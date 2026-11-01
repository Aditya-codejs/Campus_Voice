# Student Complaint Tracker – Project Documentation

## 1. Overview

**Project name:** Student Complaint Tracker
**Type:** Web application
**Purpose:** A centralized platform where students can submit complaints (academic, hostel, library, canteen, transport, harassment, etc.), track their progress in real time, and receive resolutions, while administrators and staff can review, assign, resolve, and report on them.

### Problem Statement
Institutions often handle complaints through paper forms, emails, or verbal reports. This causes lost complaints, no accountability, no status visibility, delayed resolution, and no data to improve services.

### Goals
- Make submitting a complaint simple, fast, and (optionally) anonymous.
- Give students transparent, real-time tracking of every complaint.
- Give staff/admins tools to assign, prioritize, resolve, and escalate.
- Produce analytics to identify recurring issues and measure response times.

### Non-Goals (v1)
- Payment handling, native mobile apps, AI auto-resolution.

---

## 2. User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Student** | Registered learner | Register/login, submit complaints, attach files, track status, comment, rate resolution, reopen, view own history |
| **Staff / Department Officer** | Warden, librarian, HOD, faculty, etc. | View complaints assigned to their department, update status, comment, upload proof, mark resolved |
| **Admin** | System administrator | Manage users, departments, categories; assign/reassign complaints; escalate; view all complaints; reports; settings |
| **Super Admin** (optional) | Institution head | Everything + audit logs, role management |

---

## 3. Core Features

### 3.1 Student Features
1. Registration & login (college email / roll number)
2. Submit complaint form (title, category, description, location, date of incident, priority, attachments)
3. Anonymous complaint option (identity hidden from staff; stored securely for admin-only abuse handling)
4. Unique **Complaint ID** (e.g., `SCT-2026-000123`)
5. Track status via timeline
6. Comment/reply thread with assigned staff
7. Edit or withdraw complaint (only while status = *Submitted*)
8. Reopen resolved complaint within 7 days if unsatisfied
9. Rate & give feedback after resolution (1–5 stars + comment)
10. Notification (in-app + email) on every status change
11. Dashboard: totals, pending, resolved, recent activity

### 3.2 Staff Features
1. Dashboard of assigned complaints with filters
2. Update status, add internal notes (hidden from student) and public replies
3. Upload resolution proof
4. Request more information from student
5. Escalate to admin

### 3.3 Admin Features
1. View, search, filter all complaints
2. Assign / reassign to department or staff
3. Set or change priority; escalate overdue complaints
4. Manage users, departments, categories
5. Analytics dashboard & exportable reports (CSV/PDF)
6. SLA monitoring (overdue highlighting)
7. Audit logs
8. Announcements (e.g., "Hostel water issue is being fixed")

### 3.3 Shared Features
- Search, filter, sort, pagination
- Responsive UI (mobile-first)
- Dark/light mode
- Profile management & password reset

---

## 4. Complaint Categories

| Category | Examples | Default Department |
|----------|----------|--------------------|
| Academic | Grading issue, attendance error, syllabus, timetable clash | Academic Office |
| Faculty / Teaching | Class not conducted, teaching quality | HOD |
| Hostel | Cleanliness, water, electricity, mess food, room issues | Hostel Warden |
| Library | Book unavailability, fines, timings | Librarian |
| Canteen / Mess | Food quality, hygiene, pricing | Canteen Committee |
| Infrastructure | Classroom, washroom, lab equipment, Wi-Fi | Maintenance |
| Transport | Bus delay, route, safety | Transport Office |
| Examination | Hall ticket, result errors, re-evaluation | Exam Cell |
| Fees & Scholarship | Fee receipt, scholarship delay | Accounts Office |
| Harassment / Ragging | Bullying, discrimination, misconduct | Anti-Ragging / Internal Committee (**restricted access**) |
| IT Services | Portal, email, LMS issues | IT Department |
| Other | Anything else | Admin |

> **Sensitive categories** (Harassment/Ragging) must have restricted visibility, mandatory anonymity option, and immediate high priority.

---

## 5. Status Workflow

```
Submitted → Under Review → Assigned → In Progress → Resolved → Closed
                 │                         │            │
                 ├→ Need More Info ←───────┘            └→ Reopened → In Progress
                 └→ Rejected (with reason)
                 └→ Escalated (to admin / higher authority)
```

| Status | Meaning |
|--------|---------|
| Submitted | Newly created by student |
| Under Review | Admin verifying details |
| Assigned | Allocated to department/staff |
| In Progress | Work started |
| Need More Info | Waiting on student's reply |
| Escalated | Raised to higher authority |
| Resolved | Fix applied; awaiting student confirmation |
| Closed | Confirmed by student or auto-closed after 7 days |
| Reopened | Student unsatisfied |
| Rejected | Invalid / duplicate / out of scope (reason required) |

