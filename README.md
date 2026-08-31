# 🛡️ Smart Visitor Management System (Enterprise Campus Edition)

A modern, elegant, secure, and production-ready **Smart Visitor Management System** built for college campuses and enterprise environments. Replaces traditional paper visitor registers with a fast, secure, digital access control and visitor tracking platform.

---

## 🌟 Key Features

### 🏢 Multi-Role Access Control (RBAC)
- **Admin**: Overall security console, KPI analytics, user management, audit logs, and system settings.
- **Security Guard**: Dedicated QR Code Scanner with camera & manual verification, 1-click check-in/out gate control.
- **Host / Employee**: Pre-invite visitors, receive instant arrival notifications, approve/reject visit requests.
- **Visitor**: Self-registration portal, digital visit status tracking, unique QR entry pass receipt.

### ⚡ Digital Visitor Management & Approvals
- **Multi-section Digital Registration**: Personal info, host selection, visit purpose, vehicle registration, and ID document numbers.
- **Host Approval Workflow**: Instant notification to host staff for approval or rejection with custom reasons.
- **Unique QR Pass Engine**: Cryptographically secure QR tokens generated per visit with single-use check-in verification.
- **Live Gate Check-In & Check-Out**: 1-click arrival verification, automated visit duration computation, and real-time active visitor tracking.

### 📊 Analytics & Security Insights
- **KPI Metrics**: Total Visitors Today (with % change), Currently Inside, Pending Approvals, Completed Visits.
- **Interactive Visualizations**: Visitor traffic trends, purpose distribution pie charts, peak visiting hour line charts, department-wise visitor counts.
- **Audit Logging**: Full security audit trail tracking logins, QR scans, approvals, check-ins, and check-outs.

---

## 🛠️ Mandatory Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS (Enterprise Sky-Blue theme), React Router v6, Recharts, Lucide Icons, HTML5 QR Scanner.
- **Backend**: Node.js, Express.js, TypeScript, JWT Authentication, Bcrypt password hashing, Helmet, Rate limiting.
- **Database**: PostgreSQL (relational persistent storage with clean migration SQL scripts).
- **Caching & Status**: Redis (ioredis) for live active visitor counters and caching, with a built-in resilient in-memory fallback.
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` & `npm`
- (Optional) Docker & Docker Compose (for containerized deployment)

### 1. Local Development Setup (Standalone)

```bash
# Clone or navigate to the project directory
cd smart-visitor-management

# Install root, server, and client dependencies
npm install

# Start Backend Server & Frontend Client concurrently
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`

---

### 2. Docker Containerized Setup

```bash
# Spin up PostgreSQL, Redis, Express API, and React Frontend containers
docker-compose up --build -d
```

Services running in Docker:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

## 🔑 Demo Login Credentials

The system includes pre-loaded demo accounts and quick role-switching buttons on the login screen for instant testing:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `Admin@123` | Full dashboard, analytics, audit logs, system settings |
| **Security Guard** | `security@campus.edu` | `Security@123` | QR Scanner page, gate check-in/check-out control |
| **Host / Staff** | `host@campus.edu` | `Host@123` | Approve/reject visit requests, expected visitors list |
| **Visitor** | `visitor@campus.edu` | `Visitor@123` | Self-registration, digital QR pass viewing |

---

## 🔌 Key REST API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate user and issue JWT token.
- `GET /api/auth/me`: Fetch authenticated user profile.
- `POST /api/auth/logout`: Invalidate session and record audit log.

### Visitors & Visits
- `GET /api/visitors`: Retrieve all registered visitors.
- `GET /api/visitors/:id`: Fetch detailed visitor profile with visit history timeline.
- `GET /api/visits`: Retrieve visit requests with status/host filters.
- `POST /api/visits`: Register new visitor visit request & generate QR token.

### Approvals & QR Security
- `GET /api/approvals/pending`: Retrieve pending visit requests for host/admin review.
- `POST /api/approvals/:id/approve`: Approve visit request & issue QR pass.
- `POST /api/approvals/:id/reject`: Reject visit request with reason.
- `POST /api/qr/verify`: Verify scanned QR token & return visitor card.

### Check-In / Check-Out
- `POST /api/visits/:id/check-in`: Process gate entry, update Redis active counter, notify host.
- `POST /api/visits/:id/check-out`: Process gate exit, calculate visit duration.

---

## 📁 Repository Structure

```
smart-visitor-management/
├── client/                     # React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, StatCard, QRScannerComponent, StatusBadge, Toast
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── layouts/            # AppLayout (Collapsible Sidebar + Top Navbar)
│   │   ├── pages/              # Login, AdminDashboard, VisitorsPage, RegisterVisitorPage, etc.
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile
│   └── vite.config.ts
│
├── server/                     # Express.js + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment, DB, Redis config
│   │   ├── database/           # init.sql schema & seed script
│   │   ├── middleware/         # JWT Auth & RBAC middleware
│   │   ├── controllers/        # Express API Controllers
│   │   ├── repositories/       # Data Access Layer (Postgres / Fallback DB)
│   │   └── server.ts           # Server entry point
│   └── Dockerfile
│
├── docker-compose.yml          # Container orchestration for Postgres, Redis, Express, React
├── .env.example                # Sample environment variables configuration
└── README.md
```
