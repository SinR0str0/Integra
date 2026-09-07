'use client';

interface Props {
  show: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function AvisoModal({ show, onClose, onContinue }: Props) {
  if (!show) return null;

  return (
    <div className={`modal fade show modal-vertical`} style={{ display: 'block' }} aria-modal="true">
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header justify-content-center">
            <img src="/images/encabezado-consultas.jpg" alt="UNAM-DGOAE-INTEGRA" className="img-fluid" />
          </div>
          <div className="modal-body">
            <p><b>Estimado(a) alumno(a):</b></p>
            <p style={{ textAlign: 'justify' }}>
              Recuerda que los medios oficiales para enterarte de información sobre las becas que oferta la Universidad son a través del portal del becario www.becarios.unam.mx y en el sistema Integra www.integra.unam.mx.
            </p>
            <p style={{ textAlign: 'justify' }}>
              De igual manera te recordamos que la UNAM y la Dirección General de Orientación y Atención Educativa (DGOAE-UNAM), nunca te solicitará información de datos personales y/o sensibles, adicional a la que otorgas a través del Sistema Integra.
            </p>
            <p style={{ textAlign: 'justify' }}>
              No te dejes sorprender con la solicitud de información a través del correo electrónico, teléfono y/o formularios que no son oficiales. La Universidad NO realiza visitas domiciliarias relacionadas con la asignación de becas, sin previo aviso, por escrito.
            </p>
            <p><b>Dirección de Becas y Enlace con la Comunidad<br />Dirección General de Orientación y Atención Educativa</b></p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onContinue}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}