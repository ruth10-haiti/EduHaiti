import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './styles/Connexion.module.css';

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needVerification, setNeedVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { login, user } = useAuth(); // ✅ Ajout de user pour suivre l'état
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Redirection automatique quand l'utilisateur est connecté
  useEffect(() => {
    console.log('🔍 Vérification user dans Connexion:', user);
    
    if (user) {
      console.log('✅ Utilisateur déjà connecté, redirection vers dashboard');
      let redirectUrl = '/dashboard';
      switch (user.role) {
        case 'admin': redirectUrl = '/admin'; break;
        case 'secretariat': redirectUrl = '/secretariat'; break;
        case 'bunexe': redirectUrl = '/bunexe'; break;
        case 'parent': redirectUrl = '/parent'; break;
      }
      navigate(redirectUrl);
    }
  }, [user, navigate]);

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
    
    console.log('📤 Tentative de connexion pour:', email);
    
    try {
      // Utiliser la fonction login du contexte
      await login(email, password);
      
      // La redirection se fera automatiquement via l'useEffect ci-dessus
      console.log('✅ Connexion réussie, redirection automatique...');
      
    } catch (err: any) {
      console.error('❌ Erreur login:', err.response?.data);
      
      if (err.response?.status === 403 && err.response?.data?.needVerification) {
        setNeedVerification(true);
        setError(err.response.data.message || 'Veuillez vérifier votre email avant de vous connecter');
      } else if (err.response?.status === 401) {
        setError('Email ou mot de passe incorrect');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('❌ Veuillez entrer votre email d\'abord');
      return;
    }
    
    setResendMessage('');
    setLoading(true);
    try {
      const api = (await import('../services/api')).default;
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
                autoComplete="email"
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
                autoComplete="current-password"
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