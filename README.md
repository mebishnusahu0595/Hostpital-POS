# Hospital-POS (Centralized Medical Solutions)

A Multi-Tenant Hospital Equipment Management SaaS Platform built with the MERN stack (Next.js 14, Express, MongoDB, Node.js).

## 🚀 Features

- **Multi-Tenancy**: Complete isolation between hospital data.
- **Role-Based Access Control (RBAC)**: Super Admin, Hospital Admin, Engineer, and Staff roles.
- **Equipment Management**: Track lifecycle, status, condition, and location of every medical device.
- **Maintenance Scheduling**: Automated next maintenance date calculation and email/socket notifications.
- **Digital Service Reports**: Engineers can submit reports with images and digital signatures.
- **QR Code Integration**: Scan equipment QR codes for instant access to history and reporting.
- **Real-Time Notifications**: Socket.io integration for instant alerts on breakdowns and assignments.
- **Analytics Dashboard**: Comprehensive KPIs for both platform level and hospital level.
- **Audit Logs**: Immutable logs for every critical action in the system.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand, React Query.
- **Backend**: Node.js, Express.js, TypeScript, Socket.io, Winston.
- **Database**: MongoDB (Mongoose).
- **Automation**: Node-cron for maintenance alerts and SLA tracking.
- **Reports**: Puppeteer for PDF generation.

## 📦 Installation

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` (use `.env.example` as a template)
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create `.env.local`
4. `npm run dev`

## 🛡 Security

- JWT Authentication with HttpOnly Cookies.
- Tenant Isolation middleware (`enforceHospitalScope`).
- Input validation using Zod.
- Rate limiting and Helmet.js for header protection.

## 📜 License

ISC License

---
Built with ❤️ for Medical Facilities.
