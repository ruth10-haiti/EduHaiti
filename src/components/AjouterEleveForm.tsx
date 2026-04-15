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

const AjouterEleveForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [showParentLink, setShowParentLink] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [matriculeGenere, setMatriculeGenere] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <input type="text" className={styles.input} required
              value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} /> Prénom *</label>
            <input type="text" className={styles.input} required
              value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}><Calendar size={16} /> Date naissance</label>
            <input type="date" className={styles.input}
              value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><MapPin size={16} /> Lieu naissance</label>
            <input type="text" className={styles.input}
              value={form.lieu_naissance} onChange={e => setForm({...form, lieu_naissance: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Sexe</label>
            <select className={styles.input} value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}><GraduationCap size={16} /> École</label>
            <select className={styles.input} value={form.id_ecole} onChange={e => setForm({...form, id_ecole: e.target.value})}>
              <option value="">Sélectionnez une école</option>
              {ecoles.map((ecole: Ecole) => <option key={ecole.id} value={ecole.id}>{ecole.nom}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Classe</label>
          <input type="text" className={styles.input} placeholder="Ex: 6ème A"
            value={form.classe} onChange={e => setForm({...form, classe: e.target.value})} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Phone size={16} /> Téléphone parent</label>
          <input type="tel" className={styles.input}
            value={form.tel_parent} onChange={e => setForm({...form, tel_parent: e.target.value})} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Mail size={16} /> Email parent</label>
          <input type="email" className={styles.input}
            value={form.email_parent} onChange={e => setForm({...form, email_parent: e.target.value})} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Home size={16} /> Adresse</label>
          <input type="text" className={styles.input}
            value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
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