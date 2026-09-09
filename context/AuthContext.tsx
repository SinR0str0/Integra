'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  cuenta_unam: string;
  correo: string;
  encuesta_realizada: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  updateLastActivity: () => void;
  checkEncuestaStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay sesión al cargar
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.ok === 'SI') {
          setUser(data.user);
          setIsAuthenticated(true);
          updateLastActivity();
        } else {
          router.push('/');
        }
      } catch (error) {
        router.push('/');
      }
    };
    
    checkAuth();
    
    // Configurar listener para actualizar actividad en cada interacción
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => updateLastActivity();
    
    events.forEach(event => window.addEventListener(event, handleActivity));
    
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [router]);

  const updateLastActivity = () => {
    // Actualizar cookie de última actividad
    document.cookie = `last_activity=${Date.now()}; path=/; max-age=600; SameSite=Strict`;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  const checkEncuestaStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/encuesta-status');
      const data = await response.json();
      
      if (data.ok === 'SI') {
        // Actualizar estado local
        setUser(prev => prev ? { ...prev, encuesta_realizada: data.encuesta_realizada } : null);
        return data.encuesta_realizada === 'si';
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar encuesta:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout, updateLastActivity, checkEncuestaStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}