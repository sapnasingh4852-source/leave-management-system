const Leave = require('../models/Leave');

// Valid leave types list for validation
const VALID_LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Emergency Leave', 'Other'];

// @desc    Apply for a new leave
// @route   POST /api/leaves
// @access  Authenticated User
const createLeave = async (req, res, next) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;

        // 1. Validation for required fields
        if (!leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({ message: 'All fields (leaveType, fromDate, toDate, reason) are required' });
        }

        // 2. Validate leave type
        if (!VALID_LEAVE_TYPES.includes(leaveType)) {
            return res.status(400).json({ message: `Invalid leave type. Must be one of: ${VALID_LEAVE_TYPES.join(', ')}` });
        }

        // 3. Validate dates: toDate cannot be earlier than fromDate
        const start = new Date(fromDate);
        const end = new Date(toDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            return res.status(400).json({ message: 'From date cannot be earlier than today' });
        }

        if (end < start) {
            return res.status(400).json({ message: 'To date cannot be earlier than from date' });
        }

        // 4. Create leave record
        // Always take employee from req.user._id (JWT) and force initial status to 'Pending'
        const leave = await Leave.create({
            employee: req.user._id,
            leaveType,
            fromDate: start,
            toDate: end,
            reason,
            status: 'Pending'
        });

        // Populate employee info for response
        const populatedLeave = await Leave.findById(leave._id).populate('employee', 'name email');

        res.status(201).json({
            message: 'Leave applied successfully',
            leave: populatedLeave
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get leaves (Admin: all leaves, User: own leaves)
// @route   GET /api/leaves
// @access  Authenticated User / Admin
const getLeaves = async (req, res, next) => {
    try {
        let leaves;

        if (req.user.role === 'admin') {
            // Admin sees all leaves
            leaves = await Leave.find()
                .populate('employee', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // Normal user sees only their own leaves
            leaves = await Leave.find({ employee: req.user._id })
                .populate('employee', 'name email')
                .sort({ createdAt: -1 });
        }

        res.status(200).json(leaves);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single leave by ID
// @route   GET /api/leaves/:id
// @access  Authenticated User (own leave) / Admin (any leave)
const getLeaveById = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employee', 'name email');

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        // Check ownership if user is not admin
        if (req.user.role !== 'admin' && leave.employee._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: You can only view your own leave' });
        }

        res.status(200).json(leave);
    } catch (error) {
        // Handle invalid MongoDB ObjectId error
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid leave ID' });
        }
        next(error);
    }
};

// @desc    Update a leave
// @route   PUT /api/leaves/:id
// @access  Authenticated User (own leave while Pending) / Admin
const updateLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        const { leaveType, fromDate, toDate, reason } = req.body;

        // If user is not admin
        if (req.user.role !== 'admin') {
            // Must be the owner
            if (leave.employee.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied: You can only edit your own leave' });
            }

            // Normal user can only edit while Pending
            if (leave.status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot edit leave that is already Approved or Rejected' });
            }
        }

        // Validate leave type if provided
        if (leaveType && !VALID_LEAVE_TYPES.includes(leaveType)) {
            return res.status(400).json({ message: `Invalid leave type. Must be one of: ${VALID_LEAVE_TYPES.join(', ')}` });
        }

        // Validate dates if provided
        const newFrom = fromDate ? new Date(fromDate) : leave.fromDate;
        const newTo = toDate ? new Date(toDate) : leave.toDate;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (fromDate && newFrom < today) {
            return res.status(400).json({ message: 'From date cannot be earlier than today' });
        }

        if (newTo < newFrom) {
            return res.status(400).json({ message: 'To date cannot be earlier than from date' });
        }

        // Apply updates
        if (leaveType) leave.leaveType = leaveType;
        if (fromDate) leave.fromDate = newFrom;
        if (toDate) leave.toDate = newTo;
        if (reason) leave.reason = reason;

        // Note: status cannot be modified via PUT by normal users.
        // Admin could update status or use specific approve/reject endpoints.
        if (req.user.role === 'admin' && req.body.status) {
            if (['Pending', 'Approved', 'Rejected'].includes(req.body.status)) {
                leave.status = req.body.status;
            }
        }

        await leave.save();

        const updatedLeave = await Leave.findById(leave._id).populate('employee', 'name email');

        res.status(200).json({
            message: 'Leave updated successfully',
            leave: updatedLeave
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid leave ID' });
        }
        next(error);
    }
};

// @desc    Delete a leave
// @route   DELETE /api/leaves/:id
// @access  Authenticated User (own leave while Pending) / Admin
const deleteLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        // User restrictions
        if (req.user.role !== 'admin') {
            // Must be the owner
            if (leave.employee.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied: You can only delete your own leave' });
            }

            // Normal user can only delete while Pending
            if (leave.status !== 'Pending') {
                return res.status(400).json({ message: 'Cannot cancel/delete leave that is already Approved or Rejected' });
            }
        }

        await Leave.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Leave deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid leave ID' });
        }
        next(error);
    }
};

// @desc    Approve a leave application
// @route   PATCH /api/leaves/:id/approve
// @access  Admin only
const approveLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        leave.status = 'Approved';
        await leave.save();

        const updatedLeave = await Leave.findById(leave._id).populate('employee', 'name email');

        res.status(200).json({
            message: 'Leave approved successfully',
            leave: updatedLeave
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid leave ID' });
        }
        next(error);
    }
};

// @desc    Reject a leave application
// @route   PATCH /api/leaves/:id/reject
// @access  Admin only
const rejectLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        leave.status = 'Rejected';
        await leave.save();

        const updatedLeave = await Leave.findById(leave._id).populate('employee', 'name email');

        res.status(200).json({
            message: 'Leave rejected successfully',
            leave: updatedLeave
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid leave ID' });
        }
        next(error);
    }
};

module.exports = {
    createLeave,
    getLeaves,
    getLeaveById,
    updateLeave,
    deleteLeave,
    approveLeave,
    rejectLeave
};
