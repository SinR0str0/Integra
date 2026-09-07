'use client';

interface SessionModalProps {
  show: boolean;
  lastSession: string;
  onClose: () => void;
  onNewSession: () => void;
}

export default function SessionModal({ show, lastSession, onClose, onNewSession }: SessionModalProps) {
  if (!show) return null;

  return (
    <div className={`modal fade ${show ? 'show' : ''}`} role="dialog" style={{ display: show ? 'block' : 'none' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(to left, #969518,#050234)', color: 'white' }}>
            <h6 className="modal-title">A t e n c i ó n ...</h6>
          </div>
          <div className="modal-body">
            <p>
              Te informamos que ya cuentas una sesión activa en Integra, iniciada el:
            </p>
            <div>
              <p><b>{lastSession}</b></p>
            </div>
            <p>
              Si seleccionas Iniciar Nueva Sesión se cerrara la anterior sesión.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar aviso
            </button>
            <button type="button" className="btn btn-primary" onClick={onNewSession}>
              Iniciar Nueva Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}