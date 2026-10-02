'use client';

import { Resultado } from '@/utils/motor';
import Link from 'next/link';

interface ResultadosBecasProps {
  resultados: Resultado[];
  onVolver: () => void;
}

export default function ResultadosBecas({ resultados, onVolver }: ResultadosBecasProps) {
  const elegibles = resultados.filter(r => r.veredicto === 'Elegible');
  const posibles = resultados.filter(r => r.veredicto === 'Posible (verificar)');
  const montoTotal = elegibles.reduce((sum, r) => sum + (Number(r.beca.beneficio_monto) || 0), 0);

  return (
    <div className="animate-fadeIn">
      <div className="mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={onVolver}>
          <i className="fa fa-arrow-left mr-1"></i> Volver al formulario
        </button>
      </div>

      {elegibles.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          <h5 className="alert-heading"><i className="fa fa-exclamation-triangle"></i> Ruta de mejora sugerida</h5>
          <p>Actualmente no cumples con los requisitos de las convocatorias abiertas. Te recomendamos:</p>
          <ul className="mb-0">
            <li>Mejorar tu promedio general.</li>
            <li>Avanzar a siguientes semestres.</li>
            <li>Verificar que tus datos en la <Link href="/estudiantes/actualizar-datos" className="alert-link">Encuesta</Link> estén actualizados.</li>
          </ul>
        </div>
      ) : (
        <div className="alert alert-success" role="alert">
          <h5 className="alert-heading"><i className="fa fa-check-circle"></i> Perfil elegible</h5>
          <p className="mb-0">
            Cumples con los requisitos de <strong>{elegibles.length} beca(s)</strong>.
            {posibles.length > 0 && ` Además, tienes ${posibles.length} beca(s) que requieren verificación manual.`}
          </p>
        </div>
      )}

      <div className="card bg-primary text-white mb-4 text-center border-0 shadow-sm">
        <div className="card-body py-3">
          <h6 className="text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>Monto total potencial</h6>
          <h2 className="display-5 font-weight-bold mb-0">
            ${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <small className="h6">MXN</small>
          </h2>
        </div>
      </div>

      <h5 className="mb-3"><i className="fa fa-list-ul"></i> Convocatorias evaluadas</h5>
      <div className="row">
        {resultados.map((res, idx) => {
          const esElegible = res.veredicto === 'Elegible';
          const esPosible = res.veredicto === 'Posible (verificar)';
          const cardClass = esElegible ? 'border-success' : esPosible ? 'border-warning' : 'border-secondary bg-light';
          const badgeClass = esElegible ? 'badge-success' : esPosible ? 'badge-warning text-dark' : 'badge-secondary';

          // Filtrar SOLO lo que NO se está cumpliendo
          const requisitosNoCumplidos = res.explicacion.filter(exp => exp.estado === 'no_cumple');

          return (
            <div key={idx} className="col-md-4 col-lg-3 mb-3">
              <div className={`card h-100 shadow-sm ${cardClass}`}>
                <div className="card-header d-flex justify-content-between align-items-center bg-white">
                  <span className="font-weight-bold text-dark" style={{ fontSize: '0.9rem' }}>
                    {res.beca.nombre_beca || 'Sin nombre'}
                  </span>
                  <span className={`badge ${badgeClass}`}>{res.veredicto}</span>
                </div>
                <div className="card-body">
                  {res.beca.descripcion && (
                    <p className="small text-muted mb-2" style={{ fontSize: '0.8rem' }}>{res.beca.descripcion}</p>
                  )}
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ fontSize: '0.85rem' }}><i className="fa fa-money text-success"></i> Beneficio:</span>
                    <strong style={{ fontSize: '0.85rem' }}>
                      ${Number(res.beca.beneficio_monto)?.toLocaleString() || 'N/A'}
                      {res.beca.periodo_beneficio && <small className="text-muted"> / {res.beca.periodo_beneficio}</small>}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ fontSize: '0.85rem' }}><i className="fa fa-building"></i> Empresa:</span>
                    <span style={{ fontSize: '0.85rem' }}>{res.beca.empresa || 'No especificada'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span style={{ fontSize: '0.85rem' }}><i className="fa fa-calendar"></i> Cierre:</span>
                    <span style={{ fontSize: '0.85rem' }}>{res.beca.fin_registro || 'Sin fecha'}</span>
                  </div>
                  
                  <hr className="my-2" />
                  
                  {/* ✅ CONDICIONAL: Solo se muestra si hay requisitos no cumplidos */}
                  {requisitosNoCumplidos.length > 0 ? (
                    <>
                      <h6 className="small font-weight-bold text-danger mb-2">Requisitos no cumplidos:</h6>
                      <ul className="list-unstyled small mb-0">
                        {requisitosNoCumplidos.map((exp, i) => (
                          <li key={i} className="mb-1 text-danger" style={{ fontSize: '0.8rem' }}>
                            <i className="fa fa-times mr-1"></i>
                            <strong>{exp.regla}:</strong> {exp.motivo}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="small text-success mb-0">
                      <i className="fa fa-check mr-1"></i> Cumple con todos los requisitos evaluados.
                    </p>
                  )}
                </div>
                <div className="card-footer bg-white border-top-0">
                  {esElegible || esPosible ? (
                    res.beca.url ? (
                      <a href={String(res.beca.url)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary btn-block" style={{ fontSize: '0.85rem' }}>
                        <i className="fa fa-external-link"></i> Ver convocatoria
                      </a>
                    ) : (
                      <button className="btn btn-sm btn-primary btn-block" disabled style={{ fontSize: '0.85rem' }}>Sin enlace disponible</button>
                    )
                  ) : (
                    <button className="btn btn-sm btn-secondary btn-block" disabled style={{ fontSize: '0.85rem' }}>No elegible</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}