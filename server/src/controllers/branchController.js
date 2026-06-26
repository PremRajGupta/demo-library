import Branch from '../models/Branch.js';
import cacheService from '../services/cacheService.js';

/**
 * Get all branches for organization
 */
export const getBranches = async (req, res) => {
  try {
    const { organizationId } = req;
    
    // Try cache first
    const cacheKey = `branches:${organizationId}`;
    let branches = await cacheService.get(cacheKey);

    if (!branches) {
      branches = await Branch.find({ organizationId })
        .sort({ createdAt: 1 });
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, branches, 3600);
    }

    res.json({
      success: true,
      data: branches,
      count: branches.length
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch branches',
      message: error.message 
    });
  }
};

/**
 * Get single branch
 */
export const getBranchById = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { organizationId } = req;

    const branch = await Branch.findOne({
      branchId,
      organizationId
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch branch',
      message: error.message 
    });
  }
};

/**
 * Create new branch
 */
export const createBranch = async (req, res) => {
  try {
    const { organizationId } = req;
    const {
      branchId,
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      manager,
      managerPhone,
      totalSeats
    } = req.body;

    // Validate required fields
    if (!branchId || !name || !address || !city) {
      return res.status(400).json({ 
        error: 'Missing required fields: branchId, name, address, city' 
      });
    }

    // Check if branch already exists
    const existingBranch = await Branch.findOne({ branchId, organizationId });
    if (existingBranch) {
      return res.status(400).json({ 
        error: 'Branch with this ID already exists' 
      });
    }

    // Create new branch
    const newBranch = new Branch({
      branchId,
      organizationId,
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      manager,
      managerPhone,
      totalSeats,
      status: 'active'
    });

    await newBranch.save();

    // Invalidate cache
    await cacheService.clearPattern(`branches:${organizationId}`);

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: newBranch
    });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ 
      error: 'Failed to create branch',
      message: error.message 
    });
  }
};

/**
 * Update branch
 */
export const updateBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { organizationId } = req;
    const updateData = req.body;

    // Don't allow changing branchId or organizationId
    delete updateData.branchId;
    delete updateData.organizationId;

    const updatedBranch = await Branch.findOneAndUpdate(
      { branchId, organizationId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Invalidate cache
    await cacheService.clearPattern(`branches:${organizationId}`);

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: updatedBranch
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ 
      error: 'Failed to update branch',
      message: error.message 
    });
  }
};

/**
 * Delete branch
 */
export const deleteBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { organizationId } = req;

    // Check if branch has students (don't delete if it does)
    const Student = require('../models/Student.js').default;
    const studentCount = await Student.countDocuments({
      branchId,
      organizationId
    });

    if (studentCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete branch with ${studentCount} students` 
      });
    }

    const deletedBranch = await Branch.findOneAndDelete({
      branchId,
      organizationId
    });

    if (!deletedBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Invalidate cache
    await cacheService.clearPattern(`branches:${organizationId}`);

    res.json({
      success: true,
      message: 'Branch deleted successfully',
      data: deletedBranch
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ 
      error: 'Failed to delete branch',
      message: error.message 
    });
  }
};

/**
 * Get branch statistics
 */
export const getBranchStats = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { organizationId } = req;

    const Student = require('../models/Student.js').default;
    const Fee = require('../models/Fee.js').default;
    const Seat = require('../models/Seat.js').default;

    // Try cache first
    const cacheKey = `stats:${branchId}`;
    let stats = await cacheService.get(cacheKey);

    if (!stats) {
      // Get statistics
      const totalStudents = await Student.countDocuments({
        branchId,
        organizationId
      });

      const activeStudents = await Student.countDocuments({
        branchId,
        organizationId,
        status: 'active'
      });

      const totalFees = await Fee.aggregate([
        { $match: { branchId, organizationId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const occupiedSeats = await Seat.countDocuments({
        branchId,
        organizationId,
        status: 'occupied'
      });

      const availableSeats = await Seat.countDocuments({
        branchId,
        organizationId,
        status: 'available'
      });

      stats = {
        totalStudents,
        activeStudents,
        totalFees: totalFees[0]?.total || 0,
        occupiedSeats,
        availableSeats,
        totalCapacity: occupiedSeats + availableSeats
      };

      // Cache for 5 minutes
      await cacheService.set(cacheKey, stats, 300);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get branch stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch branch statistics',
      message: error.message 
    });
  }
};

export default {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats
};
