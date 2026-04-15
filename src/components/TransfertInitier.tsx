import React, { useState } from 'react';
import api from '../services/api';

const TransfertInitier: React.FC = () => {
  const [form, setForm] = useState({ id_eleve: '', id_ecole_destination: '', date_transfert: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      id_ecole_source: 1, // À adapter selon l'école du secrétariat connecté
    };
    await api.post('/transferts', payload);
    alert('Transfert initié');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="ID Élève" value={form.id_eleve} onChange={e => setForm({...form, id_eleve: e.target.value})} required />
      <input placeholder="ID École destination" value={form.id_ecole_destination} onChange={e => setForm({...form, id_ecole_destination: e.target.value})} required />
      <input type="date" value={form.date_transfert} onChange={e => setForm({...form, date_transfert: e.target.value})} required />
      <button type="submit">Initier transfert</button>
    </form>
  );
};

export default TransfertInitier;
