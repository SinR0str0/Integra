// =====================================================================
//  motor.ts
//  Motor de inferencia del sistema experto de becas.
//
//  Cómo funciona (encadenamiento hacia adelante):
//    - Hechos:                 el perfil del estudiante (lo arma la encuesta).
//    - Base de conocimiento:   las becas (vienen del Excel / data/becas.json).
//    - Reglas:                 cada regla revisa UN requisito de la beca.
//
//  Lógica trivaluada: cada regla puede dar
//    'cumple' | 'no_cumple' | 'desconocido'  (falta el dato en la convocatoria o en el perfil)
//
//  Veredicto final por beca:
//    - Si alguna regla NO cumple          -> "No elegible"
//    - Si no hay NO, pero hay desconocidas -> "Posible (verificar)"
//    - Si todas cumplen                   -> "Elegible"
// =====================================================================


// =====================================================================
//  1. TIPOS
// =====================================================================

export type Estado = 'cumple' | 'no_cumple' | 'desconocido';
export type Veredicto = 'Elegible' | 'Posible (verificar)' | 'No elegible';

// Hechos: lo que sabemos del estudiante
export interface Perfil {
  promedio: number;
  semestre: number;
  ingresoMensual?: number;          // MXN del hogar; si falta, la regla de ingreso queda "desconocido"
  genero?: 'Femenino' | 'Masculino' | 'Otro';
  escuela: string;                  // p. ej. "UNAM"
  institucionPublica: boolean;
  carrera: string;                  // p. ej. "Actuaría"
  area?: string;                    // p. ej. "Ciencias Físico Matemáticas"
  zona?: string;                    // p. ej. "Estado de México"
  salarioMinimo?: number;           // si no se manda, se usa SALARIO_MINIMO_MENSUAL
  hoy?: Date;                       // se puede fijar para pruebas; por defecto es la fecha actual
}

// Una beca = una fila del Excel. Los campos null significan "no viene en la convocatoria".
export interface Beca {
  id: number;
  nombre_beca: string;
  empresa: string | null;
  monto_mxn: number | null;
  monto_tipo: string | null;
  fin_registro: string | null;      // AAAA-MM-DD o DD/MM/AAAA
  estatus: string | null;           // p. ej. "En proceso", "Cerrada"
  promedio_minimo: number | null;
  promedio_maximo: number | null;
  semestre_minimo: number | null;
  semestre_maximo: number | null;
  ingreso_max_salarios_minimos: number | null;
  genero_exclusivo: string | null;
  escuelas_participantes: string | null;
  carreras_participantes: string | null;
  zonas_participantes: string | null;
  otros: string | null;
  [k: string]: unknown;
}

export interface ResultadoRegla { estado: Estado; motivo: string }
export interface Regla { nombre: string; evaluar: (b: Beca, p: Perfil) => ResultadoRegla }

export interface Resultado {
  beca: Beca;
  veredicto: Veredicto;
  explicacion: { regla: string; estado: Estado; motivo: string }[];   // el "por qué" de cada regla
}


// =====================================================================
//  2. CONSTANTES Y FUNCIONES AUXILIARES
// =====================================================================

// Salario mínimo mensual. Hay que actualizarlo cada año (CONASAMI).
// Ojo: la encuesta ya manda su propio valor en perfil.salarioMinimo; este es solo el respaldo.
export const SALARIO_MINIMO_MENSUAL = 9582.47;

// Quita acentos, guiones y mayúsculas para comparar textos sin que importe cómo se escribieron
const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ').toLowerCase();

// Atajos para devolver el resultado de una regla
const cumple = (motivo: string): ResultadoRegla => ({ estado: 'cumple', motivo });
const noCumple = (motivo: string): ResultadoRegla => ({ estado: 'no_cumple', motivo });
const desconocido = (motivo: string): ResultadoRegla => ({ estado: 'desconocido', motivo });

// Convierte la fecha de cierre de la beca en un Date al FINAL de ese día.
// Por qué: "2026-10-15" se lee como medianoche UTC, y eso hacía que la beca apareciera
// cerrada desde la tarde del último día. Aceptamos AAAA-MM-DD y DD/MM/AAAA (formato típico de Excel).
function fechaDeCierre(texto: string): Date | null {
  let fecha: Date;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto.trim());
  if (iso) fecha = new Date(+iso[1], +iso[2] - 1, +iso[3], 23, 59, 59);
  else if (dmy) fecha = new Date(+dmy[3], +dmy[2] - 1, +dmy[1], 23, 59, 59);
  else fecha = new Date(texto);
  return isNaN(fecha.getTime()) ? null : fecha;
}

