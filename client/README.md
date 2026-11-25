# Watch Store client

## Development

Install dependencies and start Vite:

```sh
npm ci
npm run dev
```

By default, the client uses the hosted backend. To point it at another API, copy `.env.example` to `.env.local` and set:

```env
VITE_API_BASE_URL=http://localhost:5000
```

`VITE_API_BASE_URL` is a public client setting, not a place for secrets. Set it in the frontend hosting provider for production builds.

## Validation

```sh
npm run lint
npm run build
```
