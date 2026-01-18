# Reyah Collective Project Documentation

## Overview
Reyah Collective is a Next.js-based e-commerce platform supporting customers, sellers, suppliers, and admin roles. The project uses localStorage for user/session data and provides dashboards and management features for each role.

---

## Table of Contents
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles & Flows](#user-roles--flows)
- [Admin Setup & Access](#admin-setup--access)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Customization & Extending](#customization--extending)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Run Locally
```bash
npm run dev
# or
yarn dev
```

### Build for Production
```bash
npm run build
npm start
```

---

## Project Structure
```
/reyah_collective
  ├── public/                # Static assets
  ├── src/
  │   ├── app/               # Next.js app routes (pages)
  │   ├── components/        # Reusable React components
  │   ├── context/           # React context (Auth, etc.)
  │   ├── types/             # TypeScript types
  │   └── utils/             # Utility functions
  ├── package.json
  ├── README.md
  └── ...
```

---

## User Roles & Flows

### Customer
- Sign up at `/signup` (choose "Customer")
- Browse, shop, manage account at `/account`

### Seller
- Sign up at `/signup` (choose "Seller")
- Complete seller application at `/seller-setup`
- Wait for admin approval (`/seller-pending`)
- Manage products/orders at `/seller`

### Supplier
- Sign up at `/signup` (choose "Supplier")
- Complete supplier application at `/supplier-setup`
- Wait for admin approval (`/supplier-pending`)
- Manage supplies at `/supplier`

### Admin
- Sign up at `/signup` (any role)
- Grant admin access at `/admin-setup` (enter email, click "Grant Admin Access")
- Login at `/login` and access `/admin` dashboard

---

## Admin Setup & Access
See `ADMIN_SETUP.md` for step-by-step admin setup instructions.

---

## Development
- Uses Next.js 16, React, Tailwind CSS
- State and user data stored in browser localStorage
- No backend/database by default (for demo/dev only)
- All authentication and role checks are client-side

### Key Files
- `src/context/AuthContext.tsx` — Auth logic, login/signup
- `src/app/signup/page.tsx` — Registration flow
- `src/app/admin-setup/page.tsx` — Grant admin rights
- `src/app/admin/*` — Admin dashboard and management
- `src/app/seller/*` — Seller dashboard and features
- `src/app/supplier/*` — Supplier dashboard and features

---

## Deployment
- Deploy as a static or serverless Next.js app (Vercel, Netlify, etc.)
- After deployment, repeat admin setup in the production environment
- All user data is per-browser (localStorage)

---

## Troubleshooting
- **Admin login fails after deploy:**
  - Register and grant admin access in the deployed environment
- **User data lost after redeploy:**
  - All data is in localStorage; repeat setup as needed
- **Want persistent data?**
  - Integrate a real backend/database for production use

---

## Customization & Extending
- To add new roles, update the signup and context logic
- To use a real backend, replace localStorage logic in `AuthContext` and related files
- For advanced features, see Next.js and React documentation

---

## Support
For questions or help, contact the development team or open an issue in the repository.
