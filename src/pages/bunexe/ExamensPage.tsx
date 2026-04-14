// src/pages/bunexe/ExamensPage.tsx
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import  Examens  from '../../components/Examens'; 
import { useAuth } from '../../contexts/AuthContext';

export const ExamensPage = () => {
  const { hasRole } = useAuth();

  if (!hasRole(['bunexe'])) return null;

  return (
    <DashboardLayout title="Examens" subtitle="Gestion des examens nationaux">
      <Examens /> 
    </DashboardLayout>
  );
};