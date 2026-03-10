const AnalyticsService = require('../services/analyticsService');
const ExcelImportService = require('../services/excelImportService');
const path = require('path');
const fs = require('fs');

const getAdminDashboardStats = async (req, res, next) => {
    try {
        const stats = await AnalyticsService.getAdminDashboardStats();
        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

const importPreview = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const filePath = req.file.path;

        // Use service to just read and slice the first 10 rows
        const previewData = await ExcelImportService.previewExcel(filePath);

        // Do not delete file yet - keep it in /uploads/ for the commit stage!
        res.status(200).json(previewData);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(error);
    }
};

const importCommit = async (req, res, next) => {
    try {
        if (!req.body.filePath) return res.status(400).json({ message: 'Missing file path reference' });

        const filePath = req.body.filePath;
        const originalName = req.body.originalName.toLowerCase();
        let recordsProcessed = 0;

        if (originalName.includes('student')) {
            recordsProcessed = await ExcelImportService.importStudents(filePath);
        } else if (originalName.includes('faculty')) {
            recordsProcessed = await ExcelImportService.importFaculty(filePath);
        } else if (originalName.includes('attendance')) {
            recordsProcessed = await ExcelImportService.importAttendance(filePath);
        } else if (originalName.includes('placementapplications')) {
            recordsProcessed = await ExcelImportService.importPlacementApplications(filePath);
        } else if (originalName.includes('placementdrives')) {
            recordsProcessed = await ExcelImportService.importPlacementDrives(filePath);
        } else if (originalName.includes('activities')) {
            recordsProcessed = await ExcelImportService.importActivities(filePath);
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Unknown file type validation failed.' });
        }

        fs.unlinkSync(filePath);

        res.status(200).json({
            message: `Successfully imported ${recordsProcessed} records.`
        });

    } catch (error) {
        if (req.body.filePath && fs.existsSync(req.body.filePath)) {
            fs.unlinkSync(req.body.filePath);
        }
        next(error);
    }
};

module.exports = {
    getAdminDashboardStats,
    importPreview,
    importCommit,
};
