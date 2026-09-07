'use client';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ show, onClose }: Props) {
  if (!show) return null;

  return (
    <div 
      className={`modal fade show modal-vertical`} 
      id="AvisoSimplificado"
      style={{ display: show ? 'block' : 'none' }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header justify-content-center">
            <img 
              src="/images/encabezado-consultas.jpg" 
              alt="UNAM-DGOAE-INTEGRA" 
              className="img-fluid"
            />
          </div>
          
          {/* Modal Body */}
          <div className="modal-body">
            <p style={{textAlign: 'center'}}>
              <b>Aviso de Privacidad Simplificado</b>
            </p>
            
            <p>
              La Dirección General de Orientación y Atención Educativa (en adelante DGOAE) de la Universidad Nacional Autónoma de México, por conducto de la Dirección de Becas y Enlace con la Comunidad, recaba datos personales para el registro y administración de solicitudes de programas de becas para aspirantes y alumnos.
            </p>
            
            <p>
              Se realizarán transferencias de datos personales de conformidad con las finalidades establecidas por cada programa de becas administrado por esta área universitaria. Podrá ejercer sus derechos ARCO en la Unidad de Transparencia de la UNAM, o a través de la Plataforma Nacional de Transparencia (http://www.plataformadetransparencia.org.mx/).
            </p>
            
            <p>
              El aviso de privacidad integral se puede consultar en la sección Aviso de Privacidad de nuestro sitio web: <br></br>
              
              <a 
                href="https://www.integra.unam.mx/avisoprivacidad" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                https://www.integra.unam.mx/avisoprivacidad
              </a>
            </p>
            
          </div>
          
          {/* Modal Footer */}
          <div className="modal-footer justify-content-center">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}