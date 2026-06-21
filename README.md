# Unowned — All In

Built with React + TypeScript + Vite.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (see the "Environment Variables" section)
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

---

## Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Development server with HMR           |
| `npm run build`   | Production build output to `dist/`    |
| `npm run preview` | Local preview of the production build |
| `npm run lint`    | Run ESLint checks                     |

---

## Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Backend URL without a trailing slash
VITE_API_URL=https://api.example.com

# Base path (required if the application is deployed to a subdirectory)
# VITE_BASE_URL=/app
```

> In production, values should be provided through CI/CD pipelines or your hosting platform.

---

## Technologies

* **React 18** + **TypeScript** (strict mode)
* **Vite** — build tool and development server
* **Tailwind CSS v4** — styling
* **React Router v7** — routing
* **TanStack React Query** — server state management and caching
* **Zustand** — client state management (auth, multi-account)
* **shadcn/ui** + **Radix UI** — UI components
* **react-helmet-async** — `<head>` management
* **Sonner** — toast notifications

---

## Architecture

The project is organized into feature-based modules. Detailed information about the structure, patterns, and conventions can be found in [`AGENTS.md`](./AGENTS.md).

```text
src/
├── auth/          # Authentication (store, actions, pages)
├── me/            # Current user profile, stories, settings
├── profile/       # Viewing other users' profiles
├── layouts/       # TopBar, Sidebar, layout wrappers
├── routing/       # Top-level routing
├── provider/      # React providers (account, settings, i18n, stories)
├── context/       # React Context (types + createContext only)
├── hooks/         # Context wrapper hooks
├── lib/           # Utilities: ApiClient, QueryClient, user-preferences
├── i18n/          # Dictionaries (EN, RU, UA, IT, ES, FR, DE)
└── components/    # UI components (ui/ = shadcn, common/ = project-specific)
```

---

## Production Deployment

### Build

```bash
npm run build
# Build artifacts will be generated in ./dist/
```

### CI/CD Variables

```env
VITE_API_URL=https://api.yourdomain.com
VITE_BASE_URL=/
NODE_ENV=production
```

### Nginx (SPA)

```nginx
server {
    listen 80;
    root /var/www/unowned/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Development

Before making any changes, read [`AGENTS.md`](./AGENTS.md). It contains project conventions, architectural patterns, and known technical debt.

### Adding a New Page

1. Create a component in `src/<feature>/pages/`
2. Add a `<Route>` to `src/routing/app-routing-setup.tsx`
3. If a navigation item is required, update `ALL_NAV_ITEMS` in `src/context/settings-context.ts`

### Adding a Translation

Add the translation key to all 7 files:

```text
src/i18n/{en,ru,ua,it,es,fr,de}.ts
```

### Working with the API

Use only `apiClient` from `src/lib/api-client.ts`.

Direct `fetch()` calls are prohibited.
