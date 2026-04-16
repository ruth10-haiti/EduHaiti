import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, User, Calendar, MapPin, Phone, Mail, Home, Save, X, Link as LinkIcon } from 'lucide-react';
import api from '../services/api';
import styles from '../pages/styles/AdminDashboard.module.css';

// Types
interface Ecole {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
}

interface EleveForm {
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  sexe: string;
  id_ecole: string;
  classe: string;
  tel_parent: string;
  email_parent: string;
  adresse: string;
}

// Classes valides pour le système scolaire haïtien (1ère AF à NS4 uniquement)
const classesValides = [
  '1ère AF', '2ème AF', '3ème AF', '4ème AF', '5ème AF', '6ème AF',
  '7ème AF', '8ème AF', '9ème AF',
  'NS1', 'NS2', 'NS3', 'NS4'
];

// Calculer l'âge à partir de la date de naissance
const calculerAge = (dateNaissance: string): number => {
  if (!dateNaissance) return 0;
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const AjouterEleveForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [showParentLink, setShowParentLink] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [matriculeGenere, setMatriculeGenere] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<EleveForm>({
    nom: '', prenom: '', date_naissance: '', lieu_naissance: '',
    sexe: 'M', id_ecole: '', classe: '',
    tel_parent: '', email_parent: '', adresse: ''
  });

  useEffect(() => {
    loadEcoles();
    if (id) loadEleve();
  }, [id]);

  const loadEcoles = async () => {
    try {
      const res = await api.get('/admin/ecoles');
      setEcoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEleve = async () => {
    try {
      const res = await api.get(`/eleves/${id}`);
      setForm(res.data);
    } catch (err) {
      alert('Erreur chargement');
    }
  };

  // Validation de tous les champs
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation du nom
    if (!form.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (form.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    } else if (form.nom.length > 50) {
      newErrors.nom = 'Le nom ne peut pas dépasser 50 caractères';
    } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(form.nom)) {
      newErrors.nom = 'Le nom ne doit contenir que des lettres';
    }

    // Validation du prénom
    if (!form.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    } else if (form.prenom.length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    } else if (form.prenom.length > 50) {
      newErrors.prenom = 'Le prénom ne peut pas dépasser 50 caractères';
    } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(form.prenom)) {
      newErrors.prenom = 'Le prénom ne doit contenir que des lettres';
    }

    // Validation de la date de naissance (âge entre 4 et 50 ans)
    if (!form.date_naissance) {
      newErrors.date_naissance = 'La date de naissance est requise';
    } else {
      const selectedDate = new Date(form.date_naissance);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const age = calculerAge(form.date_naissance);

      if (selectedDate > today) {
        newErrors.date_naissance = 'La date de naissance ne peut pas être dans le futur';
      } else if (age < 4) {
        newErrors.date_naissance = 'L\'élève doit avoir au moins 4 ans';
      } else if (age > 50) {
        newErrors.date_naissance = 'L\'élève ne peut pas avoir plus de 50 ans';
      }
    }

    // Validation du lieu de naissance
    if (form.lieu_naissance && form.lieu_naissance.length > 100) {
      newErrors.lieu_naissance = 'Le lieu de naissance ne peut pas dépasser 100 caractères';
    }

    // Validation de la classe
    if (!form.classe) {
      newErrors.classe = 'Veuillez sélectionner une classe';
    } else if (!classesValides.includes(form.classe)) {
      newErrors.classe = `Classe invalide. Valeurs acceptées: ${classesValides.join(', ')}`;
    }

    // Validation du téléphone parent
    if (form.tel_parent) {
      const phoneClean = form.tel_parent.replace(/\s/g, '');
      if (!/^(\+509|509)?[0-9]{8}$/.test(phoneClean)) {
        newErrors.tel_parent = 'Téléphone invalide. Format: 12345678 ou +50912345678';
      }
    }

    // Validation de l'email parent
    if (form.email_parent && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_parent)) {
      newErrors.email_parent = 'Email invalide. Exemple: parent@email.com';
    }

    // Validation de l'adresse
    if (form.adresse && form.adresse.length > 255) {
      newErrors.adresse = 'L\'adresse ne peut pas dépasser 255 caractères';
    }

    // Validation de l'école
    if (!form.id_ecole) {
      newErrors.id_ecole = 'Veuillez sélectionner une école';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (id) {
        await api.put(`/eleves/${id}`, form);
        alert('✅ Élève modifié avec succès');
        navigate('/admin/eleves');
      } else {
        const response = await api.post('/eleves', form);
        if (response.data.matricule_national) {
          setMatriculeGenere(response.data.matricule_national);
          alert(`✅ Élève créé avec succès !\n📌 Matricule: ${response.data.matricule_national}`);
          setShowParentLink(true);
        } else {
          alert('✅ Élève créé avec succès');
          navigate('/admin/eleves');
        }
      }
    } catch (err: any) {
      console.error('Erreur:', err.response?.data);
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkParent = async () => {
    if (!parentEmail) {
      alert('Veuillez entrer l\'email du parent');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      alert('Email invalide');
      return;
    }
    
    setLoading(true);
    try {
      const eleveId = id || (await api.get('/eleves')).data.find((e: any) => e.matricule_national === matriculeGenere)?.id;
      
      await api.post(`/eleves/${eleveId}/lier-parent`, {
        id_eleve: eleveId,
        email_parent: parentEmail
      });
      
      alert('✅ Parent lié avec succès ! Un email a été envoyé au parent.');
      setShowParentLink(false);
      navigate('/admin/eleves');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la liaison');
    } finally {
      setLoading(false);
    }
  };

  // Dates min et max (pour l'âge entre 4 et 50 ans)
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - 4);
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 50);

  return (
    <div className={styles.formCard}>
      <div style={{ marginBottom: 24 }}>
        <h1 className={styles.formTitle}>
          {id ? '✏️ Modifier l\'élève' : '➕ Ajouter un élève'}
        </h1>
        <p className={styles.formSubtitle}>
          {id ? 'Modifiez les informations de l\'élève' : 'Remplissez les informations pour inscrire un nouvel élève'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} /> Nom *</label>
            <input 
              type="text" 
              className={`${styles.input} ${errors.nom ? styles.inputError : ''}`}
              required
              value={form.nom} 
              onChange={e => setForm({...form, nom: e.target.value.toUpperCase()})} 
              placeholder="Ex: JEAN"
              maxLength={50}
            />
            {errors.nom && <p className={styles.errorMessage}>{errors.nom}</p>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} /> Prénom *</label>
            <input 
              type="text" 
              className={`${styles.input} ${errors.prenom ? styles.inputError : ''}`}
              required
              value={form.prenom} 
              onChange={e => setForm({...form, prenom: e.target.value})} 
              placeholder="Ex: Sandy"
              maxLength={50}
            />
            {errors.prenom && <p className={styles.errorMessage}>{errors.prenom}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}><Calendar size={16} /> Date de naissance *</label>
            <input 
              type="date" 
              className={`${styles.input} ${errors.date_naissance ? styles.inputError : ''}`}
              value={form.date_naissance} 
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              onChange={e => setForm({...form, date_naissance: e.target.value})}
              required
            />
            <small style={{ color: '#6c757d', fontSize: 12, marginTop: 4, display: 'block' }}>
              📅 Âge requis: entre 4 et 50 ans
            </small>
            {errors.date_naissance && <p className={styles.errorMessage}>{errors.date_naissance}</p>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><MapPin size={16} /> Lieu de naissance</label>
            <input 
              type="text" 
              className={`${styles.input} ${errors.lieu_naissance ? styles.inputError : ''}`}
              value={form.lieu_naissance} 
              onChange={e => setForm({...form, lieu_naissance: e.target.value})}
              placeholder="Ex: Port-au-Prince"
              maxLength={100}
            />
            {errors.lieu_naissance && <p className={styles.errorMessage}>{errors.lieu_naissance}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Sexe</label>
            <select className={styles.input} value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})}>
              <option value="M">👨 Masculin</option>
              <option value="F">👩 Féminin</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><GraduationCap size={16} /> École *</label>
            <select 
              className={`${styles.input} ${errors.id_ecole ? styles.inputError : ''}`} 
              value={form.id_ecole} 
              onChange={e => setForm({...form, id_ecole: e.target.value})}
              required
            >
              <option value="">-- Sélectionnez une école --</option>
              {ecoles.map((ecole: Ecole) => <option key={ecole.id} value={ecole.id}>{ecole.nom}</option>)}
            </select>
            {errors.id_ecole && <p className={styles.errorMessage}>{errors.id_ecole}</p>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><GraduationCap size={16} /> Classe *</label>
          <select 
            className={`${styles.input} ${errors.classe ? styles.inputError : ''}`} 
            value={form.classe} 
            onChange={e => setForm({...form, classe: e.target.value})}
            required
          >
            <option value="">-- Sélectionnez une classe --</option>
            <optgroup label="Fondamental (AF)">
              <option value="1ère AF">1ère AF</option>
              <option value="2ème AF">2ème AF</option>
              <option value="3ème AF">3ème AF</option>
              <option value="4ème AF">4ème AF</option>
              <option value="5ème AF">5ème AF</option>
              <option value="6ème AF">6ème AF</option>
              <option value="7ème AF">7ème AF</option>
              <option value="8ème AF">8ème AF</option>
              <option value="9ème AF">9ème AF</option>
            </optgroup>
            <optgroup label="Secondaire (NS)">
              <option value="NS1">NS1</option>
              <option value="NS2">NS2</option>
              <option value="NS3">NS3</option>
              <option value="NS4">NS4</option>
            </optgroup>
          </select>
          {errors.classe && <p className={styles.errorMessage}>{errors.classe}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Phone size={16} /> Téléphone parent</label>
          <input 
            type="tel" 
            className={`${styles.input} ${errors.tel_parent ? styles.inputError : ''}`}
            value={form.tel_parent} 
            onChange={e => setForm({...form, tel_parent: e.target.value})}
            placeholder="Ex: 12345678 ou +50912345678"
            maxLength={15}
          />
          <small style={{ color: '#6c757d', fontSize: 12, marginTop: 4, display: 'block' }}>
            📱 Format: 8 chiffres ou +509 suivi de 8 chiffres
          </small>
          {errors.tel_parent && <p className={styles.errorMessage}>{errors.tel_parent}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Mail size={16} /> Email parent</label>
          <input 
            type="email" 
            className={`${styles.input} ${errors.email_parent ? styles.inputError : ''}`}
            value={form.email_parent} 
            onChange={e => setForm({...form, email_parent: e.target.value})}
            placeholder="parent@exemple.com"
            maxLength={100}
          />
          {errors.email_parent && <p className={styles.errorMessage}>{errors.email_parent}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Home size={16} /> Adresse</label>
          <input 
            type="text" 
            className={`${styles.input} ${errors.adresse ? styles.inputError : ''}`}
            value={form.adresse} 
            onChange={e => setForm({...form, adresse: e.target.value})}
            placeholder="Ex: Delmas 40, Port-au-Prince"
            maxLength={255}
          />
          {errors.adresse && <p className={styles.errorMessage}>{errors.adresse}</p>}
        </div>

        <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#1976d2' }}>
            ℹ️ Le matricule national sera généré automatiquement par le système après l'enregistrement.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className={styles.primaryButton} disabled={loading}>
            <Save size={18} />
            {loading ? 'Enregistrement...' : (id ? 'Modifier' : 'Ajouter')}
          </button>
          <button type="button" onClick={() => navigate('/admin/eleves')} className={styles.secondaryButton}>
            <X size={18} />
            Annuler
          </button>
        </div>
      </form>

      {showParentLink && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className={styles.formCard} style={{ maxWidth: 500, width: '90%' }}>
            <h3 style={{ marginBottom: 16 }}>🔗 Lier un parent à l'élève</h3>
            <p style={{ marginBottom: 16, color: '#6c757d' }}>
              Le matricule <strong>{matriculeGenere}</strong> a été généré automatiquement.
            </p>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email du parent</label>
              <input
                type="email"
                className={styles.input}
                placeholder="parent@exemple.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
              <small style={{ color: '#6c757d', marginTop: 4, display: 'block' }}>
                Un compte parent sera créé automatiquement si nécessaire.
              </small>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={handleLinkParent} className={styles.primaryButton} disabled={loading}>
                <LinkIcon size={18} />
                {loading ? 'Traitement...' : 'Lier le parent'}
              </button>
              <button onClick={() => navigate('/admin/eleves')} className={styles.secondaryButton}>
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AjouterEleveForm;