const NotificationModel = require('../models/notificationModel');

const getNotifications = async (req, res, next) => {
    try {
        const notifications = await NotificationModel.getNotificationsForUser(req.user.id);
        res.status(200).json({ notifications });
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await NotificationModel.markAsRead(id, req.user.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Marked as read', notification });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead
};
