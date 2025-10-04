module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; 
    console.log("Header API Key:", apiKey);
    console.log("ENV API Key:", `"${process.env.API_KEY}"`);
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            message: "API Key inválida",
            timestamp: new Date(),
            path: req.originalUrl
        });
    }
    next();
};
