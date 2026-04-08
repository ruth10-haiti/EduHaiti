import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MenuPublic from '../components/MenuPublic';
import styles from './styles/Accueil.module.css';

const Accueil: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll(`.${styles.fadeIn}`);
    sections.forEach((section) => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <MenuPublic />

      <section id="accueil" className={`${styles.hero} ${styles.fadeIn}`}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.logoHero}>🇭🇹</div>
          <h1 className={styles.titre}>EduHaiti</h1>
          <p className={styles.sousTitre}>
            La solution numérique complète pour gérer les parcours scolaires en Haïti.<br />
            Code unique NINS, examens officiels, transferts simplifiés.
          </p>
          <div className={styles.boutons}>
            <Link to="/connexion" className={styles.btnPrimaire}>
              Commencer maintenant
            </Link>
            <a href="#fonctionnalites" className={styles.btnSecondaire}>
              Découvrir
            </a>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className={`${styles.features} ${styles.fadeIn}`}>
        <div className={styles.sectionHeader}>
          <h2>Fonctionnalités clés</h2>
          <p>Une plateforme pensée pour les écoles haïtiennes</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔐</div>
            <h3>Code unique NINS</h3>
            <p>Identifiant permanent et sécurisé pour chaque élève.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📝</div>
            <h3>Examens officiels</h3>
            <p>Inscription, saisie des résultats, génération de diplômes.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Transferts sécurisés</h3>
            <p>Déplacement d'élève entre écoles via QR code.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Tableau de bord</h3>
            <p>Indicateurs en temps réel pour piloter votre établissement.</p>
          </div>
        </div>
      </section>

      <section id="contact" className={`${styles.contact} ${styles.fadeIn}`}>
        <div className={styles.contactContainer}>
          <h2>Contactez-nous</h2>
          <p>Une question ? Écrivez-nous, nous vous répondrons rapidement.</p>
          <div className={styles.contactInfos}>
            <div>📧 ruthdieuveuille09@gmail.com</div>
            <div>📞 +509 4347 99 01</div>
            <div>📍 Port-au-Prince, Haïti</div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 - EduHaiti | Tous droits réservés</p>
      </footer>
    </div>
  );
};

export default Accueil;