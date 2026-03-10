// Comprehensive centralized error handler
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    if (err.stack && process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Handle specific database errors (example: unique constraint violation in Postgres)
    if (err.code === '23505') {
        return res.status(409).json({
            status: 'error',
            message: 'Resource already exists.',
        });
    }

    // Cast Error / Not Found / Bad Request formatting could go here
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: err.message,
        });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), // Only include stack in dev
    });
};

module.exports = errorHandler;
