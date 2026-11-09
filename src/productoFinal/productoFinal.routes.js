import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { saveProductoFinal, getProductosFinales } from "./productoFinal.controller.js";

const router = Router();

router.get("/", validateJWT, getProductosFinales);

router.post(
    "/",
    [
        validateJWT,
        check("productoTerminado", "El ID del producto es inválido").optional({ checkFalsy: true }).isMongoId(),
        check("materiales", "Debes indicar al menos una materia prima").isArray({ min: 1 }),
        check("materiales.*.materiaPrima", "El ID de materia prima es inválido").isMongoId(),
        check("materiales.*.cantidad", "La cantidad debe ser un entero mayor a 0").isInt({ min: 1 }),
        validateFields
    ],
    saveProductoFinal
);

export default router;
