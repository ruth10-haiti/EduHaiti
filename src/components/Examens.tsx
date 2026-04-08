import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Examens: React.FC = () => {
  const [examens, setExamens] = useState<any[]>([]);
  const [nouveau, setNouveau] = useState({ nom: '', annee_session: '', debut_inscription: '', fin_inscription: '' });

  useEffect(() => {
    api.get('/examens').then(res => setExamens(res.data));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/examens', nouveau);
    setNouveau({ nom: '', annee_session: '', debut_inscription: '', fin_inscription: '' });
    const res = await api.get('/examens');
    setExamens(res.data);
  };

  return (
    <div>
      <h2>Examens</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Nom" value={nouveau.nom} onChange={e => setNouveau({...nouveau, nom: e.target.value})} required />
        <input placeholder="Année" type="number" value={nouveau.annee_session} onChange={e => setNouveau({...nouveau, annee_session: e.target.value})} required />
        <input type="date" value={nouveau.debut_inscription} onChange={e => setNouveau({...nouveau, debut_inscription: e.target.value})} />
        <input type="date" value={nouveau.fin_inscription} onChange={e => setNouveau({...nouveau, fin_inscription: e.target.value})} />
        <button type="submit">Ajouter</button>
      </form>
      <ul>
        {examens.map(ex => <li key={ex.id}>{ex.nom} - {ex.annee_session}</li>)}
      </ul>
    </div>
  );
};

export default Examens;