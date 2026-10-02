// utils/motor.ts

export type Estado = 'cumple' | 'no_cumple' | 'desconocido';
export type Veredicto = 'Elegible' | 'Posible (verificar)' | 'No elegible';

export interface Perfil {
  promedio: number;
  semestre: number;
  ingresoMensual?: number;
  genero?: 'Femenino' | 'Masculino' | 'Otro';
  escuela: string;
  institucionPublica: boolean;
  carrera: string;
  area?: string;
  zona?: string; // Estado de residencia
  es_pueblo_marginal?: 'Sí' | 'No';
  tiene_discapacidad?: 'Sí' | 'No';
  salarioMinimo?: number;
  hoy?: Date;
}

export interface Beca {
  id_beca: number | string;
  nombre_beca: string;
  empresa: string | null;
  descripcion: string | null;
  beneficio: string | null;
  beneficio_monto: number | null;
  periodo_beneficio: string | null;
  beneficio_descripcion: string | null;
  url: string | null;
  fecha_publicacion: string | null;
  inicio_registro: string | null;
  fin_registro: string | null;
  fecha_resultados: string | null;
  estatus: string | null;
  maximos_participantes: number | null;
  promedio_minimo: number | null;
  promedio_maximo: number | null;
  semestre_minimo: number | null;
  semestre_maximo: number | null;
  ingreso_mensual_maximo: number | null;
  genero_exclusivo: string | null;
  escuelas_participantes: string | null;
  niveles_educativos: string | null;
  carreras_participantes: string | null;
  zonas_participantes: string | null;
  idioma_requerido: string | null;
  etiquetas_intereses: string | null;
  otros_requisitos: string | null;
  incompatibles: string | null; // <-- NUEVO: IDs separados por ;
  [k: string]: unknown;
}

export interface ResultadoRegla { estado: Estado; motivo: string }
export interface Regla { nombre: string; evaluar: (b: Beca, p: Perfil) => ResultadoRegla }

export interface Resultado {
  beca: Beca;
  veredicto: Veredicto;
  explicacion: { regla: string; estado: Estado; motivo: string }[];
}

const SALARIO_MINIMO_MENSUAL = 9582.47;
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').toLowerCase();

const cumple = (motivo: string): ResultadoRegla => ({ estado: 'cumple', motivo });
const noCumple = (motivo: string): ResultadoRegla => ({ estado: 'no_cumple', motivo });
const desconocido = (motivo: string): ResultadoRegla => ({ estado: 'desconocido', motivo });

function estaEnLista(texto: string, elemento: string): boolean {
  const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const limpio = norm(texto).replace(/[.\s]+$/, '');
  const sep = '(?:^|[,;|/\\n]|\\s+y\\s+)';
  const fin = '(?:$|[,;|/\\n]|\\s+y\\s+)';
  return new RegExp(`${sep}\\s*${escapar(norm(elemento).trim())}\\s*${fin}`).test(limpio);
}

function generoNormalizado(s: string): string {
  const n = norm(s);
  if (/mujer|femenin/.test(n)) return 'femenino';
  if (/hombre|masculin|varon/.test(n)) return 'masculino';
  return n.trim();
}

