import React from "react";
import { FaTruck, FaUserPlus, FaCrosshairs, FaChild } from "react-icons/fa";

const StepExtras = ({ extras, selectedExtras, onChange, onNext, onBack }) => {
  // Ref para el widget
  const widgetRef = React.useRef(null);

  // Nota: evitamos auto-scroll al montar este paso para no mover el viewport
  const extraVisual = {
    "1": {
      icon: FaTruck,
      desc: "Recibe el auto en la puerta de tu casa."
    },
    "2": {
      icon: FaUserPlus,
      desc: "Comparte la conducción con alguien más."
    },
    "3": {
      icon: FaCrosshairs,
      desc: "No te pierdas en tu destino."
    },
    "4": {
      icon: FaChild,
      desc: "Seguridad para los más pequeños."
    }
  };

  return (
  <div ref={widgetRef} className="step-extras-form" style={{background:'transparent', display:'block'}}>
  <div className="extras-card-container" style={{width:'100%', maxWidth:'1400px', margin:'2rem auto', boxSizing:'border-box', background:'#fff', borderRadius:'20px', boxShadow:'0 8px 32px 0 rgba(60,60,60,0.10)', padding:'2.5rem 1.5rem'}}>
        <form onSubmit={e => { e.preventDefault(); onNext(); }} style={{width:'100%', margin:0, padding:0, boxSizing:'border-box'}}>
          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <h2 style={{fontSize:'2.2rem', fontWeight:800, color:'#222', marginBottom:'0.5rem'}}>Selecciona los extras para tu alquiler</h2>
            <div style={{fontSize:'1.1rem', color:'#555'}}>Personaliza tu viaje con estos complementos opcionales.</div>
          </div>
          <div className="extras-list-responsive" style={{width:'100%', marginBottom:'1.2rem', display:'grid', gap:'1.2rem', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))'}}>
            {extras.map(extra => {
              const Icon = extraVisual[extra.id]?.icon || FaTruck;
              let titulo = '';
              if (extra.id === '1') titulo = 'Llevar vehículo a mi dirección';
              else if (extra.id === '2') titulo = 'Conductor adicional';
              else if (extra.id === '3') titulo = 'GPS';
              else if (extra.id === '4') titulo = 'Silla para niño';
              else titulo = extra.title;
              return (
                <label
                  key={extra.id}
                  htmlFor={`extra-${extra.id}`}
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap:'1rem', flex: '1 1 220px', minWidth: 0, border: selectedExtras.includes(extra.id) ? '2.5px solid var(--wr-brand)' : '1.5px solid #e5e7eb', background: selectedExtras.includes(extra.id) ? 'rgba(46,204,113,0.06)' : '#fff', borderRadius: '16px', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', padding: '1rem 1rem', minHeight: '90px', maxWidth: '100%', transition:'border 0.2s, box-shadow 0.2s', marginBottom:'0'}}>
                  <span style={{ flex: '0 0 auto', marginRight: '1.1rem', background: '#f8f8f8', borderRadius: '12px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={40} color="var(--wr-brand)" />
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 0', minWidth: 0, justifyContent: 'center', alignItems: 'flex-start', textAlign: 'left', lineHeight:'1.4' }}>
                    <span style={{ fontWeight: 700, fontSize: '18px', color: '#222' }}>{titulo}</span>
                    <span style={{ color: '#555', fontSize: '15px' }}>{extraVisual[extra.id]?.desc}</span>
                    <span style={{ color: '#222', fontSize: '18px', fontWeight:700, marginTop:'2px' }}>+${extra.price.toLocaleString('es-CO')} <span style={{fontSize:'14px', color:'#888', fontWeight:400}}>/ día</span></span>
                  </span>
                  <input
                    type="checkbox"
                    id={`extra-${extra.id}`}
                    checked={selectedExtras.includes(extra.id)}
                    onChange={() => onChange(extra.id)}
                    className="extras-check"
                    style={{ flex: '0 0 auto', marginLeft: '1rem', alignSelf: 'center' }}
                  />
                </label>
              );
            })}
          </div>
          <style>{`
            /* Responsive grid: 1→2→3→4 columns */
            @media (min-width: 600px) {
              .extras-list-responsive { grid-template-columns: repeat(2, minmax(240px, 1fr)) !important; }
            }
            @media (min-width: 900px) {
              .extras-list-responsive { grid-template-columns: repeat(3, minmax(240px, 1fr)) !important; }
            }
            @media (min-width: 1200px) {
              .extras-list-responsive { grid-template-columns: repeat(4, minmax(240px, 1fr)) !important; }
            }

            /* Modern circular dot checkbox */
            .extras-check {
              appearance: none;
              -webkit-appearance: none;
              width: 22px; height: 22px;
              border-radius: 50%;
              border: 2px solid var(--wr-brand);
              display: grid; place-content: center;
              background: #fff;
              outline: none;
              transition: box-shadow 0.15s ease, border-color 0.15s ease;
            }
            .extras-check::before {
              content: "";
              width: 10px; height: 10px;
              border-radius: 50%;
              transform: scale(0);
              transition: transform 0.15s ease-in-out;
              background: var(--wr-brand);
            }
            .extras-check:checked::before { transform: scale(1); }
            .extras-check:focus-visible { box-shadow: 0 0 0 3px rgba(46,204,113,0.25); }
            .extras-check:disabled { opacity: 0.5; cursor: not-allowed; }

      @media (min-width: 700px) {
              .extras-list-responsive {
        flex-direction: row !important;
        gap: 1.5rem !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
              }
              .extras-list-responsive label[for^='extra-'] {
        min-width: 240px !important;
        max-width: 360px !important;
        margin-bottom: 0 !important;
        flex: 1 1 260px !important;
        padding: 1.1rem 1.2rem !important;
        min-height: 110px !important;
              }
            }
      @media (max-width: 699px) {
              .extras-list-responsive {
        flex-direction: column !important;
        gap: 0.9rem !important;
        width: 100% !important;
        flex-wrap: nowrap !important;
              }
              .extras-list-responsive label[for^='extra-'] {
        min-width: 0 !important;
        max-width: 100% !important;
        margin-bottom: 0 !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 1rem 1rem !important;
        flex: 1 1 100% !important;
        min-height: 100px !important;
              }
            }
          `}</style>
          {/* Botonera estandarizada como en Datos */}
          <div className="extras-btns" style={{display:'flex', justifyContent:'flex-end', marginTop:'1.5rem', gap:'1rem'}}>
            <button type="button" onClick={onBack} className="wr-btn wr-btn--secondary">← Atrás</button>
            <button type="submit" className="wr-btn wr-btn--primary" style={{display:'inline-flex', alignItems:'center', gap:'0.5em'}}>Siguiente →</button>
          </div>
          <style>{`
            @media (max-width: 480px) {
              .extras-btns { flex-direction: row !important; gap: 0.5rem !important; margin-top: 0.4rem !important; align-items: center !important; justify-content: flex-end !important; flex-wrap: nowrap !important; }
              .extras-btns .wr-btn { flex: 0 0 auto !important; width: auto !important; padding: 0.7rem 0.8rem !important; font-size: 1.02rem !important; }
            }
            @media (max-width: 768px) {
              .extras-btns { flex-direction: row !important; gap: 0.7rem !important; margin-top: 0.6rem !important; align-items: center !important; }
              .extras-btns .wr-btn { flex: 1 1 0 !important; }
            }
            @media (min-width: 769px) {
              .extras-btns { justify-content: flex-end !important; gap: 1rem !important; }
              .extras-btns .wr-btn { flex: 0 0 auto !important; }
            }
          `}</style>
        </form>
      </div>
    </div>
  );
};

export default StepExtras;
