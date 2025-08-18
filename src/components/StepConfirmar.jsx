// Importa los datos de vehículos para calcular el rango de precios
import { vehiculos } from "../data/vehiculos";
// Datos visuales y descripciones por categoría (igual que en StepVehiculo)
const categoriaVisual = [
  {
    id: "1",
    nombre: "Vehículo Chico",
    descripcion: "Ideal para la ciudad y viajes cortos.",
    icon: FaCar,
  },
  {
    id: "2",
    nombre: "Vehículo Mediano",
    descripcion: "Perfecto para familias y mayor comodidad.",
    icon: FaCar,
  },
  {
    id: "3",
    nombre: "Vehículo Grande",
    descripcion: "Espacio y potencia para cualquier aventura.",
    icon: FaCar,
  },
];
import React, { useState } from "react";

import { FaCar, FaUser, FaRegCalendar, FaMoneyBillWave, FaPlus, FaArrowLeft, FaArrowRight } from "react-icons/fa";

const StepConfirmar = ({ form, vehiculos, extras, onBack, onSubmit }) => {
  // Ref para el widget
  const widgetRef = React.useRef(null);
  // Responsive: detectar si es móvil/tablet
  // Cambiar breakpoint a 600px
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 600);
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helpers: get extra price and format currency
  const getExtraPrice = (extra) => {
    const p = (extra && (extra.price ?? extra.precio)) ?? 0;
    const n = typeof p === 'string' ? parseInt(p) : (p || 0);
    return Number.isFinite(n) ? n : 0;
  };
  const formatCurrency = (n) => `$${Number(n || 0).toLocaleString()}`;

  // Componente móvil/tablet
  const ConfirmarMobile = () => (
  <div ref={widgetRef} className="step-confirmar-mobile" style={{background:'transparent', display:'block'}}>
  <div className="confirmar-card-mobile" style={{width:'100%', margin:'1.2rem 0', boxSizing:'border-box', background:'#fff', borderRadius:'16px', boxShadow:'0 4px 16px 0 rgba(60,60,60,0.10)', padding:'1.1rem 0.7rem', display:'flex', flexDirection:'column', gap:'0.7rem'}}>
  <h1 style={{fontSize:'1.2rem', fontWeight:800, textAlign:'center', color:'#222', marginBottom:'0.2rem'}}>¡Revisá y confirmá tu reserva!</h1>
  <p style={{textAlign:'center', color:'#6b7280', margin:'0.2rem 0 0.7rem', fontSize:'1rem'}}>Revisá los detalles de tu alquiler antes de enviar la cotización.</p>
        <div style={{background:'#f9fafb', borderRadius:'1rem', padding:'0.9rem 0.9rem', marginBottom:'0.4rem', boxShadow:'0 2px 8px 0 rgba(60,60,60,0.04)', display:'flex', flexDirection:'column', gap:'0.2rem'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'1.2rem', marginBottom:'0.2rem'}}>
            <div style={{textAlign:'center', minWidth:'120px'}}>
              <span style={{fontSize:'0.97rem', color:'#6b7280'}}>Retiro</span>
              <div style={{fontWeight:600, color:'#222', fontSize:'1.08rem', margin:'0.1rem 0'}}>{form.fechas?.fechaRetiro || '--'}</div>
              <span style={{fontSize:'0.97rem', color:'#6b7280'}}>{form.fechas?.horaRetiro ? `${form.fechas.horaRetiro} hs` : ''}</span>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>
              <FaArrowRight style={{fontSize:'1.6rem', color:'#6b7280'}} />
            </div>
            <div style={{textAlign:'center', minWidth:'120px'}}>
              <span style={{fontSize:'0.97rem', color:'#6b7280'}}>Devolución</span>
              <div style={{fontWeight:600, color:'#222', fontSize:'1.08rem', margin:'0.1rem 0'}}>{form.fechas?.fechaDevolucion || '--'}</div>
              <span style={{fontSize:'0.97rem', color:'#6b7280'}}>{form.fechas?.horaDevolucion ? `${form.fechas.horaDevolucion} hs` : ''}</span>
            </div>
          </div>
        </div>
  <div style={{background:'#fefce8', borderRadius:'1rem', padding:'1rem 1.2rem', marginBottom:'0.5rem', textAlign:'center', boxShadow:'0 2px 8px 0 rgba(60,60,60,0.04)'}}>
          <p style={{fontSize:'1rem', color:'#854d0e', marginBottom:'0.2rem'}}>Total aproximado</p>
          {(() => {
            // Calcular el total aproximado usando el vehículo más económico de la categoría
            let precioVehiculo = 0;
            if (form.vehiculo?.categoria && vehiculos) {
              const vehiculosCat = vehiculos.filter(v => v.categoriaId === form.vehiculo.categoria);
              if (vehiculosCat.length > 0) {
                const precios = vehiculosCat.map(v => parseInt(v.precio)).filter(Boolean);
                if (precios.length > 0) {
                  precioVehiculo = Math.min(...precios);
                }
              }
            }
            // Sumar precios de extras seleccionados
            let precioExtras = 0;
            if (form.extras && Array.isArray(form.extras)) {
              precioExtras = form.extras.reduce((acc, e) => acc + (e.precio ? parseInt(e.precio) : 0), 0);
            }
            const totalAprox = (precioVehiculo * diasAlquilerMostrar) + precioExtras;
            return <div className="confirmar-total-amount" style={{fontWeight:800, color:'#854d0e', margin:'0.1rem 0', fontSize:'2.4rem'}}>${totalAprox.toLocaleString()}</div>;
          })()}
          <p style={{fontSize:'1rem', color:'#b45309'}}>por {diasAlquilerMostrar} día{diasAlquilerMostrar>1?'s':''}</p>
          <div className="confirmar-total-note" style={{color:'#b45309', marginTop:'0.3rem', fontSize:'0.85rem'}}>El precio es un aproximado según el vehículo disponible en nuestra agencia para reservar en esa categoría.</div>
        </div>
        {/* Acordeones */}
  <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'0.5rem'}}>
          {/* Vehículo */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'1rem', boxShadow:'0 2px 8px 0 rgba(60,60,60,0.04)'}}>
            <button type="button" onClick={()=>setShowVehiculo(v=>!v)} style={{width:'100%', background:'none', border:'none', padding:'0.7rem 0.2rem', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}>
              <span style={{display:'flex', alignItems:'center', color:'#6366f1', fontWeight:600}}><FaCar style={{marginRight:'0.7em'}} /> Vehículo</span>
              <span style={{color:'#6366f1', fontSize:'1.5em', transition:'transform 0.3s', transform: showVehiculo ? 'rotate(180deg)' : 'none'}}>&#9660;</span>
            </button>
            {showVehiculo && (
              <div style={{padding:'0.5rem 1rem 0.7rem 1rem', borderTop:'1px solid #e5e7eb', color:'#444', fontSize:'1rem'}}>
                {(() => {
                  const cat = categoriaVisual.find(c => c.id === form.vehiculo?.categoria);
                  let rango = form.vehiculo?.rango;
                  // Si no hay rango, calcularlo desde vehiculos
                  if (!rango && form.vehiculo?.categoria && vehiculos) {
                    const vehiculosCat = vehiculos.filter(v => v.categoriaId === form.vehiculo.categoria);
                    if (vehiculosCat.length > 0) {
                      const precios = vehiculosCat.map(v => parseInt(v.precio)).filter(Boolean);
                      if (precios.length > 0) {
                        rango = { min: Math.min(...precios), max: Math.max(...precios) };
                      }
                    }
                  }
                  return cat ? (
                    <>
                      <div style={{display:'flex', alignItems:'center', gap:'0.7em', marginBottom:'0.3em'}}>
                        {cat.icon && React.createElement(cat.icon, {size: 28, color: '#4f46e5'})}
                        <span style={{fontWeight:600, fontSize:'1.08em'}}>{cat.nombre}</span>
                      </div>
                      <div style={{fontWeight:700, color:'#4f46e5', fontSize:'1.05em', marginBottom:'0.3em'}}>
                        {rango ? `$${rango.min.toLocaleString()} - $${rango.max.toLocaleString()} / día` : '--'}
                      </div>
                      <div style={{color:'#555', fontSize:'0.98em', marginBottom:'0.3em'}}>{cat.descripcion}</div>
                    </>
                  ) : <span>--</span>;
                })()}
              </div>
            )}
          </div>
          {/* Datos del cliente */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'1rem', boxShadow:'0 2px 8px 0 rgba(60,60,60,0.04)'}}>
            <button type="button" onClick={()=>setShowDatos(v=>!v)} style={{width:'100%', background:'none', border:'none', padding:'0.7rem 0.2rem', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}>
              <span style={{display:'flex', alignItems:'center', color:'#6366f1', fontWeight:600}}><FaUser style={{marginRight:'0.7em'}} /> Datos del cliente</span>
              <span style={{color:'#6366f1', fontSize:'1.5em', transition:'transform 0.3s', transform: showDatos ? 'rotate(180deg)' : 'none'}}>&#9660;</span>
            </button>
            {showDatos && (
              <div style={{padding:'0.5rem 1rem 0.7rem 1rem', borderTop:'1px solid #e5e7eb', color:'#444', fontSize:'1rem'}}>
                <p><span style={{fontWeight:600}}>Nombre:</span> {form.datos?.nombre || '--'}</p>
                <p><span style={{fontWeight:600}}>Email:</span> {form.datos?.email || '--'}</p>
                <p><span style={{fontWeight:600}}>Teléfono:</span> {telefonoSolo || '--'}</p>
              </div>
            )}
          </div>
          {/* Extras: mostrar solo si hay seleccionados */}
          {extrasSeleccionados.length > 0 && (
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'1rem', boxShadow:'0 2px 8px 0 rgba(60,60,60,0.04)'}}>
              <button type="button" onClick={()=>setShowExtras(v=>!v)} style={{width:'100%', background:'none', border:'none', padding:'0.7rem 0.2rem', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer'}}>
                <span style={{display:'flex', alignItems:'center', color:'#6366f1', fontWeight:600}}><FaPlus style={{marginRight:'0.7em'}} /> Extras</span>
                <span style={{color:'#6366f1', fontSize:'1.5em', transition:'transform 0.3s', transform: showExtras ? 'rotate(180deg)' : 'none'}}>&#9660;</span>
              </button>
              {showExtras && (
                <div style={{padding:'0.5rem 1rem 0.7rem 1rem', borderTop:'1px solid #e5e7eb', color:'#444', fontSize:'1rem'}}>
                  <ul style={{listStyle:'disc', paddingLeft:'1.2em', margin:0}}>
                    {extrasSeleccionados.map(e => (
                      <li key={e.id} style={{display:'flex', justifyContent:'space-between', gap:'0.5rem'}}>
                          <span style={{display:'inline-block'}}>{e.name}</span>
                          <span style={{fontWeight:600, whiteSpace:'nowrap'}}>{formatCurrency(getExtraPrice(e))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Botonera estandarizada como en Datos (móvil) */}
        <div className="confirmar-btns-mobile" style={{display:'flex', justifyContent:'flex-end', marginTop:'0.7rem', gap:'0.5rem'}}>
          <button type="button" className="wr-btn wr-btn--secondary" onClick={onBack}>← Atrás</button>
          <button type="button" className="wr-btn wr-btn--primary" onClick={e => { e.preventDefault(); enviarReserva(); }} disabled={enviando}>
            Enviar cotización <FaMoneyBillWave style={{ marginLeft: '0.5em' }} />
          </button>
        </div>
        <style>{`
          /* Mobile compact + total overrides inlined to avoid external CSS conflicts */
          @media (max-width: 650px) {
            .confirmar-card-mobile { padding: 0.7rem !important; }
            .step-confirmar-mobile h1 { font-size: 1.05rem !important; }
            .step-confirmar-mobile p:not(.confirmar-total-amount):not(.confirmar-total-note) { font-size: 0.95rem !important; }
            .step-confirmar-mobile button { padding: 0.7rem 0.9rem !important; font-size: 0.98rem !important; }
            /* Force bigger amount on mobile */
            .step-confirmar-mobile .confirmar-total-amount { font-size: 2.4rem !important; line-height: 1.1 !important; }
            /* Make the note smaller on mobile */
            .step-confirmar-mobile .confirmar-total-note { font-size: 0.85rem !important; }
          }
          /* Botonera móvil: simétrica y ocupando el ancho como en StepDatos */
          @media (max-width: 768px) {
            .confirmar-btns-mobile { flex-direction: row !important; gap: 0.7rem !important; align-items: center !important; justify-content: flex-end !important; width: 100% !important; }
            .confirmar-btns-mobile .wr-btn { flex: 1 1 0 !important; width: auto !important; }
          }
        `}</style>
      </div>
    </div>
  );
  const [enviando, setEnviando] = useState(false);
  // Detectar si el usuario viene de un ad (UTM en la URL)
  const [isAdUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('utm_source') || params.get('utm_medium') || params.get('utm_campaign')
    );
  });
  // Función para enviar la reserva al backend
  const enviarReserva = async () => {
    if (enviando) return;
    setEnviando(true);
    if (onSubmit) await onSubmit();
    setEnviando(false);
  };
  // Buscar el vehículo más económico de la categoría seleccionada
  let vehiculoEconomico = null;
  if (form.vehiculo?.categoria) {
    const vehiculosCategoria = vehiculos.filter(v => v.categoria === form.vehiculo.categoria);
    vehiculoEconomico = vehiculosCategoria.reduce((min, v) => {
      const precio = parseInt(v.precio) || 0;
      return (!min || precio < parseInt(min.precio)) ? v : min;
    }, null);
  }
  // Buscar extras seleccionados
  const extrasSeleccionados = extras.filter(e => form.extras.includes(e.id));

  // Teléfono para mostrar (solo número en UI móvil)
  const telefonoSolo = `${form.datos?.telefono || ''}`.trim();

  // Calcular total
  const totalExtras = extrasSeleccionados.reduce((sum, e) => sum + (parseInt(e.price) || 0), 0);
  // Calcular días de alquiler para mostrar
  let diasAlquilerMostrar = 1;
  if (form.fechas?.fechaRetiro && form.fechas?.fechaDevolucion) {
    try {
      const d1 = new Date(form.fechas.fechaRetiro);
      const d2 = new Date(form.fechas.fechaDevolucion);
      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      diasAlquilerMostrar = diff > 0 ? diff : 1;
    } catch {}
  }
  const totalVehiculo = vehiculoEconomico && vehiculoEconomico.precio ? parseInt(vehiculoEconomico.precio) * diasAlquilerMostrar : 0;
  const total = totalVehiculo + totalExtras;

  // Acordeones
  const [showVehiculo, setShowVehiculo] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [showDatos, setShowDatos] = useState(false);

  return (
    isDesktop ? (
  <div className="step-confirmar" style={{background:'transparent', display:'block'}}>
        <div className="confirmar-card" style={{width:'100%', maxWidth:'1100px', margin:'2rem auto', boxSizing:'border-box', background:'#fff', borderRadius:'2rem', boxShadow:'0 8px 32px 0 rgba(60,60,60,0.10)', padding:'2rem 2.5rem'}}>
          {/* ...existing desktop JSX... */}
          <div style={{textAlign:'center', marginBottom:'2rem'}}>
            <h1 style={{fontSize:'2.3rem', fontWeight:800, color:'#111827'}}>¡Revisá y confirmá tu reserva!</h1>
            <p style={{color:'#6b7280', fontSize:'1.15rem', marginTop:'0.7rem'}}>Revisá los detalles de tu alquiler antes de enviar la cotización.</p>
          </div>
          <div className="confirmar-main-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'2rem', marginBottom:'2rem'}}>
            <div className="confirmar-main-left" style={{gridColumn:'span 2', display:'flex', flexDirection:'column', gap:'2rem'}}>
              <div className="confirmar-fechas-block" style={{display:'flex', flexDirection:'row', justifyContent:'space-around', background:'#f9fafb', padding:'1.2rem', borderRadius:'1rem', border:'1px solid #e5e7eb'}}>
                <div style={{textAlign:'center', minWidth:'140px'}}>
                  <p style={{fontSize:'0.98rem', color:'#6b7280'}}>Retiro</p>
                  <p style={{fontWeight:600, color:'#111827'}}>{form.fechas?.fechaRetiro || '--'}</p>
                  <p style={{fontSize:'0.98rem', color:'#111827'}}>{form.fechas?.horaRetiro ? `${form.fechas.horaRetiro} hs` : ''}</p>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280', fontSize:'2rem'}}>
                  <FaArrowRight style={{fontSize:'2rem', color:'#6b7280'}} />
                </div>
                <div style={{textAlign:'center', minWidth:'140px'}}>
                  <p style={{fontSize:'0.98rem', color:'#6b7280'}}>Devolución</p>
                  <p style={{fontWeight:600, color:'#111827'}}>{form.fechas?.fechaDevolucion || '--'}</p>
                  <p style={{fontSize:'0.98rem', color:'#111827'}}>{form.fechas?.horaDevolucion ? `${form.fechas.horaDevolucion} hs` : ''}</p>
                </div>
              </div>
              <div className="confirmar-details-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
                <div style={{border:'1px solid #e5e7eb', borderRadius:'1rem', padding:'1.2rem'}}>
                  {(() => {
                    const cat = categoriaVisual.find(c => c.id === form.vehiculo?.categoria);
                    let rango = null;
                    if (form.vehiculo?.categoria) {
                      const vehs = vehiculos.filter(v => v.categoriaId === form.vehiculo.categoria);
                      if (vehs.length) {
                        const min = Math.min(...vehs.map(v => v.precio));
                        const max = Math.max(...vehs.map(v => v.precio));
                        rango = { min, max };
                      }
                    }
                    return cat ? (
                      <>
                        <div style={{display:'flex', alignItems:'center', gap:'0.7em', marginBottom:'0.3em'}}>
                          {cat.icon && React.createElement(cat.icon, {size: 28, color: '#4f46e5'})}
                          <h2 style={{fontSize:'1.15rem', fontWeight:600, color:'#111827', margin:0}}>{cat.nombre}</h2>
                        </div>
                        <div style={{color:'#555', fontSize:'0.98em', marginBottom:'0.3em'}}>{cat.descripcion}</div>
                        <div style={{fontWeight:600, marginBottom:'0.1em'}}>Rango de precios:</div>
                        <div style={{fontWeight:800, fontSize:'1.08em', marginBottom:'0.2em'}}>{rango ? `$${rango.min.toLocaleString()} - $${rango.max.toLocaleString()} / día` : '--'}</div>
                      </>
                    ) : <span>--</span>;
                  })()}
                </div>
                <div style={{border:'1px solid #e5e7eb', borderRadius:'1rem', padding:'1.2rem'}}>
                  <div style={{display:'flex', alignItems:'center', marginBottom:'1rem'}}>
                    <FaUser style={{color:'#4f46e5', marginRight:'0.7em', fontSize:'1.3em'}} />
                    <h2 style={{fontSize:'1.15rem', fontWeight:600, color:'#111827'}}>Datos del cliente</h2>
                  </div>
                  <div style={{color:'#6b7280', fontSize:'1rem'}}>
                    <p><strong>Nombre:</strong> {form.datos?.nombre || '--'}</p>
                    <p><strong>Email:</strong> {form.datos?.email || '--'}</p>
                    <p><strong>Teléfono:</strong> {form.datos?.telefono || '--'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="confirmar-main-right" style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
              {isDesktop && extrasSeleccionados.length > 0 && (
                <div className="confirmar-extras-block" style={{border:'1px solid #e5e7eb', borderRadius:'1rem', padding:'1.2rem'}}>
                  <div style={{display:'flex', alignItems:'center', marginBottom:'1rem'}}>
                    <FaPlus style={{color:'#4f46e5', marginRight:'0.7em', fontSize:'1.3em'}} />
                    <h2 style={{fontSize:'1.15rem', fontWeight:600, color:'#111827'}}>Extras</h2>
                  </div>
                  <ul style={{paddingLeft:'1.2em', margin:0, color:'#6b7280', fontSize:'1rem'}}>
                    {extrasSeleccionados.map(e => (
                      <li key={e.id} style={{display:'flex', justifyContent:'space-between', gap:'0.75rem'}}>
                        <span style={{display:'inline-block'}}>{e.name}</span>
                        <span style={{fontWeight:600, color:'#111827', whiteSpace:'nowrap'}}>{formatCurrency(getExtraPrice(e))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="confirmar-total-block" style={{background:'#fefce8', color:'#854d0e', borderRadius:'1rem', padding:'1.5rem', textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', border:'none'}}>
                    <p style={{fontSize:'1.15rem', fontWeight:600}}>Total aproximado</p>
                    {(() => {
                      // Calcular el total aproximado usando el vehículo más económico de la categoría
                      let precioVehiculo = 0;
                      if (form.vehiculo?.categoria && vehiculos) {
                        const vehiculosCat = vehiculos.filter(v => v.categoriaId === form.vehiculo.categoria);
                        if (vehiculosCat.length > 0) {
                          const precios = vehiculosCat.map(v => parseInt(v.precio)).filter(Boolean);
                          if (precios.length > 0) {
                            precioVehiculo = Math.min(...precios);
                          }
                        }
                      }
                      // Sumar precios de extras seleccionados
                      let precioExtras = 0;
                      if (form.extras && Array.isArray(form.extras)) {
                        precioExtras = form.extras.reduce((acc, e) => acc + (e.precio ? parseInt(e.precio) : 0), 0);
                      }
                      const totalAprox = (precioVehiculo * diasAlquilerMostrar) + precioExtras;
                      return <p className="confirmar-total-amount" style={{fontWeight:800}}>${totalAprox.toLocaleString()}</p>;
                    })()}
                    <p style={{fontSize:'1.1rem', color:'#b45309'}}>por {diasAlquilerMostrar} día{diasAlquilerMostrar>1?'s':''}</p>
                    <p className="confirmar-total-note" style={{color:'#b45309', marginTop:'0.3rem'}}>El precio es un aproximado según el vehículo disponible en nuestra agencia para reservar en esa categoría.</p>
              </div>
            </div>
          </div>
          {/* Botonera estandarizada como en Datos (desktop) */}
          <div className="confirmar-btns" style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:'2rem', width:'100%', gap:'1rem'}}>
            <button type="button" className="wr-btn wr-btn--secondary" onClick={onBack}>← Atrás</button>
            <button type="button" className="wr-btn wr-btn--primary" onClick={e => { e.preventDefault(); enviarReserva(); }} disabled={enviando}>Enviar cotización <FaMoneyBillWave style={{marginLeft:'0.5em'}} /></button>
          </div>
        </div>
        <style>{`
          /* Default sizes for amount and note (desktop/tablet) */
          .confirmar-total-note { font-size: 0.9rem; }
          .confirmar-total-amount { font-size: 2.2rem; }
          @media (min-width: 901px) {
            .confirmar-card {
              max-width: 1100px !important;
              padding: 2.5rem 1.5rem !important;
              border-radius: 20px !important;
            }
            /* Better reading rhythm on desktop */
            .step-confirmar p { line-height: 1.5 !important; }
            .confirmar-main-grid { gap: 2.4rem !important; }
            .confirmar-details-grid { gap: 1.6rem !important; }
            .confirmar-fechas-block { padding: 1.4rem !important; }
            .confirmar-details-grid > div { padding: 1.4rem !important; }
            .confirmar-main-right .confirmar-extras-block { padding: 1.4rem !important; }
            .confirmar-main-right .confirmar-total-block { padding: 1.6rem !important; }
            /* Right column: make it horizontal on desktop, Extras left and Total right */
            /* Right column: make it horizontal on desktop, Extras left and Total right */
            .confirmar-main-right { flex-direction: row !important; gap: 1.5rem !important; align-items: stretch !important; }
            .confirmar-main-right .confirmar-extras-block, .confirmar-main-right .confirmar-total-block { flex: 1 1 0 !important; }
            .confirmar-main-right .confirmar-extras-block { order: 1 !important; }
            .confirmar-main-right .confirmar-total-block { order: 2 !important; }
            /* Extras list: no bullets, clearer separation */
            .confirmar-extras-block ul { list-style: none !important; padding-left: 0 !important; margin: 0 !important; }
            .confirmar-extras-block li { display: flex !important; justify-content: space-between !important; gap: 0.75rem !important; padding: 0.45rem 0 !important; border-bottom: 1px dashed #e5e7eb !important; }
            .confirmar-extras-block li:last-child { border-bottom: none !important; }
            .confirmar-fechas-row {
              flex-direction: row !important;
              gap: 2rem !important;
              align-items: stretch !important;
            }
            .confirmar-fechas-row > div {
              min-width: 220px !important;
              flex: 1 1 320px !important;
              margin-bottom: 0 !important;
            }
            .confirmar-total-block {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              align-self: stretch !important;
            }
            .confirmar-summary-row {
              flex-direction: row !important;
              gap: 2rem !important;
              align-items: stretch !important;
            }
            .confirmar-summary-row > div {
              min-width: 220px !important;
              flex: 1 1 320px !important;
              margin-bottom: 0 !important;
            }
            .confirmar-btns {
              flex-direction: row !important;
              gap: 1rem !important;
              width: 100% !important;
              justify-content: flex-end !important;
            }
            .confirmar-btns .wr-btn { flex: 0 0 auto !important; }
          }
          @media (max-width: 900px) {
            .confirmar-card {
              max-width: 100% !important;
              padding: 1.2rem 0.3rem !important;
              border-radius: 20px !important;
            }
            .confirmar-main-right { flex-direction: column !important; gap: 1rem !important; }
            .confirmar-fechas-row {
              flex-direction: column !important;
              gap: 0.7rem !important;
            }
            .confirmar-total-block {
              margin-top: 0.7rem !important;
              margin-bottom: 1.2rem !important;
            }
            .confirmar-summary-row {
              flex-direction: column !important;
              gap: 0.7rem !important;
            }
            .confirmar-summary-row > div {
              min-width: 0 !important;
              width: 100% !important;
              margin-bottom: 0.7rem !important;
            }
            .confirmar-btns { flex-direction: row !important; gap: 0.7rem !important; width: 100% !important; justify-content: flex-end !important; }
            .confirmar-btns .wr-btn { flex: 1 1 0 !important; }
          }
        `}</style>
      </div>
    ) : (
      <ConfirmarMobile />
    )
  );
};

export default StepConfirmar;
