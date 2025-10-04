const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const usersFile = "./db/users.json"; // misma ruta que usas en auth.js

async function createUser() {
    try {
        // Contraseña a hashear
        const plainPassword = "1234";

        // Generar hash
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Nuevo usuario
        const newUser = {
            id: uuidv4(),
            username: "usuarioNuevo2",
            password: hashedPassword,
            role: "admin"
        };

        // Leer archivo actual o inicializar
        let users = [];
        if (await fs.pathExists(usersFile)) {
            users = await fs.readJson(usersFile);
        }

        // Agregar usuario
        users.push(newUser);

        // Guardar de nuevo
        await fs.writeJson(usersFile, users, { spaces: 2 });

        console.log("✅ Usuario creado con éxito:");
        console.log(newUser);
        console.log(`Password plano era: ${plainPassword}`);
    } catch (err) {
        console.error("❌ Error creando usuario:", err);
    }
}

createUser();
