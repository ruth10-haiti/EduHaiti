// src/hooks/useDashboard.ts
import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface DashboardStats {
  [key: string]: any;
}

export const useDashboard = (role: 'admin' | 'bunexe' | 'secretariat') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let data;
        if (role === 'admin') data = await api.getAdminDashboard();
        else if (role === 'bunexe') data = await api.getBunexeDashboard();
        else data = await api.getSecretariatDashboard();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [role]);

  return { stats, loading, error };
};