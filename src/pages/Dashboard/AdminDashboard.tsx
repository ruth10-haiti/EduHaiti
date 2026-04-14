import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import AdminHome from '../../components/AdminHome';
import GestionEcoles from '../../components/GestionEcoles';
import GestionUtilisateurs from '../../components/GestionUtilisateurs';
import GestionEleves from '../../components/GestionEleves';
import AjouterEleveForm from '../../components/AjouterEleveForm';
import GestionExamens from '../../components/GestionExamens';

const AdminDashboard: React.FC = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<AdminHome />} />
        <Route path="/ecoles" element={<GestionEcoles />} />
        <Route path="/utilisateurs" element={<GestionUtilisateurs />} />
        <Route path="/eleves" element={<GestionEleves />} />
        <Route path="/eleves/ajouter" element={<AjouterEleveForm />} />
        <Route path="/eleves/:id/modifier" element={<AjouterEleveForm />} />
        <Route path="/examens" element={<GestionExamens />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;