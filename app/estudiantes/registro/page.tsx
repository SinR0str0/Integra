'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegistroPage() {
  // Estados del formulario
  const [cuenta, setCuenta] = useState('');
  const [correo, setCorreo] = useState('');
  const [confirmarCorreo, setConfirmarCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [curp, setCurp] = useState('');
  const [confirmarCurp, setConfirmarCurp] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState('/api/captcha');
  
  // Visibilidad de contraseñas
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  
  // Estados de error
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?${Date.now()}`);
    setCaptcha('');
  };

  // Validación del número de cuenta UNAM
  const validarCuenta = (valor: string): string | null => {
    if (!valor) return 'El número de cuenta es obligatorio';
    if (!/^\d+$/.test(valor)) return 'El número de cuenta solo debe contener números (sin guiones)';
    if (valor.length !== 9) return 'El número de cuenta debe tener exactamente 9 dígitos';
    if (parseInt(valor.charAt(0)) < 3) return 'El primer dígito del número de cuenta debe ser mayor o igual a 3';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    const errorCuenta = validarCuenta(cuenta);
    if (errorCuenta) {
      setError(errorCuenta);
      setTimeout(() => setError(''), 6000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('Ingrese un correo electrónico válido');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (correo !== confirmarCorreo) {
      setError('Los correos electrónicos no coinciden');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(''), 6000);
      return;
    }

    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    if (!curpRegex.test(curp)) {
      setError('El formato del CURP no es válido');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (curp !== confirmarCurp) {
      setError('Los CURP no coinciden');
      setTimeout(() => setError(''), 6000);
      return;
    }

    if (!captcha) {
      setError('Por favor ingrese el captcha');
      setTimeout(() => setError(''), 6000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuenta,
          correo,
          contrasena,
          curp,
          captcha: captcha.toUpperCase()
        }),
      });

      const data = await response.json();

      if (data.ok === 'SI') {
        setSuccess('¡Registro exitoso! Serás redirigido al inicio de sesión...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setError(data.msg || 'Error en el registro');
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
        <div className="card card-register">
          {/* Encabezado */}
          <div className="text-center p-3">
            <img src="/images/encabezado-consultas.jpg" alt="UNAM-DGOAE-INTEGRA" className="img-fluid" />
            <a href="https://www.integra.unam.mx/archivos/Manuales/Estudiantes_Registro.pdf" target="_blank" className="d-block mt-2">
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
            {/* Alerta informativa CURP */}
            <div className="alert alert-info text-center mb-3">
              <strong>¿ No sabes cuál es tu <span className="curp-text">CURP</span> ? </strong>
              <a 
                href="https://consultas.curp.gob.mx/CurpSP/gobmx/inicio.jsp" 
                target="_blank" 
              >
                Consúltalo aquí
              </a>
            </div>

            {loading && (
              <div className="text-center mb-3">
                <img src="/images/cargando.gif" alt="Cargando" width="50" height="50" />
              </div>
            )}

            <form className="mt-3" onSubmit={handleSubmit} autoComplete="off">
              {/* Número de cuenta UNAM */}
              <div className="form-group mb-3">
                <label htmlFor="cuenta">
                  No. de cuenta UNAM: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="cuenta"
                  value={cuenta}
                  onChange={(e) => {
                    // Solo permitir números
                    const valor = e.target.value.replace(/\D/g, '');
                    setCuenta(valor);
                  }}
                  maxLength={9}
                  placeholder="Ingresa tu Nº de cuenta UNAM"
                  required
                />
              </div>

              {/* Correo y Confirmar Correo */}
              <div className="form-row mb-3">
                <div className="col-md-6">
                  <label htmlFor="correo">
                    Correo: <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    id="correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ingresa tu correo"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmarCorreo">
                    Confirmar correo: <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    id="confirmarCorreo"
                    value={confirmarCorreo}
                    onChange={(e) => setConfirmarCorreo(e.target.value)}
                    placeholder="Confirmar correo"
                    required
                  />
                </div>
              </div>

              {/* Contraseña y Confirmar Contraseña */}
              <div className="form-row mb-3">
                <div className="col-md-6">
                  <label htmlFor="contrasena">
                    Contraseña: <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword1 ? 'text' : 'password'}
                      className="form-control form-control-sm"
                      id="contrasena"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
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
                <div className="col-md-6">
                  <label htmlFor="confirmarContrasena">
                    Confirmar contraseña: <span className="required">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      className="form-control form-control-sm"
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
              </div>

              {/* CURP y Confirmar CURP (con texto en negritas) */}
              <div className="form-row mb-3">
                <div className="col-md-6">
                  <label htmlFor="curp" className="curp-text">
                    CURP: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm curp-text"
                    id="curp"
                    value={curp}
                    onChange={(e) => setCurp(e.target.value.toUpperCase())}
                    maxLength={18}
                    placeholder="Ingresa tu CURP"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="confirmarCurp" className="curp-text">
                    Confirmar CURP: <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm curp-text"
                    id="confirmarCurp"
                    value={confirmarCurp}
                    onChange={(e) => setConfirmarCurp(e.target.value.toUpperCase())}
                    maxLength={18}
                    placeholder="Confirmar CURP"
                    required
                  />
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

              {/* Botón Registrar */}
              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.25)' }}
                disabled={loading}
              >
                R e g i s t r a r
              </button>
            </form>

            {/* Botón Inicio */}
            <div className="text-center mt-3">
              <Link href="/" className="d-block">
                <p className="font-weight-bold">Inicio</p>
              </Link>
            </div>

            {/* Datos obligatorios */}
            <div className="text-left mt-3">
              <label className="d-block small">
                <span className="required">*</span> Datos obligatorios
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}