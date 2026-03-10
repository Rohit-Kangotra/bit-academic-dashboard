const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/dashboard-stats', adminController.getAdminDashboardStats);

// Excel Upload Endpoints
router.post('/import-preview', upload.single('file'), adminController.importPreview);
router.post('/import-commit', adminController.importCommit);

module.exports = router;
