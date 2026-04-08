import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Documents: React.FC = () => {
  const [eleveId, setEleveId] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  const chargerDocuments = async () => {
    if (!eleveId) return;
    const res = await api.get(`/documents/eleve/${eleveId}`);
    setDocuments(res.data);
  };

  return (
    <div>
      <h2>Documents</h2>
      <input placeholder="ID Élève" value={eleveId} onChange={e => setEleveId(e.target.value)} />
      <button onClick={chargerDocuments}>Charger</button>
      {documents.map(doc => (
        <div key={doc.id}>
          <p>{doc.type_document} - <a href={doc.url_fichier} target="_blank">Voir</a></p>
        </div>
      ))}
    </div>
  );
};

export default Documents;