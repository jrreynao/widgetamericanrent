


import React, { useState } from "react";
import { loadEmailTemplate } from "./utils/loadEmailTemplate";
import StepFechas from "./components/StepFechas";
import StepVehiculo from "./components/StepVehiculo";
import StepExtras from "./components/StepExtras";
import StepDatos from "./components/StepDatos";
import StepConfirmar from "./components/StepConfirmar";
import EmailPreview from "./components/EmailPreview";
import { vehiculos } from "./data/vehiculos";
// import { extras as allExtras } from "./data/extras";
import { extras as allExtras } from "./data/extras";
import "./App.css";

function App({ apiBase }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fechas: {}, vehiculo: {}, extras: [], datos: {} });

  // Paso 1: Fechas
  const handleFechasNext = (data) => {
    setForm(f => ({ ...f, fechas: data }));
    setStep(2);
  };

  // Paso 2: Vehículo
  const handleVehiculoNext = (payload) => {
    // Guardar categoría desde el selector si viene en el payload
    setForm(f => {
      const nextVeh = { ...f.vehiculo };
      if (payload && payload.categoria) {
        nextVeh.categoria = payload.categoria;
      }
      // Si el valor en vehiculo es un id string, resolver al objeto
      if (typeof f.vehiculo === 'string') {
        const v = vehiculos.find(v => v.id === f.vehiculo);
        if (v) return { ...f, vehiculo: { ...v, ...nextVeh } };
      }
      return { ...f, vehiculo: nextVeh };
    });
    setStep(3);
  };
  const handleVehiculoBack = () => setStep(1);

  // Paso 3: Extras
  const handleExtrasChange = (extraId) => {
    setForm(f => {
      const selected = f.extras.includes(extraId)
        ? f.extras.filter(id => id !== extraId)
        : [...f.extras, extraId];
      return { ...f, extras: selected };
    });
  };
  const handleExtrasNext = () => {
    setStep(4);
  };
  const handleExtrasBack = () => setStep(2);

  // Paso 4: Datos del cliente
  const handleDatosNext = (datos) => {
    setForm(f => ({ ...f, datos }));
    setStep(5);
  };
  const handleDatosBack = () => setStep(3);


  const handleConfirmarBack = () => setStep(4);

  // Carga y reemplaza las plantillas antes de enviar
  const handleConfirmarSubmit = async () => {
    const formConTotal = { ...form, total: calcularTotal() };
    try {
      // Cargar plantillas desde public/email_templates
      const [plantillaCliente, plantillaAdmin] = await Promise.all([
            loadEmailTemplate("correo_cliente.html", apiBase || import.meta.env?.VITE_API_BASE),
            loadEmailTemplate("correo_admin.html", apiBase || import.meta.env?.VITE_API_BASE)
          ]);

  // Reemplazo de variables: dejar que el backend complete datos dinámicos
  // No reemplazar: booking_id, appointment_duration, appointment_amount, teléfonos, WhatsApp,
  // dirección dinámica, nombre de categoría/rango, imagen de servicio, tarjeta_credito (admin)
  const replaceVars = (tpl, vars, skipKeys = []) => {
        let html = tpl;
        Object.entries(vars).forEach(([k, v]) => {
          if (!skipKeys.includes(k)) {
            html = html.replaceAll(`%${k}%`, v ?? "");
          }
        });
        return html;
      };

      // Variables para reemplazar en las plantillas
      const vars = {
        booking_id: formConTotal.id || "%booking_id%",
        service_name: formConTotal.vehiculo?.nombre || "-",
        service_extras: (formConTotal.extras || []).map(id => {
          const extra = allExtras.find(e => e.id === id);
          return extra ? (extra.name || extra.nombre) : "";
        }).filter(Boolean).join(", ") || "Sin extras",
        appointment_date: formConTotal.fechas?.fechaRetiro || formConTotal.fechas?.fechaEntrega || "-",
        hora_entregadevehiculo: formConTotal.fechas?.horaRetiro || formConTotal.fechas?.horaEntrega || "-",
        fechadev: formConTotal.fechas?.fechaDevolucion || "-",
        hora_devolucionvehiculo: formConTotal.fechas?.horaDevolucion || "-",
        appointment_duration: "%appointment_duration%",
        appointment_amount: "%appointment_amount%",
        text_direccionentrega_block: formConTotal.fechas?.delivery && formConTotal.fechas?.direccionEntrega
          ? `<b>Dirección de entrega:</b> ${formConTotal.fechas.direccionEntrega}`
          : "",
        // No reemplazar text_direccionentrega aquí, dejar el placeholder para el backend
        text_direccionentrega: "%text_direccionentrega%",
        customer_full_name: formConTotal.datos?.nombre || "-",
        customer_phone: "%customer_phone%",
        customer_email: formConTotal.datos?.email || "-",
        dni_number: formConTotal.datos?.dni || "-",
        customer_note: formConTotal.datos?.nota || "-",
        customer_whatsapp_link: "%customer_whatsapp_link%"
      };

      // Claves que dejamos para que compute el backend
      const SKIP_COMMON = [
        'booking_id', 'appointment_duration', 'appointment_amount',
        'text_direccionentrega', 'text_direccionentrega_block', 'text_direccionentrega_admin',
        'customer_phone', 'customer_whatsapp_link', 'service_name', 'category_range', 'service_image', 'service_extras'
      ];
      const htmlCliente = replaceVars(plantillaCliente, vars, SKIP_COMMON);
      // No reemplazar %tarjeta_credito% en el admin, lo hace el backend
      const htmlAdmin = replaceVars(plantillaAdmin, vars, [...SKIP_COMMON, 'tarjeta_credito']);

  // Endpoint: prioridad a apiBase del custom element; luego VITE_API_BASE; luego /api
  const bases = [apiBase, import.meta.env?.VITE_API_BASE, "/api"].filter(Boolean);
      let res;
      let lastErr;
      for (const base of bases) {
        try {
          res = await fetch(`${base}/send-reserva`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form: { ...formConTotal, allExtras },
              htmlCliente,
              htmlAdmin
            })
          });
          if (res.ok) break;
          // Si no ok, intenta el siguiente base
          lastErr = await res.clone().json().catch(() => ({ error: res.statusText }));
        } catch (e) {
          lastErr = { error: e.message };
        }
      }
      if (!res || !res.ok) {
        throw new Error(lastErr?.error || 'No se pudo enviar la reserva');
      }
      if (res.ok) {
        alert("¡Cotización enviada correctamente!\n\nTe enviamos un correo con los detalles y el link para finalizar tu reserva y pago.\n\nSi no lo ves en tu bandeja de entrada, revisa la carpeta de spam o promociones.");
        setStep(1);
      } else {
        const err = await res.json();
        alert("Error al enviar la reserva: " + (err.error || ""));
      }
    } catch (e) {
      alert("Error de red al enviar la reserva: " + e.message);
    }
  };

  // Calcula el total para enviar al backend
  const calcularTotal = () => {
    let total = 0;
    if (form.vehiculo && form.vehiculo.precio) total += parseInt(form.vehiculo.precio);
    // Suma extras si existen
    if (form.extras && Array.isArray(form.extras)) {
      total += form.extras.reduce((sum, id) => {
        const extra = allExtras.find(e => e.id === id);
        return sum + (extra ? parseInt(extra.price) : 0);
      }, 0);
    }
    return total;
  };



  // Puedes filtrar los extras según el vehículo/categoría si lo deseas
  const availableExtras = allExtras; // Por ahora, todos disponibles

  return (
    <div>
      {step === 1 && (
        <StepFechas onNext={handleFechasNext} />
      )}
      {step === 2 && (
        <StepVehiculo
          onNext={handleVehiculoNext}
          onBack={handleVehiculoBack}
          selected={form.vehiculo}
          setSelected={vehiculoInput => {
            // Si es un id, buscar el objeto completo
            let vehiculoObj = vehiculoInput;
            if (vehiculoInput && vehiculoInput.id && !vehiculoInput.precio) {
              const v = vehiculos.find(v => v.id === vehiculoInput.id);
              if (v) vehiculoObj = v;
            }
            setForm(f => ({ ...f, vehiculo: vehiculoObj }));
          }}
        />
      )}
      {step === 3 && (
        <StepExtras
          extras={availableExtras}
          selectedExtras={form.extras}
          onChange={handleExtrasChange}
          onNext={handleExtrasNext}
          onBack={handleExtrasBack}
        />
      )}
      {step === 4 && (
        <StepDatos
          onNext={handleDatosNext}
          onBack={handleDatosBack}
          initialData={form.datos}
          extrasSeleccionados={form.extras}
        />
      )}
      {step === 5 && (
        <StepConfirmar
          form={form}
          vehiculos={vehiculos}
          extras={allExtras}
          onBack={handleConfirmarBack}
          onSubmit={handleConfirmarSubmit}
        />
      )}
    </div>
  );
}

export default App;