// ¿Aparece `elemento` como un elemento completo de una lista escrita en texto?
// Ejemplo: "Física" SÍ está en "Actuaría, Física, Matemáticas" pero NO en "Física Biomédica".
// Con un simple .includes() "Matemáticas" también "cumplía" por estar dentro de "Matemáticas Aplicadas".
// Se asume que los elementos van separados por coma, punto y coma, diagonal, salto de línea o " y ".
function estaEnLista(texto: string, elemento: string): boolean {
  const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const limpio = norm(texto).replace(/[.\s]+$/, '');
  const sep = '(?:^|[,;|/\\n]|\\s+y\\s+)';
  const fin = '(?:$|[,;|/\\n]|\\s+y\\s+)';
  return new RegExp(`${sep}\\s*${escapar(norm(elemento).trim())}\\s*${fin}`).test(limpio);
}

// La base puede decir "Mujeres", "Femenino", "Hombres"... y el formulario dice "Femenino"/"Masculino".
// Lo llevamos todo al mismo formato antes de comparar.
function generoNormalizado(s: string): string {
  const n = norm(s);
  if (/mujer|femenin/.test(n)) return 'femenino';
  if (/hombre|masculin|varon/.test(n)) return 'masculino';
  return n.trim();
}


// =====================================================================
//  3. REGLAS (una por requisito de la beca)
// =====================================================================

