import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const departmentsData = [
  { name: 'Academic Office', code: 'ACAD', email: 'academic@college.edu', description: 'Curriculum, classes, attendance, grading' },
  { name: 'Hostel Administration', code: 'HOSTEL', email: 'hostel@college.edu', description: 'Hostel rooms, water, electricity, wardens' },
  { name: 'Library Services', code: 'LIB', email: 'library@college.edu', description: 'Book lending, study halls, digital library' },
  { name: 'Campus Maintenance', code: 'MAINT', email: 'maintenance@college.edu', description: 'Classroom repairs, washrooms, electrical' },
  { name: 'IT & Network Services', code: 'IT', email: 'itsupport@college.edu', description: 'Wi-Fi, student portal, email services' },
  { name: 'Examination Cell', code: 'EXAM', email: 'examcell@college.edu', description: 'Hall tickets, exam scheduling, grade cards' },
  { name: 'Accounts Office', code: 'ACC', email: 'accounts@college.edu', description: 'Fee receipts, refunds, scholarship verification' },
  { name: 'Anti-Ragging Committee', code: 'RAGGING', email: 'antiragging@college.edu', description: 'Confidential discipline and harassment investigations' },
  { name: 'Transport Office', code: 'TRANS', email: 'transport@college.edu', description: 'University bus routes, timings, bus passes' },
  { name: 'Canteen & Mess Committee', code: 'CANT', email: 'canteen@college.edu', description: 'Food quality, mess menu, dining hygiene' },
];

const categoriesData = [
  { name: 'Academic & Grading Issues', departmentCode: 'ACAD', default_priority: 'medium', description: 'Discrepancies in attendance or grades' },
  { name: 'Hostel Facilities & Rooms', departmentCode: 'HOSTEL', default_priority: 'high', description: 'Hostel maintenance, water, electricity' },
  { name: 'Library & Learning Resources', departmentCode: 'LIB', default_priority: 'low', description: 'Book availability, fine errors, timings' },
  { name: 'Classroom & Campus Infrastructure', departmentCode: 'MAINT', default_priority: 'medium', description: 'Projectors, fans, broken desks, washrooms' },
  { name: 'Campus Wi-Fi & IT Portals', departmentCode: 'IT', default_priority: 'medium', description: 'Wi-Fi connectivity, login problems' },
  { name: 'Exam & Result Corrections', departmentCode: 'EXAM', default_priority: 'high', description: 'Hall ticket omissions, re-evaluation delay' },
  { name: 'Fees & Scholarship Delays', departmentCode: 'ACC', default_priority: 'high', description: 'Fee clearance, delayed scholarship disbursal' },
  { name: 'Harassment & Safety Concerns', departmentCode: 'RAGGING', default_priority: 'critical', is_sensitive: true, description: 'Bullying, ragging, discrimination (strictly confidential)' },
  { name: 'Bus Transport & Route Delays', departmentCode: 'TRANS', default_priority: 'low', description: 'Bus breakdown, timing issues, overcrowding' },
  { name: 'Mess Food Quality & Hygiene', departmentCode: 'CANT', default_priority: 'medium', description: 'Food hygiene, catering timings, mess menu' },
];

const demoAccounts = [
  {
    name: 'Demo Administrator',
    email: 'admin.demo@example.com',
    password: 'LocalOnly-Admin-Demo-2026!',
    role: 'admin',
    status: 'approved',
  },
  {
    name: 'Demo Student',
    email: 'student.demo@example.com',
    password: 'LocalDemo-Student-2026!',
    role: 'student',
    status: 'approved',
    enrollment_number: 'DEMO-STU-001',
    departmentCode: 'ACAD',
    department_name: 'Academic Office',
    course: 'Sample Computing Course',
    academic_year: '1st Year',
  },
  {
    name: 'Demo Approved Staff',
    email: 'staff.demo@example.com',
    password: 'LocalDemo-Staff-2026!',
    role: 'staff',
    status: 'approved',
    employee_id: 'DEMO-STAFF-001',
    departmentCode: 'IT',
    department_name: 'IT & Network Services',
  },
  {
    name: 'Demo Pending Staff',
    email: 'pending.demo@example.com',
    password: 'LocalDemo-Pending-2026!',
    role: 'staff',
    status: 'pending',
    employee_id: 'DEMO-STAFF-002',
    departmentCode: 'ACAD',
    department_name: 'Academic Office',
  },
];

const isLocalMongoUri = (uri) => {
  try {
    const hostname = new URL(uri).hostname;
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return false;
  }
};

const createInitialAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (email && await User.findOne({ email })) {
    console.log('[Seed] Admin email already exists; existing user was left unchanged.');
    return;
  }

  if (!email || !password || password.length < 16) {
    console.warn('[Seed] Configured administrator was not created: set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters.');
    return;
  }

  await User.create({
    name: process.env.ADMIN_NAME?.trim() || 'CampusVoice Administrator',
    email,
    password,
    role: 'admin',
    status: 'approved',
    email_verified: true,
  });
  console.log('[Seed] Initial administrator created from the private ADMIN_* environment settings.');
};

const seedDemoAccounts = async (departmentByCode) => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('[Seed] Local demo accounts skipped (set SEED_DEMO_DATA=true to opt in).');
    return;
  }
  if (process.env.NODE_ENV === 'production' || !isLocalMongoUri(uri)) {
    throw new Error('Demo accounts are allowed only with a local MongoDB URI outside production.');
  }

  for (const demo of demoAccounts) {
    const existingUser = await User.findOne({ email: demo.email });
    if (existingUser) {
      console.log(`[Seed] Demo account ${demo.email} already exists; left unchanged.`);
      continue;
    }

    const { departmentCode, ...account } = demo;
    await User.create({
      ...account,
      department: departmentCode ? departmentByCode[departmentCode]._id : undefined,
      email_verified: true,
    });
    console.log(`[Seed] Created local demo account: ${demo.email} (${demo.role}, ${demo.status}).`);
  }
};

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri?.trim()) {
    throw new Error('MONGODB_URI is not configured in server/.env.');
  }
  if (
    process.env.SEED_DEMO_DATA === 'true' &&
    (process.env.NODE_ENV === 'production' || !isLocalMongoUri(mongoUri))
  ) {
    throw new Error('Demo accounts are allowed only with a local MongoDB URI outside production.');
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DATABASE || 'campusvoice',
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[Seed] Connected to configured MongoDB database.');

    const departmentByCode = {};
    for (const department of departmentsData) {
      const savedDepartment = await Department.findOneAndUpdate(
        { name: department.name },
        { $setOnInsert: department },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      departmentByCode[department.code] = savedDepartment;
    }
    console.log(`[Seed] Departments ensured: ${departmentsData.length}.`);

    for (const category of categoriesData) {
      const { departmentCode, ...categoryFields } = category;
      await Category.findOneAndUpdate(
        { name: category.name },
        {
          $setOnInsert: {
            ...categoryFields,
            default_department: departmentByCode[departmentCode]._id,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Seed] Categories ensured: ${categoriesData.length}.`);

    await createInitialAdmin();
    await seedDemoAccounts(departmentByCode);
    console.log('[Seed] Completed. Existing records were not updated or deleted.');
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase().catch((error) => {
  console.error(`[Seed Error] ${error.message}`);
  process.exitCode = 1;
});
