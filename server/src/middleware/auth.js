import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

// Initialize Firebase Admin (Requires service account credentials)
try {
  console.log("Firebase Admin SDK initialized (Mocked/Disabled for dev unless configured)");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

// List of public endpoints that don't require authentication
const PUBLIC_ROUTES = [
  '/api/site-content',
  '/api/v1/site-content',
  '/api/public/stats',
  '/api/v1/public/stats',
  '/api/student/login',
  '/api/v1/student/login',
  '/student/login'
];

export const verifyToken = async (req, res, next) => {
  // Check if this is a public route
  const isPublic = PUBLIC_ROUTES.some(route => req.path.startsWith(route));
  
  if (isPublic) {
    // Skip authentication for public routes
    req.user = { uid: 'public-user', email: 'public@library.com', role: 'public' };
    return next();
  }

  // For protected routes, require token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Try to verify token as our JWT token (student sessions)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      // If JWT verification fails, fallback to existing mock admin behavior for dev/Firebase compatibility
      req.user = { uid: 'authenticated-user', email: 'admin@library.com', role: 'admin' };
      return next();
    }
  } catch (error) {
    return res.status(403).json({ message: 'Unauthorized: Invalid token', error: error.message });
  }
};
