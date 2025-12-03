# Reyah Collective

An e-commerce marketplace platform for authentic handmade Kenyan crafts, featuring multi-vendor support with sellers and suppliers.

## Features

### Marketplace System
Develop a marketplace system that allows multiple sellers and suppliers to register, manage their profiles, and list products for sale.

#### User Stories:
- **As a seller**, I want to register and manage my profile so I can list and sell products.
- **As a supplier**, I want to register and manage my profile so I can supply products to the marketplace.
- **As a buyer**, I want to view seller/supplier profiles and their products so I can choose who to buy from.
- **As an admin**, I want to approve or suspend sellers, suppliers, and products to maintain quality and trust.

#### Requirements:
✅ **Seller & Supplier Registration**
- Onboarding process with profile verification
- Admin approval system for sellers (`/admin/sellers`)
- Admin approval system for suppliers (`/admin/suppliers`)
- Status tracking: pending, approved, rejected

✅ **Seller Dashboard** (`/seller`)
- Product management (CRUD operations with image upload)
- Order tracking and management
- Sales analytics with revenue charts
- Top products performance
- Inventory overview
- Profile management

✅ **Supplier Dashboard** (`/supplier`)
- Product supply management
- Delivery tracking
- Supply analytics
- Revenue monitoring
- Inventory management

✅ **Seller & Supplier Profiles**
- Display seller name and business description
- Display supplier company name and type
- Product listings by seller/supplier
- Sales statistics

✅ **Buyer Features**
- View all products from a specific seller/supplier
- Search and filter products by category
- Shopping cart and checkout
- Order tracking
- Order history

✅ **Admin Tools** (`/admin`)
- Approve, reject, or remove sellers and suppliers
- Product management and moderation
- User management
- Order oversight
- Category management
- Dashboard with statistics

✅ **Analytics**
- Seller analytics for sales, revenue, and performance
- Supplier analytics for deliveries and supply metrics
- Time-range filtering (7, 30, 90, 365 days)
- Monthly revenue charts
- Top-selling products
- Inventory status tracking

✅ **Mobile-Friendly**
- Responsive design for all interfaces
- Optimized seller and buyer dashboards
- Touch-friendly navigation

### Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Context API with localStorage
- **Email:** Resend API
- **Storage:** localStorage (MVP - ready for backend migration)
- **Image Upload:** Base64 encoding (max 5MB)

### User Roles
1. **Regular Users** - Browse, shop, and purchase products
2. **Sellers** - Manage products, view orders, track sales (green badge 🏪)
3. **Suppliers** - Supply products, manage deliveries (indigo badge 🏭)
4. **Admins** - Manage entire platform (red badge 🔐)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard and management
│   │   ├── categories/     # Category management
│   │   ├── orders/         # Order management
│   │   ├── products/       # Product management
│   │   ├── sellers/        # Seller approval and management
│   │   ├── suppliers/      # Supplier approval and management
│   │   └── users/          # User management
│   ├── seller/             # Seller dashboard
│   │   ├── products/       # Seller product management
│   │   ├── orders/         # Seller order tracking
│   │   └── analytics/      # Seller analytics
│   ├── supplier/           # Supplier dashboard
│   │   ├── products/       # Supplier product management
│   │   ├── orders/         # Supplier delivery tracking
│   │   └── analytics/      # Supplier analytics
│   ├── account/            # User account and orders
│   ├── shop/               # Product catalog
│   ├── cart/               # Shopping cart
│   └── checkout/           # Checkout process
├── components/             # Reusable components
├── context/                # React Context (Auth, Cart)
└── utils/                  # Utility functions
```

## Key Features Implementation

### Seller Registration Flow
1. User signs up → `/signup`
2. Navigate to account dropdown → "Become a Seller"
3. Fill seller application → `/seller-setup`
4. Wait for admin approval → `/seller-pending`
5. Admin approves → `/admin/sellers`
6. Access seller dashboard → `/seller`

### Supplier Registration Flow
1. User signs up → `/signup`
2. Navigate to account dropdown → "Become a Supplier"
3. Fill supplier application → `/supplier-setup`
4. Wait for admin approval → `/supplier-pending`
5. Admin approves → `/admin/suppliers`
6. Access supplier dashboard → `/supplier`

### Admin Setup
1. Create an account
2. Visit `/admin-setup`
3. Set admin flag
4. Access admin dashboard → `/admin`

## Build

```bash
npm run build
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Future Enhancements

- [ ] Seller ratings and feedback system
- [ ] Secure messaging system for buyer-seller communication
- [ ] Backend database integration (PostgreSQL/MongoDB)
- [ ] Payment gateway integration (M-Pesa, Stripe)
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications for order updates
- [ ] Multi-currency support
- [ ] Shipping integrations

