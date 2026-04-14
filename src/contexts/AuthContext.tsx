// src/contexts/AuthContext.tsx (VERSION CORRIGÉE)
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'secretariat' | 'bunexe' | 'parent';
  id_ecole?: number;
  doit_changer_mdp?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (roles: string[]) => boolean;  // ← Déclaré dans l'interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fonction hasRole - AJOUTÉE
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // ✅ Chargement initial depuis localStorage
  useEffect(() => {
    console.log('🔍 AuthProvider: Chargement initial...');
    
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('   - token présent:', !!storedToken);
    console.log('   - storedUser présent:', !!storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('✅ Utilisateur chargé depuis localStorage:', parsedUser);
        
        // Vérifier que api.defaults.headers existe
        if (api.defaults?.headers) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (storedToken) {
      const fetchUser = async () => {
        try {
          console.log('📡 Récupération utilisateur depuis /api/auth/me');
          const res = await api.get('/auth/me');
          const userData = res.data;
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Utilisateur récupéré:', userData);
        } catch (err) {
          console.error('❌ Erreur récupération utilisateur:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
      return;
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 Tentative de login pour:', email);
    
    try {
      const res = await api.post('/auth/connexion', { email, mot_de_passe: password });
      console.log('📥 Réponse login:', res.data);
      
      const { token: newToken, user: userData, doit_changer_mdp } = res.data;
      
      if (!newToken || !userData) {
        throw new Error('Token ou utilisateur manquant dans la réponse');
      }
      
      // Ajouter le flag doit_changer_mdp à l'utilisateur
      const userWithFlag = { ...userData, doit_changer_mdp: doit_changer_mdp || false };
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userWithFlag));
      
      // Vérifier que api.defaults.headers existe
      if (api.defaults?.headers) {
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      }
      
      setToken(newToken);
      setUser(userWithFlag);
      
      console.log('✅ Login réussi pour:', userData.email, 'doit_changer_mdp:', doit_changer_mdp);
      toast.success('Connexion réussie !');
      
      // Redirection après login
      if (doit_changer_mdp) {
        window.location.href = '/changer-mot-de-passe';
      } else {
        // Redirection selon le rôle
        switch (userData.role) {
          case 'admin':
            window.location.href = '/admin';
            break;
          case 'secretariat':
            window.location.href = '/secretariat';
            break;
          case 'bunexe':
            window.location.href = '/bunexe';
            break;
          case 'parent':
            window.location.href = '/parent';
            break;
          default:
            window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur login:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erreur de connexion');
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logout appelé');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (api.defaults?.headers) {
      delete api.defaults.headers.common['Authorization'];
    }
    
    setToken(null);
    setUser(null);
    
    toast.success('Déconnexion réussie');
    window.location.href = '/connexion';
  };

  console.log('📊 AuthProvider état - isLoading:', isLoading, 'user:', user?.role);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isLoading,
      hasRole  // ← AJOUTÉ - la fonction hasRole est maintenant exposée
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};