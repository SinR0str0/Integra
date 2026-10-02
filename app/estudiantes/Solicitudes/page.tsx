'use client';

import Link from 'next/link';
import FormularioSolicitud from '@/components/Solicitudes/FormularioSolicitud';
import ResetErrorCounter from '@/components/EasterEgg/ResetErrorCounter';

export default function SolicitudesPage() {
  return (
    <>
      <ResetErrorCounter />
      <div className="solicitudes-container">
        <h1 className="page-header text-center">
          Solicitudes
          <br />
          <small>Ingrese los siguientes datos para validar su información académica.</small>
        </h1>
        
        <div className="mb-3 text-center">
          <Link 
            href="https://www.integra.unam.mx/archivos/Manuales/Estudiantes_Solicitud.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-sm btn-info"
          >
            Manual de Usuario
          </Link>
        </div>

        <div className="card mb-4">
          <div className="card-header text-center">
            Datos académicos
          </div>
          <div className="card-body">
            <FormularioSolicitud />
          </div>
        </div>
      </div>
    </>
  );
}