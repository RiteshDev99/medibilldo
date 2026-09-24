# MediBillDo 💊

> An enterprise-grade, multi-tenant **Pharmacy Management & Point-of-Sale (POS) Billing System** engineered for retail pharmacies, medical dispensaries, and hospital chains.

---

## 📖 Overview

**MediBillDo** is an end-to-end pharmacy retail ERP platform built to automate everyday medical store operations. It features high-throughput POS billing with instant barcode scanning, automatic **FEFO (First-Expiry-First-Out)** batch selection, multi-tier tax calculation (GST, CESS, HSN), conversion factor management (loose tablets vs. full strips/boxes), double-entry stock movement tracking, and customer credit ledger (Udhar/Khata) management.

---

## ⚡ Key Features

### 🛒 High-Throughput Point-of-Sale (POS) Billing
- **Instant Search & Barcode Integration**: Sub-second search by medicine brand name, generic formulation, short name, or barcode.
- **FEFO (First-Expiry-First-Out) Auto-Allocation**: Intelligently recommends and selects the earliest expiring unexpired batch to minimize medicine wastage and stock expiry losses.
- **Pack vs. Loose Unit Selling**: Dynamic conversion factor logic enabling seamless sales of whole strips/boxes or loose tablets with accurate base inventory deduction.
- **Multi-Payment Mode Support**: Accepts Cash, UPI, Card, and Credit (Udhar) transactions with real-time change calculation and cash register tracking.
- **Digital & Thermal Invoicing**: Generates sequential invoices (`INV-YYYY-XXXX`) and provides printable receipts compliant with retail pharmacy standards.

### 📦 Batch Inventory & Stock Movement Ledger
- **Granular Batch Tracking**: Tracks batch number, manufacturing date, expiry date, MRP, purchase rate, and current stock level for every medicine.
- **Double-Entry Stock Audit Trail**: Logs every inventory change with full history across `PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN`, `DAMAGE`, and `EXPIRY`.
- **Intelligent Stock Alerts**: Live notifications and dashboard warnings for near-expiry medicines (under 30/60/90 days) and low-stock reorder thresholds.

### 🏛️ Multi-Tenancy & Role-Based Access Control (RBAC)
- **Tenant Isolation**: Secure data segregation ensuring each pharmacy store's inventory, staff, sales, and customer data remain strictly isolated.
- **Tiered Role Hierarchy**:
  - **Super Admin**: Global platform administration, store provisioning, approval workflows, and audit logging.
  - **Store Admin (Owner)**: Complete store control, inventory management, purchase pricing, profit margins, staff management, and financial reporting.
  - **Staff (Cashier/Dispenser)**: Fast-paced POS billing, shift summaries, and stock lookup with restricted access to sensitive store financial margins.

### 🧾 Indian GST & Tax Compliance Engine
- **Multi-Slab GST Support**: Automatic computation of 5%, 12%, 18%, and 28% GST rates.
- **CGST & SGST Split**: Automated bifurcation of GST into Central and State components alongside optional CESS.
- **Deterministic 2-Decimal Precision**: Eliminates floating-point discrepancies in price, tax, and discount calculations.
- **HSN Classification**: Detailed HSN-wise sales tracking for tax filing and audit compliance.

### 👥 Customer Khata & Credit Ledger
- **Customer Directory**: Track customer contact info, purchase history, and prescribing doctors.
- **Credit Balance Management**: Real-time tracking of unpaid balances (Udhar/Khata) with payment reconciliation at the counter.

### 📊 Business Intelligence & Reporting
- **Dual Role Dashboards**:
  - **Admin View**: Revenue growth, net profit margins, top-selling medicines, and inventory valuation.
  - **Staff View**: Shift-specific sales, hourly billing count, and payment mode breakdowns (Cash vs. UPI vs. Card).
- **Exportable Reports**: Generate detailed sales timelines, tax summaries, and customer ledgers with one-click CSV export.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components & Icons**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

### Backend & Database
- **Runtime & Language**: [TypeScript](https://www.typescriptlang.org/) / Node.js
- **Database**: [PostgreSQL (Neon Serverless)](https://neon.tech/)
- **ORM & Migrations**: [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit
- **Transactions**: Atomic batch transactions via Drizzle ORM

### Authentication & Services
- **Authentication**: [Better Auth](https://www.better-auth.com/) (Session-based, multi-role RBAC)
- **Email Service**: [Resend](https://resend.com/) (Password reset & transactional emails)

### Tooling & Quality
- **Linter & Formatter**: [Biome](https://biomejs.dev/) & [Ultracite](https://github.com/peterbe/ultracite)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)
