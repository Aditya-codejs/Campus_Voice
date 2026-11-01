# CampusVoice &bull; University Student Complaint & Grievance Tracker

CampusVoice is a modern, enterprise-grade university complaint and grievance redressal web portal built with the **MERN** stack (MongoDB, Express, React, Node.js), Tailwind CSS, Lucide Icons, and Recharts.

---

## 🌟 Key Features

### 1. Multi-Role Workspaces & Role-Based Access Control (RBAC)
- **Student Portal**:
  - Independent student registration with roll number, course, year, and department.
  - Multi-attribute complaint submission with **100% Anonymous Reporting** mode.
  - File attachments support (images & PDFs up to 5 MB per file).
  - Unique human-readable Tracking Code (`SCT-YYYY-NNNNNN`).
  - Interactive visual status timeline with timestamped update history.
  - Two-way discussion thread with assigned department officers.
  - 7-Day Reopen window for resolved grievances.
  - 5-Star satisfaction rating & feedback submission.
  - Profile & password management.
- **Staff / Department Officer Portal**:
  - Independent registration with Employee ID and Department (accounts start in **Pending Approval** status).
  - Department-specific complaint queue with assignment filters ("Assigned to Me" toggle).
  - Status progression workflow (`Assigned`, `In Progress`, `Need More Info`, `Resolved`, `Rejected`).
  - Mandatory **Resolution Summary** when resolving issues and mandatory **Rejection Reason** when rejecting.
  - **Internal Staff Notes** (confidential notes visible only to staff and administrators, strictly hidden from students).
- **Administration & Analytics Hub**:
  - An initial administrator can be bootstrapped from private environment settings.
  - **Staff Registration Review Queue**: 1-click Approve or Reject staff accounts with reason.
  - **Master Grievance Registry**: Assign/reassign tickets to departments and specific staff members; modify priority levels.
  - **Live Analytics & Recharts Dashboards**: Complaints by Department, Category Distribution, Status Breakdown, and SLA compliance.
  - **Departments & Categories Manager**: Create and configure departments and categories (with Sensitive flags).
  - **Audit Logs**: Immutable log recording security events, staff approvals, and status transitions with IP addresses.
  - **CSV Export**: 1-click complete data export.
- **Public Grievance Tracker**:
  - Public `/track/:code` portal allowing anyone with a tracking code to view progress while keeping student identity completely masked.

### 2. SLA Automation Engine
- Automatic due date calculation based on priority:
  - **Critical**: 24 Hours
  - **High**: 3 Days
  - **Medium**: 7 Days
  - **Low**: 14 Days
- Background cron scheduler (`node-cron`) automatically flags overdue tickets, escalates critical violations, and auto-closes resolved tickets after 7 days if unobjected.

### 3. Email Notification System
- Nodemailer SMTP service with branded HTML email templates for:
  - Welcome & registration confirmation.
  - Staff account approval & rejection.
  - Complaint submission confirmation with tracking link.
  - Complaint assignment to officer.
  - Status update alerts.
  - Password reset links.
- Graceful development fallback: logs email content cleanly to the console if SMTP credentials are placeholder.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- **MongoDB** (Local MongoDB on `127.0.0.1:27017` or a MongoDB Atlas URI)

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or install manually in both folders: `cd server && npm install` and `cd ../client && npm install`)*

### 2. Seed the Database
Ensure the default departments and categories exist, and create the initial administrator only when a strong password is configured. Seeding never deletes or overwrites existing records:
```bash
npm run seed
```
Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 16 characters in `server/.env`. Existing accounts are left unchanged.

Local-only demo accounts are opt-in. Set `SEED_DEMO_DATA=true` and use a local MongoDB URI; the seed command refuses to create demos on Atlas or in production.

### 3. Start the Application

You can run the backend and frontend in separate terminals:

**Terminal 1 (Backend API - Port 5000):**
```bash
npm run server
```

**Terminal 2 (Frontend Client - Port 5173):**
```bash
npm run client
```

Now open **http://localhost:5173** in your browser.

---

## 🔑 Local Demo Accounts

