// utils/response.js
function success(res, data, status = 200) {
    return res.status(status).json({
        timestamp: new Date().toISOString(),
        path: res.req.originalUrl,
        status,
        data,
    });
}

function error(res, message, status = 500) {
    return res.status(status).json({
        timestamp: new Date().toISOString(),
        path: res.req.originalUrl,
        status,
        error: message,
    });
}

module.exports = { success, error };