---

## 6. Priority & SLA

| Priority | Examples | Target First Response | Target Resolution |
|----------|----------|----------------------|-------------------|
| Critical | Harassment, safety hazard, no water/power in hostel | 2 hours | 24 hours |
| High | Exam/result errors, fee issues | 24 hours | 3 days |
| Medium | Infrastructure, library, IT | 48 hours | 7 days |
| Low | Suggestions, minor inconveniences | 72 hours | 14 days |

Overdue complaints are flagged red and auto-escalated.

---

## 7. Database Design

### 7.1 Entities

**users**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID / PK | |
| name | string | |
| email | string, unique | |
| password_hash | string | bcrypt/argon2 |
| role | enum | student, staff, admin, superadmin |
| roll_number | string, nullable | students only |
| course / year | string | |
| phone | string, nullable | |
| department_id | FK, nullable | staff only |
| is_active | boolean | |
| email_verified | boolean | |
| created_at / updated_at | timestamp | |

**departments**
| id | name | email | head_user_id | created_at |

**categories**
| id | name | description | default_department_id | is_sensitive |

**complaints**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID / PK | |
| complaint_code | string, unique | `SCT-YYYY-NNNNNN` |
| student_id | FK users | nullable if fully anonymous |
| is_anonymous | boolean | |
| title | string (max 150) | |
| description | text | |
| category_id | FK | |
| department_id | FK | |
| assigned_to | FK users, nullable | |
| priority | enum | low, medium, high, critical |
| status | enum | see workflow |
| location | string | e.g., "Hostel B, Room 204" |
| incident_date | date | |
| resolution_summary | text, nullable | |
| rating | int 1–5, nullable | |
| feedback | text, nullable | |
| due_date | timestamp | from SLA |
| resolved_at / closed_at | timestamp, nullable | |
| created_at / updated_at | timestamp | |

**complaint_comments**
| id | complaint_id | user_id | message | is_internal (bool) | created_at |

**complaint_attachments**
| id | complaint_id | uploaded_by | file_url | file_name | file_type | file_size | created_at |

**complaint_status_history**
| id | complaint_id | old_status | new_status | changed_by | note | created_at |

**notifications**
| id | user_id | complaint_id | type | message | is_read | created_at |

**announcements**
| id | title | body | created_by | created_at | expires_at |

**audit_logs**
| id | user_id | action | entity | entity_id | ip_address | created_at |

### 7.2 Relationships
- One user → many complaints
- One department → many staff, many complaints
- One complaint → many comments, attachments, status history entries
- One category → many complaints

### 7.3 SQL Example (PostgreSQL / MySQL-compatible)

