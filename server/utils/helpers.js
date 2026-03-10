// Utility helpers for common functions (e.g., date formats, response standardizers)
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

module.exports = {
    formatDate,
};
