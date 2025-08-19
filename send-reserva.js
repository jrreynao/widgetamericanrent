import nodemailer from 'nodemailer';
import { extras as allExtras } from './src/data/extras.js';
import { vehiculos as allVehiculos, categorias as allCategorias } from './src/data/vehiculos.js';
import { fillTemplate } from './src/utils/loadEmailTemplate.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Dry run: permite probar conectividad sin enviar correos
  const dryRun = (req.query && (req.query.dryRun === '1' || req.query.dryRun === 'true')) || (req.body && req.body.dryRun === true);
  if (dryRun) {
    return res.json({ ok: true, mode: 'dry-run' });
  }

  const { form } = req.body;
  if (!form) return res.status(400).json({error: 'Faltan datos'});

  // Configuracion de correo/administrador
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@americanrentacar.ar';
  const FROM_NAME = process.env.MAIL_FROM_NAME || 'American Rent a Car';
  const FROM_EMAIL = process.env.MAIL_FROM || ADMIN_EMAIL;

  // Configurar transporter de nodemailer
  const transporter = nodemailer.createTransport({
    // Usar el host del entorno; por defecto apuntar al dominio actual
    host: process.env.SMTP_HOST || 'mail.americanrentacar.ar',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    secure: true, // SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Determinar un remitente seguro acorde al dominio del SMTP para evitar
  // "550 header From not allowed" cuando el FROM no coincide con el dominio autenticado
  const SMTP_USER = process.env.SMTP_USER || '';
  const getDomain = (email = '') => (email.includes('@') ? email.split('@')[1].toLowerCase() : '');
  const smtpDomain = getDomain(SMTP_USER);
  const fromDomain = getDomain(FROM_EMAIL);
  // Si los dominios difieren, usar como From el SMTP_USER y dejar Reply-To con el correo de marca
  const EFFECTIVE_FROM_EMAIL = smtpDomain && fromDomain && smtpDomain !== fromDomain && SMTP_USER
    ? SMTP_USER
    : FROM_EMAIL;
  const USE_REPLY_TO = EFFECTIVE_FROM_EMAIL !== FROM_EMAIL ? FROM_EMAIL : '';

  // Leer las plantillas desde la URL pública
  async function fetchTemplate(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo obtener la plantilla: ${url}`);
    return await res.text();
  }
  // Si el front envía HTML listo, priorizarlo. Si no, usar plantillas públicas.
  const FRONTEND_BASE = process.env.FRONTEND_BASE || '';
  // Prefer API path if the frontend is served behind /api (e.g., americanrentacar.ar/api/email_templates)
  const clienteURL = FRONTEND_BASE
    ? `${FRONTEND_BASE.replace(/\/$/, '')}/email_templates/correo_cliente.html`
    : 'https://americanrentacar.ar/api/email_templates/correo_cliente.html';
  const adminURL = FRONTEND_BASE
    ? `${FRONTEND_BASE.replace(/\/$/, '')}/email_templates/correo_admin.html`
    : 'https://americanrentacar.ar/api/email_templates/correo_admin.html';
  const htmlClienteRaw = (req.body && req.body.htmlCliente) ? String(req.body.htmlCliente) : await fetchTemplate(clienteURL);
  const htmlAdminRaw = (req.body && req.body.htmlAdmin) ? String(req.body.htmlAdmin) : await fetchTemplate(adminURL);
  const htmlCliente = htmlClienteRaw;
  const htmlAdmin = htmlAdminRaw;

  const booking_id = Math.floor(Math.random()*1000000);
  const customer_full_name = form.datos?.nombre || '';
  const customer_email = form.datos?.email || '';
  // Normalizar teléfono para mostrar y para WhatsApp
  const raw_phone = form.datos?.telefono || '';
  // Quitar textos como "+54 Argentina" y caracteres no numéricos
  let phone_digits = String(raw_phone).replace(/\+?\s*54\s*argentina/gi, '').replace(/[^0-9]/g, '');
  // Si empieza con 00, quitarlo
  if (phone_digits.startsWith('00')) phone_digits = phone_digits.slice(2);
  // Preparar versión mostrable con prefijo +54 si falta y parece un número argentino sin prefijo
  let customer_phone = phone_digits;
  if (/^\d{10,11}$/.test(customer_phone) && !customer_phone.startsWith('54')) {
    customer_phone = '+54 ' + customer_phone;
  } else if (customer_phone.startsWith('54')) {
    customer_phone = '+' + customer_phone;
  }
  const dni_number = form.datos?.dni || '';
  const customer_note = form.datos?.nota || '';
  // Categoría seleccionada y datos derivados (nombre amigable, imagen representativa y rango de precios)
  const categoriaId = String(form.vehiculo?.categoria || form.vehiculo?.categoriaId || '').trim();
  const categoriaLabelMap = { '1': 'Vehículo Chico', '2': 'Vehículo Mediano', '3': 'Vehículo Grande' };
  const categoriaNombre = categoriaLabelMap[categoriaId] || (allCategorias.find(c => String(c.id) === categoriaId)?.nombre || 'Categoría no especificada');
  const vehsCategoria = Array.isArray(allVehiculos) ? allVehiculos.filter(v => String(v.categoriaId) === categoriaId) : [];
  const minPrecio = vehsCategoria.length ? Math.min(...vehsCategoria.map(v => parseInt(v.precio) || 0)) : 0;
  const maxPrecio = vehsCategoria.length ? Math.max(...vehsCategoria.map(v => parseInt(v.precio) || 0)) : 0;
  const vehiculoRepresentativo = vehsCategoria.find(v => (parseInt(v.precio) || 0) === minPrecio) || vehsCategoria[0];
  const service_name = categoriaNombre; // usar nombre de la categoría
  const service_image = vehiculoRepresentativo?.imagen || vehiculoRepresentativo?.image || '';
  const category_range = (minPrecio && maxPrecio)
    ? `$${Number(minPrecio).toLocaleString('es-AR')} - $${Number(maxPrecio).toLocaleString('es-AR')} / día`
    : (minPrecio ? `$${Number(minPrecio).toLocaleString('es-AR')} / día` : '');
  const service_extras = (form.extras || []).map(id => {
    const extra = allExtras?.find(e => e.id === id);
    return extra ? (extra.name || extra.nombre || id) : id;
  }).filter(Boolean).join(', ') || 'Sin extras';
  const appointment_date = form.fechas?.fechaRetiro || '';
  const fechadev = form.fechas?.fechaDevolucion || '';
  const hora_entregadevehiculo = form.fechas?.horaEntrega || form.fechas?.horaRetiro || '';
  const hora_devolucionvehiculo = (form.fechas?.horaDevolucion && /am|pm/i.test(form.fechas.horaDevolucion))
    ? form.fechas.horaDevolucion
    : (form.fechas?.horaDevolucion ? form.fechas.horaDevolucion + ' hs' : '');

  // Calcular diasAlquiler
  let diasAlquiler = 1;
  if (form.fechas?.fechaRetiro && form.fechas?.fechaDevolucion) {
    const d1 = new Date(form.fechas.fechaRetiro);
    const d2 = new Date(form.fechas.fechaDevolucion);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    diasAlquiler = diff > 0 ? diff : 1;
  }

  const appointment_duration = `${diasAlquiler} ${diasAlquiler === 1 ? 'día' : 'días'}`;
  const appointment_amount = (() => {
    // Aproximado: precio mínimo de la categoría por cantidad de días + extras
    let totalVehiculo = (minPrecio || 0) * diasAlquiler;
    let totalExtras = 0;
    if (form.extras && Array.isArray(form.extras)) {
      totalExtras = (form.extras || []).map(id => {
        const extra = allExtras?.find(e => e.id === id);
        return extra ? parseInt(extra.price) || 0 : 0;
      }).reduce((a,b)=>a+b,0);
    }
  const total = totalVehiculo + totalExtras;
  return total ? `$${Number(total).toLocaleString('es-AR')}` : '';
  })();

  // Lógica para mostrar dirección de entrega según extras
  let direccionEntrega = '';
  let mostrarDireccion = false;
  if (form.extras && Array.isArray(form.extras)) {
    mostrarDireccion = form.extras.some(id => {
      const extra = allExtras?.find(e => e.id === id);
      // Detectar por ID ("1") o por nombre, para mayor robustez
      return !!extra && (extra.id === '1' || extra.name === 'Llevar vehículo a mi dirección' || extra.nombre === 'Llevar vehículo a mi dirección');
    });
    // Aceptar ambos nombres de campo desde el front: 'direccion' o 'direccion_entrega'
    const dirFront = form.datos?.direccion || form.datos?.direccion_entrega || '';
    direccionEntrega = mostrarDireccion ? String(dirFront).trim() : '';
  }
  // Definir text_direccionentrega para compatibilidad con plantillas antiguas
  const text_direccionentrega = mostrarDireccion && direccionEntrega
    ? direccionEntrega
    : 'Av. de los Lagos 7008, B1670 Rincón de Milberg';
  // Mensaje para el cliente (siempre explicativo)
  const text_direccionentrega_block = mostrarDireccion && direccionEntrega
    ? `Llevaremos el vehículo a la dirección que indicaste (<b>${direccionEntrega}</b>) el día <b>${appointment_date}</b> a las <b>${hora_entregadevehiculo}</b>. Si tienes alguna duda o necesitas modificar la dirección, contáctanos.`
    : `Deberás retirar tu vehículo en nuestra agencia. Te esperamos en <b>Av. de los Lagos 7008, B1670 Rincón de Milberg</b> a la hora acordada.`;
  // Mensaje para el admin (solo dirección o sede)
  const text_direccionentrega_admin = mostrarDireccion && direccionEntrega
    ? `<b>Dirección de entrega:</b> ${direccionEntrega}`
    : `<b>Retiro en sede:</b> Av. de los Lagos 7008, B1670 Rincón de Milberg`;

  const tarjeta_credito_var = typeof form.datos?.tieneTarjeta !== 'undefined'
    ? (form.datos.tieneTarjeta ? 'Sí' : 'No')
    : '';

  const customer_whatsapp_link = (() => {
    if (!phone_digits) return '';
    let tel = phone_digits;
    // Evitar duplicar 54: si ya empieza con 54 o 549, mantener; si no, agregar 54
    if (!tel.startsWith('54')) {
      tel = '54' + tel;
    }
    // Asegurar formato móvil con 549 cuando corresponde (AR mobile rule heuristic)
    if (tel.startsWith('54') && !tel.startsWith('549')) {
      // Insert a '9' after the country code for mobile if length suggests missing it
      tel = '549' + tel.slice(2);
    }
    return tel;
  })();

  const whatsapp_factura = (() => {
    // Mensaje completo en texto plano y luego URL-encoded
    const lines = [];
    lines.push('🧾 Solicitud de cotización');
    lines.push(`Orden: ${booking_id}`);
    lines.push(`Nombre: ${customer_full_name}`);
    lines.push(`Email: ${customer_email}`);
    lines.push(`Teléfono: ${customer_phone}`);
    lines.push(`DNI/Pasaporte: ${dni_number}`);
    lines.push(`Categoría: ${service_name}`);
    if (category_range) lines.push(`Rango de precios: ${category_range}`);
    lines.push(`Fechas: ${appointment_date} a ${fechadev}`);
    lines.push(`Cantidad de días: ${appointment_duration}`);
    lines.push('Extras:');
    if (form.extras && form.extras.length > 0) {
      (form.extras || []).forEach(id => {
        const extra = allExtras?.find(e => e.id === id);
        if (extra) lines.push(`- ${extra.name}: $${parseInt(extra.price).toLocaleString('es-AR')}`);
      });
    } else {
      lines.push('- Sin extras');
    }
    // Dirección personalizada si corresponde
    if (mostrarDireccion && direccionEntrega) {
      lines.push(`Dirección de entrega: ${direccionEntrega}`);
    } else {
      lines.push('Retiro en sede: Av. de los Lagos 7008, B1670 Rincón de Milberg');
    }
    if (appointment_amount) lines.push(`Total aproximado: ${appointment_amount}`);
    lines.push(`¿Posee tarjeta de crédito?: ${tarjeta_credito_var || ''}`);
    if (customer_note) lines.push(`Nota del cliente: ${customer_note}`);
    lines.push('');
    lines.push('Solicito la cotización final y confirmación de disponibilidad.');
    const msg = lines.join('\n');
    return encodeURIComponent(msg);
  })();

  // Número de WhatsApp del negocio para que el cliente inicie chat (env override)
  const BUSINESS_WA = (process.env.WA_BUSINESS || process.env.BUSINESS_WHATSAPP || '5491126584086').replace(/[^0-9]/g, '');
  const wa_contact_link = `https://wa.me/${BUSINESS_WA}?text=${whatsapp_factura}`;

  // Construir bloque de lista de extras para el correo del admin (si hay)
  let extras_list_block = '';
  if (form.extras && form.extras.length > 0) {
    const items = (form.extras || []).map(id => {
      const extra = allExtras?.find(e => e.id === id);
      if (!extra) return '';
      const price = parseInt(extra.price) || 0;
      return `<tr><td style="padding:3px 0;border-bottom:1px dashed #e5e7eb;"><b>${extra.name}</b></td><td style="padding:3px 0;text-align:right;border-bottom:1px dashed #e5e7eb;">$${price.toLocaleString('es-AR')}</td></tr>`;
    }).filter(Boolean).join('');
    extras_list_block = `
      <table style="width:100%;border:1px solid #e5e7eb;border-radius:10px;margin:0 0 16px 0;color:#334155;font-size:1em">
        <tr>
          <td colspan="2" style="padding:10px 12px;font-weight:700">Extras seleccionados</td>
        </tr>
        ${items}
      </table>
    `;
  }

  const vars = {
    customer_full_name,
    customer_email,
    customer_phone,
    dni_number,
    customer_note,
    service_name,
    service_image,
    service_extras,
    category_range,
    appointment_date,
    fechadev,
    hora_entregadevehiculo,
    hora_devolucionvehiculo,
    appointment_duration,
    appointment_amount,
    text_direccionentrega,
    text_direccionentrega_block,
    text_direccionentrega_admin,
    booking_id,
    tarjeta_credito: tarjeta_credito_var,
    customer_whatsapp_link,
  wa_contact_link,
    extras_list_block,
    whatsapp_factura
  };

  let mensaje_entrega_cliente = '';
  if (mostrarDireccion && direccionEntrega) {
    mensaje_entrega_cliente = `Llevaremos el vehículo a la dirección que indicaste (<b>${direccionEntrega}</b>) el día <b>${appointment_date}</b> a las <b>${hora_entregadevehiculo}</b>. Si tienes alguna duda o necesitas modificar la dirección, contáctanos.`;
  } else {
    mensaje_entrega_cliente = `Deberás retirar tu vehículo en nuestra agencia. Te esperamos en <a href="https://g.co/kgs/gj5UX3Z" style="color:#2563eb;text-decoration:none;font-weight:500" target="_blank">Av. de los Lagos 7008, B1670 Rincón de Milberg</a> a la hora acordada.`;
  }
  vars.mensaje_entrega_cliente = mensaje_entrega_cliente;

  try {
    const userResult = await transporter.sendMail({
      from: `${FROM_NAME} <${EFFECTIVE_FROM_EMAIL}>`,
      to: vars.customer_email,
      subject: '¡Recibimos tu solicitud en American Rent a Car! 🎉',
      html: fillTemplate(htmlCliente, vars),
      ...(USE_REPLY_TO ? { replyTo: USE_REPLY_TO } : {}),
      // Asegurar sobre de SMTP correcto
      envelope: {
        from: SMTP_USER || EFFECTIVE_FROM_EMAIL,
        to: vars.customer_email
      }
    });
    const adminResult = await transporter.sendMail({
      from: `${FROM_NAME} <${EFFECTIVE_FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Nueva solicitud de cotización - American Rent a Car - ${vars.customer_full_name}`,
      html: fillTemplate(htmlAdmin, vars),
      ...(USE_REPLY_TO ? { replyTo: USE_REPLY_TO } : {}),
      envelope: {
        from: SMTP_USER || EFFECTIVE_FROM_EMAIL,
        to: ADMIN_EMAIL
      }
    });
    // Intentar WhatsApp (Twilio) al admin si hay configuración
    let twilioInfo = { skipped: true };
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID || '';
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN || '';
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // sandbox por defecto
    const ADMIN_WHATSAPP_RAW = (process.env.ADMIN_WHATSAPP || process.env.WA_ADMIN || '').trim();
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && ADMIN_WHATSAPP_RAW) {
      try {
        const { default: twilio } = await import('twilio');
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const digits = ADMIN_WHATSAPP_RAW.replace(/[^0-9]/g, '');
        const to = `whatsapp:+${digits}`;
        const from = TWILIO_WHATSAPP_FROM.startsWith('whatsapp:') ? TWILIO_WHATSAPP_FROM : `whatsapp:${TWILIO_WHATSAPP_FROM}`;
        const lines = [];
        lines.push('Nueva solicitud de cotización');
        lines.push(`Orden: ${booking_id}`);
        if (customer_full_name) lines.push(`Nombre: ${customer_full_name}`);
        if (customer_phone) lines.push(`Teléfono: ${customer_phone}`);
        if (customer_email) lines.push(`Email: ${customer_email}`);
        lines.push(`Categoría: ${service_name}`);
        if (category_range) lines.push(`Rango: ${category_range}`);
        lines.push(`Fechas: ${appointment_date} a ${fechadev}`);
        lines.push(`Días: ${appointment_duration}`);
        if (service_extras) lines.push(`Extras: ${service_extras}`);
        if (appointment_amount) lines.push(`Total aprox.: ${appointment_amount}`);
        if (customer_note) lines.push(`Nota: ${customer_note}`);
        // Link directo para abrir chat con el cliente (si hay teléfono)
        if (customer_whatsapp_link) {
          lines.push('');
          lines.push(`Chat cliente: https://wa.me/${customer_whatsapp_link}`);
        }
        const body = lines.join('\n');
        const msg = await client.messages.create({ from, to, body });
        twilioInfo = { skipped: false, sid: msg.sid };
      } catch (twilioErr) {
        console.error('Twilio WA error:', twilioErr);
        twilioInfo = { skipped: false, error: twilioErr?.message || String(twilioErr) };
      }
    }

    if (userResult.accepted.length && adminResult.accepted.length) {
      res.json({ ok: true, twilio: twilioInfo });
    } else {
      res.status(500).json({error: 'No se pudo enviar uno o ambos correos'});
    }
  } catch (e) {
    console.error('Error en send-reserva:', e);
    res.status(500).json({
      error: e.message,
      stack: e.stack,
      smtp: {
        code: e.code,
        response: e.response,
        command: e.command
      }
    });
  }
}
