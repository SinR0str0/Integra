'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperaPasswordPage() {
  const [usuario, setUsuario] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState('/api/captcha');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?${Date.now()}`);
    setCaptcha('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!usuario) {
      setError('Ingrese su nombre de usuario y/o cuenta UNAM');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (!captcha) {
      setError('Favor de verificar el captcha.');
      setTimeout(() => setError(''), 6000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuario.toUpperCase(),
          captcha: captcha.toUpperCase()
        }),
      });

      const data = await response.json();

      if (data.ok === 'SI') {
        setSuccess(data.msg || 'Se ha enviado un enlace de recuperación a su correo registrado.');
        setTimeout(() => setSuccess(''), 8000);
      } else {
        setError(data.msg || 'Error al procesar la solicitud');
        setTimeout(() => setError(''), 6000);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setTimeout(() => setError(''), 6000);
    } finally {
      setLoading(false);
    }
  };

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

            {/* Mensaje de error/éxito debajo del manual (igual que login) */}
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
              {/* Campo Usuario */}
              <div className="form-group">
                <label htmlFor="txt_usuario">
                  Usuario y/o cuenta UNAM: <span className="required">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Usuario"
                    id="txt_usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.toUpperCase())}
                    required
                  />
                  <div className="input-group-append">
                    <span
                      className="input-group-text tooltip-custom"
                      data-tooltip="Capturar nombre de Usuario ó los 9 dígitos del No. de Cuenta UNAM"
                    >
                      <i className="fa fa-user"></i>
                    </span>
                  </div>
                </div>
              </div>

              {/* Captcha */}
              <div
                className="form-group text-center mb-3"
                style={{
                  backgroundColor: '#EEEEEE',
                  borderRadius: '10px',
                  border: '1px solid #B3B3B3',
                  padding: '1rem',
                  boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                }}
              >
                <label className="d-block mb-2">Por favor valide el Captcha</label>
                <img
                  src={captchaUrl}
                  alt="CAPTCHA"
                  className="mb-2 img-fluid"
                  style={{ maxHeight: '60px', cursor: 'pointer' }}
                  onClick={refreshCaptcha}
                  title="Click para recargar"
                />
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control text-center font-weight-bold"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ backgroundColor: '#FFFFFF' }}
                    required
                  />
                  <div className="input-group-append">
                    <span
                      className="input-group-text tooltip-custom cursor-pointer"
                      data-tooltip="Recargar Captcha"
                      onClick={refreshCaptcha}
                    >
                      <i className="fa fa-random"></i>
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón Recuperar Contraseña */}
              <button
                type="submit"
                className="btn btn-primary btn-block mt-3"
                style={{ boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.25)' }}
                disabled={loading}
              >
                Recuperar contraseña
              </button>
            </form>

            {/* Botón Inicio */}
            <div className="text-center mt-3">
              <Link href="/" className="d-block">
                <p className="font-weight-bold">Inicio</p>
              </Link>
            </div>

            {/* Datos obligatorios */}
            <div className="text-left mt-4">
              <label className="d-block small mb-2">
                <span className="required">*</span> Datos obligatorios
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}