export const REGLAS: Regla[] = [

  // --- Vigencia: ¿la convocatoria sigue abierta? ---
  { nombre: 'Vigencia', evaluar: (b, p) => {
      const hoy = p.hoy ?? new Date();
      if (b.estatus === 'Cerrada') return noCumple('Convocatoria cerrada');

      const cierre = b.fin_registro ? fechaDeCierre(b.fin_registro) : null;
      if (cierre) {
        return cierre < hoy
          ? noCumple(`Registro cerró el ${b.fin_registro}`)
          : cumple(`Registro abierto hasta ${b.fin_registro}`);
      }
      // Sin fecha (o fecha ilegible): nos apoyamos en el estatus
      return b.estatus === 'En proceso'
        ? cumple('Convocatoria en proceso')
        : desconocido('Sin fecha de cierre válida ni estatus');
  }},

  // --- Promedio ---
  { nombre: 'Promedio', evaluar: (b, p) => {
      // Un máximo de 10 no limita a nadie, así que lo tratamos como "sin máximo"
      const maximo = b.promedio_maximo != null && b.promedio_maximo < 10 ? b.promedio_maximo : null;
      if (b.promedio_minimo == null && maximo == null) return desconocido('Sin requisito de promedio registrado');
      if (b.promedio_minimo != null && p.promedio < b.promedio_minimo) return noCumple(`Requiere promedio ≥ ${b.promedio_minimo}`);
      if (maximo != null && p.promedio > maximo) return noCumple(`Promedio máximo ${maximo}`);
      return cumple('Promedio dentro del rango');
  }},

  // --- Semestre ---
  { nombre: 'Semestre', evaluar: (b, p) => {
      if (b.semestre_minimo == null && b.semestre_maximo == null) return desconocido('Sin requisito de semestre registrado');
      if (b.semestre_minimo != null && p.semestre < b.semestre_minimo) return noCumple(`Requiere semestre ≥ ${b.semestre_minimo}`);
      if (b.semestre_maximo != null && p.semestre > b.semestre_maximo) return noCumple(`Solo hasta semestre ${b.semestre_maximo}`);
      return cumple('Semestre dentro del rango');
  }},

  // --- Ingreso (en salarios mínimos) ---
  { nombre: 'Ingreso', evaluar: (b, p) => {
      // Pendiente: aquí falta decidir con el equipo si "null" en la base significa "sin tope"
      // o "no se capturó el dato". Por ahora lo tomamos como "sin tope".
      if (b.ingreso_max_salarios_minimos == null) return cumple('Sin tope de ingreso');

      const salario = p.salarioMinimo ?? SALARIO_MINIMO_MENSUAL;
      if (p.ingresoMensual == null || !salario) {
        return desconocido(`Tope de ${b.ingreso_max_salarios_minimos} salarios mínimos: falta dato de ingreso`);
      }
      return p.ingresoMensual / salario <= b.ingreso_max_salarios_minimos
        ? cumple('Ingreso dentro del tope')
        : noCumple(`Ingreso excede ${b.ingreso_max_salarios_minimos} salarios mínimos`);
  }},

  // --- Género (becas exclusivas para mujeres u hombres) ---
  { nombre: 'Género', evaluar: (b, p) => {
      if (!b.genero_exclusivo) return cumple('Sin restricción de género');
      if (!p.genero) return desconocido(`Exclusiva para ${b.genero_exclusivo}`);
      return generoNormalizado(p.genero) === generoNormalizado(b.genero_exclusivo)
        ? cumple('Cumple restricción de género')
        : noCumple(`Exclusiva para ${b.genero_exclusivo}`);
  }},

  // --- Institución ---
  { nombre: 'Institución', evaluar: (b, p) => {
      const texto = b.escuelas_participantes;
      if (!texto) return desconocido('Instituciones no especificadas');
      const n = norm(texto);

      if (n.includes('publicas o privadas')) return cumple('Institución elegible');
      if (p.institucionPublica && n.includes('publicas')) return cumple('Institución elegible');
      // (validamos que escuela no esté vacía: "texto".includes('') siempre da true)
      if (p.escuela && n.includes(norm(p.escuela))) return cumple('Institución elegible');
      return noCumple(`Solo para: ${texto}`);
  }},

  // --- Carrera / área ---
  { nombre: 'Carrera', evaluar: (b, p) => {
      const texto = b.carreras_participantes;
      if (!texto) return desconocido('Carreras no especificadas');
      const n = norm(texto);

      // Pendiente: aquí falta afinar, "licenciaturas" también aparece en frases como
      // "solo licenciaturas en ingeniería" y ahí daría un falso "cumple".
      if (/\b(todas|licenciaturas|cualquier carrera)\b/.test(n)) return cumple('Abierta a cualquier licenciatura');

      if (p.area && n.includes(norm(p.area))) return cumple('Carrera/área elegible');

      if (p.carrera) {
        if (estaEnLista(texto, p.carrera)) return cumple('Carrera elegible');
        // Si el nombre aparece pero pegado a otro (ej. "Matemáticas" dentro de "Matemáticas Aplicadas"),
        // no nos arriesgamos a decir sí ni no: se pide verificar.
        if (n.includes(norm(p.carrera))) return desconocido('Coincidencia parcial con la lista de carreras: verificar');
      }
      return texto.includes('…')
        ? desconocido('Lista de carreras truncada en la fuente')
        : noCumple('Tu carrera/área no está en la lista');
  }},

  // --- Zona geográfica ---
  { nombre: 'Zona', evaluar: (b, p) => {
      const texto = b.zonas_participantes;
      if (!texto) return desconocido('Zona no especificada');
      const n = norm(texto);

      if (n.includes('nacional')) return cumple('Zona elegible');
      if (!p.zona) return desconocido(`Zona requerida: ${texto}`);
      // Pendiente: aquí falta manejar abreviaturas (CDMX, EdoMex) y que el estado venga de una lista fija.
      return n.includes(norm(p.zona)) ? cumple('Zona elegible') : noCumple(`Solo para: ${texto}`);
  }},

  // --- Requisitos adicionales (texto libre de la convocatoria) ---
  { nombre: 'Requisitos adicionales', evaluar: (b) =>
      b.otros?.includes('…')
        ? desconocido('Requisitos adicionales incompletos en la fuente')
        : cumple('Sin requisitos adicionales pendientes')
  },
];


// =====================================================================
//  4. EVALUACIÓN
// =====================================================================

// Evalúa todas las becas contra el perfil y las regresa ordenadas:
// primero las elegibles, luego las "por verificar", al final las no elegibles
// (y dentro de cada grupo, de mayor a menor monto).
export function evaluar(becas: Beca[], perfil: Perfil): Resultado[] {
  const prioridad: Record<Veredicto, number> = { 'Elegible': 0, 'Posible (verificar)': 1, 'No elegible': 2 };

  return becas
    .map((beca): Resultado => {
      const explicacion = REGLAS.map(r => ({ regla: r.nombre, ...r.evaluar(beca, perfil) }));

      const veredicto: Veredicto =
        explicacion.some(e => e.estado === 'no_cumple') ? 'No elegible'
        : explicacion.some(e => e.estado === 'desconocido') ? 'Posible (verificar)'
        : 'Elegible';

      return { beca, veredicto, explicacion };
    })
    .sort((a, b) =>
      prioridad[a.veredicto] - prioridad[b.veredicto] ||
      (b.beca.monto_mxn ?? 0) - (a.beca.monto_mxn ?? 0));
}
