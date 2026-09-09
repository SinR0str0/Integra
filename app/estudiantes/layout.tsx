'use client';

import { useEffect, useState, ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, logout, checkEncuestaStatus } = useAuth();
  const pathname = usePathname();
  const [showEncuestaAlert, setShowEncuestaAlert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [encuestaChecked, setEncuestaChecked] = useState(false);

  useEffect(() => {
    // Verificar estado de encuesta SOLO una vez al cargar
    if (!encuestaChecked && user) {
      const checkStatus = async () => {
        const realizada = await checkEncuestaStatus();
        if (!realizada) {
          setShowEncuestaAlert(true);
        }
        setEncuestaChecked(true);
      };
      
      checkStatus();
    }
  }, [user, encuestaChecked, checkEncuestaStatus]);

  const menuItems = [
    { name: 'Tutorías', href: '/responsables/Tutoria' },
    { name: 'Preguntas Frecuentes', href: '/administrativos/PreguntasFrecuentes' },
    { name: 'Scotiabank Tutorias', href: '/administrativos/AdmScotianbank' },
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
    <div className="fixed-nav sticky-footer bg-dark" id="page-top">
      {/* Navbar Superior */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
        <a className="navbar-brand" href="/estudiantes/">
          <img src="/images/Logo_Integra_Oro.png" alt="Integra" className="img-fluid" width="150" />
        </a>

        {showEncuestaAlert && (
          <div className="ml-3 d-none d-lg-block">
            <Link 
              href="/estudiantes/actualizar-datos"
              className="btn btn-warning btn-sm"
              onClick={() => setShowEncuestaAlert(false)}
            >
              <i className="fa fa-exclamation-triangle"></i> Actualizar Datos
            </Link>
          </div>
        )}

        <ul className="navbar-nav ml-auto">
          <li className="nav-item" data-toggle="tooltip" data-placement="right" title="">
            <span className="nav-link">
              <i className="fa fa-user fa-fw"></i>
              {user?.cuenta_unam} - Estudiante
            </span>
          </li>
        </ul>

        <button 
          className="navbar-toggler navbar-toggler-right" 
          type="button" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${sidebarOpen ? 'show' : ''}`} id="navbarResponsive">
          {/* Menú Lateral Izquierdo */}
          <ul className="navbar-nav navbar-sidenav" id="exampleAccordion">
            <br/><br/>
            <li className="nav-item">
              <i className="nav-link fa fa-angle-double-right fetchx collapse show" id="Becas" style={{display: 'none'}}></i>
              <a className="nav-link titsubtext" href="#" data-toggle="collapse" data-target="#Becas" aria-expanded="true">
                <i className="fa fa-angle-double-right"></i> Becas 
                <i className="fa fa-fw fa-angle-down pull-right"></i>
              </a>
              <ul id="Becas" className="over-link collapse show" style={{backgroundColor: 'rgb(52, 58, 64)', borderRadius: '10px'}}>
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link 
                      className={`nav-link over ${pathname === item.href ? 'active' : ''}`} 
                      href={item.href}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          {/* Botón Toggle Sidebar */}
          <ul className="navbar-nav sidenav-toggler">
            <li className="nav-item">
              <a className="nav-link text-center" id="sidenavToggler" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <i className="fa fa-fw fa-angle-left"></i>
              </a>
            </li>
          </ul>

          {/* Menú Superior Derecho */}
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/configuracion/CambioPassword">
                <i className="fa fa-fw fa-key"></i>Cambiar Contraseña
              </Link> 
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/configuracion/CambioCorreo">
                <i className="fa fa-fw fa-envelope"></i>Cambiar Correo
              </Link>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={logout}>
                <i className="fa fa-fw fa-sign-out"></i>Salir
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="content-wrapper">
        <div className="container-fluid">
          {children}
        </div>

        {/* Footer */}
        <footer className="sticky-footer">
          <div className="container">
            <div className="copyright">
              Copyright © Integra 2026, todos los derechos reservados. 
              Administrado por la: <a href="/creditos">Coordinación de Sistemas</a> de DGOAE. 
              <a href="/avisoprivacidad"> Aviso de privacidad</a>
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