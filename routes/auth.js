const express = require("express");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const apiKey = require("../middleware/apiKey");
const { success, error } = require("../utils/response.js");

const router = express.Router();
const usersFile = "./db/users.json";


router.post("/login", apiKey, async (req, res) => { //VALIDAMOS EL APIKEY
    const { username, password } = req.body; //OBTENEMOS LOS ELEMENTOS ENVIADOS

    try {
        const users = await fs.readJson(usersFile); //LEEMOS LOS USUARIOS
        const user = users.find(u => u.username === username); //BUSCAMOS EL NOMBRE DE USUARIO
        if (!user) return error(res, "Usuario no encontrado", 401); //SI NO ENCONTRAMOS EL USUARIO DEVOLVEMOS ERROR

        const validPass = await bcrypt.compare(password, user.password); //SI LO ENCONTRAMOS ENTONCES COMPARAMOS LA CONTRASENIA
        if (!validPass) return error(res, "Credenciales inválidas", 401); //SI NO ES VALIDA DEVOLVEMOS ERROR

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, //LE DAMOS UN TOKEN AL CLIENTE
            process.env.JWT_SECRET,
            { expiresIn: "1h" } //EXPIRA EN 1 HORA
        );

        return success(res, { token }, 200); //Retornamos respuesta exitosa
    } catch (err) {
        return error(res, err.message, 500); //si da algun error retornamos error
    }
});

module.exports = router;