```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY,
  complaint_code VARCHAR(20) UNIQUE NOT NULL,
  student_id UUID REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category_id INT REFERENCES categories(id),
  department_id INT REFERENCES departments(id),
  assigned_to UUID REFERENCES users(id),
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'submitted',
  location VARCHAR(150),
  incident_date DATE,
  resolution_summary TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  due_date TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Pages & UI Structure

### Public
- `/` Landing page (about, how it works, FAQs)
- `/login`, `/register`, `/forgot-password`, `/reset-password`

### Student
- `/student/dashboard` – stats cards + recent complaints
- `/student/complaints/new` – submission form
- `/student/complaints` – list with filters
- `/student/complaints/:id` – details, timeline, comments, feedback
- `/student/notifications`
- `/student/profile`

### Staff
- `/staff/dashboard`
- `/staff/complaints` – assigned list
- `/staff/complaints/:id` – update status, notes, proof

### Admin
- `/admin/dashboard` – analytics
- `/admin/complaints` – all complaints, assign/escalate
- `/admin/users`, `/admin/departments`, `/admin/categories`
- `/admin/reports`
- `/admin/announcements`
- `/admin/audit-logs`
- `/admin/settings`

### Complaint Form Fields
| Field | Type | Required |
|-------|------|----------|
| Title | text | Yes |
| Category | dropdown | Yes |
| Description | textarea | Yes |
| Location | text | No |
| Date of incident | date | No |
| Priority (suggested) | dropdown | No (admin finalizes) |
| Attachments | file upload (max 5 files, 5 MB each; jpg, png, pdf) | No |
| Submit anonymously | checkbox | No |

---

## 9. REST API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Send reset link |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Current user |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints` | List (filtered by role) |
| GET | `/api/complaints/:id` | Details |
| PUT | `/api/complaints/:id` | Edit (student, only if Submitted) |
| DELETE | `/api/complaints/:id` | Withdraw |
| PATCH | `/api/complaints/:id/status` | Update status (staff/admin) |
| PATCH | `/api/complaints/:id/assign` | Assign (admin) |
| PATCH | `/api/complaints/:id/priority` | Change priority (admin) |
| POST | `/api/complaints/:id/comments` | Add comment |
| POST | `/api/complaints/:id/attachments` | Upload file |
| POST | `/api/complaints/:id/feedback` | Rating & feedback |
| POST | `/api/complaints/:id/reopen` | Reopen |
| GET | `/api/complaints/track/:code` | Track by code |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/api/users` | User management |
| GET/POST/PUT/DELETE | `/api/departments` | Departments |
| GET/POST/PUT/DELETE | `/api/categories` | Categories |
| GET | `/api/reports/summary` | Stats |
| GET | `/api/reports/export?format=csv` | Export |
| GET | `/api/audit-logs` | Logs |

### Notifications
| GET | `/api/notifications` | List |
| PATCH | `/api/notifications/:id/read` | Mark read |

### Sample Request – Create Complaint
```json
POST /api/complaints
{
  "title": "Water not available in Hostel B",
  "category_id": 3,
  "description": "No water supply on 3rd floor since morning.",
  "location": "Hostel B, 3rd Floor",
  "incident_date": "2026-10-30",
  "priority": "high",
  "is_anonymous": false
}
```

### Sample Response
```json
{
  "success": true,
  "data": {
    "id": "b2a1...",
    "complaint_code": "SCT-2026-000123",
    "status": "submitted",
    "due_date": "2026-11-02T10:00:00Z"
  }
}
```

---

## 10. Recommended Tech Stack

### Option A – MERN (recommended for beginners)
| Layer | Tech |
|-------|------|
| Frontend | React + Vite, React Router, Tailwind CSS, Axios, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File Storage | Cloudinary / AWS S3 / local `uploads/` |
| Email | Nodemailer (SMTP) |
| Validation | Zod / Joi |

### Option B – Simple stack
HTML, CSS, JavaScript + PHP/Laravel or Django + MySQL.

### Option C – Full-stack framework
Next.js + Prisma + PostgreSQL + NextAuth.

### Hosting
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas / Supabase / PlanetScale
- Version control: GitHub

---

## 11. Suggested Folder Structure (MERN)

```
student-complaint-tracker/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/        # Navbar, Sidebar, ComplaintCard, StatusBadge, Timeline
│       ├── pages/
│       │   ├── auth/
│       │   ├── student/
│       │   ├── staff/
│       │   └── admin/
│       ├── context/           # AuthContext
│       ├── hooks/
│       ├── services/          # API calls
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── config/                # db.js, env, cloudinary
│   ├── controllers/
│   ├── middleware/            # auth, role, upload, errorHandler, rateLimiter
│   ├── models/
│   ├── routes/
│   ├── services/              # emailService, notificationService
│   ├── utils/                 # generateComplaintCode, sla
│   ├── jobs/                  # cron: overdue check, auto-close
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 12. Security Requirements

