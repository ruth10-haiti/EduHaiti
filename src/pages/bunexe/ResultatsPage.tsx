// src/pages/bunexe/ResultatsPage.tsx
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { DataTable } from '../../components/UI/DataTable';
import { Modal } from '../../components/UI/Modal';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Resultat {
  id: number;
  examen_nom: string;
  eleve_nom: string;
  eleve_prenom: string;
  note: number;
  statut: string;
  date_publication: string;
}

export const ResultatsPage = () => {
  const { hasRole } = useAuth();
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [examens, setExamens] = useState<any[]>([]);
  const [eleves, setEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_examen: '',
    id_eleve: '',
    note: '',
    statut: 'ADMIS'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resResultats, resExamens, resEleves] = await Promise.all([
        api.getResultats(),
        api.getExamens(),
        api.getEleves()
      ]);
      setResultats(resResultats.data);
      setExamens(resExamens.data);
      setEleves(resEleves.data);
    } catch (error) {
      toast.error('Erreur chargement données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.publierResultat(formData);
      toast.success('Résultat publié');
      setModalOpen(false);
      fetchData();
      setFormData({ id_examen: '', id_eleve: '', note: '', statut: 'ADMIS' });
    } catch (error) {
      toast.error('Erreur publication');
    }
  };

  const columns = [
    { key: 'examen_nom', label: 'Examen' },
    { key: 'eleve_prenom', label: 'Prénom' },
    { key: 'eleve_nom', label: 'Nom' },
    { key: 'note', label: 'Note' },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'ADMIS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'ADMIS' ? 'Admis' : 'Échec'}
        </span>
      )
    },
    { 
      key: 'date_publication', 
      label: 'Date publication',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR')
    },
  ];

  if (!hasRole(['bunexe'])) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout title="Résultats" subtitle="Publication des résultats d'examens">
      <div className="mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Publier un résultat
        </button>
      </div>

      <DataTable columns={columns} data={resultats} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publier un résultat">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Examen</label>
            <select
              value={formData.id_examen}
              onChange={(e) => setFormData({ ...formData, id_examen: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un examen</option>
              {examens.map((examen) => (
                <option key={examen.id} value={examen.id}>{examen.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Élève</label>
            <select
              value={formData.id_eleve}
              onChange={(e) => setFormData({ ...formData, id_eleve: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un élève</option>
              {eleves.map((eleve) => (
                <option key={eleve.id} value={eleve.id}>{eleve.prenom} {eleve.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <input
              type="number"
              step="0.01"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ADMIS">Admis</option>
              <option value="ECHEC">Échec</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Publier
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};