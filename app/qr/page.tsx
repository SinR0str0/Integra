'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function QRPage() {
  const [copiado, setCopiado] = useState(false);
  
  const urlPagina = typeof window !== 'undefined' 
    ? `${window.location.origin}/`
    : 'https://www.integra.unam.mx/';

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(urlPagina);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      const input = document.createElement('input');
      input.value = urlPagina;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const pasos = [
    { numero: 1, icono: 'fa-camera', titulo: 'Abre la cámara', descripcion: 'Activa la cámara de tu teléfono móvil.' },
    { numero: 2, icono: 'fa-qrcode', titulo: 'Apunta al código', descripcion: 'Sin tomar la foto, enfoca el QR.' },
    { numero: 3, icono: 'fa-hand-pointer-o', titulo: 'Toca la notificación', descripcion: 'Aparecerá un enlace en pantalla.' },
    { numero: 4, icono: 'fa-sign-in', titulo: 'Inicia sesión', descripcion: 'Usa tu cuenta UNAM para entrar.' },
  ];

  return (
    <div className="qr-page-wrapper">
      {/* Encabezado */}
      <div className="qr-header">
        <div className="qr-header-content">
          <span className="qr-header-badge">
            <i className="fa fa-mobile"></i> ACCESO RÁPIDO
          </span>
          <h1 className="qr-title">
            Código QR de Acceso
          </h1>
          <p className="qr-subtitle">
            Comparte este código para acceder rápidamente al sistema desde cualquier dispositivo móvil.
          </p>
        </div>
      </div>

      {/* Tarjeta principal con QR */}
      <div className="qr-main-card">
        <div className="qr-section">
          <div className="qr-frame">
            <div className="qr-frame-inner">
              <Image
                src="/images/qr.png"
                alt="Código QR para acceder al sistema"
                width={260}
                height={260}
                className="qr-image"
                priority
              />
            </div>
            <span className="qr-corner qr-corner-tl"></span>
            <span className="qr-corner qr-corner-tr"></span>
            <span className="qr-corner qr-corner-bl"></span>
            <span className="qr-corner qr-corner-br"></span>
          </div>

          <p className="qr-instruction">
            <i className="fa fa-info-circle"></i>
            Escanea con la cámara de tu dispositivo móvil
          </p>
        </div>

        {/* URL */}
        <div className="url-section">
          <label className="url-label">
            <i className="fa fa-link"></i> Enlace directo
          </label>
          <div className="url-box">
            <input
              type="text"
              className="url-input"
              value={urlPagina}
              readOnly
            />
            <button
              className={`url-copy-btn ${copiado ? 'copiado' : ''}`}
              type="button"
              onClick={handleCopiar}
              title="Copiar enlace"
            >
              {copiado ? (
                <><i className="fa fa-check"></i> ¡Copiado!</>
              ) : (
                <><i className="fa fa-copy"></i> Copiar</>
              )}
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <Link href="/" className="btn-action btn-primary-unam">
            <i className="fa fa-external-link"></i> Ir al sistema          </Link>
          <button className="btn-action btn-outline-unam" onClick={() => window.print()}>
            <i className="fa fa-print"></i> Imprimir QR
          </button>
        </div>
      </div>

      {/* Pasos a seguir */}
      <div className="steps-card">
        <h3 className="steps-title">
          <i className="fa fa-list-ol"></i> ¿Cómo usar el código QR?
        </h3>
        <div className="steps-grid">
          {pasos.map((paso) => (
            <div key={paso.numero} className="step-item">
              <div className="step-icon">
                <i className={`fa ${paso.icono}`}></i>
              </div>
              <div className="step-number">{paso.numero}</div>
              <h4 className="step-title">{paso.titulo}</h4>
              <p className="step-description">{paso.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .qr-page-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 1rem;
        }

        /* ========== ENCABEZADO ========== */
        .qr-header {
          background: linear-gradient(135deg, #003366 0%, #004080 100%);
          border-radius: 12px 12px 0 0;
          padding: 2rem 2rem 1.8rem;
          position: relative;
          overflow: hidden;
          border-bottom: 4px solid #A48329;
        }

        .qr-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(164, 131, 41, 0.15) 0%, transparent 70%);
          border-radius: 50%;
        }

        .qr-header-content {
          position: relative;
          z-index: 1;
        }

        .qr-header-badge {
          display: inline-block;
          background: rgba(164, 131, 41, 0.2);
          color: #F5D76E;
          padding: 0.3rem 0.9rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          border: 1px solid rgba(164, 131, 41, 0.4);
          margin-bottom: 0.8rem;
        }

        .qr-title {
          color: #fff;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          letter-spacing: -0.5px;
        }

        .qr-subtitle {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.95rem;
          margin: 0;
          max-width: 600px;
        }

        /* ========== TARJETA PRINCIPAL ========== */
        .qr-main-card {
          background: #fff;
          border-radius: 0 0 12px 12px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 20px rgba(0, 51, 102, 0.08);
          text-align: center;
          border: 1px solid #e8eef5;
          border-top: none;
        }

        .qr-section {
          margin-bottom: 2rem;
        }

        .qr-frame {
          position: relative;
          display: inline-block;
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #eef3f9 100%);
          border-radius: 16px;
          box-shadow: 
            0 8px 24px rgba(0, 51, 102, 0.12),
            inset 0 0 0 2px rgba(0, 51, 102, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .qr-frame:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 12px 32px rgba(0, 51, 102, 0.18),
            inset 0 0 0 2px rgba(164, 131, 41, 0.3);
        }

        .qr-frame-inner {
          background: #fff;
          padding: 12px;
          border-radius: 8px;
          border: 2px dashed rgba(0, 51, 102, 0.15);
        }

        .qr-image {
          display: block;
          width: 860px;
          height: 860px;
          object-fit: contain;
        }

        /* Esquinas decorativas doradas */
        .qr-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 3px solid #A48329;
        }
        .qr-corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; border-top-left-radius: 8px; }
        .qr-corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; border-top-right-radius: 8px; }
        .qr-corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; border-bottom-left-radius: 8px; }
        .qr-corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; border-bottom-right-radius: 8px; }

        .qr-instruction {
          margin-top: 1.2rem;
          color: #555;
          font-size: 0.9rem;
          font-style: italic;
        }

        .qr-instruction i {
          color: #A48329;
          margin-right: 0.4rem;
        }

        /* ========== URL ========== */
        .url-section {
          max-width: 600px;
          margin: 0 auto 2rem;
          text-align: left;
        }

        .url-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #003366;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .url-label i {
          color: #A48329;
          margin-right: 0.3rem;
        }

        .url-box {
          display: flex;
          background: #f8fafc;
          border: 2px solid #e0e7ef;
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .url-box:focus-within {
          border-color: #A48329;
          box-shadow: 0 0 0 3px rgba(164, 131, 41, 0.15);
        }

        .url-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.85rem 1rem;
          font-size: 0.88rem;
          color: #333;
          outline: none;
          font-family: 'Courier New', monospace;
        }

        .url-copy-btn {
          background: #003366;
          color: #fff;
          border: none;
          padding: 0 1.5rem;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .url-copy-btn:hover {
          background: #A48329;
        }

        .url-copy-btn.copiado {
          background: #28a745;
        }

        /* ========== BOTONES DE ACCIÓN ========== */
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 0.8rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .btn-action {
          padding: 0.7rem 1.8rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .btn-primary-unam {
          background: linear-gradient(135deg, #003366 0%, #004080 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 51, 102, 0.25);
        }

        .btn-primary-unam:hover {
          background: linear-gradient(135deg, #A48329 0%, #c9a84a 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(164, 131, 41, 0.35);
          color: #fff;
        }

        .btn-outline-unam {
          background: #fff;
          color: #003366;
          border-color: #003366;
        }

        .btn-outline-unam:hover {
          background: #003366;
          color: #fff;
          transform: translateY(-2px);
        }

        /* ========== PASOS ========== */
        .steps-card {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 51, 102, 0.08);
          border: 1px solid #e8eef5;
        }

        .steps-title {
          color: #003366;
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 1.5rem;
          padding-bottom: 0.8rem;
          border-bottom: 2px solid #A48329;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .steps-title i {
          color: #A48329;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.2rem;
        }

        .step-item {
          position: relative;
          text-align: center;
          padding: 1.5rem 1rem 1.2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
          border-radius: 10px;
          border: 1px solid #e8eef5;
          transition: all 0.3s ease;
        }

        .step-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 51, 102, 0.1);
          border-color: #A48329;
        }

        .step-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 0.8rem;
          background: linear-gradient(135deg, #003366 0%, #004080 100%);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 4px 10px rgba(0, 51, 102, 0.2);
        }

        .step-number {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 28px;
          height: 28px;
          background: #A48329;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .step-title {
          color: #003366;
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.3rem;
        }

        .step-description {
          color: #666;
          font-size: 0.82rem;
          margin: 0;
          line-height: 1.4;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 600px) {
          .qr-page-wrapper {
            padding: 0.5rem;
          }
          .qr-header {
            padding: 1.5rem 1.2rem;
          }
          .qr-title {
            font-size: 1.4rem;
          }
          .qr-main-card {
            padding: 1.5rem 1rem;
          }
          .qr-image {
            width: 220px;
            height: 220px;
          }
          .url-box {
            flex-direction: column;
          }
          .url-copy-btn {
            padding: 0.8rem;
            justify-content: center;
          }
          .steps-card {
            padding: 1.2rem;
          }
        }

        /* ========== IMPRESIÓN ========== */
        @media print {
          .btn-action, .steps-card, .qr-subtitle, .qr-header-badge {
            display: none !important;
          }
          .qr-header {
            background: #003366 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .qr-main-card, .steps-card {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}