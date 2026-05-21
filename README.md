# PitWall — F1 Telemetry Dashboard

Lightweight telemetry and leaderboard dashboard inspired by professional Formula 1 pit-wall tools. The app pairs a Vite + React frontend with a small Express backend that provides REST endpoints and a WebSocket feed (mock data when no live session is available).

Key technologies: React, Vite, Tailwind CSS, Recharts, Express, WebSocket.

## Features

- Real-time snapshot broadcasts over WebSocket (server polls OpenF1 or falls back to mock data)
- REST endpoints for on-demand data (`/api/*`)
- Telemetry visualizations, leaderboards, tire/strategy views, and componentized UI
- Small demo backend with Ergast schedule/standings and OpenF1 telemetry helpers

## Project structure

- `src/` — frontend React app and components (DriverCard, TelemetryChart, TrackMap, etc.)
- `server/` — backend: `index.js`, `openf1.js`, `ergast.js` (Express + WebSocket)
- `public/` — static assets

## Quick start

Prerequisites: Node.js (v16+ recommended) and npm.

Install dependencies:

```bash
npm install
```

Run the frontend dev server only:

```bash
npm run dev
```

Run the backend server only:

```bash
npm run server
```

Run both concurrently (frontend + backend):

```bash
npm run dev:full
```

## Notes

- The server polls OpenF1 every 4s; when no live session is present it serves a realistic mock snapshot.
- API keys are not required; all external calls are made server-side.

## Contributing

Contributions welcome — open an issue or PR. Keep changes focused and add small, testable commits.


