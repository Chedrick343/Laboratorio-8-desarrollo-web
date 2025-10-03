const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Token de autorización requerido",
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Token inválido o expirado",
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: "Usuario no autenticado",
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Acceso denegado. Se requieren los roles: ${allowedRoles.join(', ')}`,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }

        next();
    };
};

module.exports = {
    authenticateJWT,
    authorizeRoles
};