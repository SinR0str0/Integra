'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/Login/LoginForm';
import AvisoModal from '@/components/Modals/AvisoModal';
import PrivacyModal from '@/components/Modals/PrivacyModal';

export default function Home() {
  const [showAviso, setShowAviso] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowAviso(true);
  }, []);

  const handleAvisoContinue = () => {
    setShowAviso(false);
    setShowPrivacy(true);
  };

  const handleLogin = async (user: string, pass: string, captcha: string): Promise<string | null> => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass, captcha, valida: 1, sesionew: 0 }),
      });
      const data = await res.json();

      if (data.ok === 'SI') {
        window.location.href = `/${data.ruta}`;
        return null; // Éxito, no hay error
      } else {
        // Devuelve el mensaje de la API (ej: "Usuario o contraseña incorrectos")
        return data.msg || 'Error en las credenciales o captcha';
      }
    } catch (err) {
      console.error(err);
      return 'Error de conexión con el servidor';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background">
      <div className="main-container">
        <LoginForm onLogin={handleLogin} loading={loading} />
      </div>

      <AvisoModal show={showAviso} onClose={() => setShowAviso(false)} onContinue={handleAvisoContinue} />
      <PrivacyModal show={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}