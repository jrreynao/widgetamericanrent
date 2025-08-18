// Campo reutilizable para hora con click en todo el área
function HoraField({ id, label, value, onChange, helpText, classPrefix = "" }) {
  const inputRef = useRef(null);
  const handleClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    }
  };
  const fieldClass = `field${classPrefix ? " " + classPrefix + "-step-fechas-field " + classPrefix + "-clickable-field" : ""}`;
  const labelClass = classPrefix ? `${classPrefix}-step-fechas-label` : "step-fechas-label";
  const inputClass = classPrefix ? `${classPrefix}-step-fechas-input ${classPrefix}-datepicker-input` : "step-fechas-input datepicker-input";
  const helpClass = classPrefix ? `${classPrefix}-step-fechas-help` : "step-fechas-help";
  return (
    <div className={fieldClass} onClick={handleClick} style={{cursor:'pointer'}}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        ref={inputRef}
        type="time"
        id={id}
        className={inputClass}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        style={{pointerEvents:'auto'}}
      />
      {helpText && <div className={helpClass}>{helpText}</div>}
    </div>
  );
}
import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegClock, FaRegCalendar, FaSearch } from "react-icons/fa";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
registerLocale("es", es);
import dayjs from "dayjs";


const sucursales = ["Buenos Aires"];

