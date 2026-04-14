// src/pages/secretariat/DocumentsPage.tsx
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import  Documents  from '../../components/Documents'; 
import { useAuth } from '../../contexts/AuthContext';

export const DocumentsPage = () => {
  const { hasRole } = useAuth();

  if (!hasRole(['secretariat'])) return null;

  return (
    <DashboardLayout title="Documents" subtitle="Gestion des documents">
      <Documents /> {/* Ton composant existant */}
    </DashboardLayout>
  );
};