- Hash passwords with bcrypt/argon2 (never store plain text)
- JWT in HttpOnly, Secure cookies; short expiry + refresh tokens
- Role-based access control (RBAC) middleware on every protected route
- Input validation & sanitization (prevent XSS, SQL/NoSQL injection)
- CSRF protection if using cookies
- Rate limiting on login and submission endpoints
- File upload restrictions: type whitelist, size limit, virus scan (optional), randomized filenames
- HTTPS everywhere; CORS restricted to your frontend domain
- Anonymous complaints: never expose `student_id` in staff/API responses
- Audit logging for sensitive actions
- Data privacy: follow institutional policy and applicable law (e.g., India's DPDP Act, 2023)
- Regular backups

---

## 13. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Complaint submitted | Student, Admin | In-app + Email |
| Assigned | Staff, Student | In-app + Email |
| Status changed | Student | In-app + Email |
| New comment | Other party | In-app |
| More info requested | Student | In-app + Email |
| Overdue / escalated | Admin, HOD | Email |
| Resolved – please confirm | Student | In-app + Email |
| Auto-closed | Student | Email |

---

## 14. Analytics & Reports

**Dashboard widgets**
- Total, Pending, In Progress, Resolved, Overdue complaints
- Complaints by category (pie/bar)
- Complaints by department
- Monthly trend (line chart)
- Average resolution time
- SLA compliance %
- Student satisfaction (average rating)
- Top recurring issues/locations

**Exports:** CSV, PDF, filter by date range, department, category, status.

---

## 15. Validation Rules

- Title: 5–150 characters
- Description: 20–2000 characters
- Email: valid format; optionally restricted to institution domain (e.g., `@college.edu`)
- Password: min 8 chars, upper + lower + number + symbol
- Attachments: ≤ 5 files, ≤ 5 MB each; `.jpg .jpeg .png .pdf`
- Edit/withdraw allowed only in *Submitted* status
- Reopen allowed within 7 days of resolution
- Rating only after Resolved/Closed

---

## 16. Business Rules

1. Every complaint gets a unique, human-readable code.
2. Rejection requires a written reason.
3. Resolution requires a summary note.
4. Resolved complaints auto-close after 7 days with no student action.
5. Duplicate complaints can be merged by admin.
6. Sensitive-category complaints go straight to the designated committee and bypass general staff.
7. Internal notes are never visible to students.
8. Students may only view their own complaints; staff only their department's.

---

## 17. Sample Seed Data

The seed script ensures the configured departments and categories exist without deleting or overwriting existing records. Fictional demo accounts are opt-in and limited to a local MongoDB database outside production.

**Local demo users** (created only with `SEED_DEMO_DATA=true` and a local MongoDB URI)
| Name | Role | Email |
|------|------|-------|
| Demo Administrator | admin | admin.demo@example.com |
| Demo Approved Staff | staff | staff.demo@example.com |
| Demo Pending Staff | staff | pending.demo@example.com |
| Demo Student | student | student.demo@example.com |

Complaints are submitted through the application; the seed script does not add sample complaint records.

---

## 18. Non-Functional Requirements

- **Performance:** Pages load < 3 seconds; API response < 500 ms for typical queries
- **Scalability:** Support 5,000+ students initially
- **Availability:** 99% uptime
- **Responsive:** Works on mobile, tablet, desktop
- **Accessibility:** WCAG 2.1 AA (labels, contrast, keyboard navigation)
- **Browser support:** Latest Chrome, Edge, Firefox, Safari
- **Maintainability:** Clean code, ESLint/Prettier, documented APIs

---

## 19. Environment Variables (`.env.example`)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/complaint-tracker
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 20. Development Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **1. Planning & Design** | Week 1 | Requirements, wireframes, DB schema |
| **2. Setup & Auth** | Week 2 | Project setup, registration/login, RBAC |
| **3. Core Complaint Module** | Weeks 3–4 | Submit, list, details, attachments, status flow |
| **4. Staff & Admin Panels** | Weeks 5–6 | Assignment, comments, user/category management |
| **5. Notifications & Feedback** | Week 7 | Email/in-app notifications, ratings, reopen |
| **6. Analytics & Reports** | Week 8 | Dashboard charts, CSV/PDF export |
| **7. Testing & Security** | Week 9 | Unit/integration tests, security review, bug fixes |
| **8. Deployment & Docs** | Week 10 | Hosting, CI/CD, user guide |

### MVP (build first)
- Student register/login
- Submit complaint with category + description
- Complaint list + status tracking
- Admin view all + update status + comment
- Basic dashboard counts

### Future Enhancements
- Anonymous reporting with encrypted identity
- Real-time chat & push notifications (WebSockets)
- SMS / WhatsApp alerts
- Mobile app (React Native / Flutter)
- AI-based category suggestion and duplicate detection
- Multilingual support (English, Hindi)
- QR codes for location-based complaints (e.g., scan in hostel)
- Public transparency board of resolved issues
- Integration with college ERP / SSO

---

## 21. Testing Plan

| Type | Tools | Focus |
|------|-------|-------|
| Unit | Jest / Vitest | Utilities, validators, controllers |
| API | Supertest / Postman | Endpoints, auth, roles |
| UI | React Testing Library | Forms, components |
| E2E | Cypress / Playwright | Submit → assign → resolve → feedback flow |
| Security | OWASP ZAP checklist | Injection, auth, file upload |
| Usability | Manual with real students | Form clarity, tracking experience |

**Key test cases**
- Student cannot see others' complaints
- Staff cannot access other departments' complaints
- Anonymous complaint hides identity in all responses
- Invalid file types rejected
- Status transitions follow the allowed workflow
- Overdue job flags and escalates correctly

---

## 22. Deployment Checklist

- [ ] Environment variables set in production
- [ ] HTTPS enabled
- [ ] Database backups scheduled
- [ ] Admin account seeded, default passwords changed
- [ ] CORS restricted
- [ ] Error logging/monitoring (Sentry / LogRocket)
- [ ] Cron jobs running (overdue check, auto-close)
- [ ] Privacy policy & terms page published
- [ ] User guide shared with students and staff

---

## 23. Success Metrics

- Average first-response time
- Average resolution time
- % complaints resolved within SLA
- Average satisfaction rating (target ≥ 4/5)
- Reopen rate (target < 10%)
- Monthly active student users

---

## 24. Glossary

| Term | Meaning |
|------|---------|
| SLA | Service Level Agreement – target response/resolution time |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token used for authentication |
| Escalation | Raising an unresolved/urgent complaint to a higher authority |
| Internal note | Staff-only comment hidden from students |

---

*Document version 1.0 – Created 31 October 2026. Adjust departments, categories, and SLA values to match your institution's policies.*
