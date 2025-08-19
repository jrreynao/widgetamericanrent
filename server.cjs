'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
// Cargar el handler ESM de forma perezosa con import() dentro del middleware
let handlerPromise = null;
async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import('./send-reserva.js').then((mod) => mod.default || mod.handler || mod);
  }
  return handlerPromise;
}

const app = express();
app.use(cors());
app.use(express.json());
// Serve email templates under /api/email_templates from both public/ and src/email_templates if present
const templatesDirs = [
  path.join(__dirname, 'public', 'email_templates'),
  path.join(__dirname, 'src', 'email_templates')
];
templatesDirs.forEach(dir => {
  app.use('/api/email_templates', express.static(dir, { fallthrough: true }));
});

// Raíz de estado
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'widgetrent-api' });
});

// Rutas API (ambas variantes para evitar conflictos con estáticos)
app.post('/send-reserva', async (req, res, next) => {
  try {
    const handler = await getHandler();
    return handler(req, res, next);
  } catch (e) { next(e); }
});
app.post('/backend/send-reserva', async (req, res, next) => {
  try {
    const handler = await getHandler();
    return handler(req, res, next);
  } catch (e) { next(e); }
});
// Prefijos explícitos por si el proxy no elimina /api
app.post('/api/send-reserva', async (req, res, next) => {
  try {
    const handler = await getHandler();
    return handler(req, res, next);
  } catch (e) { next(e); }
});

// GET dry-run rápido
app.get('/send-reserva', (req, res) => {
  const q = req.query || {};
  if (q.dryRun === '1' || q.dryRun === 'true') {
    return res.json({ ok: true, mode: 'dry-run', method: 'GET' });
  }
  res.status(405).json({ error: 'Use POST' });
});
app.get('/api/send-reserva', (req, res) => {
  const q = req.query || {};
  if (q.dryRun === '1' || q.dryRun === 'true') {
    return res.json({ ok: true, mode: 'dry-run', method: 'GET' });
  }
  res.status(405).json({ error: 'Use POST' });
});

// Health checks
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/backend/healthz', (req, res) => res.json({ ok: true }));
app.get('/api/healthz', (req, res) => res.json({ ok: true }));

// Verificación SMTP rápida (no envía correo)
app.get('/api/smtp-verify', async (req, res) => {
  try {
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
    const smtpSecure = typeof process.env.SMTP_SECURE !== 'undefined'
      ? /^(1|true|yes)$/i.test(String(process.env.SMTP_SECURE))
      : smtpPort === 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.americanrentacar.ar',
      port: smtpPort,
      secure: smtpSecure,
      name: process.env.SMTP_NAME || 'americanrentacar.ar',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      requireTLS: !smtpSecure,
      tls: { rejectUnauthorized: false }
    });
    const ok = await transporter.verify().then(() => true).catch((err) => { throw err; });
    res.json({ ok, smtp: { host: transporter.options.host, port: transporter.options.port, secure: transporter.options.secure } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code, response: e.response, command: e.command });
  }
});

// Manejo básico de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Exportar app para LiteSpeed/Passenger
module.exports = app;

// Si se ejecuta directamente (no bajo Passenger), levantar servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
}
