import jwt from 'jsonwebtoken';
import ApiKey from '../models/ApiKey.js';

/**
 * Multi-tenant middleware
 * Extracts organization and branch from token or API key
 * Adds to request object for use in controllers
 */
export const multiTenantMiddleware = async (req, res, next) => {
  try {
    let organizationId, branchId, clientType;

    // Check for API Key (for mobile apps, third-party)
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey) {
      // Verify API key
      const keyRecord = await ApiKey.findOne({ 
        apiKey,
        isActive: true,
        isRevoked: false
      });

      if (!keyRecord) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Check if expired
      if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
        return res.status(401).json({ error: 'API key expired' });
      }

      organizationId = keyRecord.organizationId;
      clientType = keyRecord.clientType;
      
      // Update last used timestamp
      await ApiKey.updateOne(
        { apiKey },
        { 
          lastUsedAt: new Date(),
          $inc: { requestCount: 1 }
        }
      );
    } else {
      // Get from JWT token (for web browsers)
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        organizationId = decoded.organizationId;
        branchId = decoded.branchId;
        clientType = 'web';
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Get branchId from query if not in token (allow override)
    if (req.query.branch) {
      branchId = req.query.branch;
    }

    // If no branchId yet, get default from database
    if (!branchId) {
      const Branch = require('../models/Branch.js').default;
      const defaultBranch = await Branch.findOne({ organizationId });
      if (defaultBranch) {
        branchId = defaultBranch.branchId;
      } else {
        // Fallback to any branch
        branchId = 'default';
      }
    }

    // Add to request for use in controllers
    req.organizationId = organizationId;
    req.branchId = branchId;
    req.clientType = clientType;

    // Add helper for filtering queries
    req.getTenantFilter = () => ({
      organizationId,
      branchId
    });

    next();
  } catch (error) {
    console.error('Multi-tenant middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Branch validation middleware
 * Ensures user has access to requested branch
 */
export const validateBranchAccess = async (req, res, next) => {
  try {
    const { organizationId, branchId } = req;
    
    // In production, verify user has access to this branch
    // For now, just ensure it belongs to their organization
    
    const Branch = require('../models/Branch.js').default;
    const branch = await Branch.findOne({ 
      branchId, 
      organizationId 
    });

    if (!branch) {
      return res.status(403).json({ 
        error: 'Access denied to this branch' 
      });
    }

    req.branch = branch;
    next();
  } catch (error) {
    console.error('Branch validation error:', error);
    res.status(500).json({ error: 'Authorization error' });
  }
};

/**
 * Role-based access control
 * Check if user has required role
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.userRole || 'user'; // Get from JWT
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

export default {
  multiTenantMiddleware,
  validateBranchAccess,
  requireRole
};
