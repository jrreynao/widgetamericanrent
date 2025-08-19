
// Utilidad para cargar una plantilla HTML desde public/email_templates
export async function loadEmailTemplate(templateName, apiBase) {
  const bases = [
    apiBase ? `${apiBase.replace(/\/$/, '')}/email_templates` : null,
    (import.meta.env?.VITE_API_BASE ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, '')}/email_templates` : null),
    '/api/email_templates',
    '/email_templates'
  ].filter(Boolean);
  let lastErr = null;
  for (const base of bases) {
    try {
      const res = await fetch(`${base}/${templateName}`);
      if (res.ok) return await res.text();
      lastErr = new Error(`${res.status} ${res.statusText}`);
    } catch (e) { lastErr = e; }
  }
  console.warn('No se pudo cargar la plantilla', templateName, lastErr?.message);
  return "";
}

// Reemplaza las variables %var% en la plantilla HTML
export function fillTemplate(template, vars) {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/%([a-zA-Z0-9_]+)%/g, (match, key) => {
    return typeof vars[key] !== 'undefined' ? vars[key] : match;
  });
}
