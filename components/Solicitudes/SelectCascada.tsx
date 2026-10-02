'use client';

import { Opcion } from '@/data/datosAcademicos';

interface SelectCascadaProps {
  opciones: Opcion[] | string[];
  valor: string;
  onChange: (valor: string) => void;
}

export default function SelectCascada({
  opciones,
  valor,
  onChange,
}: SelectCascadaProps) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="form-control focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
    >
      <option value="">Selecciona una opción</option>
      {opciones.map((op) => {
        const id = typeof op === 'string' ? op : op.id;
        const nombre = typeof op === 'string' ? op : op.nombre;
        return (
          <option key={id} value={id}>
            {nombre}
          </option>
        );
      })}
    </select>
  );
}