export default function StepFechas({ onNext }) {
  // Ref para el widget
  const widgetRef = React.useRef(null);
  // Refs para abrir el time picker al hacer click en todo el campo
  const startTimeRef = React.useRef(null);
  const endTimeRef = React.useRef(null);
  // Refs para medir posición de los campos fecha
  const retiroGroupRef = React.useRef(null);
  const devolGroupRef = React.useRef(null);

  const openTimePicker = (ref) => {
    const el = ref?.current;
    if (!el || el.disabled) return;
    if (typeof el.showPicker === 'function') {
      try { el.showPicker(); return; } catch (_) { /* fallback below */ }
    }
    el.focus();
  };

  // Nota: evitamos auto-scroll al montar este paso para no mover el viewport
  const [sucursal] = useState("Buenos Aires");
  const today = dayjs();
  const defaultRetiro = today.add(1, "day").toDate();
  const [fechaRetiro, setFechaRetiro] = useState(defaultRetiro);
  const [fechaDevolucion, setFechaDevolucion] = useState(null);
  const [horaRetiro, setHoraRetiro] = useState("08:00");
  const [horaDevolucion, setHoraDevolucion] = useState("14:00");
  // Estado para controlar la colocación del popper según espacio disponible
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 900;
  });
  // Preferimos abrir arriba (top-start) y que el popper haga flip si abajo hay más espacio.
  // Sin modal: usamos el popper normal anclado al campo

  React.useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
  // no gestionamos placement por estado; el popper decide con flip
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleOpenRetiro = () => {};
  const handleOpenDevol = () => {};

  const fechaRetiroStr = fechaRetiro ? dayjs(fechaRetiro).format("YYYY-MM-DD") : "";
  const fechaDevolucionStr = fechaDevolucion ? dayjs(fechaDevolucion).format("YYYY-MM-DD") : "";

  const isValid = sucursal && fechaRetiroStr && horaRetiro && fechaDevolucionStr && horaDevolucion;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onNext({
        sucursal,
        fechaRetiro: fechaRetiroStr,
        horaRetiro,
        fechaDevolucion: fechaDevolucionStr,
        horaDevolucion
      });
    }
  };

  return (
    <div ref={widgetRef} className="step-fechas-bg" style={{background:'transparent', display:'block'}}>
      <style>{`
        .step-fechas-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 16px 0 rgba(60,60,60,0.10);
          padding: 2rem 1.5rem;
          max-width: 1200px;
          width: 100%;
          margin: 2rem auto;
          box-sizing: border-box;
          /* Ensure poppers can overflow visually when needed */
          overflow: visible;
        }
        .step-fechas-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
        }
        .step-fechas-grid-item {
          min-width: 150px;
          flex: 1 1 150px;
        }
        .step-fechas-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: block;
          color: #3d4152;
        }
        .step-fechas-input-group {
          position: relative;
          display: flex;
          align-items: center;
          /* Make react-datepicker wrapper stretch so icon positioning is consistent */
          gap: 0; /* avoid extra spacing */
          overflow: visible;
        }
        .step-fechas-input-group .react-datepicker-wrapper,
        .step-fechas-input-group .react-datepicker__input-container {
          width: 100%;
          display: block;
          position: relative;
          z-index: 1; /* sit below the icon */
        }
        .step-fechas-input-group .react-datepicker__input-container input {
          width: 100%;
          box-sizing: border-box;
        }
        .step-fechas-icon {
          position: absolute;
          left: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 16px;
          pointer-events: none;
          z-index: 5; /* above input, below popper */
        }
        .step-fechas-input {
          width: 100%;
          height: 44px;
          padding: 0.8rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 16px;
          background: #fff;
          color: #3d4152;
          outline: none;
          box-sizing: border-box;
          transition: border 0.2s;
          display: flex;
          align-items: center;
        }
        .step-fechas-input-icon {
          /* Desktop/base: tighter spacing between icon and text */
          padding-left: 2.2rem !important;
          height: 44px !important;
          font-size: 16px !important;
        }
        /* Extra padding for text inputs like 'Sucursal' to prevent icon overlap */
        input[type="text"].step-fechas-input-icon,
        input[disabled][type="text"].step-fechas-input-icon {
          padding-left: 2.5rem !important; /* base desktop */
        }
        .step-fechas-input:focus {
          border-color: var(--wr-brand);
        }
        /* Ensure extra padding for time inputs with left icon */
        input[type="time"].step-fechas-input-icon {
          padding-left: 2.2rem !important; /* base desktop */
        }
  /* Ocultar iconos nativos del input time para evitar doble icono con el SVG */
  .step-fechas-input[type="time"]::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
  .step-fechas-input[type="time"]::-webkit-clear-button { display: none; -webkit-appearance: none; }
  .step-fechas-input[type="time"]::-webkit-inner-spin-button,
  .step-fechas-input[type="time"]::-webkit-outer-spin-button { display: none; -webkit-appearance: none; margin: 0; }
  .step-fechas-input[type="time"] { -moz-appearance: textfield; appearance: textfield; }
  /* Remove space reserved by indicator in some browsers */
  .step-fechas-input[type="time"]::-webkit-datetime-edit-fields-wrapper { padding: 0; }
  .step-fechas-input[type="time"]::-webkit-datetime-edit { padding: 0; }

        /* ====== React DatePicker themed styles (scoped) ====== */
        .step-fechas-datepicker-calendar.react-datepicker {
          border: 1px solid #e5e7eb;
          box-shadow: 0 8px 28px rgba(60,60,60,0.18);
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }
        .step-fechas-datepicker-calendar .react-datepicker__triangle { display: none; }
        .step-fechas-datepicker-calendar .react-datepicker__header {
          background: #f7f7fb;
          border-bottom: 1px solid #eceff4;
          padding-top: 0.75rem;
          padding-bottom: 0.5rem;
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
        }
        .step-fechas-datepicker-calendar .react-datepicker__current-month {
          font-weight: 700;
          color: #111827;
          text-transform: capitalize;
          margin-bottom: 0.4rem; /* add space before dropdowns */
        }
        .step-fechas-datepicker-calendar .react-datepicker__header__dropdown {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.1rem;
          margin-bottom: 0.2rem;
        }
        .step-fechas-datepicker-calendar .react-datepicker__month-dropdown-container--select,
        .step-fechas-datepicker-calendar .react-datepicker__year-dropdown-container--select {
          margin: 0 0.15rem;
        }
        .step-fechas-datepicker-calendar .react-datepicker__month {
          margin: 0.5rem;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 600;
          width: 2.2rem;
          line-height: 2.2rem;
          margin: 0.2rem;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day {
          border-radius: 8px;
          width: 2.2rem;
          line-height: 2.2rem;
          margin: 0.2rem;
          color: #111827;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day:hover {
          background: rgba(46,204,113,0.12);
          color: var(--wr-brand);
        }
        .step-fechas-datepicker-calendar .react-datepicker__day--selected,
        .step-fechas-datepicker-calendar .react-datepicker__day--in-selecting-range,
        .step-fechas-datepicker-calendar .react-datepicker__day--in-range {
          background: var(--wr-brand);
          color: #fff;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day--keyboard-selected {
          background: #e5e7eb;
          color: #111827;
        }
        .step-fechas-datepicker-calendar .react-datepicker__navigation-icon::before {
          border-color: var(--wr-brand);
          top: 8px;
        }
        .step-fechas-datepicker-calendar .react-datepicker__navigation--previous,
        .step-fechas-datepicker-calendar .react-datepicker__navigation--next { outline: none; }
        .step-fechas-datepicker-calendar .react-datepicker__month-dropdown-container--select select,
        .step-fechas-datepicker-calendar .react-datepicker__year-dropdown-container--select select {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          background: #fff;
          color: #111827;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day--outside-month { color: #cbd5e1; }
        .step-fechas-datepicker-calendar .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
          opacity: 0.7;
          cursor: not-allowed;
          pointer-events: none;
          background: transparent !important;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day--disabled:hover {
          background: transparent !important;
          color: #cbd5e1 !important;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day--today {
          box-shadow: inset 0 0 0 2px #a5b4fc;
          border-radius: 8px;
        }
        .step-fechas-datepicker-calendar .react-datepicker__day--disabled.react-datepicker__day--today {
          box-shadow: none; /* remove today ring if disabled */
        }
  /* Ensure the calendar popper overlays surrounding UI */
  .react-datepicker-popper { z-index: 2147483647 !important; width: auto; }
  /* Keep popper width close to input for alignment on small screens */
  .step-fechas-input-group .react-datepicker-popper { min-width: 260px; }
  .step-fechas-popper[data-popper-placement^="top"] { margin-bottom: 10px; }
  .step-fechas-popper[data-popper-placement^="bottom"] { margin-top: 8px; }

        /* Cap calendar height on very small screens and allow scrolling inside */
        .step-fechas-datepicker-calendar.react-datepicker {
          max-height: calc(100vh - 48px);
          overflow-y: auto; /* allow scroll if needed */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .step-fechas-datepicker-calendar .react-datepicker__month-container {
          max-height: inherit;
        }

        .step-fechas-btn-grid-item {
          min-width: 180px;
          flex: 1 1 180px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 100%;
        }
        .step-fechas-btn {
          width: 100%;
          height: 54px;
          font-weight: bold;
          font-size: 1.1rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px 0 rgba(60,60,60,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--wr-brand);
          color: #fff;
          border: none;
          transition: background 0.2s, transform 0.2s;
          margin-bottom: 0;
          cursor: pointer;
        }
        .step-fechas-btn:disabled {
          background: #c7c7c7;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          /* On mobile, restore larger paddings to avoid overlap and keep comfortable touch targets */
          .step-fechas-icon { left: 0.8rem; }
          .step-fechas-input-icon { padding-left: 2.8rem !important; }
          input[type="text"].step-fechas-input-icon,
          input[disabled][type="text"].step-fechas-input-icon { padding-left: 3.2rem !important; }
          input[type="time"].step-fechas-input-icon { padding-left: 2.8rem !important; }
          .step-fechas-card {
            padding: 1.2rem 0.5rem;
          }
          .step-fechas-grid {
            gap: 1rem;
          }
        }
        @media (max-width: 650px) {
          .step-fechas-card {
            padding: 1rem 0.75rem; /* más aire lateral */
            border-radius: 16px;
            box-shadow: 0 8px 32px 0 rgba(60,60,60,0.10);
            margin: 0.9rem auto; /* separar del borde superior/inferior */
            max-width: 98vw; /* respetar el contenedor padre y dar respiro */
          }
          .step-fechas-datepicker-calendar.react-datepicker { max-height: calc(100vh - 96px); }
          .step-fechas-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .step-fechas-grid-item, .step-fechas-btn-grid-item {
            min-width: 100%;
            flex: unset;
          }
          .step-fechas-btn-grid-item {
            grid-column: 1 / span 2;
            margin-top: 1.2rem;
          }
        }
      `}</style>
  <div className="step-fechas-card">
        <form className="step-fechas-form" onSubmit={handleSubmit} style={{width:'100%', margin:0, padding:0, boxSizing:'border-box'}}>
          <div className="step-fechas-grid">
            {/* Sucursal: línea completa */}
            <div className="step-fechas-grid-item" style={{gridColumn: '1 / span 2'}}>
              <label className="step-fechas-label" htmlFor="sucursal">Sucursal de retiro</label>
              <div className="step-fechas-input-group">
                <span className="step-fechas-icon"><FaLocationDot /></span>
                <input
                  id="sucursal"
                  type="text"
                  className="step-fechas-input step-fechas-input-icon"
                  value={sucursal}
                  disabled
                  autoComplete="off"
                  style={{background:'#f3f4f6', color:'#6b7280'}}
                />
              </div>
            </div>
            {/* Recogida y hora de recogida */}
            <div className="step-fechas-grid-item">
              <label className="step-fechas-label" htmlFor="start-date">Recogida</label>
        <div className="step-fechas-input-group" ref={retiroGroupRef}>
                <span className="step-fechas-icon"><FaRegCalendar /></span>
                <DatePicker
                  selected={fechaRetiro}
                  onChange={date => {
                    setFechaRetiro(date);
                    if (fechaDevolucion && dayjs(date).isAfter(dayjs(fechaDevolucion))) {
                      setFechaDevolucion(null);
                    }
                  }}
                  minDate={today.toDate()}
                  dateFormat="dd/MM/yy"
                  placeholderText="DD/MM/AA"
                  todayButton="Hoy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="step-fechas-input step-fechas-input-icon"
                  calendarClassName="step-fechas-datepicker-calendar"
                  popperClassName="step-fechas-popper"
                  locale="es"
                  id="custom-retiro"
                  name="customRetiro"
                  autoComplete="off"
                  onInputClick={handleOpenRetiro}
                  popperPlacement={'bottom-start'}
                  popperModifiers={[
                    { name: 'offset', options: { offset: [0, 10] } },
                    { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] } },
                    { name: 'preventOverflow', options: { boundary: 'viewport', rootBoundary: 'viewport', altBoundary: true, tether: true, padding: 8 } }
                  ]}
          onCalendarOpen={handleOpenRetiro}
                />
              </div>
            </div>
            <div className="step-fechas-grid-item">
              <label className="step-fechas-label" htmlFor="start-time">Hora de retiro</label>
        <div className="step-fechas-input-group" onClick={() => openTimePicker(startTimeRef)} style={{cursor:'pointer'}}>
                <span className="step-fechas-icon"><FaRegClock /></span>
                <input
                  id="start-time"
                  type="time"
                  className="step-fechas-input step-fechas-input-icon"
          ref={startTimeRef}
                  value={horaRetiro}
                  onChange={e => setHoraRetiro(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            {/* Devolución y hora de devolución */}
            <div className="step-fechas-grid-item">
              <label className="step-fechas-label" htmlFor="end-date">Devolución</label>
        <div className="step-fechas-input-group" ref={devolGroupRef}>
                <span className="step-fechas-icon"><FaRegCalendar /></span>
                <DatePicker
                  selected={fechaDevolucion}
                  onChange={date => setFechaDevolucion(date)}
                  minDate={fechaRetiro || today.toDate()}
                  dateFormat="dd/MM/yy"
                  placeholderText="DD/MM/AA"
                  todayButton="Hoy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="step-fechas-input step-fechas-input-icon"
                  calendarClassName="step-fechas-datepicker-calendar"
                  popperClassName="step-fechas-popper"
                  locale="es"
                  id="custom-devolucion"
                  name="customDevolucion"
                  autoComplete="off"
                  disabled={!fechaRetiro}
                  onInputClick={handleOpenDevol}
                  popperPlacement={'bottom-start'}
                  popperModifiers={[
                    { name: 'offset', options: { offset: [0, 10] } },
                    { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] } },
                    { name: 'preventOverflow', options: { boundary: 'viewport', rootBoundary: 'viewport', altBoundary: true, tether: true, padding: 8 } }
                  ]}
          onCalendarOpen={handleOpenDevol}
                />
              </div>
            </div>
            <div className="step-fechas-grid-item">
              <label className="step-fechas-label" htmlFor="end-time">Hora de devolución</label>
        <div className="step-fechas-input-group" onClick={() => openTimePicker(endTimeRef)} style={{cursor:'pointer'}}>
                <span className="step-fechas-icon"><FaRegClock /></span>
                <input
                  id="end-time"
                  type="time"
                  className="step-fechas-input step-fechas-input-icon"
          ref={endTimeRef}
                  value={horaDevolucion}
                  onChange={e => setHoraDevolucion(e.target.value)}
                  required
                  autoComplete="off"
                  disabled={!fechaRetiro}
                />
              </div>
            </div>
            {/* Botón igual a la referencia: texto, ancho completo, alineado */}
            <div className="step-fechas-btn-grid-item">
              <button
                className="wr-btn wr-btn--primary wr-btn--block step-fechas-btn"
                type="submit"
                disabled={!isValid}
              >
                Cotizar alquiler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}