import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

class RentacarWidget extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
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
      /* Provide widget-level CSS variables */
      --wr-radius: 14px; --wr-gap: 0.7rem; --wr-gap-sm: 0.5rem; --wr-pad: 1rem; --wr-pad-sm: 0.6rem;
      --wr-font: 15px; --wr-font-sm: 14px; --wr-muted: #6b7280; --wr-fg: #222; --wr-bg: #fff; --wr-surface: #f5f6f8;
      --wr-brand: #2ecc71; --wr-heading: #2e2a6e; --wr-accent: #6b5cff;
    }
    /* Prevent host style bleed and keep predictable box sizing */
    :host *, :host *::before, :host *::after { box-sizing: border-box; font-family: inherit; }
    :host a { color: inherit; text-decoration: none; }
    :host h1, :host h2, :host h3, :host h4, :host p { margin: 0; }
    /* Form controls use widget font */
    :host button, :host input, :host select, :host textarea { font: inherit; color: inherit; }
  `;
  this.shadow.appendChild(base);
  // Inyecta los estilos en el Shadow DOM mediante @import (sin fetch/CORS)
  // Esto asegura que el CSS se cargue incluso embebido en otros dominios.
  const cssUrl = new URL('widget.css', import.meta.url).toString();
  const style = document.createElement('style');
  style.textContent = `@import url("${cssUrl}");`;
  this.shadow.appendChild(style);
    // Crea el mount point para React
    const mountPoint = document.createElement("div");
    mountPoint.id = 'wr';
    this.shadow.appendChild(mountPoint);
    ReactDOM.createRoot(mountPoint).render(<App />);
  }
}

customElements.define("rentacar-widget", RentacarWidget);
