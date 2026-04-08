import React, { useState } from 'react';
import api from '../services/api';

const AjouterEcole: React.FC = () => {
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ecoles', { nom, adresse, telephone });
      setMessage('École ajoutée avec succès');
      setNom(''); setAdresse(''); setTelephone('');
    } catch (err) {
      setMessage('Erreur lors de l\'ajout');
    }
  };

  return (
    <div>
      <h2>Ajouter une école</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required />
        <input placeholder="Adresse" value={adresse} onChange={e => setAdresse(e.target.value)} />
        <input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AjouterEcole;