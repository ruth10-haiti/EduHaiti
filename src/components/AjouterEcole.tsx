import React, { useState } from 'react';
import { 
  School, 
  MapPin, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react';
import api from '../services/api';
import styles from './AjouterEcole.module.css';

const AjouterEcole: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de l\'école est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (formData.telephone && !/^[0-9+\-\s]{8,15}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ en cours de modification
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setNotification(null);
    
    try {
      await api.post('/ecoles', formData);
      
      setNotification({
        type: 'success',
        message: '🎉 École ajoutée avec succès !'
      });
      
      // Réinitialiser le formulaire
      setFormData({ nom: '', adresse: '', telephone: '' });
      
      // Masquer la notification après 5 secondes
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || '❌ Erreur lors de l\'ajout de l\'école'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ nom: '', adresse: '', telephone: '' });
    setErrors({});
    setNotification(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <School size={32} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Ajouter une école</h1>
          <p className={styles.subtitle}>
            Remplissez les informations pour enregistrer un nouvel établissement
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationIcon}>
            {notification.type === 'success' ? 
              <CheckCircle size={20} /> : 
              <AlertCircle size={20} />
            }
          </div>
          <p className={styles.notificationMessage}>{notification.message}</p>
          <button 
            className={styles.notificationClose}
            onClick={() => setNotification(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Champ Nom */}
        <div className={styles.formGroup}>
          <label htmlFor="nom" className={styles.label}>
            <School size={18} className={styles.labelIcon} />
            Nom de l'école *
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="nom"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              className={`${styles.input} ${errors.nom ? styles.inputError : ''}`}
              placeholder="Ex: Lycée National de Port-au-Prince"
              disabled={loading}
            />
          </div>
          {errors.nom && (
            <p className={styles.errorMessage}>
              <AlertCircle size={14} />
              {errors.nom}
            </p>
          )}
        </div>

        {/* Champ Adresse */}
        <div className={styles.formGroup}>
          <label htmlFor="adresse" className={styles.label}>
            <MapPin size={18} className={styles.labelIcon} />
            Adresse
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="adresse"
              name="adresse"
              type="text"
              value={formData.adresse}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ex: 123 Rue des Écoles, Port-au-Prince"
              disabled={loading}
            />
          </div>
        </div>

        {/* Champ Téléphone */}
        <div className={styles.formGroup}>
          <label htmlFor="telephone" className={styles.label}>
            <Phone size={18} className={styles.labelIcon} />
            Téléphone
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleChange}
              className={`${styles.input} ${errors.telephone ? styles.inputError : ''}`}
              placeholder="Ex: +509 1234 5678"
              disabled={loading}
            />
          </div>
          {errors.telephone && (
            <p className={styles.errorMessage}>
              <AlertCircle size={14} />
              {errors.telephone}
            </p>
          )}
        </div>

        {/* Champs obligatoires */}
        <p className={styles.requiredNote}>* Champs obligatoires</p>

        {/* Boutons d'action */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleClear}
            className={styles.secondaryButton}
            disabled={loading}
          >
            Effacer
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Ajout en cours...
              </>
            ) : (
              <>
                <School size={18} />
                Ajouter l'école
              </>
            )}
          </button>
        </div>
      </form>

      {/* Aperçu en temps réel */}
      {(formData.nom || formData.adresse || formData.telephone) && (
        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>Aperçu</h3>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <School size={24} />
              <span className={styles.previewBadge}>Nouvelle école</span>
            </div>
            <h4 className={styles.previewName}>{formData.nom || 'Nom de l\'école'}</h4>
            {formData.adresse && (
              <p className={styles.previewDetail}>
                <MapPin size={14} />
                {formData.adresse}
              </p>
            )}
            {formData.telephone && (
              <p className={styles.previewDetail}>
                <Phone size={14} />
                {formData.telephone}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AjouterEcole;
