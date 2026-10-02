'use client';

import { useState, useMemo } from 'react';
import SelectCascada from './SelectCascada';
import { datosAcademicos, NIVELES_INICIALES, Opcion } from '@/data/datosAcademicos';
import { evaluar, filtrarIncompatibles, Perfil } from '@/utils/motor';
import ResultadosBecas from '@/components/Solicitudes/ResultadosBecas';

export default function FormularioSolicitud() {
  const [nivel, setNivel] = useState('');
  const [plantel, setPlantel] = useState('');
  const [carrera, setCarrera] = useState('');

  const [vista, setVista] = useState<'formulario' | 'resultados'>('formulario');
  const [resultados, setResultados] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleNivelChange = (v: string) => { setNivel(v); setPlantel(''); setCarrera(''); setVista('formulario'); setError(''); };
  const handlePlantelChange = (v: string) => { setPlantel(v); setCarrera(''); setVista('formulario'); setError(''); };
  const handleCarreraChange = (v: string) => { setCarrera(v); setVista('formulario'); setError(''); };

  const validar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nivel || !plantel || !carrera) {
      setError('Por favor completa todos los campos antes de validar.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const resPerfil = await fetch('/api/perfil');
      const dataPerfil = await resPerfil.json();

      if (dataPerfil.ok !== 'SI' || !dataPerfil.data.existe) {
        throw new Error('No tienes datos en la encuesta. Completa tu <a href="/estudiantes/actualizar-datos" class="alert-link">Encuesta de Datos</a> primero.');
      }

      const p = dataPerfil.data.datos;

      if (!p.promedio_actual || !p.semestre_actual) {
        throw new Error('Tu encuesta no tiene promedio o semestre. Actualiza tu <a href="/estudiantes/actualizar-datos" class="alert-link">Encuesta de Datos</a>.');
      }

      const resConv = await fetch('/api/convocatorias');
      const dataConv = await resConv.json();

      if (dataConv.ok !== 'SI') {
        throw new Error('No se pudieron cargar las convocatorias.');
      }

      // ✅ Se agregaron tiene_discapacidad y es_pueblo_marginal al perfil
      const perfil: Perfil = {
        promedio: Number(p.promedio_actual),
        semestre: Number(p.semestre_actual),
        genero: (p.genero as any) || undefined,
        escuela: 'UNAM',
        institucionPublica: true,
        carrera: carrera, // La carrera capturada en el formulario
        ingresoMensual: Number(p.ingresos_mensuales_totales) || undefined,
        zona: p.estado_residencia || undefined,
        es_pueblo_marginal: (p.es_pueblo_marginal as any) || undefined,
        tiene_discapacidad: (p.tiene_discapacidad as any) || undefined,
        salarioMinimo: 9582.47,
        hoy: new Date()
      };

      const resultadoEvaluacion = evaluar(dataConv.data, perfil);
      
      // ✅ Aplicamos el filtro de incompatibilidades
      const resultadoFiltrado = filtrarIncompatibles(resultadoEvaluacion);
      
      setResultados(resultadoFiltrado);
      setVista('resultados');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    setVista('formulario');
    setResultados(null);
    setError('');
  };

  if (vista === 'resultados' && resultados) {
    return <ResultadosBecas resultados={resultados} onVolver={handleVolver} />;
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
        <div className="alert alert-danger text-center text-sm animate-fadeIn mt-3" dangerouslySetInnerHTML={{ __html: error }} />
      )}

      {carrera && (
        <div className="animate-fadeIn">
          <button type="submit" className="btn-unam" disabled={loading}>
            {loading ? <><i className="fa fa-spinner fa-spin mr-1"></i> Evaluando...</> : 'Validar Información'}
          </button>
        </div>
      )}
    </form>
  );
}