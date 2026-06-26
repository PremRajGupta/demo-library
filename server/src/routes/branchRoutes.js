import express from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats
} from '../controllers/branchController.js';
import { multiTenantMiddleware, validateBranchAccess, requireRole } from '../middleware/multiTenant.js';

const router = express.Router();

// Apply middleware
router.use(multiTenantMiddleware);

/**
 * GET /api/v1/branches
 * Get all branches for organization
 */
router.get('/', getBranches);

/**
 * GET /api/v1/branches/:branchId/stats
 * Get branch statistics
 */
router.get('/:branchId/stats', getBranchStats);

/**
 * GET /api/v1/branches/:branchId
 * Get single branch
 */
router.get('/:branchId', getBranchById);

/**
 * POST /api/v1/branches
 * Create new branch (admin only)
 */
router.post('/', requireRole(['admin', 'manager']), createBranch);

/**
 * PUT /api/v1/branches/:branchId
 * Update branch
 */
router.put('/:branchId', requireRole(['admin', 'manager']), updateBranch);

/**
 * DELETE /api/v1/branches/:branchId
 * Delete branch
 */
router.delete('/:branchId', requireRole(['admin']), deleteBranch);

export default router;