These fictional accounts are created only when `SEED_DEMO_DATA=true` is used with a local MongoDB URI outside production:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin.demo@example.com` | `LocalOnly-Admin-Demo-2026!` | Local-only administrative testing |
| **Approved Staff** | `staff.demo@example.com` | `LocalDemo-Staff-2026!` | Local-only staff testing |
| **Pending Staff** | `pending.demo@example.com` | `LocalDemo-Pending-2026!` | Local-only approval workflow testing |
| **Student** | `student.demo@example.com` | `LocalDemo-Student-2026!` | Local-only student testing |

The development login page provides quick-fill buttons for the local administrator, approved staff, and student accounts. No demo buttons or demo accounts are provided in production.

---

## ⚙️ Environment Variables

Copy `server/.env.example` to `server/.env` and update values as needed:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb://127.0.0.1:27017/complaint_tracker

# JWT Authentication
JWT_SECRET=super_secret_university_jwt_key_2026_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Admin seed credentials (use a unique password of at least 16 characters)
ADMIN_NAME=CampusVoice Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-unique-secret-of-at-least-16-characters

# SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=CampusVoice Grievance Cell <no-reply@college.edu>

# Optional Cloudinary File Storage (Local disk storage used by default)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📁 Project Architecture

```
student_complaint_web/
├── client/                               # Frontend React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                     # ProtectedRoute (role guards)
│   │   │   ├── common/                   # StatusBadge, PriorityBadge, ConfirmationModal
│   │   │   ├── complaints/               # Timeline, ComplaintComments (with internal notes)
│   │   │   └── layout/                   # Navbar, Sidebar, DashboardLayout, NotificationDropdown
│   │   ├── context/                      # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── public/                   # Landing, Login, Student/Staff Register, Forgot/Reset, Track
│   │   │   ├── student/                  # Dashboard, SubmitComplaint, MyComplaints, Detail, Profile
│   │   │   ├── staff/                    # Dashboard, ComplaintsQueue, Detail, Profile
│   │   │   └── admin/                    # Dashboard (Recharts), Registry, StaffApprovals, Users, Depts/Cats, Logs, Profile
│   │   ├── services/                     # api.js (Axios with JWT interceptors)
│   │   ├── App.jsx                       # React Router route registry
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Backend Express API
│   ├── src/
│   │   ├── config/                       # db.js, mailer.js, cloudinary.js
│   │   ├── controllers/                  # auth, complaint, comment, admin, department, category, notification
│   │   ├── middleware/                   # auth (JWT & RBAC), upload (Multer), errorHandler
│   │   ├── models/                       # User, Department, Category, Complaint, Comment, StatusHistory, Attachment, Notification, AuditLog
│   │   ├── routes/                       # auth, complaint, admin, department, category, notification
│   │   ├── services/                     # emailService (HTML templates), notificationService, auditService
│   │   ├── jobs/                         # slaCron.js (SLA violation & 7-day auto-close scheduler)
│   │   ├── seeds/                        # seed.js (Full database initializer)
│   │   ├── utils/                        # generateComplaintCode, calculateSla, apiResponse
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                          # Local file storage for attachments
│   └── package.json
│
├── student-complaint-tracker.md          # Primary project requirements documentation
├── .env.example
├── package.json
└── README.md
```

---

## 🧪 Testing Verification Completed

1. **Authentication & RBAC**:
   - Student self-registration and instant login.
   - Staff registration created in `pending` state; verified that staff cannot access staff functionality until an administrator approves their account.
   - Admin approval activates the staff account and triggers an email notice.
2. **Complaint Lifecycle**:
   - Created complaint `SCT-2026-000004` with priority SLA computation.
   - Public comment posted by student.
   - Internal note posted by staff; verified that the internal note is strictly hidden from the student.
   - Status updated to `in_progress`, `resolved`, and `closed` with mandatory resolution summaries.
   - 7-day reopen window validated.
3. **Analytics & Public Tracking**:
   - Recharts visual telemetry rendering department volume, categories, and SLA metrics.
   - Public tracking endpoint `/api/complaints/track/:code` verified with student identity masking.
   - CSV export tested and confirmed.
