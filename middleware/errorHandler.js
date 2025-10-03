module.exports = (err, req, res, next) => {
    console.error('🔴 Error:', err.message);
    
    // Manejo de errores específicos
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: "Token inválido",
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: "Token expirado",
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    // Error por defecto
    res.status(500).json({
        error: "Error interno del servidor",
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
};