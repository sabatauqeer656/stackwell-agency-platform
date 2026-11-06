# Stackwell Agency Platform

A full-stack MERN website for a (fictional) software agency: a marketing site that turns visitors into leads, and an admin dashboard for managing those leads and the site's content.

> **Status:** the REST API and the whole public site are finished (Phases 1 to 4). The admin dashboard is next. See the [Roadmap](#roadmap).
> The agency, clients, team and figures are invented for this portfolio project.

## What it does

**Public site**
- Home, Services, Solutions (industries), Projects (case studies with an industry filter and pagination), About (with the team), FAQ and Contact pages, all loaded from the API.
- A **contact form** and a **four-step quote wizard** with per-step validation, saved drafts, `?service=` pre-selection and **file attachments** (PDF, PNG, JPG, DOCX).
- Per-page SEO: titles, descriptions, canonical URLs, Open Graph tags, structured data (JSON-LD), `robots.txt`.
- Accessible by design: skip link, landmarks, keyboard-operable controls, focus management on page changes, screen-reader announcements, `prefers-reduced-motion` support.

**API and lead handling**
- JWT authentication with short-lived access tokens, a rotating refresh token in an `httpOnly` cookie, and `admin` / `editor` roles.
- CRUD for services, solutions, projects, testimonials, team members, FAQs and site settings, each with a public (published only) and an admin side.
- Inquiries and quote requests with a status pipeline, spam protection (rate limit, honeypot, strict validation), **private file storage** with short-lived signed download links, and **email notifications** to the team plus a confirmation to the visitor.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, TanStack Query, Axios, React Hook Form + Zod, Framer Motion, react-helmet-async, lucide-react |
| Backend | Node.js (ESM), Express 5, Mongoose, Zod, JWT, bcrypt, helmet, cors, express-rate-limit, multer, file-type, Nodemailer, morgan |
| Services | MongoDB Atlas (database), Cloudinary (private file storage), SMTP (email, optional) |

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- A **MongoDB** database. A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster works.
- A free [Cloudinary](https://cloudinary.com) account (quote attachments).

## Getting started

```bash
# 1. Install dependencies for both apps (npm workspaces)
npm install

# 2. Configure the server
cp server/.env.example server/.env
#    then edit server/.env: set MONGO_URI, the three CLOUDINARY_* values, and generate the two JWT secrets with
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
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | yes | | File storage. Quote attachments are stored privately and opened only through short-lived signed links. The secret is a password, never commit it |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | no | | Enables real email (set all four or none). Without them, notification emails are composed and logged instead of sent. For Gmail use an [App Password](https://myaccount.google.com/apppasswords) |
| `SMTP_PORT` | no | `465` | `465` (SSL) or `587` (STARTTLS) |
| `MAIL_TO` | no | `SMTP_USER` | Inbox that receives "new message" and "new quote request" alerts |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no | | Only read by `npm run seed:admin`. Remove the password afterwards |

Client (`client/.env`): `VITE_API_URL` is the API base URL, and `VITE_SITE_URL` (optional) is the deployed address used for canonical links. Variables prefixed `VITE_` are public; never put secrets in them.

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

## API overview

Base path `/api/v1`. Every response is `{ success, data, meta? }` or `{ success: false, error: { message, code, details? } }`.

| Area | Public | Admin or editor (delete: admin only) |
| --- | --- | --- |
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` (needs a token) | |
| Services, Solutions | `GET /services`, `/services/:slug`, `/solutions`, `/solutions/:slug` | `/admin/services`, `/admin/solutions`: list, get, create, update, delete |
| Projects | `GET /projects` (`?industry=`, `?featured=`, `?page=`, `?limit=`), `/projects/:slug` | `/admin/projects` |
| Testimonials, Team, FAQs | `GET /testimonials`, `/team`, `/faqs` (`?category=`) | `/admin/testimonials`, `/admin/team`, `/admin/faqs` |
| Settings | `GET /settings` | `PATCH /admin/settings` (admin only) |
| Inquiries | `POST /inquiries` | `/admin/inquiries`: list, get, update status and notes, delete |
| Quote requests | `POST /quotes` (JSON, or `multipart/form-data` with up to 3 attachments) | `/admin/quotes`: list, get, update status and notes, delete, `GET /admin/quotes/:id/attachments/:index/download` (signed link, 5 minutes) |

## Security highlights

- Passwords hashed with bcrypt (cost 12). Login errors are generic and take the same time whether or not the email exists.
- Access token in memory, refresh token in an `httpOnly` cookie. A `tokenVersion` lets a logout revoke every token of a user at once.
- Every input is validated with Zod on the server (unknown fields are dropped), and every route group is guarded in one place.
- Public form endpoints are rate limited and have a honeypot field. Quote attachments are checked by their **actual content** (not their name), stored **privately**, and only reachable through expiring signed links.
- Emails are protected against header injection and HTML injection, and the visitor confirmation never repeats visitor-supplied text.
- Secrets live only in `server/.env` (git-ignored) and are validated at startup. `helmet` sets security headers and CORS allows only the client origin.

## Project structure

```
agency-website/
├─ client/                 React app
│  ├─ public/              favicon, robots.txt
│  └─ src/
│     ├─ app/              router (lazy-loaded pages) and providers
│     ├─ components/
│     │  ├─ ui/            Button, Input, Card, Modal, Toast, QueryState, ...
│     │  ├─ layout/        Navbar, Footer, PublicLayout, Section, PageHeader, ...
│     │  ├─ sections/      page sections (Hero, ServicesSection, ProjectCard, ...)
│     │  └─ forms/         ContactForm, QuoteWizard, FileDropzone, step screens
│     ├─ features/         data hooks and form rules per domain (services, quotes, ...)
│     ├─ lib/              axios instance, query client, API error helpers
│     └─ pages/public/     route components (admin pages arrive in Phase 5)
├─ server/                 Express API
│  └─ src/
│     ├─ config/           env.js (Zod-validated), db.js, cloudinary.js
│     ├─ models/           Mongoose models
│     ├─ routes/           public routes, and routes/admin/ (guarded as a group)
│     ├─ controllers/      thin request handlers
│     ├─ services/         business logic, storage, email, notifications
│     ├─ middleware/       auth, validation, uploads, rate limits, honeypot, errors
│     ├─ validators/       Zod schemas
│     ├─ seed/             demo content and admin creation
│     ├─ app.js            Express app: middleware and routes
│     └─ server.js         connects to MongoDB, then starts listening
└─ package.json            npm workspaces and root scripts
```

## Architecture notes

- **Monorepo with npm workspaces:** one install, one lockfile; the client and API still deploy separately.
- **Layers on the server:** route, validate, controller, service, model. Controllers stay thin and the logic lives in services.
- **Configuration:** the server reads settings only through the validated `env` object in `server/src/config/env.js`.
- **Server state on the client:** TanStack Query for everything that comes from the API (loading, error, empty and success states are handled in one shared component). Filters and pages live in the URL, so views are shareable.
- **Design system:** colors, type scale, radii and shadows are Tailwind tokens defined once in `client/src/index.css`.
- **Performance:** every page except the home page is code-split and downloaded on demand; the animation engine loads after first paint.

## Testing

The API and the public site were verified end to end during development with real-browser and real-service checks (including uploads to Cloudinary and the email composition). A committed automated test suite is planned for Phase 6.

## Temporary preview pages

While the UI is built, two pages show the design system and components: `/design-preview` and `/layout-preview`. They will be removed before launch.

## Roadmap

- [x] **Phase 1: Foundation.** Monorepo, Express skeleton, env validation, MongoDB connection, error handling, security middleware, design system and UI kit.
- [x] **Phase 2: Backend core.** Models, validators, public and admin CRUD, JWT auth with refresh tokens and roles, seed data.
- [x] **Phase 3: Public site.** Navbar, footer, all public pages wired to the API, animations, SEO, code splitting.
- [x] **Phase 4: Lead capture.** Contact form, quote wizard, file uploads, email notifications.
- [ ] **Phase 5: Admin dashboard.** Login, lead pipeline, content management, image uploads, settings.
- [ ] **Phase 6: Polish and ship.** Accessibility audit, tests, sitemap, deployment, screenshots.
