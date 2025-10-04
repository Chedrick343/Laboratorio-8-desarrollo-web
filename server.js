const express = require("express");
require("dotenv").config();

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Ruta de prueba ANTES de cargar las rutas principales
app.get("/", (req, res) => {
    res.json({ 
        message: "✅ API Laboratorio 9 funcionando",
        timestamp: new Date().toISOString()
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        timestamp: new Date().toISOString() 
    });
});

// CARGAR RUTAS CON MANEJO DE ERRORES
try {
    console.log("🔧 Cargando rutas...");
    
    const authRoutes = require("./routes/auth");
    const productsRoutes = require("./routes/products");
    
    app.use("/auth", authRoutes);
    app.use("/products", productsRoutes);
    
    console.log("✅ Rutas cargadas correctamente");
} catch (error) {
    console.error("❌ Error cargando rutas:", error.message);
}

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Middleware de errores simplificado
app.use((err, req, res, next) => {
    console.error('🔴 Error:', err.message);
    res.status(500).json({
        error: "Error interno del servidor",
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Endpoints disponibles:`);
    console.log(`   GET  /`);
    console.log(`   GET  /health`);
    console.log(`   POST /auth/login`);
    console.log(`   GET  /products`);
});