# NOVA — Modern Tech Store

> Technology, refined.

A full-stack e-commerce store for technology products (laptops, headphones, keyboards, mice, monitors, accessories).

## Tech Stack

**Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, TanStack Query
**Backend:** Node.js, Express 5, TypeScript, Zod
**Database:** MongoDB, Mongoose
**Auth:** JWT (short-lived access token + httpOnly refresh-token cookie)

## Features

- **Storefront** — home page, category browsing, search, brand/price/stock filters, sorting, pagination
- **Product pages** — specs, stock status, related products
- **Cart** — persisted in `localStorage`, synced across tabs, stock-aware quantities
- **Checkout** — shipping address, cash on delivery or simulated card payment; the server re-prices every order and reserves stock atomically
- **Accounts** — register, sign in, persistent sessions, profile and password update, order history, cancel pending orders
- **Admin dashboard** — revenue and order stats, low-stock alerts, product CRUD, order status management (cancelling restocks items)

## Getting Started

**Requirements:** Node.js 20.9+

```bash
npm install
cp server/.env.example server/.env   # already present for local dev
npm run dev
```

- Storefront: http://localhost:3000
- API: http://localhost:4000/api

With `MONGODB_URI` left empty, the API starts an **in-memory MongoDB** and seeds it automatically, so no database install is needed. Data resets on every restart. The first run downloads a MongoDB binary (about 800 MB, cached afterwards).

To keep your data, set `MONGODB_URI` in `server/.env` (local MongoDB or Atlas), then load the sample data:

```bash
npm run seed
```

### Demo accounts

| Role     | Email             | Password      |
| -------- | ----------------- | ------------- |
| Admin    | admin@nova.dev    | Admin@12345   |
| Customer | customer@nova.dev | Customer@123  |

## Scripts (run from the repo root)

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the API and web app in watch mode       |
| `npm run build`     | Production build of both apps                 |
| `npm start`         | Run the production builds                     |
| `npm run typecheck` | Type-check both apps                          |
| `npm run lint`      | Lint the client                               |
| `npm run seed`      | Reset and seed the database in `MONGODB_URI`  |

## Project Structure

```
nova/
├── client/                 # Next.js frontend
│   └── src/
│       ├── app/            # Routes: /, /products, /products/[slug], /cart, /checkout,
│       │                   #         /login, /register, /account, /orders/[id], /admin/*
│       ├── components/     # UI components
│       └── lib/            # API client, auth, cart store, types, formatting
└── server/                 # Express API
    └── src/
        ├── config/         # env, database, pricing
        ├── controllers/    # auth, products, orders
        ├── middleware/     # auth guards, error handling
        ├── models/         # User, Product, Order
        ├── routes/         # route table
        ├── data/           # seed products
        └── scripts/        # seed script
```

The browser only talks to the Next.js app: `/api/*` is proxied to the Express server (`API_URL`, default `http://localhost:4000`), so the refresh-token cookie stays first-party.

## API Overview

| Method | Endpoint                    | Access   |
| ------ | --------------------------- | -------- |
| POST   | `/api/auth/register`        | Public   |
| POST   | `/api/auth/login`           | Public   |
| POST   | `/api/auth/refresh`         | Cookie   |
| POST   | `/api/auth/logout`          | Cookie   |
| GET    | `/api/auth/me`              | User     |
| PATCH  | `/api/auth/me`              | User     |
| GET    | `/api/products`             | Public   |
| GET    | `/api/products/facets`      | Public   |
| GET    | `/api/products/:slug`       | Public   |
| POST   | `/api/orders`               | User     |
| GET    | `/api/orders/mine`          | User     |
| GET    | `/api/orders/:id`           | Owner/Admin |
| POST   | `/api/orders/:id/cancel`    | Owner    |
| GET    | `/api/admin/stats`          | Admin    |
| POST   | `/api/admin/products`       | Admin    |
| GET/PATCH/DELETE | `/api/admin/products/:id` | Admin |
| GET    | `/api/admin/orders`         | Admin    |
| PATCH  | `/api/admin/orders/:id/status` | Admin |

`GET /api/products` accepts `q`, `category`, `brand` (comma-separated), `minPrice`, `maxPrice`, `inStock`, `featured`, `sort` (`newest`, `price-asc`, `price-desc`, `rating`, `name`), `page` and `limit`.

## Production Notes

- Set `NODE_ENV=production`, a real `MONGODB_URI`, and long random `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` values. The server refuses to start in production without them.
- Change the seeded admin password (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Card payment is simulated. Integrate a real payment provider (e.g. Stripe) before taking real orders.
