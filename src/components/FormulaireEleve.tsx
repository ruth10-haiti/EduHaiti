import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const FormulaireEleve: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    matricule_national: '', prenom: '', nom: '', date_de_naissance: '',
    lieu_de_naissance: '', tel_parent: '', email_parent: '', adresse: ''
  });

  useEffect(() => {
    if (id) {
      api.get(`/eleves/${id}`).then(res => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/eleves/${id}`, form);
      } else {
        await api.post('/eleves', form);
      }
      navigate('/secretariat/eleves');
    } catch (err) {
      alert('Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="matricule_national" placeholder="Matricule NINS" value={form.matricule_national} onChange={handleChange} required />
      <input name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
      <input name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
      <input name="date_de_naissance" type="date" value={form.date_de_naissance} onChange={handleChange} />
      <input name="lieu_de_naissance" placeholder="Lieu de naissance" value={form.lieu_de_naissance} onChange={handleChange} />
      <input name="tel_parent" placeholder="Téléphone parent" value={form.tel_parent} onChange={handleChange} />
      <input name="email_parent" placeholder="Email parent" value={form.email_parent} onChange={handleChange} />
      <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} />
      <button type="submit">Enregistrer</button>
    </form>
  );
};

export default FormulaireEleve;
