import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { validateAdmin } from "../middlewares/validate-user.js";
import { productoTerminadoExistsById, materiaPrimaExistsById } from "../helpers/db-validator.js";
import { 
    saveProductoTerminado, 
    getProductosTerminados, 
    updateProductoTerminado, 
    deleteProductoTerminado,
    comprarProducto
} from "./productoTerminado.controller.js";

const router = Router();


router.get("/", getProductosTerminados);

// Compra pública: no requiere sesión
router.post(
    "/comprar",
    [
        check("productoId", "El ID del producto es inválido").isMongoId(),
        check("cantidad", "La cantidad debe ser un entero entre 1 y 100").optional().isInt({ min: 1, max: 100 }),
        validateFields
    ],
    comprarProducto
);

router.post(
    "/",
    [
        validateJWT,
        validateAdmin,
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("margenGanancia", "El margen debe ser un número entre 0 y 99.99").optional().isFloat({ min: 0, max: 99.99 }),
        check("manoObra", "La mano de obra debe ser un arreglo de IDs").optional().isArray(),
        check("manoObra.*", "El ID de mano de obra es inválido").isMongoId(),
        check("receta", "La receta debe ser un arreglo de materias primas").isArray({ min: 1 }),
        check("receta.*.materiaPrima", "El ID de materia prima es inválido").isMongoId(),
        check("receta.*.materiaPrima").custom(materiaPrimaExistsById),
        check("receta.*.cantidadRequerida", "La cantidad requerida debe ser un número mayor a 0").isInt({ min: 1 }),
        validateFields
    ],
    saveProductoTerminado
);

router.put(
    "/:id",
    [
        validateJWT,
        validateAdmin,
        check("id", "Invalid Mongo ID").isMongoId(),
        check("id").custom(productoTerminadoExistsById),
        check("margenGanancia", "El margen debe ser un número entre 0 y 99.99").optional().isFloat({ min: 0, max: 99.99 }),
        check("manoObra", "La mano de obra debe ser un arreglo de IDs").optional().isArray(),
        check("manoObra.*", "El ID de mano de obra es inválido").isMongoId(),
        validateFields
    ],
    updateProductoTerminado
);

router.delete(
    "/:id",
    [
        validateJWT,
        validateAdmin,
        check("id", "Invalid Mongo ID").isMongoId(),
        check("id").custom(productoTerminadoExistsById),
        validateFields
    ],
    deleteProductoTerminado
);

export default router;