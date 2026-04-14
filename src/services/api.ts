// src/services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://eduhaiti-wjx6.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`📡 ${config.method?.toUpperCase()} ${config.url} - Token présent`);
    } else {
      console.log(`📡 ${config.method?.toUpperCase()} ${config.url} - Pas de token`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 Token expiré ou invalide, déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

// Exporter l'instance par défaut
export default apiClient;

// Exporter également les méthodes utilitaires
export const api = {
  get: <T = any>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => apiClient.delete<T>(url, config),
  
  // Méthodes spécifiques
  getMe: () => apiClient.get('/auth/me'),
  login: (email: string, mot_de_passe: string) => apiClient.post('/auth/connexion', { email, mot_de_passe }),
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
  getBunexeDashboard: () => apiClient.get('/dashboard/bunexe'),
  getSecretariatDashboard: () => apiClient.get('/dashboard/secretariat'),
  getExamens: () => apiClient.get('/bunexe/examens'),
  getEleves: () => apiClient.get('/secretariat/eleves'),
  getInscriptions: () => apiClient.get('/secretariat/inscriptions'),
  getDocuments: () => apiClient.get('/secretariat/documents'),
  getInscriptionsExamens: () => apiClient.get('/bunexe/inscriptions'),
  getResultats: () => apiClient.get('/bunexe/resultats'),
  getUtilisateurs: () => apiClient.get('/admin/utilisateurs'),
  getEcoles: () => apiClient.get('/admin/ecoles'),
  createUtilisateur: (data: any) => apiClient.post('/admin/utilisateurs/creer', data),
  deleteUtilisateur: (id: number) => apiClient.delete(`/admin/utilisateurs/${id}`),
  createEcole: (data: any) => apiClient.post('/admin/ecoles', data),
  deleteEcole: (id: number) => apiClient.delete(`/admin/ecoles/${id}`),
  validerInscriptionExamen: (id: number) => apiClient.put(`/bunexe/inscriptions/${id}/valider`),
  validerInscription: (id: number) => apiClient.put(`/secretariat/inscriptions/${id}/valider`),
  refuserInscription: (id: number) => apiClient.put(`/secretariat/inscriptions/${id}/refuser`),
  publierResultat: (data: any) => apiClient.post('/bunexe/resultats', data),
};