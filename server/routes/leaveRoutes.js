const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Student Route
router.post('/apply', roleMiddleware(['student']), leaveController.applyLeave);
router.get('/student', roleMiddleware(['student']), leaveController.getStudentLeaves);

// Approval Routes (Faculty / Admin)
router.get('/pending', roleMiddleware(['faculty', 'admin']), leaveController.getPendingLeaves);
router.put('/:id/approve', roleMiddleware(['faculty', 'admin']), leaveController.approveLeave);

module.exports = router;
