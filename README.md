## Backend API base

- Production: configured via `.env.production` with `VITE_API_BASE=https://americanrentacar.ar/api`.
- Development: Vite dev server proxies `/backend` to the remote `/api` on `americanrentacar.ar` per `vite.config.js`. The app tries `VITE_API_BASE` first, then `/api`, then `/backend` as fallback.

Endpoints used:
- `GET /healthz` for health checks
- `POST /send-reserva` for sending the reservation

## Email templates and sending

- The frontend loads HTML templates from `public/email_templates` and can include the filled HTML in the POST body as `htmlCliente` and `htmlAdmin`.
- The backend prefers these request-provided HTML strings. If they are not provided, it fetches the templates from a public URL.
- To make the backend fetch your own hosted templates (the ones built from `public/email_templates`), set the environment variable `FRONTEND_BASE` to the origin where the widget is hosted. Example:
	- `FRONTEND_BASE=https://widget.americanrentacar.ar`
- Mail-related environment variables:
	- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
	- `ADMIN_EMAIL` (defaults to `admin@americanrentacar.ar`)
	- `MAIL_FROM_NAME` (defaults to `American Rent a Car`)
	- `MAIL_FROM` (defaults to `ADMIN_EMAIL`)

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


ssh -p 21098 isrammek@66.29.146.38

source /home/isrammek/nodevenv/public_html/api/18/bin/activate && cd /home/isrammek/public_html/api

## Admin WhatsApp notification (Twilio)

Optionally send a WhatsApp message to the admin after a reservation is received. Configure these environment variables in your API host:

- `TWILIO_ACCOUNT_SID` – Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` – Your Twilio Auth Token
- `TWILIO_WHATSAPP_FROM` – Your WhatsApp sender. Use your approved number or the sandbox: `whatsapp:+14155238886`
- `ADMIN_WHATSAPP` (or `WA_ADMIN`) – Destination admin number in international format, e.g. `+5491123456789`

Behavior:
- If the above variables are set, after sending emails the server will send a concise WhatsApp summary to the admin.
- If not set, WhatsApp is skipped gracefully.

Notes:
- For the sandbox, make sure the admin number has joined the sandbox in Twilio.
- We also include a clickable link to open a chat with the customer when a phone is provided.