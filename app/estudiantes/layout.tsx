'use client';

import { useEffect, useState, ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, logout, checkEncuestaStatus } = useAuth();
  const pathname = usePathname();
  
  const [showEncuestaAlert, setShowEncuestaAlert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto
  const [encuestaChecked, setEncuestaChecked] = useState(false);
  const [isBecasOpen, setIsBecasOpen] = useState(false); // 👈 Cerrado por defecto

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
        setIsBecasOpen(true); // Abierto en desktop
      } else {
        setSidebarOpen(false);
        setIsBecasOpen(false); // 👈 Cerrado en móvil
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar al montar
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (encuestaChecked || !user) return;

    const abortController = new AbortController();
    const checkStatus = async () => {
      try {
        const realizada = await checkEncuestaStatus(abortController.signal);
        if (!realizada) setShowEncuestaAlert(true);
        setEncuestaChecked(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') console.error('Error al verificar encuesta:', error);
      }
    };
    
    checkStatus();
    return () => abortController.abort();
  }, [user, encuestaChecked, checkEncuestaStatus]);

  const menuItems = [
    { name: 'Tutorías', href: '/estudiantes/Tutoria' },
    { name: 'Preguntas Frecuentes', href: '/estudiantes/PreguntasFrecuentes' },
    { name: 'Scotiabank Tutorias', href: '/estudiantes/AdmScotianbank' },
    { name: 'Datos Personales', href: '/estudiantes/Personales' },
    { name: 'Mensajes', href: '/estudiantes/Mensajes' },
    { name: 'Solicitudes', href: '/estudiantes/Solicitudes' },
    { name: 'Archivos', href: '/estudiantes/Archivos' },
    { name: 'Datos de Pago', href: '/estudiantes/ClabeInterbancaria' },
    { name: 'Pagos', href: '/estudiantes/Pagos' },
    { name: 'Encuesta', href: '/estudiantes/Encuesta' },
    { name: 'Renuncias', href: '/estudiantes/Renuncias' },
    { name: 'Reintegros', href: '/estudiantes/Reintegros' },
    { name: 'Eventos', href: '/estudiantes/Eventos' },
  ];

  return (
    <div className={`main-layout-wrapper fixed-nav bg-dark ${!sidebarOpen ? 'sidenav-toggled' : ''}`} id="page-top">
      
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/estudiantes/">
            <img src="/images/Logo_Integra_Oro.png" alt="Integra" style={{ maxHeight: '40px' }} />
          </Link>

          {/* Botón Actualizar Datos - SOLO DESKTOP */}
          {showEncuestaAlert && (
            <div className="d-none d-lg-block ml-3">
              <Link href="/estudiantes/actualizar-datos" className="encuesta-alert-btn" onClick={() => setShowEncuestaAlert(false)}>
                <i className="fa fa-exclamation-triangle"></i> Actualizar Datos
              </Link>
            </div>
          )}

          <span className="nav-link user-info d-none d-lg-block mr-3">
            <i className="fa fa-user fa-fw"></i> {user?.cuenta_unam} - Estudiante
          </span>

          <div className="d-flex align-items-center ml-auto">
            {/* Botones de acción - SOLO DESKTOP */}
            <ul className="navbar-nav navbar-top-right d-none d-lg-flex">
              <li className="nav-item">
                <Link className="nav-link" href="/configuracion/CambioPassword">
                  <i className="fa fa-fw fa-key"></i> Cambiar Contraseña
                </Link> 
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/configuracion/CambioCorreo">
                  <i className="fa fa-fw fa-envelope"></i> Cambiar Correo
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link border-0 p-0" onClick={logout} style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <i className="fa fa-fw fa-sign-out"></i> Salir
                </button>
              </li>
            </ul>

            {/* Botón Hamburguesa - SOLO MÓVIL */}
            <button className="navbar-toggler d-lg-none border-0 ml-3" type="button" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'white', fontSize: '1.5rem', padding: '0.5rem' }}>
              <i className="fa fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar / Menú Lateral */}
      <ul className={`navbar-sidenav ${sidebarOpen ? 'show' : ''}`} id="exampleAccordion">
        <li className="nav-item">
          <a className="nav-link titsubtext" href="#" onClick={(e) => { e.preventDefault(); setIsBecasOpen(!isBecasOpen); }} aria-expanded={isBecasOpen}>
            <i className="fa fa-angle-double-right"></i> Becas 
            <i className="fa fa-fw fa-angle-down pull-right"></i>
          </a>
          
          <ul className={`over-link ${isBecasOpen ? 'show' : ''}`}>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link className={`nav-link over ${pathname === item.href ? 'active' : ''}`} href={item.href} onClick={() => { if (window.innerWidth < 992) setSidebarOpen(false); }}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/*  BOTONES DE ACCIÓN EN MÓVIL - Debajo de Becas */}
        <li className="d-lg-none" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem' }}>
          {showEncuestaAlert && (
            <Link href="/estudiantes/actualizar-datos" className="nav-link" onClick={() => { setShowEncuestaAlert(false); setSidebarOpen(false); }}>
              <i className="fa fa-exclamation-triangle"></i> Actualizar Datos
            </Link>
          )}
          <Link className="nav-link" href="/configuracion/CambioPassword" onClick={() => setSidebarOpen(false)}>
            <i className="fa fa-fw fa-key"></i> Cambiar Contraseña
          </Link>
          <Link className="nav-link" href="/configuracion/CambioCorreo" onClick={() => setSidebarOpen(false)}>
            <i className="fa fa-fw fa-envelope"></i> Cambiar Correo
          </Link>
          <button className="nav-link btn btn-link border-0 w-100 text-left" onClick={logout} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <i className="fa fa-fw fa-sign-out"></i> Salir
          </button>
        </li>

        {/* Botón de minimizar - SOLO DESKTOP */}
        <li className="sidenav-toggler-desktop">
          <a onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fa fa-fw ${sidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
          </a>
        </li>
      </ul>

      <div className="content-wrapper">
        <div className="container-fluid">
          {children}
        </div>

        <footer className="sticky-footer">
          <div className="container">
            <div className="copyright text-center text-muted" style={{ fontSize: '0.85rem', width: '100%' }}>
              Copyright &copy; Integra 2026, todos los derechos reservados. 
              Administrado por la: <Link href="/creditos" className="text-dark">Coordinación de Sistemas</Link> de DGOAE. 
              <Link href="/avisoprivacidad" className="text-dark ml-2"> Aviso de privacidad</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function EstudiantesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}