import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'secretariat' | 'bunexe' | 'parent';
  id_ecole?: number;
  doit_changer_mdp?: boolean; // ← AJOUTÉ
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
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
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userWithFlag);
      
      console.log('✅ Login réussi pour:', userData.email, 'doit_changer_mdp:', doit_changer_mdp);
    } catch (error: any) {
      console.error('❌ Erreur login:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logout appelé');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    delete api.defaults.headers.common['Authorization'];
    
    setToken(null);
    setUser(null);
  };

  console.log('📊 AuthProvider état - isLoading:', isLoading, 'user:', user?.role);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};