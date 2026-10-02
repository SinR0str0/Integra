// data/encuestaDatos.ts

export const AREAS: Record<number, string> = {
  1: "Ciencias Físico Matemáticas",
  2: "Ciencias Biológicas, Químicas y de la Salud",
  3: "Ciencias Sociales",
  4: "Humanidades y de las Artes"
};

export const CATALOGO_CARRERAS = `Actuaría|1|101
Administración|3|301
Arquitectura|1|102
Artes Visuales|4|401
Biología|2|201
Ciencia de Datos|1|138
Ciencias de la Comunicación|3|302
Ciencias Políticas y Administración Pública|3|
Derecho|3|305
Diseño Gráfico|4|
Economía|3|306
Enseñanza de Inglés|4|
Filosofía|4|411
Física|1|106
Ingeniería Civil|1|107
Ingeniería en Computación|1|110
Ingeniería Mecatrónica|1|124
Matemáticas|1|122
Matemáticas Aplicadas y Computación|1|114
Pedagogía|4|421
Psicología|2|210
Química|2|211
Química Farmacéutico Biológica|2|213
Relaciones Internacionales|3|310
Sociología|3|
Traducción|4|440`;

export const ZONAS: Record<string, { marginal: boolean; ids: string }> = {
  "55506": { marginal: true, ids: "Sin dato" },
  "57185": { marginal: true, ids: "Sin dato" },
  "09140": { marginal: true, ids: "Sin dato" },
  "53000": { marginal: false, ids: "Sin dato" },
  "55000": { marginal: false, ids: "Sin dato" }
};

export const PUNTOS_ESCOLARIDAD: Record<string, number> = {
  "Sin estudios": 0, "Primaria": 0, "Secundaria": 22,
  "Bachillerato": 38, "Licenciatura": 52, "Posgrado": 72
};

export const CORTES_NSE: [number, string][] = [
  [205, "A/B"], [167, "C+"], [141, "C"], [116, "C-"], [95, "D+"], [48, "D"]
];

export const SALARIO_MINIMO_MENSUAL = 9582.47;

// Helper para normalizar texto y buscar en el catálogo
export const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const CARRERAS_DICT: Record<string, { nombre: string; area: number; clave: string }> = {};
CATALOGO_CARRERAS.split('\n').forEach(linea => {
  const [nombre, area, clave] = linea.split('|');
  CARRERAS_DICT[norm(nombre)] = { 
    nombre: nombre.trim(), 
    area: Number(area), 
    clave: (clave || '').trim() 
  };
});