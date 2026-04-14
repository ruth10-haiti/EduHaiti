// src/pages/secretariat/InscriptionsPage.tsx
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { DataTable } from '../../components/UI/DataTable';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Inscription {
  id: number;
  eleve_nom: string;
  eleve_prenom: string;
  ecole_nom: string;
  date_inscription: string;
  statut: string;
}

export const InscriptionsPage = () => {
  const { hasRole } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const data = await api.getInscriptions();
      setInscriptions(data.data);
    } catch (error) {
      toast.error('Erreur chargement inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (inscription: Inscription) => {
    try {
      await api.validerInscription(inscription.id);
      toast.success('Inscription validée');
      fetchInscriptions();
    } catch (error) {
      toast.error('Erreur validation');
    }
  };

  const handleRefuse = async (inscription: Inscription) => {
    try {
      await api.refuserInscription(inscription.id);
      toast.success('Inscription refusée');
      fetchInscriptions();
    } catch (error) {
      toast.error('Erreur refus');
    }
  };

  const columns = [
    { key: 'eleve_prenom', label: 'Prénom élève' },
    { key: 'eleve_nom', label: 'Nom élève' },
    { key: 'ecole_nom', label: 'École' },
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
          value === 'valide' ? 'bg-green-100 text-green-800' :
          value === 'refuse' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value === 'valide' ? 'Validée' : value === 'refuse' ? 'Refusée' : 'En attente'}
        </span>
      )
    },
  ];

  if (!hasRole(['secretariat'])) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Inscriptions" subtitle="Gestion des inscriptions">
      <DataTable
        columns={columns}
        data={inscriptions}
        onValidate={(item) => item.statut === 'en_attente' && handleValidate(item)}
        onRefuse={(item) => item.statut === 'en_attente' && handleRefuse(item)}
      />
    </DashboardLayout>
  );
};