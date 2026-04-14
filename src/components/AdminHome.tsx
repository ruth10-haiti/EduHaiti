import React, { useEffect, useState } from 'react';
import { School, Users, GraduationCap, FileText } from 'lucide-react';
import api from '../services/api';
import styles from '../../styles/AdminDashboard.module.css';

const AdminHome: React.FC = () => {
  const [stats, setStats] = useState({
    totalEcoles: 0,
    totalUtilisateurs: 0,
    totalEleves: 0,
    totalExamens: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ecoles, users, eleves, examens] = await Promise.all([
          api.get('/admin/ecoles'),
          api.get('/admin/utilisateurs'),
          api.get('/eleves'),
          api.get('/examens')
        ]);
        
        setStats({
          totalEcoles: ecoles.data.length,
          totalUtilisateurs: users.data.length,
          totalEleves: eleves.data.length,
          totalExamens: examens.data.length
        });
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  const statCards = [
    { title: 'Écoles', value: stats.totalEcoles, icon: School, color: '#4361ee', path: '/admin/ecoles' },
    { title: 'Utilisateurs', value: stats.totalUtilisateurs, icon: Users, color: '#06d6a0', path: '/admin/utilisateurs' },
    { title: 'Élèves', value: stats.totalEleves, icon: GraduationCap, color: '#fca311', path: '/admin/eleves' },
    { title: 'Examens', value: stats.totalExamens, icon: FileText, color: '#ef233c', path: '/admin/examens' }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>Chargement du tableau de bord...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', color: '#1a1a2e', marginBottom: 8 }}>
          Tableau de bord
        </h1>
        <p style={{ color: '#6c757d' }}>
          Bienvenue dans l'interface d'administration d'EduHaiti
        </p>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={styles.statCard}
            onClick={() => window.location.href = card.path}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statInfo}>
              <h3>{card.title}</h3>
              <div className={styles.statNumber}>{card.value}</div>
            </div>
            <div className={styles.statIcon} style={{ background: `${card.color}20`, color: card.color }}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Section d'activité récente */}
      <div className={styles.formCard}>
        <h3 style={{ marginBottom: 16 }}>📊 Vue d'ensemble</h3>
        <p style={{ color: '#6c757d' }}>
          Système de gestion scolaire - Version 2.0
        </p>
        <div style={{ marginTop: 16, padding: 16, background: '#f8f9fa', borderRadius: 12 }}>
          <p>✅ Système opérationnel</p>
          <p>📊 {stats.totalEleves} élèves inscrits</p>
          <p>🏫 {stats.totalEcoles} écoles partenaires</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;