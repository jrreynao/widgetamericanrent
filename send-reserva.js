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
    host: process.env.SMTP_HOST || 'mail.isracarent.com',
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

  // Leer las plantillas desde la URL pública
  async function fetchTemplate(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo obtener la plantilla: ${url}`);
    return await res.text();
  }
  // Si el front envía HTML listo, priorizarlo. Si no, usar plantillas públicas.
  const FRONTEND_BASE = process.env.FRONTEND_BASE || '';
  const clienteURL = FRONTEND_BASE
    ? `${FRONTEND_BASE.replace(/\/$/, '')}/email_templates/correo_cliente.html`
    : 'https://widget.isracarent.com/email_templates/correo_cliente.html';
  const adminURL = FRONTEND_BASE
    ? `${FRONTEND_BASE.replace(/\/$/, '')}/email_templates/correo_admin.html`
    : 'https://widget.isracarent.com/email_templates/correo_admin.html';
  const htmlClienteRaw = (req.body && req.body.htmlCliente) ? String(req.body.htmlCliente) : await fetchTemplate(clienteURL);
  const htmlAdminRaw = (req.body && req.body.htmlAdmin) ? String(req.body.htmlAdmin) : await fetchTemplate(adminURL);
  const htmlCliente = htmlClienteRaw;
  const htmlAdmin = htmlAdminRaw;

  const booking_id = Math.floor(Math.random()*1000000);
  const customer_full_name = form.datos?.nombre || '';
  const customer_email = form.datos?.email || '';
  const customer_phone = form.datos?.telefono || '';
  const dni_number = form.datos?.dni || '';
  const customer_note = form.datos?.nota || '';
  // Categoría seleccionada y datos derivados (nombre amigable, imagen representativa y rango de precios)
  const categoriaId = form.vehiculo?.categoria || form.vehiculo?.categoriaId || '';
  const categoriaLabelMap = { '1': 'Vehículo Chico', '2': 'Vehículo Mediano', '3': 'Vehículo Grande' };
  const categoriaNombre = categoriaLabelMap[categoriaId] || (allCategorias.find(c => c.id === categoriaId)?.nombre || 'Categoría no especificada');
  const vehsCategoria = Array.isArray(allVehiculos) ? allVehiculos.filter(v => v.categoriaId === categoriaId) : [];
  const minPrecio = vehsCategoria.length ? Math.min(...vehsCategoria.map(v => parseInt(v.precio) || 0)) : 0;
  const maxPrecio = vehsCategoria.length ? Math.max(...vehsCategoria.map(v => parseInt(v.precio) || 0)) : 0;
  const vehiculoRepresentativo = vehsCategoria.find(v => (parseInt(v.precio) || 0) === minPrecio) || vehsCategoria[0];
  const service_name = categoriaNombre; // usar nombre de la categoría
  const service_image = vehiculoRepresentativo?.imagen || vehiculoRepresentativo?.image || '';
  const category_range = (minPrecio && maxPrecio)
    ? `$${Number(minPrecio).toLocaleString('es-AR')} - $${Number(maxPrecio).toLocaleString('es-AR')} / día`
    : '';
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
    if (!form.datos?.telefono) return '';
    let tel = String(form.datos.telefono).replace(/[^0-9]/g, '');
    if (tel.startsWith('00')) tel = tel.slice(2);
    if (tel.startsWith('54')) {
      if (tel.startsWith('549')) {
        return tel;
      } else if (tel.length === 12 && tel.startsWith('54')) {
        return tel;
      } else if (tel.length === 11 && tel.startsWith('54')) {
        return '549' + tel.slice(2);
      }
    }
    return tel;
  })();

  const whatsapp_factura = (() => {
    let factura = '🧾 *Solicitud de cotización*%0A';
    factura += `Orden: ${booking_id}%0A`;
    factura += `Nombre: ${customer_full_name}%0A`;
    factura += `Categoría: ${service_name}%0A`;
    factura += `Fechas: ${appointment_date} a ${fechadev}%0A`;
    factura += 'Extras:%0A';
    if (form.extras && form.extras.length > 0) {
      (form.extras || []).forEach(id => {
        const extra = allExtras?.find(e => e.id === id);
        if (extra) factura += `- ${extra.name}: $${parseInt(extra.price).toLocaleString('es-AR')}%0A`;
      });
    } else {
      factura += '- Sin extras%0A';
    }
    // Dirección personalizada si corresponde
    if (mostrarDireccion && direccionEntrega) {
      factura += `Dirección de entrega: ${encodeURIComponent(direccionEntrega)}%0A`;
    } else {
      factura += `Retiro en sede: Av. de los Lagos 7008, B1670 Rincón de Milberg%0A`;
    }
    factura += `Total aproximado: ${appointment_amount} (por ${appointment_duration})%0A%0A`;
    factura += 'Quisiera recibir la cotización final y conocer los métodos de pago disponibles.';
    return factura;
  })();

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
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: vars.customer_email,
      subject: '¡Recibimos tu solicitud en American Rent a Car! 🎉',
      html: fillTemplate(htmlCliente, vars)
    });
    const adminResult = await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Nueva solicitud de cotización - American Rent a Car - ${vars.customer_full_name}`,
      html: fillTemplate(htmlAdmin, vars)
    });
    if (userResult.accepted.length && adminResult.accepted.length) {
      res.json({ok:true});
    } else {
      res.status(500).json({error: 'No se pudo enviar uno o ambos correos'});
    }
  } catch (e) {
    console.error('Error en send-reserva:', e);
    res.status(500).json({error: e.message, stack: e.stack});
  }
}
