// src/pages/admin/UtilisateursListe.tsx
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { DataTable } from '../../components/UI/DataTable';
import { Modal } from '../../components/UI/Modal';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  created_at: string;
}

export const UtilisateursListe = () => {
  const { hasRole } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'secretariat',
    id_ecole: ''
  });

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const data = await api.getUtilisateurs();
      setUtilisateurs(data.data);
    } catch (error) {
      toast.error('Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUtilisateur(formData);
      toast.success('Utilisateur créé avec succès');
      setModalOpen(false);
      fetchUtilisateurs();
      setFormData({ nom: '', prenom: '', email: '', role: 'secretariat', id_ecole: '' });
    } catch (error) {
      toast.error('Erreur création utilisateur');
    }
  };

  const handleDelete = async (user: Utilisateur) => {
    if (confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) {
      try {
        await api.deleteUtilisateur(user.id);
        toast.success('Utilisateur supprimé');
        fetchUtilisateurs();
      } catch (error) {
        toast.error('Erreur suppression');
      }
    }
  };

  const columns = [
    { key: 'prenom', label: 'Prénom' },
    { key: 'nom', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { 
      key: 'created_at', 
      label: 'Date création',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
    },
  ];

  if (!hasRole(['admin'])) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Utilisateurs" subtitle="Gestion des utilisateurs du système">
      <div className="mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvel utilisateur
        </button>
      </div>

      <DataTable
        columns={columns}
        data={utilisateurs}
        onDelete={handleDelete}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Créer un utilisateur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="secretariat">Secrétariat</option>
              <option value="bunexe">Bunexe</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Créer
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};