// src/pages/admin/EcolesListe.tsx
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { DataTable } from '../../components/UI/DataTable';
import { Modal } from '../../components/UI/Modal';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Ecole {
  id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
}

export const EcolesListe = () => {
  const { hasRole } = useAuth();
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nom: '', adresse: '', telephone: '' });

  useEffect(() => {
    fetchEcoles();
  }, []);

  const fetchEcoles = async () => {
    try {
      const data = await api.getEcoles();
      setEcoles(data.data);
    } catch (error) {
      toast.error('Erreur chargement écoles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEcole(formData);
      toast.success('École créée avec succès');
      setModalOpen(false);
      fetchEcoles();
      setFormData({ nom: '', adresse: '', telephone: '' });
    } catch (error) {
      toast.error('Erreur création école');
    }
  };

  const handleDelete = async (ecole: Ecole) => {
    if (confirm(`Supprimer l'école ${ecole.nom} ?`)) {
      try {
        await api.deleteEcole(ecole.id);
        toast.success('École supprimée');
        fetchEcoles();
      } catch (error) {
        toast.error('Erreur suppression');
      }
    }
  };

  const columns = [
    { key: 'nom', label: 'Nom de l\'école' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'telephone', label: 'Téléphone' },
  ];

  if (!hasRole(['admin'])) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Écoles" subtitle="Gestion des établissements scolaires">
      <div className="mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle école
        </button>
      </div>

      <DataTable columns={columns} data={ecoles} onDelete={handleDelete} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une école">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de l'école</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Créer
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};