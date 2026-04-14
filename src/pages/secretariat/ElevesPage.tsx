// src/pages/secretariat/ElevesPage.tsx
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import  ListeEleves  from '../../components/ListeEleves'; // Ton composant existant
import { useAuth } from '../../contexts/AuthContext';

export const ElevesPage = () => {
  const { hasRole } = useAuth();

  if (!hasRole(['secretariat'])) return null;

  return (
    <DashboardLayout title="Élèves" subtitle="Gestion des élèves">
      <ListeEleves /> {/* Ton composant existant */}
    </DashboardLayout>
  );
};