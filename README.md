## Backend API base

- Production: configured via `.env.production` with `VITE_API_BASE=https://isracarent.com/api`.
- Development: Vite dev server proxies `/backend` to the remote `/api` per `vite.config.js`. The app tries `VITE_API_BASE` first, then `/api`, then `/backend` as fallback.

Endpoints used:
- `GET /healthz` for health checks
- `POST /send-reserva` for sending the reservation

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


ssh -p 21098 isrammek@66.29.146.38

source /home/isrammek/nodevenv/public_html/api/18/bin/activate && cd /home/isrammek/public_html/api