import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

class RentacarWidget extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  this._btnObserver = null;
  }
  async connectedCallback() {
  // Base host styles: transparent and auto-size + light anti-inheritance for widget subtree
  const base = document.createElement('style');
  base.textContent = `
    /* Widget shadow root base styles */
    :host{
      display:block; overflow:visible; background:transparent;
      /* Lock widget typography to avoid WordPress inheritance */
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif;
      font-size: 16px; line-height: 1.45; color: #222;
      /* Some WP themes set -webkit-text-fill-color globally; reset here so our colors apply */
      -webkit-text-fill-color: #222;
      /* Provide widget-level CSS variables */
  --wr-radius: 14px; --wr-gap: 0.7rem; --wr-gap-sm: 0.5rem; --wr-pad: 1rem; --wr-pad-sm: 0.6rem;
  --wr-font: 15px; --wr-font-sm: 14px; --wr-muted: #6b7280; --wr-fg: #222; --wr-bg: #fff; --wr-surface: #f5f6f8;
  /* American Rent a Car brand */
  --wr-brand: #0b3d91; /* primary navy */
  --wr-heading: #0b3d91; /* headings in brand navy */
  --wr-accent: #e31e24; /* accent red */
  /* helpers for subtle shadows/highlights */
  --wr-brand-06a: #0b3d910f; /* ~6% alpha */
  --wr-brand-12a: #0b3d9120; /* ~12% alpha */
    }
    /* Prevent host style bleed and keep predictable box sizing */
    :host *, :host *::before, :host *::after { box-sizing: border-box; font-family: inherit; }
    :host a { color: inherit; text-decoration: none; }
    :host h1, :host h2, :host h3, :host h4, :host p { margin: 0; }
    /* Form controls use widget font; avoid inheriting external text-fill hacks */
    :host button, :host input, :host select, :host textarea { font: inherit; }
    :host button { -webkit-text-fill-color: inherit; }
  `;
  this.shadow.appendChild(base);
  // Inyecta los estilos en el Shadow DOM mediante @import (sin fetch/CORS)
  // Esto asegura que el CSS se cargue incluso embebido en otros dominios.
  const cssUrl = new URL('widget.css', import.meta.url).toString();
  const style = document.createElement('style');
  style.textContent = `@import url("${cssUrl}");`;
  this.shadow.appendChild(style);
  // Final override: ensure primary buttons render white text regardless of host theme hacks
  const finalGuard = document.createElement('style');
  finalGuard.textContent = `
    :host .wr-btn--primary, :host .wr-btn--primary *,
    :host .step-fechas-btn, :host .step-fechas-btn * {
      color: #fff !important;
      -webkit-text-fill-color: #fff !important;
      mix-blend-mode: normal !important;
      filter: none !important;
    }
    :host .wr-btn--primary svg, :host .wr-btn--primary svg *,
    :host .step-fechas-btn svg, :host .step-fechas-btn svg * {
      fill: #fff !important; stroke: #fff !important;
    }
  `;
  this.shadow.appendChild(finalGuard);
    // Crea el mount point para React
    const mountPoint = document.createElement("div");
    mountPoint.id = 'wr';
    this.shadow.appendChild(mountPoint);
    ReactDOM.createRoot(mountPoint).render(<App />);

    // Runtime guard: ensure any primary button text stays white even if host injects styles
    const enforcePrimaryWhite = () => {
      const nodes = this.shadow.querySelectorAll('.wr-btn--primary, .step-fechas-btn');
      nodes.forEach(btn => {
        try {
          btn.style.setProperty('color', '#fff', 'important');
          btn.style.setProperty('-webkit-text-fill-color', '#fff', 'important');
          btn.style.setProperty('mix-blend-mode', 'normal', 'important');
          btn.style.setProperty('filter', 'none', 'important');
        } catch (_) { /* ignore */ }
      });
    };
    enforcePrimaryWhite();
    this._btnObserver = new MutationObserver(() => enforcePrimaryWhite());
    this._btnObserver.observe(this.shadow, { childList: true, subtree: true, attributes: true });
  }
  disconnectedCallback() {
    if (this._btnObserver) {
      this._btnObserver.disconnect();
      this._btnObserver = null;
    }
  }
}

customElements.define("rentacar-widget", RentacarWidget);
