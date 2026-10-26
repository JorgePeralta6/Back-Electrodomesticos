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
    deleteProductoTerminado 
} from "./productoTerminado.controller.js";

const router = Router();


router.get("/", getProductosTerminados);

router.post(
    "/",
    [
        validateJWT,
        validateAdmin,
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("precio", "El precio es obligatorio y debe ser un número positivo").isFloat({ min: 0 }),
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