'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResetErrorCounter from '@/components/EasterEgg/ResetErrorCounter';
import { 
  AREAS, CARRERAS_DICT, ZONAS, PUNTOS_ESCOLARIDAD, CORTES_NSE, SALARIO_MINIMO_MENSUAL, norm 
} from '@/data/encuestaDatos';

export default function ActualizarDatosPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Record<string, any>>({
    institucion: 'UNAM',
    cuenta_unam: user?.cuenta_unam || '',
    servicios: [],
    numero_cuenta: user?.cuenta_unam || '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Cargar datos previos
  useEffect(() => {
    if (!user?.cuenta_unam) return;
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/encuesta-data');
        const result = await res.json();
        if (result.ok === 'SI' && result.data.existe && result.data.datos) {
          setFormData(prev => ({ ...prev, ...result.data.datos, numero_cuenta: user.cuenta_unam }));
        } else {
          setFormData(prev => ({ ...prev, numero_cuenta: user.cuenta_unam }));
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setLoadError('No se pudieron cargar tus datos previos.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user?.cuenta_unam]);

  // Manejo de cambios con reglas de negocio
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const current = prev[name] || [];
        if (checked) return { ...prev, [name]: [...current, value] };
        return { ...prev, [name]: current.filter((v: string) => v !== value) };
      });
    } else {
      setFormData(prev => {
        const newState = { ...prev, [name]: value };
        
        // Regla 1: Si hay materias reprobadas pendientes, es Irregular automáticamente
        if (name === 'materias_reprobadas' && Number(value) > 0) {
          newState.estatus_escolar = 'Irregular';
        }
        
        // Regla 2: Si NO es madre/padre y principal sostén, hijos = 0
        if (name === 'es_madre_jefa' && value === 'No') {
          newState.numero_hijos = 0;
        }
        
        return newState;
      });
    }
  };

  // Cálculos automáticos en segundo plano
  useEffect(() => {
    const carreraNorm = norm(formData.carrera_actual || '');
    const carreraData = CARRERAS_DICT[carreraNorm];
    const cp = formData.codigo_postal || '';
    const zona = ZONAS[cp];
    const ingresos = parseFloat(String(formData.ingresos_mensuales_totales).replace(/[$,\s]/g, '')) || 0;
    const creditosTotales = Number(formData.creditos_totales) || 0;
    const creditosCursados = Number(formData.creditos_cursados) || 0;

    const nuevaClave = carreraData ? (carreraData.clave || 'Pendiente') : '';
    const porcentaje = creditosTotales ? ((creditosCursados / creditosTotales) * 100).toFixed(1) : '';
    
    // Regularidad automática si no se forzó por materias reprobadas
    const esRegular = formData.estatus_escolar === 'Regular' && (Number(formData.materias_reprobadas) || 0) === 0 ? 'Sí' : 'No';

    // Mujer en ciencia: Género Femenino + Área 1 (Físico-Matemáticas e Ingenierías)
    let mujerCiencia = 'No';
    if (formData.genero === 'Femenino' && carreraData && carreraData.area === 1) {
      mujerCiencia = 'Sí';
    }

    // Zona marginal: Forzar 'NO' si no es marginal
    const esMarginal = zona ? (zona.marginal ? 'SÍ' : 'NO') : (cp ? 'SIN DATO' : '');
    const ids = zona ? zona.ids : (cp ? 'SIN DATO' : '');

    // Cálculo NSE AMAI
    let nse = '';
    if (formData.jefe_familia_escolaridad && formData.tiene_internet && formData.cuartos_dormir !== '') {
      let puntos = PUNTOS_ESCOLARIDAD[formData.jefe_familia_escolaridad] ?? 0;
      puntos += Number(formData.num_banos) === 1 ? 24 : Number(formData.num_banos) >= 2 ? 47 : 0;
      puntos += Number(formData.num_autos) === 1 ? 22 : Number(formData.num_autos) >= 2 ? 43 : 0;
      puntos += formData.tiene_internet === 'Sí' ? 32 : 0;
      puntos += Number(formData.personas_trabajan) === 1 ? 15 : Number(formData.personas_trabajan) >= 2 ? 31 : 0;
      const cuartos = Number(formData.cuartos_dormir);
      puntos += cuartos === 2 ? 12 : cuartos === 3 ? 22 : cuartos >= 4 ? 32 : 0;
      const corte = CORTES_NSE.find(([minimo]) => puntos >= minimo);
      nse = corte ? corte[1] : "E";
    }

    const ingresosEnSM = ingresos ? (ingresos / SALARIO_MINIMO_MENSUAL).toFixed(2) : '';
    const fechaNse = nse ? new Date().toLocaleDateString('sv-SE') : '';

    setFormData(prev => {
      if (
        prev.clave_carrera === nuevaClave && prev.porcentaje_creditos === porcentaje &&
        prev.regular === esRegular && prev.es_mujer_ciencia === mujerCiencia &&
        prev.es_pueblo_marginal === esMarginal && prev.indice_desarrollo_social === ids &&
        prev.nse_amai === nse && prev.ingresos_en_salarios_minimos === ingresosEnSM &&
        prev.fecha_calculo_nse === fechaNse
      ) return prev;

      return {
        ...prev,
        clave_carrera: nuevaClave,
        porcentaje_creditos: porcentaje,
        regular: esRegular,
        es_mujer_ciencia: mujerCiencia,
        es_pueblo_marginal: esMarginal,
        indice_desarrollo_social: ids,
        nse_amai: nse,
        ingresos_en_salarios_minimos: ingresosEnSM,
        fecha_calculo_nse: fechaNse
      };
    });
  }, [
    formData.carrera_actual, formData.creditos_totales, formData.creditos_cursados,
    formData.estatus_escolar, formData.materias_reprobadas, formData.genero,
    formData.codigo_postal, formData.jefe_familia_escolaridad, formData.tiene_internet,
    formData.cuartos_dormir, formData.num_banos, formData.num_autos, formData.personas_trabajan,
    formData.ingresos_mensuales_totales
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/encuesta-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datos: formData }),
      });
      const result = await res.json();
      if (result.ok === 'SI') {
        alert('OK');
        router.push('/estudiantes/');
      } else {
        throw new Error(result.msg || 'Error al guardar');
      }
    } catch (err: any) {
      alert(err.message || 'Hubo un error al guardar tus datos.');
    } finally {
      setSubmitting(false);
    }
  };

  const showIf = (campo: string, valorEsperado: string) => formData[campo] === valorEsperado;

  return (
    <>
        <ResetErrorCounter />
        <div className="encuesta-page">
        <h1 className="page-header">
            Actualizar Datos
            <small>Encuesta para recomendación de becas UNAM. Los campos calculados se guardan automáticamente.</small>
        </h1>

        {loading && <div className="loading-banner"><i className="fa fa-spinner fa-spin mr-2"></i>Cargando tus datos previos...</div>}
        {loadError && !loading && <div className="error-banner"><i className="fa fa-exclamation-triangle mr-2"></i>{loadError}</div>}

        <form onSubmit={handleSubmit}>
            {/* 1. DATOS PERSONALES */}
            <section>
            <h2>1. Datos personales</h2>
            <div className="section-body grid">
                <label>Número de cuenta
                <input type="text" name="numero_cuenta" value={formData.numero_cuenta || ''} readOnly tabIndex={-1} />
                </label>
                <label>Nombre completo
                <input type="text" name="nombre_completo" value={formData.nombre_completo || ''} onChange={handleChange} required />
                </label>
                <label>Correo institucional
                <input type="email" name="correo_institucional" value={formData.correo_institucional || ''} onChange={handleChange} required />
                </label>
                <label>Teléfono
                <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} />
                </label>
                <label>Fecha de nacimiento
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleChange} />
                </label>
                <label>Género
                <select name="genero" value={formData.genero || ''} onChange={handleChange} required>
                    <option value="">Selecciona…</option>
                    <option>Femenino</option>
                    <option>Masculino</option>
                    <option>Otro</option>
                    <option>Prefiero no decir</option>
                </select>
                </label>
            </div>
            </section>

            {/* 2. DATOS ACADÉMICOS */}
            <section>
            <h2>2. Datos académicos</h2>
            <div className="section-body grid">
                <label>Carrera actual
                <input type="text" name="carrera_actual" list="carreras" value={formData.carrera_actual || ''} onChange={handleChange} required />
                </label>
                <label>Semestre actual
                <input type="number" name="semestre_actual" min="1" max="14" value={formData.semestre_actual || ''} onChange={handleChange} required />
                </label>
                <label>Créditos cursados
                <input type="number" name="creditos_cursados" min="0" max="600" value={formData.creditos_cursados || ''} onChange={handleChange} required />
                </label>
                <label>Créditos totales del plan
                <input type="number" name="creditos_totales" min="1" max="600" value={formData.creditos_totales || ''} onChange={handleChange} required />
                </label>
                <label>Promedio actual
                <input type="number" name="promedio_actual" min="0" max="10" step="0.01" value={formData.promedio_actual || ''} onChange={handleChange} required />
                </label>
                <label>Materias reprobadas (historial total)
                <input type="number" name="materias_reprobadas_total" min="0" max="99" value={formData.materias_reprobadas_total || ''} onChange={handleChange} />
                </label>
                <label>Materias reprobadas pendientes (actuales)
                <input type="number" name="materias_reprobadas" min="0" max="99" value={formData.materias_reprobadas || ''} onChange={handleChange} />
                </label>
                
                {/* Regla: Si hay materias reprobadas > 0, se oculta el select y se fuerza "Irregular" */}
                {Number(formData.materias_reprobadas) === 0 && (
                <label>Estatus escolar
                    <select name="estatus_escolar" value={formData.estatus_escolar || ''} onChange={handleChange} required>
                    <option value="">Selecciona…</option>
                    <option>Regular</option>
                    <option>Irregular</option>
                    </select>
                </label>
                )}
                
                <label>Veces que cambiaste de carrera
                <input type="number" name="veces_cambio_carrera" min="0" max="5" value={formData.veces_cambio_carrera || ''} onChange={handleChange} />
                </label>
                <label>Modalidad
                <select name="modalidad" value={formData.modalidad || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Escolarizada</option>
                    <option>Abierta</option>
                    <option>A distancia</option>
                    <option>Mixta</option>
                </select>
                </label>
                <label>Turno
                <select name="turno" value={formData.turno || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Matutino</option>
                    <option>Vespertino</option>
                    <option>Mixto</option>
                </select>
                </label>
                <label>Tipo de ingreso
                <select name="tipo_ingreso" value={formData.tipo_ingreso || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Pase reglamentado</option>
                    <option>Concurso de selección</option>
                    <option>Otro</option>
                </select>
                </label>
                <label>Año de ingreso
                <input type="number" name="anio_ingreso" min="2000" max="2026" value={formData.anio_ingreso || ''} onChange={handleChange} />
                </label>
            </div>
            </section>

            {/* 3. VIVIENDA Y HOGAR */}
            <section>
            <h2>3. Vivienda y hogar</h2>
            <div className="section-body grid">
                <label>Tipo de vivienda
                <select name="tipo_vivienda" value={formData.tipo_vivienda || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Casa</option>
                    <option>Departamento</option>
                    <option>Vecindad</option>
                    <option>Cuarto</option>
                    <option>Otra</option>
                </select>
                </label>
                <label>Tenencia
                <select name="tenencia_vivienda" value={formData.tenencia_vivienda || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Propia</option>
                    <option>Rentada</option>
                    <option>Prestada</option>
                    <option>Hipotecada</option>
                </select>
                </label>
                <label>Antigüedad (años)
                <input type="number" name="antiguedad_vivienda" min="0" max="100" value={formData.antiguedad_vivienda || ''} onChange={handleChange} />
                </label>
                <label>Habitaciones
                <input type="number" name="habitaciones" min="1" max="20" value={formData.habitaciones || ''} onChange={handleChange} />
                </label>
                <label>Cuartos para dormir
                <input type="number" name="cuartos_dormir" min="0" max="20" value={formData.cuartos_dormir || ''} onChange={handleChange} />
                </label>
                <label>Baños completos
                <input type="number" name="num_banos" min="0" max="10" value={formData.num_banos || ''} onChange={handleChange} />
                </label>
                <fieldset className="full">
                <legend>Servicios</legend>
                {['Agua entubada', 'Luz', 'Drenaje', 'Gas', 'Pavimento'].map(serv => (
                    <label key={serv} className="check">
                    <input type="checkbox" name="servicios" value={serv} checked={(formData.servicios || []).includes(serv)} onChange={handleChange} /> {serv}
                    </label>
                ))}
                </fieldset>
                <label>¿Internet en casa?
                <select name="tiene_internet" value={formData.tiene_internet || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                <label>¿Auto en casa?
                <select name="tiene_auto" value={formData.tiene_auto || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                {showIf('tiene_auto', 'Sí') && (
                <label>Número de autos
                    <input type="number" name="num_autos" min="1" max="10" value={formData.num_autos || ''} onChange={handleChange} />
                </label>
                )}
                <label>¿Tienes computadora?
                <select name="tiene_computadora" value={formData.tiene_computadora || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                <label>Integrantes de la familia
                <input type="number" name="integrantes_familia" min="1" max="20" value={formData.integrantes_familia || ''} onChange={handleChange} required />
                </label>
                <label>Estado de residencia
                <input type="text" name="estado_residencia" value={formData.estado_residencia || ''} onChange={handleChange} />
                </label>
                <label>Colonia
                <input type="text" name="nombre_colonia" value={formData.nombre_colonia || ''} onChange={handleChange} />
                </label>
                <label>Código postal
                <input type="text" name="codigo_postal" value={formData.codigo_postal || ''} onChange={handleChange} required />
                </label>
            </div>
            </section>

            {/* 4. ECONOMÍA FAMILIAR */}
            <section>
            <h2>4. Economía familiar</h2>
            <div className="section-body grid">
                <label>Principal fuente de ingreso
                <select name="fuente_ingreso" value={formData.fuente_ingreso || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sueldo</option>
                    <option>Negocio propio</option>
                    <option>Remesas</option>
                    <option>Pensión</option>
                    <option>Apoyos</option>
                    <option>Otra</option>
                </select>
                </label>
                <label>Gasto mensual total (MXN)
                <input type="text" inputMode="decimal" name="gasto_mensual_total" placeholder="Ej. 8500" value={formData.gasto_mensual_total || ''} onChange={handleChange} />
                </label>
                <label>Ingresos mensuales del hogar (MXN)
                <input type="text" inputMode="decimal" name="ingresos_mensuales_totales" placeholder="Ej. 8500" value={formData.ingresos_mensuales_totales || ''} onChange={handleChange} required />
                </label>
                <label>Personas que trabajaron el mes pasado
                <input type="number" name="personas_trabajan" min="0" max="15" value={formData.personas_trabajan || ''} onChange={handleChange} />
                </label>
                <label>Ocupación del padre
                <input type="text" name="padre_ocupacion" value={formData.padre_ocupacion || ''} onChange={handleChange} />
                </label>
                <label>Escolaridad del padre
                <select name="padre_escolaridad" value={formData.padre_escolaridad || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sin estudios</option>
                    <option>Primaria</option>
                    <option>Secundaria</option>
                    <option>Bachillerato</option>
                    <option>Licenciatura</option>
                    <option>Posgrado</option>
                </select>
                </label>
                <label>Ocupación de la madre
                <input type="text" name="madre_ocupacion" value={formData.madre_ocupacion || ''} onChange={handleChange} />
                </label>
                <label>Escolaridad de la madre
                <select name="madre_escolaridad" value={formData.madre_escolaridad || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sin estudios</option>
                    <option>Primaria</option>
                    <option>Secundaria</option>
                    <option>Bachillerato</option>
                    <option>Licenciatura</option>
                    <option>Posgrado</option>
                </select>
                </label>
                <label>Ocupación del jefe(a) de familia
                <input type="text" name="jefe_familia_ocupacion" value={formData.jefe_familia_ocupacion || ''} onChange={handleChange} />
                </label>
                <label>Escolaridad del jefe(a) de familia
                <select name="jefe_familia_escolaridad" value={formData.jefe_familia_escolaridad || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sin estudios</option>
                    <option>Primaria</option>
                    <option>Secundaria</option>
                    <option>Bachillerato</option>
                    <option>Licenciatura</option>
                    <option>Posgrado</option>
                </select>
                </label>
            </div>
            </section>

            {/* 5. SITUACIÓN LABORAL */}
            <section>
            <h2>5. Situación laboral</h2>
            <div className="section-body grid">
                <label>¿Trabajas?
                <select name="trabaja" value={formData.trabaja || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                {showIf('trabaja', 'Sí') && (
                <>
                    <label>Lugar de trabajo
                    <input type="text" name="lugar_trabajo" value={formData.lugar_trabajo || ''} onChange={handleChange} />
                    </label>
                    <label>Horario
                    <input type="text" name="horario_trabajo" value={formData.horario_trabajo || ''} onChange={handleChange} />
                    </label>
                    <label>Ingreso propio mensual (MXN)
                    <input type="text" inputMode="decimal" name="ingreso_propio" placeholder="Ej. 8500" value={formData.ingreso_propio || ''} onChange={handleChange} />
                    </label>
                    <label>Tipo de empleo
                    <select name="tipo_empleo" value={formData.tipo_empleo || ''} onChange={handleChange}>
                        <option value="">Selecciona…</option>
                        <option>Formal</option>
                        <option>Informal</option>
                        <option>Freelance</option>
                        <option>Prácticas/servicio</option>
                    </select>
                    </label>
                </>
                )}
            </div>
            </section>

            {/* 6. CONDICIONES ESPECÍFICAS */}
            <section>
            <h2>6. Condiciones específicas</h2>
            <div className="section-body grid">
                <label>¿Perteneces a un pueblo indígena?
                <select name="es_indigena" value={formData.es_indigena || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                {showIf('es_indigena', 'Sí') && (
                <label>¿Cuál pueblo?
                    <input type="text" name="pueblo_indigena" value={formData.pueblo_indigena || ''} onChange={handleChange} />
                </label>
                )}
                <label>¿Te identificas como afromexicano(a)?
                <select name="es_afromexicano" value={formData.es_afromexicano || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                <label>¿Hablas lengua indígena?
                <select name="habla_lengua_indigena" value={formData.habla_lengua_indigena || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                {showIf('habla_lengua_indigena', 'Sí') && (
                <label>¿Cuál lengua?
                    <input type="text" name="cual_lengua" value={formData.cual_lengua || ''} onChange={handleChange} />
                </label>
                )}
                <label>¿Eres madre/padre y principal sostén de tu familia?
                <select name="es_madre_jefa" value={formData.es_madre_jefa || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                <label>Número de hijos(as)
                <input type="number" name="numero_hijos" min="0" max="10" value={formData.numero_hijos || 0} onChange={handleChange} />
                </label>
                <label>¿Tienes alguna discapacidad?
                <select name="tiene_discapacidad" value={formData.tiene_discapacidad || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                {showIf('tiene_discapacidad', 'Sí') && (
                <label>Tipo de discapacidad
                    <input type="text" name="tipo_discapacidad" value={formData.tipo_discapacidad || ''} onChange={handleChange} />
                </label>
                )}
                <label>¿Eres deportista de alto rendimiento?
                <select name="es_deportista_alto_rendimiento" value={formData.es_deportista_alto_rendimiento || ''} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    <option>Sí</option>
                    <option>No</option>
                </select>
                </label>
                {showIf('es_deportista_alto_rendimiento', 'Sí') && (
                <label>Deporte
                    <input type="text" name="deporte" value={formData.deporte || ''} onChange={handleChange} />
                </label>
                )}
            </div>
            </section>

            {/* CAMPOS OCULTOS (Se calculan y envían, pero no se muestran al usuario) */}
            <input type="hidden" name="institucion" value="UNAM" />
            <input type="hidden" name="cuenta_unam" value={formData.cuenta_unam} />
            <input type="hidden" name="clave_carrera" value={formData.clave_carrera || ''} />
            <input type="hidden" name="porcentaje_creditos" value={formData.porcentaje_creditos || ''} />
            <input type="hidden" name="regular" value={formData.regular || ''} />
            <input type="hidden" name="es_mujer_ciencia" value={formData.es_mujer_ciencia || ''} />
            <input type="hidden" name="es_pueblo_marginal" value={formData.es_pueblo_marginal || ''} />
            <input type="hidden" name="indice_desarrollo_social" value={formData.indice_desarrollo_social || ''} />
            <input type="hidden" name="nse_amai" value={formData.nse_amai || ''} />
            <input type="hidden" name="ingresos_en_salarios_minimos" value={formData.ingresos_en_salarios_minimos || ''} />
            <input type="hidden" name="salario_minimo_mensual" value={SALARIO_MINIMO_MENSUAL} />
            <input type="hidden" name="fecha_calculo_nse" value={formData.fecha_calculo_nse || ''} />

            <label className="aviso">
            <input type="checkbox" name="aviso_privacidad" required />
            Acepto el aviso de privacidad y el tratamiento de mis datos personales, incluidos los sensibles.
            </label>

            <button type="submit" disabled={submitting || loading}>
            {submitting ? 'Enviando...' : 'Enviar datos'}
            </button>
        </form>

        <datalist id="carreras">
            {Object.values(CARRERAS_DICT).map((c, i) => <option key={i} value={c.nombre} />)}
        </datalist>
        </div>
    </>
  );
}