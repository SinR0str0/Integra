'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function RestaurarPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(true);

  // Verificar el token al cargar la página
  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setError('Token no proporcionado. Por favor, use el enlace completo del correo.');
        setTokenValido(false);
        setVerificando(false);
        return;
      }

      try {
        const response = await fetch('/api/verificar-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.ok === 'SI') {
          setTokenValido(true);
        } else {
          setError(data.msg || 'El enlace de recuperación no es válido o ha expirado.');
          setTokenValido(false);
        }
      } catch (err) {
        setError('Error de conexión con el servidor.');
        setTokenValido(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(''), 6000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nueva_contrasena: nuevaContrasena,
        }),
      });

      const data = await response.json();

      if (data.ok === 'SI') {
        setSuccess('¡Contraseña actualizada exitosamente! Serás redirigido al inicio de sesión...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setError(data.msg || 'Error al cambiar la contraseña');
        setTimeout(() => setError(''), 6000);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setTimeout(() => setError(''), 6000);
    } finally {
      setLoading(false);
    }
  };

  // Estado de verificación del token
  if (verificando) {
    return (
      <div className="background">
        <div className="main-container">
          <div className="card card-login mx-auto">
            <div className="text-center p-3">
              <img src="/images/encabezado-consultas.jpg" alt="UNAM-DGOAE-INTEGRA" className="img-fluid" />
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <img src="/images/cargando.gif" alt="Verificando" width="50" height="50" />
              </div>
              <p className="mt-3">Verificando enlace de recuperación...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token inválido o no proporcionado
  if (!tokenValido) {
    return (
      <div className="background">
        <div className="main-container">
          <div className="card card-login mx-auto">
            <div className="text-center p-3">
              <img src="/images/encabezado-consultas.jpg" alt="UNAM-DGOAE-INTEGRA" className="img-fluid" />
              <a href="/archivos/Manuales/InicioSesion.pdf" target="_blank" className="d-block mt-2">
                Manual de Usuario
              </a>
              {error && (
                <p className="mt-2" style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                  {error}
                </p>
              )}
            </div>
            <div className="card-body">
              <div className="text-center mt-4">
                <p className="mb-3">
                  El enlace de recuperación no es válido o ha expirado.
                  <br />
                  Por favor, solicite un nuevo enlace desde la página de recuperación.
                </p>
                <Link href="/configuracion/RecuperaPassword" className="btn btn-primary btn-block mt-3">
                  Solicitar nuevo enlace
                </Link>
                <Link href="/" className="d-block mt-3">
                  <p className="font-weight-bold">Volver al Inicio</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token válido - Mostrar formulario
  return (
    <div className="background">
      <div className="main-container">
        <div className="card card-login mx-auto">
          {/* Encabezado */}
          <div className="text-center p-3">
            <img src="/images/encabezado-consultas.jpg" alt="UNAM-DGOAE-INTEGRA" className="img-fluid" />
            <a href="/archivos/Manuales/InicioSesion.pdf" target="_blank" className="d-block mt-2">
              Manual de Usuario
            </a>

            {/* Mensaje de error/éxito */}
            {error && (
              <p className="mt-2" style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                {error}
              </p>
            )}
            {success && (
              <p className="mt-2" style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                {success}
              </p>
            )}
          </div>

          <div className="card-body">
            {loading && (
              <div className="text-center mb-3">
                <img src="/images/cargando.gif" alt="Cargando" width="50" height="50" />
              </div>
            )}

            <form className="mt-3" onSubmit={handleSubmit}>
              {/* Nueva Contraseña */}
              <div className="form-group">
                <label htmlFor="nuevaContrasena">
                  Nueva contraseña: <span className="required">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword1 ? 'text' : 'password'}
                    className="form-control"
                    id="nuevaContrasena"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    maxLength={20}
                    placeholder="**********"
                    required
                  />
                  <div className="input-group-append">
                    <span
                      className="input-group-text tooltip-custom cursor-pointer"
                      data-tooltip="Mostrar / Ocultar contraseña"
                      onClick={() => setShowPassword1(!showPassword1)}
                    >
                      <i className={`fa ${showPassword1 ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="form-group">
                <label htmlFor="confirmarContrasena">
                  Confirmar contraseña: <span className="required">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword2 ? 'text' : 'password'}
                    className="form-control"
                    id="confirmarContrasena"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    maxLength={20}
                    placeholder="**********"
                    required
                  />
                  <div className="input-group-append">
                    <span
                      className="input-group-text tooltip-custom cursor-pointer"
                      data-tooltip="Mostrar / Ocultar contraseña"
                      onClick={() => setShowPassword2(!showPassword2)}
                    >
                      <i className={`fa ${showPassword2 ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Cambiar Contraseña */}
              <button
                type="submit"
                className="btn btn-primary btn-block mt-3"
                style={{ boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.25)' }}
                disabled={loading}
              >
                Cambiar contraseña
              </button>
            </form>

            {/* Botón Inicio */}
            <div className="text-center mt-3">
              <Link href="/" className="d-block">
                <p className="font-weight-bold" style={{ color: 'var(--primary-color)' }}>Inicio</p>
              </Link>
            </div>

            {/* Datos obligatorios */}
            <div className="text-left mt-4">
              <label className="d-block small mb-2">
                <span className="required">*</span> Datos obligatorios
              </label>
              <p className="copyright-text">
                Copyright © Integra 2026, todos los derechos reservados.<br />
                Administrado por la:{' '}
                <a href="/creditos" target="_blank" style={{ color: '#1C3D6C' }}>
                  Coordinación de Sistemas
                </a>{' '}
                de DGOAE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurarPasswordPage() {
  return (
    <Suspense fallback={
      <div className="background">
        <div className="main-container">
          <div className="card card-login mx-auto">
            <div className="card-body text-center">
              <img src="/images/cargando.gif" alt="Cargando" width="50" height="50" />
              <p className="mt-3">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <RestaurarPasswordForm />
    </Suspense>
  );
}