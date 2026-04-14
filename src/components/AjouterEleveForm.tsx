import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GraduationCap, User, Calendar, MapPin, Phone, Mail, Home, Save, X } from 'lucide-react';
import api from '../services/api';
import styles from '../../styles/AdminDashboard.module.css';

const AjouterEleveForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ecoles, setEcoles] = useState<any[]>([]);
  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '', lieu_naissance: '',
    sexe: 'M', matricule_national: '', id_ecole: '', classe: '',
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
      } else {
        await api.post('/eleves', form);
      }
      navigate('/admin/eleves');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
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
              {ecoles.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
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

        {/* Note pour le matricule */}
        <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 8, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#1976d2' }}>
            ℹ️ Le matricule national est généré automatiquement par le système. Vous n'avez pas besoin de le renseigner.
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
    </div>
  );
};

export default AjouterEleveForm;