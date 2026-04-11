import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styles from './styles/Connexion.module.css';

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needVerification, setNeedVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si on vient d'une vérification email réussie
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      setError('');
      setResendMessage('✅ Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedVerification(false);
    setResendMessage('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/connexion', { 
        email, 
        mot_de_passe: password 
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Appeler la fonction login du contexte
        login(response.data.token, response.data.user);
        
        // Rediriger vers le dashboard spécifique selon le rôle
        navigate(response.data.redirectUrl || '/dashboard');
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.needVerification) {
        setNeedVerification(true);
        setError(err.response.data.message || 'Veuillez vérifier votre email avant de vous connecter');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
  setResendMessage('');
  setLoading(true);
  try {
    await api.post('/auth/renvoyer-verification', { email });
    setResendMessage('✅ Un nouvel email de vérification a été envoyé ! Vérifiez votre boîte mail.');
  } catch (err: any) {
    setResendMessage('❌ ' + (err.response?.data?.error || 'Erreur lors du renvoi'));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>← Retour à l'accueil</Link>
      <div className={styles.split}>
        <div className={styles.left}>
          <h2>Connexion</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            {resendMessage && (
              <div className={resendMessage.includes('✅') ? styles.success : styles.error}>
                {resendMessage}
              </div>
            )}
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Mot de passe</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          {needVerification && (
            <div className={styles.verificationBox}>
              <p>Vous n'avez pas reçu l'email de vérification ?</p>
              <button 
                onClick={handleResendVerification} 
                className={styles.resendButton}
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
              </button>
            </div>
          )}
          
          <div className={styles.links}>
            <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
            <Link to="/inscription">Pas encore de compte ? S'inscrire</Link>
          </div>
        </div>
        <div className={styles.right}>
          <h2>EduHaiti</h2>
          <p>Connectez-vous pour accéder à votre espace personnalisé et suivre les parcours scolaires.</p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;