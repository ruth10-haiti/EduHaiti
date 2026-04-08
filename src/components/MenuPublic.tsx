import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../pages/styles/Accueil.module.css';

const MenuPublic: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <Link to="/">📘 EduHaiti</Link>
        </div>
        <ul className={styles.navLinks}>
          <li><button onClick={() => scrollToSection('accueil')}>Accueil</button></li>
          <li><button onClick={() => scrollToSection('fonctionnalites')}>Fonctionnalités</button></li>
          <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
        </ul>
        <div className={styles.authButtons}>
          <Link to="/connexion" className={styles.btnConnexion}>Connexion</Link>
          <Link to="/inscription" className={styles.btnInscription}>Inscription</Link>
        </div>
      </div>
    </nav>
  );
};

export default MenuPublic;