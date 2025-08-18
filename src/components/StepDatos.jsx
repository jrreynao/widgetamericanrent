import React, { useState } from "react";
import "./StepDatos.css";
import 'react-phone-input-2/lib/style.css';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// ID del extra de "Llevar vehículo a mi dirección"
const EXTRA_ENVIO_ID = "1";

const StepDatos = ({ onNext, onBack, initialData = {}, extrasSeleccionados = [] }) => {
  // Ref para el widget
  const widgetRef = React.useRef(null);

  // Nota: evitamos auto-scroll al montar este paso para no mover el viewport
  const [nombre, setNombre] = useState(initialData.nombre || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [codigoPais, setCodigoPais] = useState(initialData.codigoPais || "+54 Argentina");
  const [telefono, setTelefono] = useState(initialData.telefono || "+54");
  const [dni, setDni] = useState(initialData.dni || "");
  const [direccion, setDireccion] = useState(initialData.direccion || "");
  const [nota, setNota] = useState(initialData.nota || "");
  const [tieneTarjeta, setTieneTarjeta] = useState(
    typeof initialData.tieneTarjeta === 'boolean' ? initialData.tieneTarjeta : null
  );
  const [errores, setErrores] = useState({});

  const mostrarDireccion = extrasSeleccionados.includes(EXTRA_ENVIO_ID);

  const validar = () => {
    const errs = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = "Email inválido";
    if (!telefono || telefono.replace(/\D/g, '').length < 8) errs.telefono = "Teléfono inválido";
    if (!dni.trim()) errs.dni = "DNI o Pasaporte obligatorio";
    if (mostrarDireccion && !direccion.trim()) errs.direccion = "La dirección es obligatoria";
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validar()) {
      onNext({ nombre, email, codigoPais, telefono, dni, direccion: mostrarDireccion ? direccion : "", nota, tieneTarjeta });
    }
  };

  return (
  <div ref={widgetRef} className="step-datos-bg" style={{background:'transparent', display:'block'}}>
  <div className="step-datos-desktop-card" style={{width:'100%', maxWidth:'1400px', margin:'2rem auto', boxSizing:'border-box', background:'#fff', borderRadius:'20px', boxShadow:'0 8px 32px 0 rgba(60,60,60,0.10)', padding:'2.5rem 1.5rem'}}>
        <form className="step-datos-form" onSubmit={handleSubmit} style={{width:'100%', margin:0, padding:0, boxSizing:'border-box'}}>
          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <h2 className="step-datos-title" style={{fontSize:'2.2rem', fontWeight:800, color:'#222', marginBottom:'0.5rem'}}>Completa tus datos para la reserva</h2>
            <div className="step-datos-subtitle" style={{fontSize:'1.1rem', color:'#555'}}>Un último paso para asegurar tu vehículo.</div>
          </div>
          <div className="datos-fields" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1.2rem', marginBottom:'2.5rem', width:'100%'}}>
            {/* Nombre y Apellido */}
            <label className="field-full datos-label" style={{gridColumn:'span 1', fontWeight:600, fontSize:'1rem', color:'#222', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
              <span style={{marginBottom:'0.1rem'}}>Nombre y Apellido</span>
              <input className="datos-input" type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" style={{fontSize:'1rem', padding:'0.7rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb'}} />
              {errores.nombre && <span className="datos-error" style={{color:'#e23c3c', fontSize:'0.95rem'}}>{errores.nombre}</span>}
            </label>
            {/* Email */}
            <label className="field-full datos-label" style={{gridColumn:'span 1', fontWeight:600, fontSize:'1rem', color:'#222', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
              <span style={{marginBottom:'0.1rem'}}>Email</span>
              <input className="datos-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan.perez@email.com" style={{fontSize:'1rem', padding:'0.7rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb'}} />
              {errores.email && <span className="datos-error" style={{color:'#e23c3c', fontSize:'0.95rem'}}>{errores.email}</span>}
            </label>
            {/* Teléfono */}
            <label className="field-full datos-label" style={{gridColumn:'span 1', fontWeight:600, fontSize:'1rem', color:'#222', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
              <span style={{marginBottom:'0.1rem'}}>Teléfono</span>
              <input className="datos-input" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: +54 9 11 1234-5678" autoComplete="tel" required style={{fontSize:'1rem', padding:'0.7rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb'}} />
              {errores.telefono && <span className="datos-error" style={{color:'#e23c3c', fontSize:'0.95rem'}}>{errores.telefono}</span>}
            </label>
            {/* DNI o Pasaporte */}
            <label className="field-full datos-label" style={{gridColumn:'span 1', fontWeight:600, fontSize:'1rem', color:'#222', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
              <span style={{marginBottom:'0.1rem'}}>N° DNI o Pasaporte</span>
              <input className="datos-input" type="text" value={dni} onChange={e => setDni(e.target.value)} placeholder="Ingresa tu número de documento" style={{fontSize:'1rem', padding:'0.7rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb'}} />
              {errores.dni && <span className="datos-error" style={{color:'#e23c3c', fontSize:'0.95rem'}}>{errores.dni}</span>}
            </label>
            {/* Dirección si aplica */}
            {mostrarDireccion && (
              <label className="field-full datos-label" style={{gridColumn:'1 / -1', fontWeight:600, fontSize:'1rem', color:'#222', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
                <span style={{marginBottom:'0.1rem'}}>Dirección a la que llevaremos el vehículo</span>
                <input className="datos-input" type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Siempre Viva 742, Springfield" style={{fontSize:'1rem', padding:'0.7rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb'}} />
                {errores.direccion && <span className="datos-error" style={{color:'#e23c3c', fontSize:'0.95rem'}}>{errores.direccion}</span>}
              </label>
            )}
            {/* Nota */}
            <label className="field-full datos-label" style={{gridColumn: mostrarDireccion ? '1 / -1' : 'span 1', fontWeight:600, fontSize:'1rem', color:'#222', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
              <span style={{marginBottom:'0.1rem'}}>Nota (opcional)</span>
              <textarea className="datos-input datos-textarea" value={nota} onChange={e => setNota(e.target.value)} rows={2} placeholder="¿Alguna aclaración que debamos tener en cuenta?" style={{fontSize:'1rem', padding:'0.7rem 1rem', borderRadius:'10px', border:'1px solid #e5e7eb'}} />
            </label>
            {/* Tarjeta de crédito */}
            <div className="field-full datos-checkbox" style={{gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontWeight: 600, fontSize:'1rem', color:'#222'}}>
              <div style={{marginBottom:'0.35rem', fontWeight:700}}>¿Posee tarjeta de crédito?</div>
              <div className="datos-si-no" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', width:'100%'}}>
                <button
                  type="button"
                  className={`datos-checkbox-btn${tieneTarjeta === true ? ' selected-si' : ''}`}
                  onClick={() => setTieneTarjeta(true)}
                  style={{fontSize:'1rem', padding:'0.7rem 1.2rem', borderRadius:'10px', border:'1px solid #e5e7eb', background:tieneTarjeta===true?'#e6fbe7':'#fff', color:'#222', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5em', width:'100%', flex:'1 1 0'}}
                >
                  <span style={{color:'#1bbf4c', fontSize:'1.3em'}}>&#10004;</span> Sí
                </button>
                <button
                  type="button"
                  className={`datos-checkbox-btn${tieneTarjeta === false ? ' selected-no' : ''}`}
                  onClick={() => setTieneTarjeta(false)}
                  style={{fontSize:'1rem', padding:'0.7rem 1.2rem', borderRadius:'10px', border:'1px solid #e5e7eb', background:tieneTarjeta===false?'#fdeaea':'#fff', color:'#222', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5em', width:'100%', flex:'1 1 0'}}
                >
                  <span style={{color:'#e23c3c', fontSize:'1.3em'}}>&#10008;</span> No
                </button>
              </div>
              {tieneTarjeta === null && <span className="datos-error" style={{color:'#e23c3c', fontSize:'0.95rem', marginTop:'0.25rem'}}>Selecciona una opción</span>}
            </div>
          </div>
          <div className="datos-btns" style={{display:'flex', justifyContent:'flex-end', marginTop:'1.5rem', width:'100%', gap:'1rem'}}>
            <button type="button" className="wr-btn wr-btn--secondary" onClick={onBack}>← Atrás</button>
            <button type="submit" className="wr-btn wr-btn--primary">Confirmar Datos →</button>
          </div>
        </form>
      </div>
      <style>{`
        /* Ensure the Datos card uses the available viewport width with side gutters */
        .step-datos-desktop-card {
          width: min(98vw, 1400px) !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .datos-fields .datos-label, .datos-fields .datos-input, .datos-fields .datos-checkbox {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        /* Asegurar filas completas para campos largos cuando se pide envío */
        .datos-fields .field-full { grid-column: span 1; }
        @media (min-width: 769px) {
          ${'' /* Dirección, Nota y bloque Si/No ocupan toda la fila cuando aplica */}
          .datos-fields .field-full[style*="grid-column: 1 / -1"] { grid-column: 1 / -1 !important; }
        }
  .datos-si-no { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem; width: 100%; align-items: stretch; }
  .datos-si-no .datos-checkbox-btn { width: 100%; justify-content: center; height: 44px; }
  @media (max-width: 480px) {
          /* Mantener Sí/No en dos columnas en móvil y compactar espaciado */
          .datos-si-no { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 0.6rem !important; }
          .datos-si-no .datos-checkbox-btn { width: 100% !important; }
          .datos-textarea { height: 3rem !important; }
          .step-datos-title { font-size: 1.45rem !important; margin-bottom: 0.35rem !important; }
          .step-datos-subtitle { font-size: 0.95rem !important; }
          .step-datos-desktop-card {
            max-width: 98vw !important;
            margin: 0.9rem auto !important;
            border-radius: 16px !important;
            padding: 1rem 0.75rem !important;
            box-shadow: 0 4px 16px 0 rgba(60,60,60,0.10) !important;
          }
          .datos-fields { grid-template-columns: 1fr !important; gap: 0.7rem !important; margin-bottom: 0.9rem !important; }
          .datos-fields .datos-label { font-size: 0.98rem !important; }
          .datos-fields .datos-input { font-size: 0.98rem !important; padding: 0.58rem 0.85rem !important; border-radius: 10px !important; border: 1px solid #e5e7eb !important; }
          .datos-fields .datos-checkbox { width: 100% !important; min-width: 0 !important; font-size: 0.98rem !important; }
          .datos-btns { flex-direction: row !important; gap: 0.5rem !important; margin-top: 0.4rem !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; }
          .datos-btns .wr-btn { flex: 0 0 auto !important; width: auto !important; padding: 0.7rem 0.8rem !important; font-size: 1.02rem !important; }
        }
        @media (max-width: 360px) {
          .datos-si-no { gap: 0.5rem !important; }
          .datos-si-no .datos-checkbox-btn { padding: 0.55rem 0.7rem !important; font-size: 0.95rem !important; }
          .step-datos-title { font-size: 1.35rem !important; }
          .step-datos-subtitle { font-size: 0.9rem !important; }
        }
        /* Alinear con StepFechas: espaciado y ancho en pantallas <= 650px */
        @media (max-width: 650px) {
          .step-datos-desktop-card {
            padding: 1rem 0.75rem !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 32px 0 rgba(60,60,60,0.10) !important;
            margin: 0.9rem auto !important;
            max-width: 98vw !important;
          }
        }
  @media (max-width: 768px) {
          .step-datos-desktop-card {
            max-width: 98vw !important;
            margin: 1rem auto !important;
            border-radius: 16px !important;
            padding: 1rem 0.75rem !important;
            box-shadow: 0 4px 16px 0 rgba(60,60,60,0.10) !important;
          }
          .datos-fields {
            grid-template-columns: 1fr !important;
            gap: 0.9rem !important;
            margin-bottom: 1.2rem !important;
          }
          .datos-fields .datos-label, .datos-fields .datos-input, .datos-fields .datos-checkbox {
            width: 100%;
            min-width: 0;
            font-size: 1rem !important;
          }
          .step-datos-title { font-size: 1.7rem !important; }
          .step-datos-subtitle { font-size: 1rem !important; }
          .datos-btns { flex-direction: row !important; gap: 0.7rem !important; margin-top: 0.6rem !important; align-items: center !important; }
          .datos-btns .wr-btn { flex: 1 1 0 !important; }
        }
        /* Escritorio: mantener botones como en otros pasos (alineados a la derecha, sin estirar) */
        @media (min-width: 769px) {
          .datos-btns { justify-content: flex-end !important; gap: 1rem !important; }
          .datos-btns .wr-btn { flex: 0 0 auto !important; }
        }
        
      `}</style>
    </div>
  );
};

export default StepDatos;
