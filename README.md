# Stackwell Agency Platform

A full-stack MERN website for a software agency: a marketing site that turns visitors into leads, and an admin dashboard for managing those leads and the site's content.

> **Status:** under active development. Phase 1 (foundation) is complete. See [Roadmap](#roadmap).

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, TanStack Query, Axios, React Hook Form + Zod, Framer Motion, react-helmet-async, lucide-react |
| Backend | Node.js (ESM), Express 5, Mongoose, Zod, helmet, cors, morgan |
| Database | MongoDB Atlas |

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- A **MongoDB** database. A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster works.

## Getting started

```bash
# 1. Install dependencies for both apps (npm workspaces)
npm install

# 2. Configure the server
cp server/.env.example server/.env
#    then edit server/.env: set MONGO_URI and generate the two JWT secrets with
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Add demo content (services, projects, FAQs...) and your admin account
npm run seed
#    for the admin: set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env, then
npm run seed:admin

# 4. Run the client and the API together
npm run dev
```

- Client: http://localhost:5173
- API health check: http://localhost:5000/api/v1/health

The client's `client/.env.example` is optional. Copy it to `client/.env` only if the API runs somewhere other than `http://localhost:5000/api/v1`.

## Environment variables

Server (`server/.env`), validated with Zod at startup. The server refuses to start if a required value is missing or invalid.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | no | `development` | `development`, `production` or `test` |
| `PORT` | no | `5000` | Port the API listens on |
| `CLIENT_URL` | yes | | Origin of the React app, used for the CORS allowlist |
| `MONGO_URI` | yes | | MongoDB connection string (contains credentials, never commit it). Include a database name, e.g. `.../stackwell?...` |
| `JWT_ACCESS_SECRET` | yes | | Signs short-lived access tokens (min 32 characters) |
| `JWT_ACCESS_EXPIRES_IN` | no | `15m` | Access token lifetime |
| `JWT_REFRESH_SECRET` | yes | | Signs refresh tokens (min 32 characters, different from the access secret) |
| `JWT_REFRESH_EXPIRES_DAYS` | no | `7` | Refresh token lifetime in days |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | yes | | File storage ([free Cloudinary account](https://cloudinary.com)). Quote attachments are stored privately and opened only through short-lived signed links. The secret is a password, never commit it |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no | | Only read by `npm run seed:admin`. Remove the password afterwards |

Client (`client/.env`): `VITE_API_URL`, the API base URL. Variables prefixed `VITE_` are public; never put secrets in them.

## Scripts

Run from the project root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the client (Vite) and the server (`node --watch`) together |
| `npm run build` | Builds the client for production into `client/dist` |
| `npm start` | Starts the server without file watching (production) |
| `npm run lint` | Lints the client |
| `npm run seed` | Adds demo content that is missing. Safe to run again: existing content is never overwritten |
| `npm run seed -- --reset --yes` | Deletes all site content, then re-adds the demo content. Users, inquiries and quote requests are never touched |
| `npm run seed:admin` | Creates the first admin account from the `ADMIN_*` values in `server/.env` |

All demo content is fictional: the company, clients, people and numbers were invented for this portfolio project.

## Project structure

```
agency-website/
├─ client/                 React app
│  └─ src/
│     ├─ app/              router and providers
│     ├─ components/
│     │  ├─ ui/            Button, Input, Card, Modal, Toast, ...
│     │  ├─ layout/        Container, Section, SectionHeading, PageHeader
│     │  ├─ sections/      page sections (Phase 3)
│     │  ├─ forms/         ContactForm, QuoteWizard (Phase 4)
│     │  └─ admin/         dashboard components (Phase 5)
│     ├─ context/          React contexts (toasts; auth in Phase 2)
│     ├─ features/         API hooks per domain
│     ├─ hooks/            shared hooks
│     ├─ lib/              axios instance, query client, utilities
│     └─ pages/            public/ and admin/ route components
├─ server/                 Express API
│  └─ src/
│     ├─ config/           env.js (Zod-validated), db.js
│     ├─ middleware/       error handling (auth, validation in Phase 2)
│     ├─ utils/            AppError, asyncHandler
│     ├─ app.js            Express app: middleware and routes
│     └─ server.js         connects to MongoDB, then starts listening
└─ package.json            npm workspaces and root scripts
```

## Architecture notes

- **Monorepo with npm workspaces:** one install, one lockfile; the client and API still deploy separately.
- **API conventions:** all routes live under `/api/v1`. Every response has the shape `{ success, data, meta? }` or `{ success: false, error: { message } }`, produced by one central error handler.
- **Configuration:** the server reads settings only through the validated `env` object in `server/src/config/env.js`.
- **Design system:** colors, type scale, radii and shadows are Tailwind tokens defined once in `client/src/index.css`.
- **Accessibility:** the UI kit uses native elements where possible (`<dialog>`, `<button>`), visible focus rings, ARIA roles and `prefers-reduced-motion` support.

## Temporary preview pages

While the UI is built, two pages show the design system and components: `/design-preview` and `/layout-preview`. They will be removed before launch.

## Roadmap

- [x] **Phase 1: Foundation.** Monorepo, Express skeleton, env validation, MongoDB connection, error handling, security middleware, design system and UI kit.
- [ ] **Phase 2: Backend core.** Models, validators, public and admin CRUD, JWT auth with refresh tokens and roles, seed data.
- [ ] **Phase 3: Public site.** Navbar, footer, all public pages wired to the API, animations, SEO.
- [ ] **Phase 4: Lead capture.** Contact form, quote wizard, file uploads, email notifications.
- [ ] **Phase 5: Admin dashboard.** Lead pipeline, content management, image uploads, settings.
- [ ] **Phase 6: Polish and ship.** Accessibility, performance, sitemap, deployment.
