import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ListeEleves: React.FC = () => {
  const [eleves, setEleves] = useState<any[]>([]);

  useEffect(() => {
    api.get('/eleves').then(res => setEleves(res.data));
  }, []);

  return (
    <div>
      <h2>Liste des élèves</h2>
      <Link to="/secretariat/eleves/ajouter">➕ Ajouter</Link>
      <table>
        <thead>
          <tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {eleves.map(e => (
            <tr key={e.id}>
              <td>{e.matricule_national}</td>
              <td>{e.nom}</td>
              <td>{e.prenom}</td>
              <td>
                <Link to={`/secretariat/eleves/${e.id}/modifier`}>✏️</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListeEleves;