# Gadget District — Mobile Accessories E-Commerce Store

**Gadget District** is a complete, modern, professional mobile accessories e-commerce website built from scratch. It features curated phone cases, GaN fast chargers, tempered glass shields, audio accessories, and power banks.

The entire store follows the **Theme 3: Minimal Premium** visual identity:
- **Color Palette:** Pure White (`#FFFFFF`), Light Gray surfaces (`#F9FAFB`), Hairline Borders (`#E5E7EB`), and Deep Black (`#111111`).
- **Typography:** Helvetica Neue / Clean Sans, Ultra-light (200/300) headlines, generous letter spacing (`tracking-[0.2em]`) on tags.
- **Buttons:** Sharp 2px radius, solid black primary CTAs, refined outlined secondaries.
- **Product Cards:** Full-bleed minimal photo frames, crisp pricing, stock indicators, and instant quick-add actions.
- **Atmosphere:** Apple-inspired, spacious, content-first layout.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 with App Router (JavaScript)
- **Styling:** Tailwind CSS
- **Backend:** Node.js & Express.js REST API
- **Database:** MongoDB Atlas (Cloud Database)
- **ODM:** Mongoose
- **Authentication:** JWT with bcrypt password hashing and role-based authorization (Admin / Customer)
- **State Management:** React Context API (Cart with localStorage sync + MongoDB cloud persistence for logged-in users)

---

## ☁️ MongoDB Atlas Cloud Database Setup Guide

Gadget District is designed to connect directly to **MongoDB Atlas Cloud Database**. Follow these steps to obtain your free connection string:

### Step 1: Create a Free Atlas Cluster
1. Visit [MongoDB Atlas](https://cloud.mongodb.com) and create an account or sign in.
2. Click **Create** and select the **M0 Free Tier** cluster.
3. Choose your preferred cloud provider (AWS, GCP, or Azure) and nearest region.
4. Name your cluster (e.g. `gadget-district-cluster`) and click **Create Deployment**.

### Step 2: Configure Network Access
1. In the left navigation panel, click **Security** → **Network Access**.
2. Click **Add IP Address**.
3. Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm**.

### Step 3: Create Database User
1. In the left navigation panel, click **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Set **Authentication Method** to `Password`.
4. Create a username (e.g., `admin`) and a secure password (e.g., `MySecurePassword123!`).
5. Set **Database User Privileges** to `Read and write to any database`.
6. Click **Add User**.

### Step 4: Obtain Connection String
1. In the left navigation panel, click **Deployment** → **Database**.
2. Click the **Connect** button on your cluster.
3. Choose **Drivers** (Driver: `Node.js`, Version: `6.7 or later`).
4. Copy the connection string format:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/gadget_district?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials.

### Step 5: Configure Environment Variables
Create a file named `server/.env` (or copy from `server/.env.example`):
```env
MONGODB_URI=mongodb+srv://admin:MySecurePassword123!@cluster0.mongodb.net/gadget_district?retryWrites=true&w=majority
PORT=5001
NODE_ENV=development
JWT_SECRET=gadget_district_ultra_secure_jwt_secret_key_2026_minimal
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

And in `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## 📦 Project Structure

```
assessories store/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── branding.js        # Centralized store branding & theme tokens
│   │   │   └── db.js              # MongoDB Atlas connection & resilience
│   │   ├── models/
│   │   │   ├── User.js            # User accounts with bcrypt hashing
│   │   │   ├── Product.js         # Products with specs, SKU, compatibility
│   │   │   ├── Category.js        # 10 Mobile accessory categories
│   │   │   ├── Brand.js           # Accessory brands
│   │   │   ├── Cart.js            # Cloud-persisted user carts
│   │   │   ├── Order.js           # Orders with tracking history
│   │   │   ├── Review.js          # Customer reviews with ratings
│   │   │   ├── Wishlist.js        # Saved items
│   │   │   └── Newsletter.js      # Subscriber emails
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & Admin protection
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── controllers/           # REST API business logic
│   │   ├── routes/                # Express endpoint routers
│   │   ├── seed/
│   │   │   ├── seedData.js        # Realistic demo products across all 10 categories
│   │   │   └── seeder.js          # Database populator script
│   │   └── server.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js          # Root layout with Header, BagDrawer, Footer
│   │   │   ├── page.js            # Minimal Premium Homepage
│   │   │   ├── shop/page.js       # Dedicated Shop with 10 Categories & Filters
│   │   │   ├── product/[slug]/    # Product details with Compatibility Checker
│   │   │   ├── cart/page.js       # Shopping bag & Free shipping calculator
│   │   │   ├── checkout/page.js   # Delivery details & COD checkout
│   │   │   ├── order-confirmation/# Instant order receipt
│   │   │   ├── track-order/       # Order tracking with progress stepper
│   │   │   ├── wishlist/page.js   # Saved accessories
│   │   │   ├── login/page.js      # Sign-in with 1-click Demo credentials
│   │   │   ├── register/page.js   # Registration page
│   │   │   ├── account/page.js    # Order history & delivery address
│   │   │   └── admin/page.js      # Live database Analytics & CRUD
│   │   ├── components/            # Header, Footer, Cards, Checker, Drawer
│   │   ├── context/               # AuthContext & CartContext
│   │   └── lib/                   # Centralized API client & Branding
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
├── package.json                   # Root orchestrator scripts
├── .env.example
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies
From the root directory:
```bash
npm run install:all
```
*(Or run `npm install` inside both `server/` and `client/`)*

### 2. Seed the MongoDB Database
Ensure your `server/.env` contains your `MONGODB_URI`:
```bash
npm run seed
```
This populates the database with:
- All **10 Mobile Accessory Categories**
- Popular Brands (Anker, Spigen, Belkin, Nomad, ESR, Ugreen)
- Over a dozen realistic products with full specs and compatibility lists
- Sample customer reviews and orders for analytics
- **Admin Account:** `admin@example.com` / `Admin@ChangeMe123!` (or configure via `ADMIN_SEED_PASSWORD`)
- **Customer Account:** `john@example.com` / `Customer@123`

### 3. Run Development Servers
Open two terminal windows (or run from root):

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Server starts on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Next.js app starts on http://localhost:3000
```

Visit **http://localhost:3000** in your browser.

---

## 🔑 Demo Login Credentials

You can use the **1-click quick-fill buttons** on the `/login` page:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@example.com` | `Admin@ChangeMe123!` | Full Admin Console (`/admin`), Product CRUD, Order Status Updates |
| **Customer** | `john@example.com` | `Customer@123` | Past Orders, Wishlist, Cloud Cart, Reviews |

---

## 📱 The 10 Product Categories

1. **Mobile Cases and Covers**
2. **Screen Protectors**
3. **Chargers and Adapters**
4. **USB Cables and Accessories**
5. **Wireless Earbuds and Headphones**
6. **Power Banks**
7. **Mobile Stands and Holders**
8. **Smartwatch Accessories**
9. **Car Mobile Accessories**
10. **Other Mobile Accessories**

---

## ⚡ Key Features

1. **Device Compatibility Checker:** Customers can select or type their device model (e.g. *iPhone 16 Pro*, *Samsung S24 Ultra*) on any product page to verify fit instantly.
2. **Atomic Stock Management:** Prevents overselling during concurrent purchases; stock is automatically replenished if an order is cancelled in the Admin console.
3. **Real Database Admin Analytics:** Total revenue, orders, active customers, and bestsellers are calculated live via MongoDB aggregation pipelines (no hardcoded numbers).
4. **Order Tracking System:** Customers can track any order using their unique Order Number (e.g., `GD-2026-A1092`) with a visual 6-step progress bar and activity log.
5. **Hybrid Cart:** Seamless guest shopping with automatic cloud database sync upon user login.
