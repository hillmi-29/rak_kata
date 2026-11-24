# Rak Kata — Indonesian Bookstore E-Commerce

A complete full-stack Indonesian bookstore with Express/MySQL backend and Next.js 16 frontend. Features mobile-first responsive design, editorial styling, and smooth animations.

## Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Express 5, Prisma ORM, MySQL (XAMPP), JWT auth, Xendit payments |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 3.4, TypeScript |
| **Animations** | GSAP, Motion (Framer Motion), Lenis smooth scroll |
| **Testing** | Vitest (unit), Playwright (visual regression) |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--cherry` | `#B3173B` | Primary actions, accents |
| `--navy` | `#14213D` | Headings, nav, footer |
| `--paper` | `#FAF6EF` | Page background |
| `--ink` | `#1B1B1F` | Body text |
| `--line` | `#E6DFD3` | Borders, dividers |

Typography: **Source Sans 3** (UI) + **Playfair Display** (editorial headings) + **Dancing Script** (handwritten accents).

## Features

### Customer-Facing
- 🏠 Home: 3D animated bookshelf hero, category strip, bestsellers, new releases
- 📚 Catalog (`/books`): Filter sidebar/drawer, price/author/stock filters, sort, grid/3D shelf toggle, pagination, quick-view drawer
- 📖 Book Detail (`/book/[slug]`): Cover tilt animation, tabs (Deskripsi/Detail/Ulasan), rating distribution, similar books shelf, sticky mobile add-to-cart
- 🛒 Cart (`/cart`): Item list with stepper, stock warnings, guest banner, sticky summary — **mobile card layout**
- 💳 Checkout (`/checkout`): Address CRUD + modal, live shipping rates (JNE/SiCepat/J&T), Xendit payment groups (VA/QRIS/E-Wallet/CVS), coupon, notes — **mobile-optimized**
- 📦 Orders (`/orders/:id`): Timeline, countdown, tracking, cancel modal
- 👤 Account: Profile, password change, order history (status tabs + pagination), favorites grid, addresses CRUD
- 🔐 Auth: Login, Register (strength meter), Forgot/Reset password

### Admin (`/admin`)
- 📊 Dashboard: KPIs, revenue chart, top books, category donut, low-stock alerts, recent orders
- 📚 Books: Searchable table, CSV import/export, drawer form with live spine preview
- 📦 Orders: Filterable table, detail drawer, ship modal (courier + resi + email notification)

### Mobile Responsiveness
- All drawers/modals → full-screen slide-up on mobile (`mobileFullScreen` prop)
- Cart: stacked cards on mobile, table on desktop
- Checkout: address cards & payment groups stack on mobile
- Header: collapsible mobile menu with search

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8+ (XAMPP on port 3306)
- npm/pnpm

### Backend (port 3000)
```bash
cd C:\xampp\htdocs\jualanbuku
cp .env.example .env   # edit DATABASE_URL, JWT_SECRET, XENDIT_KEY, SMTP
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Frontend (port 3001)
```bash
cd C:\xampp\htdocs\jualanbuku\frontend
npm install
npm run dev
```

Open http://localhost:3001 (frontend proxies API to http://localhost:3000).

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tokobuku.com` | `password123` |
| Buyer | `budi@gmail.com` | `password123` |

## Project Structure

```
jualanbuku/
├── src/                    # Express backend
│   ├── controllers/        # Route handlers
│   ├── services/           # Business logic
│   ├── routes/             # Express routers
│   ├── middleware/         # Auth, validation, rate-limit
│   ├── validators/         # Zod schemas
│   ├── utils/              # JWT, helpers
│   ├── config/             # DB, Prisma
│   ├── app.ts              # Express app setup
│   └── server.ts           # Entry point
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── seed.ts             # 26 books, 6 categories, 8 users
├── frontend/               # Next.js 16 app
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   │   ├── (routes)/   # Public pages
│   │   │   ├── account/    # Protected user pages
│   │   │   ├── admin/      # Protected admin pages
│   │   │   └── api/        # (none - separate backend)
│   │   ├── components/     # React components
│   │   │   ├── books/      # BookCard, BookCover, Bookshelf, Spine
│   │   │   ├── home/       # HeroShelf, CategoryStrip, etc.
│   │   │   ├── layout/     # Header, Footer, SiteChrome, AccountLayout, AdminLayout
│   │   │   └── ui/         # Modal, Drawer, Rating, Pagination, etc.
│   │   ├── lib/            # API client, contexts, utils, types
│   │   ├── app/globals.css # Design tokens, responsive utilities
│   │   └── middleware.ts   # (none - cookie-based auth)
│   ├── playwright.config.ts
│   └── tests/visual.spec.ts
├── tests/                  # Backend integration tests (Vitest)
├── .github/workflows/      # CI, DAST, dependency updates
├── docker-compose.yml      # Dev stack
├── docker-compose.prod.yml # Production stack
└── nginx.conf              # Reverse proxy config
```

## Key Environment Variables

```env
# Backend (.env)
DATABASE_URL="mysql://root:@localhost:3306/bookstore"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
XENDIT_SECRET_KEY="xnd_development_..."
XENDIT_PUBLIC_KEY="xnd_public_development_..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Rak Kata <noreply@rakkata.com>"
FRONTEND_URL="http://localhost:3001"
RATE_LIMIT_MAX=2000
RATE_LIMIT_WINDOW_MS=900000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

## Scripts

```bash
# Backend (root)
npm run dev          # Start with tsx watch
npm run build        # Compile to dist/
npm run start        # Run compiled dist
npm run seed         # Seed database
npm run test         # Vitest integration tests
npm run lint         # ESLint

# Frontend (frontend/)
npm run dev          # Next.js dev (Turbopack)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test:visual  # Playwright visual regression
```

## API Endpoints

| Area | Base Path |
|------|-----------|
| Auth | `/api/v1/auth` |
| Books | `/api/v1/books` |
| Categories | `/api/v1/categories` |
| Cart | `/api/v1/cart` |
| Checkout/Orders | `/api/v1/checkout`, `/api/v1/orders` |
| Addresses | `/api/v1/addresses` |
| Shipping | `/api/v1/shipping` |
| Reviews | `/api/v1/reviews` |
| Coupons | `/api/v1/coupons` |
| User | `/api/v1/user` |
| Admin | `/api/v1/admin` |
| Xendit Webhook | `/api/v1/xendit/webhook` |

## Deployment

### Docker (Recommended)
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Manual
1. Build backend: `npm run build` → `node dist/server.js`
2. Build frontend: `cd frontend && npm run build && npm run start`
3. Configure nginx reverse proxy (see `nginx.conf`)
4. Set production env vars, enable HTTPS

## License

MIT — feel free to use for learning or commercial projects.

---

**Rak Kata** — *Membeli buku adalah cara paling murah untuk bepergian jauh.*