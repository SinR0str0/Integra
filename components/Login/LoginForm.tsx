'use client';

import { useState } from 'react';

interface Props {
  onLogin: (user: string, pass: string, captcha: string) => Promise<string | null>;
  loading: boolean;
}

export default function LoginForm({ onLogin, loading }: Props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaUrl, setCaptchaUrl] = useState('/api/captcha'); 

  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?${Date.now()}`);
    setCaptcha('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Ingrese su nombre de usuario y/o cuenta UNAM');
      setTimeout(() => setError(null), 6000);
      return;
    }
    if (!pass) {
      setError('Ingrese su contraseña.');
      setTimeout(() => setError(null), 6000);
      return;
    }
    if (!captcha) {
      setError('Favor de verificar el captcha.');
      setTimeout(() => setError(null), 6000);
      return;
    }
    const errorMsg = await onLogin(user.toUpperCase(), pass, captcha.toUpperCase());
    
    if (errorMsg) {
      setError(errorMsg);
      setTimeout(() => setError(null), 10000);
    }
  };

  return (
    <div className="card card-login">
      <div className="text-center" style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
        <img src="/images/encabezado-consultas.jpg" alt="UNAM-DGOAE-INTEGRA" className="img-fluid" />
        <a href="https://www.integra.unam.mx/archivos/Manuales/InicioSesion.pdf" target="_blank" className="d-block mt-2">
          Manual de Usuario
        </a>

        {error && (
          <p className="mt-2" style={{ color: '#721c24', border: '1px solid #f5c6cb', padding: '0.75rem 1.25rem', marginBottom: '1rem', borderRadius: '0.25rem', backgroundColor: '#f8d7da' }}>
            {error}
          </p>
        )}
      </div>

      <div className="card-body">
        
        {loading && (
          <div className="text-center mb-3">
            <img src="/images/cargando.gif" alt="Cargando" width="50" height="50" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                value={user}
                onChange={(e) => setUser(e.target.value.toUpperCase())}
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
          
          <div className="form-group">
            <label htmlFor="txt_psw">
              Contraseña: <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                id="txt_psw"
                placeholder="**********"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
              <div className="input-group-append">
                <span 
                  className="input-group-text tooltip-custom cursor-pointer"
                  data-tooltip="Mostrar / Ocultar contraseña"
                  onClick={() => setShowPass(!showPass)}
                >
                  <i className={`fa ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </span>
              </div>
            </div>
          </div>
          
          <div className="form-group text-center" style={{ backgroundColor: '#EEEEEE', borderRadius: '10px', border: '1px solid #B3B3B3', padding: '1rem 0', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}>
            <label htmlFor="cap_captcha" className="mb-2" style={{ display: 'block' }}>
              Por favor valide el Captcha
            </label>
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
                className="form-control text-center"
                id="cap_captcha"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value.toUpperCase())}
                required
                maxLength={6}
                style={{ backgroundColor: '#FFFFFF', fontWeight: 'bold' }}
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

          <button 
            type="submit" 
            className="btn btn-primary btn-block mt-3" 
            style={{ boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.25)' }}
            disabled={loading}
          >
            Ingresar
          </button>
        </form>

        <div className="text-center mt-3">
          <a className="d-block small mb-2" href="/estudiantes/registro">Registrarse</a>
          <a className="d-block small" href="/configuracion/RecuperaPassword">Recuperar contraseña</a>
        </div>

        <div className="browser-icons-container">
          <img src="/images/crome.jpg" width="40" height="40" title="Chrome" className="img-fluid" alt="Chrome" />
          <img src="/images/firefox.jpg" width="40" height="40" title="Firefox" className="img-fluid" alt="Firefox" />
          <img src="/images/opera.jpg" width="40" height="40" title="Opera" className="img-fluid" alt="Opera" />
        </div>

        <div className="text-left mt-4">
          <label className="d-block small mb-2">
            <span className="required">*</span> Datos obligatorios
          </label>
          <p className="copyright-text">
            Copyright &copy; Integra 2026, todos los derechos reservados.<br />
            Administrado por la:{' '}
            <a href="https://www.integra.unam.mx/creditos/" target="_blank">
              Coordinación de Sistemas
            </a>{' '}
            de DGOAE.
          </p>
        </div>
      </div>
    </div>
  );
}