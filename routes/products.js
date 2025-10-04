const express = require("express"); //ESTO SON COSAS DE EXPRESS ESPECIFICAMENTE
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid"); //HASTA AQUI
const apiKey = require("../middleware/apiKey");//AQUI IMPORTAMOS LA FUNCION PARA VALIDAR LA PAIKEY
const { authenticateJWT, authorizeRoles } = require("../middleware/auth"); //AHORA TRAEMOS LA AUTENTICACION DEL JWT Y DE LOS ROLES
const { success, error } = require("../utils/response.js");

const router = express.Router(); //ROUTER PARA CREAR LAS RUTAS
const productsFile = "./db/products.json"; //PROUDCTOS EN LA BASE DE DATOS


router.get("/", apiKey, async (req, res) => {//VALIDAMOS LA CLAVE
    try {
        const { page = 1, limit = 10 } = req.query; //TOMAMOS LOS PARAMETROS DE LA CONSULTA
        const products = await fs.readJson(productsFile); //LEEMOS LOS PRODUCTOS EN LA BASE DE DATOS

        const start = (Number(page) - 1) * Number(limit); // CALCULAMOS EL INICIO DEL START
        const end = start + Number(limit); //CALCULAMOS EL FINAL DEL SLICE
        const paginated = products.slice(start, end); //DEVUELVE LOS ELEMENTOS DESDE START HASTA END


        if (req.accepts("xml")) { //SI LA CONSULTA ACEPTA XML
            const xml = require("xmlbuilder"); 
            const xmlData = xml.create("products"); // CREAMOS LA RAIZ PRODUCTS
            paginated.forEach(p => xmlData.ele("product", p)); //AGREGAMOS LOS PRODUCTOS UNO POR UNO
            return res.type("application/xml").send(xmlData.end({ pretty: true })); //EVIAMOS LA RESPUESTA COMO XML
        }

        return success(res, paginated, 200); //SI NO SOLICITA XML ENTONCES LO DEVOLVEMOS COMO JSON
    } catch (err) {
        return error(res, err.message, 500); //SI OCURRE ALGUN ERROR SE RETORNA EL MENSAJE CON CODIGO 500
    }
});

router.get("/:id", apiKey, async (req, res) => { //PROTEGEMOS LA RUTA CON APIKEY
    try {
        const products = await fs.readJson(productsFile);//LEEMOS LOS PRODUCTOS
        const product = products.find(p => p.id === req.params.id);//OBTENEMOS EL PRODUCTO QUE SE BUSCA

        if (!product) return error(res, "Producto no encontrado", 404); //SI NO ENCONTRAMOS NADA DEVOLVEMOS 404
        return success(res, product, 200); //SI ENCONTRAMOS ALGO DEVOLVEMOS PRODUCTO
    } catch (err) {
        return error(res, err.message, 500); //SI DA ALGUN ERROR DEVOLVEMOS EL ERROR CON NUMERO 500
    }
});


router.post("/", authenticateJWT, authorizeRoles("editor", "admin"), async (req, res) => {
    const { name, sku, price, stock, category } = req.body;//OBTENEMOS LOS PARAMETROS DEL NUEVO PRODUCTO

    if (!name || !sku || price <= 0 || stock < 0 || !category) {
        return error(res, "Datos inválidos", 422); //VALIDAMOS LOS DATOS
    }

    try {
        const products = await fs.readJson(productsFile); //GUARDAMOS LOS PRODUCTOS EN ESTA CONSTANTE

        if (products.find(p => p.sku === sku)) {
            return error(res, "SKU ya existe", 409); //SI EXISTE SKU ENTONCES DEVOLVEMOS ERROR
        }

        const newProduct = { id: uuidv4(), name, sku, price, stock, category }; //CREAMOS UN NUEVO PRODUCTO
        products.push(newProduct); //COLOCAMOS UN NUEVO PRODUCTO EN LOS PRODUCTOS

        await fs.writeJson(productsFile, products, { spaces: 2 }); //INSERTAMOS EN LA BASE DE DATOS
        return success(res, newProduct, 201); //DEVOLVEMOS 201 COMO MENSAJE DE EXITO
    } catch (err) {
        return error(res, err.message, 500); //SI NO DEVOLVEMOS ERROR
    }
});

router.put("/:id", authenticateJWT, authorizeRoles("editor", "admin"), async (req, res) => {
    const { name, sku, price, stock, category } = req.body; //OBTENEMOS LOS ELEMENTOS DE LA BASE DE DATOS

    if (!name || !sku || price <= 0 || stock < 0 || !category) {
        return error(res, "Datos inválidos", 422); //SI ALGUN ELEMENTO NO CUMPLE LAS CONDICIONES SE RETORNA ERROR CON CODIGO 422
    }

    try {
        const products = await fs.readJson(productsFile); //OBTENEMOS LOS PRODUCTOS
        const index = products.findIndex(p => p.id === req.params.id); //BUSCAMOS EL PRODUCTO A ACTUALIZAR
        if (index === -1) return error(res, "Producto no encontrado", 404); //SI NO SE ENCUENTRA DEVOLVEMOS ERROR CON CODIGO 404

        // verificar SKU duplicado en otro producto
        const skuExists = products.find(p => p.sku === sku && p.id !== req.params.id); //VERIFICAMOS QUE NO SE DUPLIQUEN LOS ELEMENTOS
        if (skuExists) return error(res, "SKU ya existe", 409); //SI SE DUPLICAN DEVOLVEMOSS ERROR CON CODIGO 409

        products[index] = { ...products[index], name, sku, price, stock, category }; //ACTUALIZAMOS Y MANTENEMOS ELEMENTOS QUE NO CAMBIARON
        await fs.writeJson(productsFile, products, { spaces: 2 }); //ESCRIBIMOS DE NUEVO EN LA BASE DE DATOS

        return success(res, products[index], 200); // SI FUNCIONA ENTONCES DEVOLVEMOS SUCCES CON CODIGO 200
    } catch (err) {
        return error(res, err.message, 500); //SI FALLA POR ALGUNA RAZON DEVOLVEMOS EL MENSAJE DE ERROR Y SU CODIGO 500
    }
});

router.delete("/:id", authenticateJWT, authorizeRoles("admin"), async (req, res) => { //AUTENTICAMOS EL ROL
    try {
        const products = await fs.readJson(productsFile); //LEEMOS LOS PRODUCTOS
        const index = products.findIndex(p => p.id === req.params.id); //BUSCAMOS EL PRODUCTTO EN LA LISTA DE PRODUCTOS

        if (index === -1) return error(res, "Producto no encontrado", 404); //SI NO SE ENCUENTRA DEVOLVEMOS ERROR 404

        products.splice(index, 1); //ELIMINAMOS EL ELEMENTO DEL ARRAY
        await fs.writeJson(productsFile, products, { spaces: 2 }); //GUARDAMOS LOS ELEMENTOS SIN EL ELEMENTO ELIMINADO

        return success(res, null, 204); // RETORNAMOS EXITO 204
    } catch (err) {
        return error(res, err.message, 500); //SI OCURRE ALGUN ERROR RETORNAMOS ERROR
    }
});

module.exports = router;
