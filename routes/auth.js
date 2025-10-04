const express = require("express");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const apiKey = require("../middleware/apiKey");

const router = express.Router();
const usersFile = "./db/users.json";

router.post("/", apiKey, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(422).json({
            error: "Username y password son requeridos",
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    try {
        const users = await fs.readJson(usersFile);
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return res.status(401).json({
                error: "Credenciales inválidas",
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(401).json({
                error: "Credenciales inválidas",
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            data: { 
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Error interno del servidor",
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
});

module.exports = router;