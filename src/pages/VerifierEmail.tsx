import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './styles/VerifierEmail.module.css';

const VerifierEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifierEmail = async () => {
      try {
        // Appel direct au backend pour la vérification
        const response = await fetch(`https://eduhaiti-wjx6.onrender.com/api/auth/verifier-email/${token}`);
        
        if (response.redirected) {
          // Redirection vers la page de connexion avec succès
          window.location.href = response.url;
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.error || 'Lien de vérification invalide');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur de connexion au serveur');
      }
    };
    
    verifierEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Vérification en cours...</h2>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>❌ Vérification échouée</h2>
          <p>{message}</p>
          <Link to="/connexion" className={styles.button}>Aller à la connexion</Link>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifierEmail;