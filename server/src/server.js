import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import jwt from 'jsonwebtoken';

// Routes
import studentRoutes from './routes/studentRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { getSiteContent, updateSiteContent } from './controllers/siteContentController.js';
import { getPublicStats, recordPublicVisit } from './controllers/publicStatsController.js';

// Models
import Student from './models/Student.js';
import Fee from './models/Fee.js';
import Seat from './models/Seat.js';

// Utils
import { computeStudentFeeDue } from './utils/feeDues.js';

// Middleware
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();

// ===== CORS Configuration =====
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3001',
  'https://galaxylib.com',
  'https://app.galaxylib.com',
  'https://admin.galaxylib.com',
  'https://www.galaxyhub.in',
  'https://galaxyhub.in',
  process.env.FRONTEND_URL
].filter(Boolean);

const isLocalDevOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// ===== Body Parser & Middleware =====
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===== Request Logging =====
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== Cache Control Headers (Prevent stale data) =====
app.use((req, res, next) => {
  // Disable caching for API responses
  if (req.path.startsWith('/api')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// ===== Health Check Route (No Auth Required) =====
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Library Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== Authentication Route =====
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@library.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123!';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    {
      uid: 'admin',
      email,
      role: 'admin'
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '8h' }
  );

  const user = {
    uid: 'admin',
    email,
    displayName: 'Library Admin',
    role: 'admin'
  };

  return res.json({ token, user });
});

// ===== Student Authentication Route =====
app.post(['/api/student/login', '/api/v1/student/login', '/student/login'], async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find all students matching email or studentId case-insensitively
    const emailOrId = email.trim();
    const students = await Student.find({
      $or: [
        { email: { $regex: new RegExp("^" + emailOrId + "$", "i") } },
        { studentId: { $regex: new RegExp("^" + emailOrId + "$", "i") } }
      ]
    });

    if (students.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Find the student whose password matches
    let student = null;
    for (const s of students) {
      // If student exists but does not have a password field, migrate on the fly
      if (!s.password) {
        const randomPin = Math.floor(1000 + Math.random() * 9000);
        s.password = `Galaxy@${randomPin}`;
        await s.save();
      }

      if (password === s.password) {
        student = s;
        break;
      }
    }

    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        uid: student._id.toString(),
        email: student.email,
        role: 'student',
        studentId: student.studentId,
        organizationId: student.organizationId,
        branchId: student.branchId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const user = {
      uid: student._id.toString(),
      email: student.email,
      displayName: student.name,
      role: 'student',
      studentId: student.studentId
    };

    return res.json({ token, user });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ===== PUBLIC ROUTES (Before auth middleware) =====
// Public Website Content (No Auth — home page must load/save for all visitors)
app.get('/api/v1/site-content', getSiteContent);
app.get('/api/site-content', getSiteContent);
app.put('/api/v1/site-content', updateSiteContent);
app.put('/api/site-content', updateSiteContent);

// Public landing stats (visitors + admissions for index page)
app.get('/api/v1/public/stats', getPublicStats);
app.get('/api/public/stats', getPublicStats);
app.post('/api/v1/public/stats/visit', recordPublicVisit);
app.post('/api/public/stats/visit', recordPublicVisit);

// ===== AUTHENTICATION MIDDLEWARE (Protects all /api routes below this) =====
app.use('/api/v1', verifyToken);
app.use('/api', verifyToken);

// ===== Student Me Route (Returns logged-in student details) =====
app.get(['/api/v1/student/me', '/api/student/me'], async (req, res) => {
  try {
    const userId = req.user.uid;
    const role = req.user.role;

    if (role !== 'student') {
      return res.status(403).json({ message: 'Access denied: Not a student' });
    }

    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    // Fetch fee records
    const fees = await Fee.find({ studentId: student._id }).sort({ paymentDate: -1 });

    // Compute dues
    const dues = computeStudentFeeDue({
      monthlyFee: student.feeAmount,
      joiningDate: student.joiningDate || student.admissionDate,
      payments: fees
    });

    // Fetch seat details if available
    let seat = null;
    if (student.seatNumber && student.seatNumber !== '--') {
      seat = await Seat.findOne({
        seatNumber: student.seatNumber,
        organizationId: student.organizationId,
        branchId: student.branchId
      });
    }

    // Compute advance payment validity (Matching Admin Dashboard logic)
    const monthlyFee = Number(student.feeAmount) || 0;
    const joinDateStr = student.joiningDate || student.admissionDate;

    // Helper functions matching feeController.js
    const toDateOnly = (value) => {
      if (!value) return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    };

    const formatDateOnly = (value) => {
      if (!value) return null;
      const date = value instanceof Date ? new Date(value) : toDateOnly(value);
      if (!date) return null;
      date.setHours(0, 0, 0, 0);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const addBillingMonths = (startDate, months) => {
      const wholeMonths = Math.max(0, Math.floor(months));
      const originalDay = startDate.getDate();
      const endDate = new Date(startDate);
      endDate.setHours(0, 0, 0, 0);
      endDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + wholeMonths);
      const lastDayOfTargetMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
      endDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));
      return endDate;
    };

    const getBillablePeriodCount = (startDate, asOf) => {
      if (asOf < startDate) return 0;
      let count = 0;
      while (addBillingMonths(startDate, count) <= asOf) {
        count += 1;
      }
      return count;
    };

    const calculateValidityFromAmount = (startDate, amount, monthFee) => {
      const safeAmount = Math.max(0, Number(amount) || 0);
      const safeMonthlyFee = Math.max(0, Number(monthFee) || 0);
      if (!safeMonthlyFee) {
        return { monthsCovered: 0, validUntil: new Date(startDate) };
      }
      const fullMonthsCovered = Math.floor(safeAmount / safeMonthlyFee);
      const validUntil = addBillingMonths(startDate, fullMonthsCovered);
      return { monthsCovered: fullMonthsCovered, validUntil };
    };

    let validity = {
      hasPaymentHistory: false,
      hasAdvancePayment: false,
      isAdvancePayment: false,
      monthsCovered: 0,
      advanceMonths: 0,
      validUntilDate: null,
      advanceStartDate: null,
      advanceValidUntilDate: null,
      daysRemaining: 0,
      rawDaysRemaining: 0,
      paymentStatus: 'no-payment',
      monthlyFee,
      totalPaid: 0,
    };

    try {
      const startDate = toDateOnly(joinDateStr);
      if (monthlyFee > 0 && startDate) {
        const totalPaid = fees.reduce((sum, fee) => {
          const feeCredit = fee.feeCreditAmount !== undefined ? fee.feeCreditAmount : fee.amount;
          return sum + (Number(feeCredit) || 0);
        }, 0);

        const { monthsCovered, validUntil } = calculateValidityFromAmount(startDate, totalPaid, monthlyFee);

        if (monthsCovered > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const daysRemaining = Math.floor((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          let paymentStatus = 'valid';
          if (daysRemaining < 0) paymentStatus = 'expired';
          else if (daysRemaining <= 15) paymentStatus = 'expiring-soon';

          const currentPeriodCount = getBillablePeriodCount(startDate, today);
          const advanceMonths = Math.max(0, monthsCovered - currentPeriodCount);
          const hasComputedAdvance = advanceMonths > 0;
          const advanceStartDate = hasComputedAdvance ? addBillingMonths(startDate, currentPeriodCount) : null;

          validity = {
            hasPaymentHistory: totalPaid > 0,
            hasAdvancePayment: hasComputedAdvance,
            isAdvancePayment: hasComputedAdvance,
            monthsCovered,
            advanceMonths,
            validUntilDate: formatDateOnly(validUntil),
            advanceStartDate: formatDateOnly(advanceStartDate),
            advanceValidUntilDate: hasComputedAdvance ? formatDateOnly(validUntil) : null,
            daysRemaining: Math.max(0, daysRemaining),
            rawDaysRemaining: daysRemaining,
            paymentStatus,
            monthlyFee,
            totalPaid,
          };
        } else {
          validity.hasPaymentHistory = totalPaid > 0;
          validity.totalPaid = totalPaid;
        }
      }
    } catch (err) {
      console.error('Error computing advance payment validity:', err);
    }

    // Removed duplicate validity variable

    return res.json({
      student,
      fees,
      seat,
      dues,
      validity
    });
  } catch (error) {
    console.error('Fetch student/me error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ===== PROTECTED API Routes (v1) =====
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/seats', seatRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);

// ===== API Routes (Legacy) =====
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// ===== Error Handling Middleware =====
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'CORS not allowed') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== Database Connection =====
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/demo_library';
const EXPECTED_DATABASE_NAME = process.env.EXPECTED_DATABASE_NAME || 'demo_library';

const getMongoDatabaseName = (uri) => {
  try {
    const parsed = new URL(uri);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, '').split('/')[0] || '');
  } catch {
    return uri.split('?')[0].split('/').pop() || '';
  }
};

const DATABASE_NAME = getMongoDatabaseName(MONGODB_URI);

// Only start server and connect to DB if not in test mode
if (process.env.NODE_ENV !== 'test') {
  if (DATABASE_NAME !== EXPECTED_DATABASE_NAME && process.env.ALLOW_NON_DEMO_DATABASE !== 'true') {
    console.error(
      `Refusing to start: MONGODB_URI points to "${DATABASE_NAME}", expected "${EXPECTED_DATABASE_NAME}".`
    );
    console.error('Set MONGODB_URI to the demo database to avoid modifying the sold/live project.');
    process.exit(1);
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log(`✓ V1 API available at http://localhost:${PORT}/api/v1`);
    console.log(`✓ Health check at http://localhost:${PORT}/api/health`);
    console.log(`${'='.repeat(60)}\n`);
  });

  // Connect to MongoDB with retry mechanism
  const connectDB = async () => {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 5
      });
      console.log('✓ Connected to MongoDB successfully');
      console.log(`✓ Database: ${DATABASE_NAME}\n`);
    } catch (error) {
      console.warn('⚠ MongoDB connection failed. Retrying in 5 seconds...');
      console.warn(`  Error: ${error.message}`);
      setTimeout(connectDB, 5000);
    }
  };

  connectDB();
}

// ===== Graceful Shutdown =====
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✓ MongoDB connection closed');
  process.exit(0);
});

export default app;
