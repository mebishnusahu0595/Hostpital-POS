# Hospital-POS (Centralized Medical Solutions)

A Multi-Tenant Hospital Equipment Management SaaS Platform built with the MERN stack (Next.js 14, Express, MongoDB, Node.js).

## Project Overview

Centralized Medical Solutions is a comprehensive platform designed for medical facilities to manage the full lifecycle of their equipment. It provides a centralized hub for tracking inventory, scheduling maintenance, managing service engineers, and ensuring regulatory compliance.

## Core Features

- **Multi-Tenancy**: Secure isolation between hospital data using dedicated tenant identification.
- **Role-Based Access Control (RBAC)**: Defined workflows for Super Admins, Hospital Admins, Engineers, and Staff.
- **Equipment Lifecycle Management**: Detailed tracking of acquisition, warranty, status, condition, and location.
- **Automated Maintenance**: Intelligent calculation of maintenance schedules with automated notifications.
- **Digital Service Reporting**: Mobile-ready interface for engineers to submit reports, images, and signatures.
- **QR Code System**: Unique QR generation for each asset to facilitate quick history retrieval and issue reporting.
- **Real-Time Communication**: Instant alerts for critical breakdowns and task assignments via Socket.io.
- **Comprehensive Analytics**: Data-driven insights into equipment uptime, maintenance costs, and compliance.
- **Audit Compliance**: Immutable logging of all administrative and technical actions.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Zustand and React Query

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Communication**: Socket.io
- **Logging**: Winston

### Database
- **Primary Database**: MongoDB (Mongoose ODM)

## Deployment and Infrastructure

- **Process Management**: PM2
- **Reverse Proxy**: Nginx
- **Security**: JWT Authentication, Rate Limiting, and Helmet.js

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation Steps

1. Clone the repository to your production server.
2. Navigate to the `backend` directory, install dependencies, and configure the `.env` file.
3. Navigate to the `frontend` directory, install dependencies, and configure the `.env.local` file.
4. Run the build scripts for both components.
5. Use the provided deployment scripts in the `scripts/` directory to manage the processes.

## Legal and Licensing

This software is proprietary. Unauthorized copying, modification, distribution, or use of this software via any medium is strictly prohibited.

Copyright (c) 2025 Centralized Medical Solutions. All rights reserved.
