'use client';

import Link from 'next/link';
import FormularioSolicitud from '@/components/Solicitudes/FormularioSolicitud';
import ResetErrorCounter from '@/components/EasterEgg/ResetErrorCounter';

export default function SolicitudesPage() {
  return (
    <>
      <ResetErrorCounter />
      <div className="solicitudes-container">
        <h1 className="page-header">
          Solicitudes
        </h1>
          <p>Ingrese los siguientes datos para validar su información académica.</p>
        
        
        <div className="mb-3">
          <Link 
            href="https://www.integra.unam.mx/archivos/Manuales/Estudiantes_Solicitud.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Manual de Usuario
          </Link>
        </div>

        <div className="card mb-4">
          <div className="card-header">
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