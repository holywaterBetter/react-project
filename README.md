# Enterprise React Starter (Webpack + TypeScript + GitHub Pages)

Production-ready React starter that mirrors a typical enterprise React 18-era setup, while using **latest stable modern packages** (including React 19).

## Stack Summary

- **Core**: React 19, React DOM 19, TypeScript 6
- **UI**: MUI 7, Emotion 11, Tailwind CSS 4
- **Routing**: react-router-dom 7 (`HashRouter` for resilient GitHub Pages refresh behavior)
- **State**: Context API only
- **i18n**: i18next + react-i18next (English/Korean)
- **HTTP**: axios with request/response interceptor structure
- **Build/Dev**: Webpack 5, Babel 7, webpack-dev-server, React Refresh
- **Testing**: Jest 30 + React Testing Library
- **Quality**: ESLint 9 (flat config) + Prettier 3
- **CI/CD**: GitHub Actions workflow for PR validation + auto deploy on push to `main`

## Project Structure

```text
src/
  app/            # app entry composition and i18n bootstrap
  pages/          # route-level page components
  components/     # reusable UI components
  layouts/        # layout shells
  routes/         # router configuration
  contexts/       # Context API providers
  hooks/          # custom hooks
  services/       # shared service clients (axios, etc.)
  api/            # API modules by domain
  utils/          # utility helpers
  constants/      # env constants and app constants
  types/          # shared TypeScript types
  locales/        # i18n JSON resources
  styles/         # global styles + Tailwind entry
  assets/         # static assets
config/
  webpack.common.js
  webpack.dev.js
  webpack.prod.js
  env.js          # layered dotenv loader
```

## Setup

### Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm 10+

### Install

```bash
npm install
```

### Run (development)

```bash
npm start
```

### Build (production)

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint / Type-check / Format

```bash
npm run lint
npm run typecheck
npm run format
```

## Environment Variables

Environment files are loaded in this precedence order:

1. `.env.<mode>.local`
2. `.env.<mode>`
3. `.env.local`
4. `.env`

### Included examples

- `.env`
- `.env.development`
- `.env.production`

### Variables

- `APP_NAME`: shown in HTML title and app metadata
- `API_BASE_URL`: axios base URL
- `APP_BASE_PATH`: webpack `publicPath` and deployment base path (default `/`)

## Architecture Notes

- **Context API** is intentionally lightweight (`AppThemeContext`) to mirror enterprise starter scope without over-engineering.
- **Axios** setup includes centralized request/response interceptors for future token injection and error normalization.
- **Routing** uses `createHashRouter` to avoid GitHub Pages refresh 404 issues out of the box.
- **Webpack** is split into common/dev/prod for maintainability and practical enterprise extension.

## GitHub Actions & GitHub Pages

Workflow file: `.github/workflows/ci-cd-pages.yml`

### Trigger behavior

- **Pull Request targeting `main`**
  - Install dependencies
  - Run lint
  - Run tests
  - Run production build
  - **No deploy**
- **Push to `main`**
  - Install dependencies
  - Run lint
  - Run tests
  - Run production build
  - Upload artifact + deploy to GitHub Pages

### Required repository settings

In GitHub repository settings:

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**

### Base path / repository rename changes

Builds in Actions automatically set:

```bash
APP_BASE_PATH=/<repository-name>/
```

If repository name changes, workflow remains valid because it derives from `${{ github.event.repository.name }}` dynamically.

For local production simulation, update `.env.production`:

```env
APP_BASE_PATH=/your-new-repo-name/
```

## Compatibility Notes (React 19 + latest ecosystem)

- Chosen packages are modern versions compatible with React 19.
- Router is `react-router-dom` 7, which differs from many React 18-era codebases but is the current stable line.
- Tailwind CSS 4 is used via `@tailwindcss/postcss` plugin.
- No outdated package is pinned unless required by tooling compatibility.

## Scripts

- `npm start` - start webpack dev server
- `npm run build` - production build to `dist`
- `npm test` - Jest test suite with coverage
- `npm run lint` - ESLint checks
- `npm run lint:fix` - auto-fix lint issues
- `npm run typecheck` - TypeScript validation (no emit)
- `npm run format` - format via Prettier
- `npm run build:analyze` - production build with analyzer flag hook

