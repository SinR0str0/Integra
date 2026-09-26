'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CatchAllPage() {
  const [attemptCount, setAttemptCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedCount = localStorage.getItem('integra_error_count');
    const currentCount = storedCount ? parseInt(storedCount, 10) : 1;
    
    setAttemptCount(currentCount);
    localStorage.setItem('integra_error_count', (currentCount + 1).toString());
  }, []);

  // Evita errores de hidratación
  if (!isMounted) {
    return <div className="p-5 text-center">Cargando...</div>;
  }

  // --- LÓGICA DEL EASTER EGG ---

  if (attemptCount <= 2) {
    return (
      <div className="text-center p-5">
        <i className="fa fa-exclamation-circle fa-3x text-warning mb-3"></i>
        <h3 className="mb-3">Enlace no disponible</h3>
        <p className="lead">
          Este enlace no está disponible, entra a:{' '}
          <a href="https://integra.unam.mx" target="_blank" className="text-primary font-weight-bold">
            https://integra.unam.mx
          </a>
        </p>
      </div>
    );
  }

  if (attemptCount === 3) {
    return (
      <div className="text-center p-5">
        <div className="spongebob-time-card">Unos momentos después...</div>
        <h4 className="mt-4" style={{ fontFamily: 'Comic Sans MS, sans-serif' }}>
          🧽 Te dije que no había nada ahí.
        </h4>
      </div>
    );
  }

  if (attemptCount === 4) {
    return (
      <div className="text-center p-5">
        <div className="spongebob-time-card">Unos momentos después...</div>
        <h4 className="mt-4" style={{ fontFamily: 'Comic Sans MS, sans-serif' }}>
          🧽 ¿Sigues haciendo clic? Te lo advertí.
        </h4>
      </div>
    );
  }

  if (attemptCount === 5) {
    return (
      <div className="text-center p-5">
        <div className="spongebob-time-card">Unos momentos después...</div>
        <h4 className="mt-4" style={{ fontFamily: 'Comic Sans MS, sans-serif' }}>
          🧽 En serio, no hay nada aquí. Por favor, vete.
        </h4>
      </div>
    );
  }

  // Intento 6 o más: ¡La Mosca!
  return (
    <div className="fly-container">
      <p className="fly-text">
        El programador se cansó de advertirte y ahora verás una mosca volar.
      </p>
      <div className="the-fly">🪰</div>
      <Link href="/estudiantes/" className="rescue-btn">
        <i className="fa fa-home"></i> Volver al Inicio (y liberar a la mosca)
      </Link>
    </div>
  );
}