export const REGLAS: Regla[] = [
  // { nombre: 'Vigencia', evaluar: (b, p) => { ... } }, // Comentada como se solicitó

  { nombre: 'Promedio', evaluar: (b, p) => {
      const maximo = b.promedio_maximo != null && b.promedio_maximo < 10 ? b.promedio_maximo : null;
      if (b.promedio_minimo == null && maximo == null) return desconocido('Sin requisito de promedio');
      if (b.promedio_minimo != null && p.promedio < Number(b.promedio_minimo)) return noCumple(`Requiere ≥ ${b.promedio_minimo}`);
      if (maximo != null && p.promedio > maximo) return noCumple(`Máximo ${maximo}`);
      return cumple('Promedio dentro del rango');
  }},
  { nombre: 'Semestre', evaluar: (b, p) => {
      if (b.semestre_minimo == null && b.semestre_maximo == null) return desconocido('Sin requisito de semestre');
      if (b.semestre_minimo != null && p.semestre < Number(b.semestre_minimo)) return noCumple(`Requiere ≥ semestre ${b.semestre_minimo}`);
      if (b.semestre_maximo != null && p.semestre > Number(b.semestre_maximo)) return noCumple(`Solo hasta semestre ${b.semestre_maximo}`);
      return cumple('Semestre dentro del rango');
  }},
  { nombre: 'Ingreso', evaluar: (b, p) => {
      if (b.ingreso_mensual_maximo == null || Number(b.ingreso_mensual_maximo) === 0) return cumple('Sin tope de ingreso');
      if (p.ingresoMensual == null) return desconocido(`Tope de $${Number(b.ingreso_mensual_maximo).toLocaleString()} MXN: falta dato de ingreso`);
      return p.ingresoMensual <= Number(b.ingreso_mensual_maximo)
        ? cumple('Ingreso dentro del tope')
        : noCumple(`Ingreso excede $${Number(b.ingreso_mensual_maximo).toLocaleString()} MXN`);
  }},
  // ✅ ACTUALIZADO: Ahora valida género Y discapacidad en la misma columna
  { nombre: 'Género / Discapacidad', evaluar: (b, p) => {
      if (!b.genero_exclusivo) return cumple('Sin restricción de género o discapacidad');
      const exclusivo = norm(String(b.genero_exclusivo));
      
      if (exclusivo.includes('discapacitad')) {
        return p.tiene_discapacidad === 'Sí' 
          ? cumple('Cumple requisito de discapacidad') 
          : noCumple('Exclusivo para personas con discapacidad');
      }
      
      if (!p.genero) return desconocido(`Exclusivo para ${b.genero_exclusivo}`);
      return generoNormalizado(p.genero) === generoNormalizado(exclusivo)
        ? cumple('Cumple restricción de género')
        : noCumple(`Exclusivo para ${b.genero_exclusivo}`);
  }},
  { nombre: 'Institución', evaluar: (b, p) => {
      const texto = b.escuelas_participantes;
      if (!texto) return desconocido('Instituciones no especificadas');
      const n = norm(String(texto));
      if (n.includes('publicas o privadas')) return cumple('Institución elegible');
      if (p.institucionPublica && n.includes('publicas')) return cumple('Institución elegible');
      if (p.escuela && n.includes(norm(p.escuela))) return cumple('Institución elegible');
      return noCumple(`Solo para: ${texto}`);
  }},
  { nombre: 'Carrera', evaluar: (b, p) => {
      const texto = b.carreras_participantes;
      if (!texto) return desconocido('Carreras no especificadas');
      const n = norm(String(texto));
      if (/\b(todas|licenciaturas|cualquier carrera)\b/.test(n)) return cumple('Abierta a cualquier licenciatura');
      if (p.area && n.includes(norm(p.area))) return cumple('Carrera/área elegible');
      if (p.carrera && estaEnLista(String(texto), p.carrera)) return cumple('Carrera elegible');
      if (p.carrera && n.includes(norm(p.carrera))) return desconocido('Coincidencia parcial: verificar');
      return noCumple('Tu carrera no está en la lista');
  }},
  // ✅ ACTUALIZADO: Lógica específica para las zonas solicitadas
  { nombre: 'Zona', evaluar: (b, p) => {
      const texto = b.zonas_participantes;
      if (!texto) return desconocido('Zona no especificada');
      const n = norm(String(texto));
      const zonaUsuario = p.zona ? norm(p.zona) : '';

      if (n.includes('territorio nacional') || n.includes('nacional')) return cumple('Zona elegible (Nacional)');

      if (n.includes('marginal')) {
        if (p.es_pueblo_marginal === 'Sí') return cumple('Zona elegible (Marginal)');
        if (p.es_pueblo_marginal === 'No') return noCumple('Exclusivo para zonas marginales');
      }

      if (n.includes('cdmx') || n.includes('ciudad de mexico') || n.includes('distrito federal')) {
        if (zonaUsuario.includes('ciudad de mexico') || zonaUsuario.includes('cdmx') || zonaUsuario.includes('distrito federal')) return cumple('Zona elegible (CDMX)');
        return noCumple('Exclusivo para CDMX');
      }

      if (n.includes('estado de mexico') || n.includes('edomex')) {
        if (zonaUsuario.includes('estado de mexico') || zonaUsuario.includes('edomex') || zonaUsuario.includes('mexico')) return cumple('Zona elegible (Edo. Méx.)');
        return noCumple('Exclusivo para Estado de México');
      }

      if (p.zona && n.includes(zonaUsuario)) return cumple('Zona elegible');
      return desconocido(`Zona requerida: ${texto}`);
  }},
  { nombre: 'Requisitos adicionales', evaluar: (b) =>
      b.otros_requisitos && String(b.otros_requisitos).includes('…')
        ? desconocido('Requisitos adicionales incompletos')
        : cumple('Sin requisitos adicionales pendientes')
  },
];

export function evaluar(becas: Beca[], perfil: Perfil): Resultado[] {
  const prioridad: Record<Veredicto, number> = { 'Elegible': 0, 'Posible (verificar)': 1, 'No elegible': 2 };

  return becas.map((beca): Resultado => {
    const explicacion = REGLAS.map(r => ({ regla: r.nombre, ...r.evaluar(beca, perfil) }));
    const veredicto: Veredicto =
      explicacion.some(e => e.estado === 'no_cumple') ? 'No elegible' :
      explicacion.some(e => e.estado === 'desconocido') ? 'Posible (verificar)' : 'Elegible';
    return { beca, veredicto, explicacion };
  }).sort((a, b) =>
    prioridad[a.veredicto] - prioridad[b.veredicto] ||
    (Number(b.beca.beneficio_monto ?? 0) - Number(a.beca.beneficio_monto ?? 0))
  );
}

// ✅ NUEVA FUNCIÓN: Filtra incompatibles priorizando monto y cantidad
export function filtrarIncompatibles(resultados: Resultado[]): Resultado[] {
  // Solo aplicamos el filtro a las viables (Elegibles y Posibles)
  const viables = resultados.filter(r => r.veredicto !== 'No elegible');
  const resultadoFinal: Resultado[] = [];
  const descartadas = new Set<string | number>();

  // Ordenar: 1. Mayor monto, 2. Mayor cantidad de participantes (maximos_participantes)
  viables.sort((a, b) => {
    const montoA = Number(a.beca.beneficio_monto) || 0;
    const montoB = Number(b.beca.beneficio_monto) || 0;
    if (montoB !== montoA) return montoB - montoA;

    const partA = Number(a.beca.maximos_participantes) || 0;
    const partB = Number(b.beca.maximos_participantes) || 0;
    return partB - partA;
  });

  for (const res of viables) {
    if (descartadas.has(res.beca.id_beca)) continue;

    resultadoFinal.push(res);

    // Marcar sus incompatibles como descartadas para que no se incluyan
    if (res.beca.incompatibles) {
      const incompatibles = String(res.beca.incompatibles).split(';').map(id => id.trim());
      incompatibles.forEach(id => descartadas.add(id));
    }
  }

  // Re-integrar las no elegibles al final para que el usuario vea por qué no aplicó
  const noElegibles = resultados.filter(r => r.veredicto === 'No elegible');
  return [...resultadoFinal, ...noElegibles];
}