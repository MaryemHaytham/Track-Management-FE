# Takwene UI

Angular frontend for the Takwene Track Management API.

## Run

```bash
npm install
npm start
```

App: `http://localhost:4200`

API expected in local dev: `https://localhost:7139/api` (configured in `src/environments/environment.ts`)

Production API base URL is configured in `src/environments/environment.prod.ts`.

## Features

- Track list with status filter
- Track detail with DSP distribution statuses

Full setup (API + JWT + migrations): see the root [README.md](../../README.md) and [DECISIONS.md](../../DECISIONS.md).
