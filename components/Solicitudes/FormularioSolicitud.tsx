'use client';

import { useState, useMemo } from 'react';
import SelectCascada from './SelectCascada';
import { datosAcademicos, NIVELES_INICIALES, Opcion } from '@/data/datosAcademicos';

export default function FormularioSolicitud() {
  const [nivel, setNivel] = useState('');
  const [plantel, setPlantel] = useState('');
  const [carrera, setCarrera] = useState('');

  const [mostrarOK, setMostrarOK] = useState(false);
  const [error, setError] = useState('');

  // Obtener opciones en cascada (Solo 2 niveles de profundidad)
  const opcionesPlantel = useMemo<Opcion[]>(() => {
    if (!nivel) return [];
    const n = datosAcademicos[nivel];
    return n?.hijos ? Object.values(n.hijos) : [];
  }, [nivel]);

  const opcionesCarrera = useMemo<Opcion[]>(() => {
    if (!nivel || !plantel) return [];
    const p = datosAcademicos[nivel]?.hijos?.[plantel];
    return p?.hijos ? Object.values(p.hijos) : [];
  }, [nivel, plantel]);

  // Handlers con reset en cascada
  const handleNivelChange = (v: string) => {
    setNivel(v); setPlantel(''); setCarrera('');
    setMostrarOK(false); setError('');
  };

  const handlePlantelChange = (v: string) => {
    setPlantel(v); setCarrera('');
    setMostrarOK(false); setError('');
  };

  const handleCarreraChange = (v: string) => {
    setCarrera(v);
    setMostrarOK(false); setError('');
  };

  const validar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nivel || !plantel || !carrera) {
      setError('Por favor completa todos los campos antes de validar.');
      setMostrarOK(false);
      return;
    }
    setError('');
    setMostrarOK(true);
  };

  if (mostrarOK) {
    return (
      <div className="alert alert-success text-center animate-fadeIn" role="alert">
        <h4 className="alert-heading mb-3">OK</h4>
        <p className="mb-3">Tu información académica ha sido validada correctamente.</p>
        <hr />
        <div className="text-left" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p className="mb-1"><strong>Nivel:</strong> {nivel}</p>
          <p className="mb-1"><strong>Plantel:</strong> {opcionesPlantel.find(p => p.id === plantel)?.nombre}</p>
          <p className="mb-1"><strong>Carrera:</strong> {opcionesCarrera.find(c => c.id === carrera)?.nombre}</p>
        </div>
        <button 
          className="btn btn-sm btn-outline-success mt-4"
          onClick={() => {
            setNivel(''); setPlantel(''); setCarrera('');
            setMostrarOK(false);
          }}
        >
          Realizar otra validación
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={validar}>
      <div className="solicitudes-form-group animate-fadeIn">
        <label className="solicitudes-label">Nivel:</label>
        <SelectCascada opciones={NIVELES_INICIALES} valor={nivel} onChange={handleNivelChange} />
      </div>

      {nivel && (
        <div className="solicitudes-form-group animate-fadeIn">
          <label className="solicitudes-label">Plantel:</label>
          <SelectCascada opciones={opcionesPlantel} valor={plantel} onChange={handlePlantelChange} />
        </div>
      )}

      {plantel && (
        <div className="solicitudes-form-group animate-fadeIn">
          <label className="solicitudes-label">Carrera:</label>
          <SelectCascada opciones={opcionesCarrera} valor={carrera} onChange={handleCarreraChange} />
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center text-sm animate-fadeIn mt-3">
          {error}
        </div>
      )}

      {carrera && (
        <div className="animate-fadeIn">
          <button type="submit" className="btn-unam">
            Validar Información
          </button>
        </div>
      )}
    </form>
  );
}