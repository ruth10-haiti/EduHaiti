// src/pages/bunexe/InscriptionsExamensPage.tsx
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { DataTable } from '../../components/UI/DataTable';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface InscriptionExamen {
  id: number;
  examen_nom: string;
  eleve_nom: string;
  eleve_prenom: string;
  date_inscription: string;
  statut: string;
}

export const InscriptionsExamensPage = () => {
  const { hasRole } = useAuth();
  const [inscriptions, setInscriptions] = useState<InscriptionExamen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const data = await api.getInscriptionsExamens();
      setInscriptions(data.data);
    } catch (error) {
      toast.error('Erreur chargement inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (inscription: InscriptionExamen) => {
    try {
      await api.validerInscriptionExamen(inscription.id);
      toast.success('Inscription validée');
      fetchInscriptions();
    } catch (error) {
      toast.error('Erreur validation');
    }
  };

  const columns = [
    { key: 'examen_nom', label: 'Examen' },
    { key: 'eleve_prenom', label: 'Prénom élève' },
    { key: 'eleve_nom', label: 'Nom élève' },
    { 
      key: 'date_inscription', 
      label: 'Date inscription',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
    },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'valide' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value === 'valide' ? 'Validée' : 'En attente'}
        </span>
      )
    },
  ];

  if (!hasRole(['bunexe'])) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Inscriptions aux examens" subtitle="Validation des inscriptions">
      <DataTable
        columns={columns}
        data={inscriptions}
        onValidate={(item) => item.statut === 'en_attente' && handleValidate(item)}
      />
    </DashboardLayout>
  );
};