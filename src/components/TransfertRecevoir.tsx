import React, { useState } from 'react';
import api from '../services/api';

const TransfertRecevoir: React.FC = () => {
  const [qrCode, setQrCode] = useState('');

  const handleScan = async () => {
    const res = await api.get(`/transferts?code_qr=${qrCode}`);
    // Traitement...
    alert('Transfert reçu');
  };

  return (
    <div>
      <input placeholder="Scanner QR code" value={qrCode} onChange={e => setQrCode(e.target.value)} />
      <button onClick={handleScan}>Valider réception</button>
    </div>
  );
};

export default TransfertRecevoir;