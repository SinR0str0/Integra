// data/datosAcademicos.ts
export interface Opcion {
  id: string;
  nombre: string;
  hijos?: Record<string, Opcion>;
}

// Opción por defecto para niveles que no requieren desglose detallado
const defaultOpcion: Opcion = {
  id: "DEFAULT",
  nombre: "PLANTEL POR DEFECTO",
  hijos: {
    "CARRERA POR DEFECTO": {
      id: "CARRERA POR DEFECTO",
      nombre: "CARRERA POR DEFECTO"
    }
  }
};

export const datosAcademicos: Record<string, Opcion> = {
  BACHILLERATO: {
    id: "BACHILLERATO",
    nombre: "BACHILLERATO",
    hijos: {
      "ESCUELA NACIONAL PREPARATORIA": {
        id: "ESCUELA NACIONAL PREPARATORIA",
        nombre: "ESCUELA NACIONAL PREPARATORIA",
        hijos: {
          "TRONCO COMÚN": { id: "TRONCO COMÚN", nombre: "TRONCO COMÚN" }
        }
      }
    }
  },
  LICENCIATURA: {
    id: "LICENCIATURA",
    nombre: "LICENCIATURA",
    hijos: {
      "F.E.S. ACATLÁN": {
        id: "F.E.S. ACATLÁN",
        nombre: "F.E.S. ACATLÁN",
        hijos: {
          "ACTUARÍA": { id: "ACTUARÍA", nombre: "ACTUARÍA" },
          "ARQUITECTURA": { id: "ARQUITECTURA", nombre: "ARQUITECTURA" },
          "DISEÑO GRÁFICO": { id: "DISEÑO GRÁFICO", nombre: "DISEÑO GRÁFICO" },
          "ENSEÑANZA DE INGLÉS": { id: "ENSEÑANZA DE INGLÉS", nombre: "ENSEÑANZA DE INGLÉS" },
          "CIENCIAS POLÍTICAS Y ADMINISTRACIÓN PÚBLICA": { id: "CIENCIAS POLÍTICAS Y ADMINISTRACIÓN PÚBLICA", nombre: "CIENCIAS POLÍTICAS Y ADMINISTRACIÓN PÚBLICA" },
          "PERIODISMO": { id: "PERIODISMO", nombre: "PERIODISMO" },
          "CIENCIAS DE LA COMUNICACIÓN": { id: "CIENCIAS DE LA COMUNICACIÓN", nombre: "CIENCIAS DE LA COMUNICACIÓN" },
          "RELACIONES INTERNACIONALES": { id: "RELACIONES INTERNACIONALES", nombre: "RELACIONES INTERNACIONALES" },
          "SOCIOLOGÍA": { id: "SOCIOLOGÍA", nombre: "SOCIOLOGÍA" },
          "MATEMÁTICAS APLICADAS Y COMPUTACIÓN": { id: "MATEMÁTICAS APLICADAS Y COMPUTACIÓN", nombre: "MATEMÁTICAS APLICADAS Y COMPUTACIÓN" },
          "TÉCNICO EN COMPUTACIÓN": { id: "TÉCNICO EN COMPUTACIÓN", nombre: "TÉCNICO EN COMPUTACIÓN" },
          "DERECHO": { id: "DERECHO", nombre: "DERECHO" },
          "ECONOMÍA": { id: "ECONOMÍA", nombre: "ECONOMÍA" },
          "FILOSOFÍA": { id: "FILOSOFÍA", nombre: "FILOSOFÍA" },
          "INGENIERÍA": { id: "INGENIERÍA", nombre: "INGENIERÍA" },
          "LENGUA EXTRANJERA": { id: "LENGUA EXTRANJERA", nombre: "LENGUA EXTRANJERA" }
        }
      },
      "FACULTAD DE INGENIERÍA": {
        id: "FACULTAD DE INGENIERÍA",
        nombre: "FACULTAD DE INGENIERÍA",
        hijos: {
          "INGENIERÍA EN COMPUTACIÓN": { id: "INGENIERÍA EN COMPUTACIÓN", nombre: "INGENIERÍA EN COMPUTACIÓN" }
        }
      }
    }
  },
  ESPECIALIDAD: { id: "ESPECIALIDAD", nombre: "ESPECIALIDAD", hijos: { "DEFAULT": defaultOpcion } },
  INICIACIÓN: { id: "INICIACIÓN", nombre: "INICIACIÓN", hijos: { "DEFAULT": defaultOpcion } },
  MAESTRÍA: { id: "MAESTRÍA", nombre: "MAESTRÍA", hijos: { "DEFAULT": defaultOpcion } },
  DOCTORADO: { id: "DOCTORADO", nombre: "DOCTORADO", hijos: { "DEFAULT": defaultOpcion } },
  PROPEDEUTICO: { id: "PROPEDEUTICO", nombre: "PROPEDEUTICO", hijos: { "DEFAULT": defaultOpcion } }
};

export const NIVELES_INICIALES = [
  "BACHILLERATO",
  "LICENCIATURA",
  "ESPECIALIDAD",
  "INICIACIÓN",
  "MAESTRÍA",
  "DOCTORADO",
  "PROPEDEUTICO",
];