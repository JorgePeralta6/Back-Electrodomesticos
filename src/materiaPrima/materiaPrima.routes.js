import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { 
    getMateriasPrimas, 
    saveMateriaPrima, 
    updateMateriaPrima, 
    deleteMateriaPrima 
} from "./materiaPrima.controller.js";

const router = Router();

router.get("/", getMateriasPrimas);

router.post(
    "/",
    [
        validateJWT,
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("costoUnitario", "El costo es obligatorio y numérico").isNumeric(),
        check("stock", "El stock debe ser numérico").isNumeric(),
        validateFields
    ],
    saveMateriaPrima
);

router.put(
    "/:id",
    [
        validateJWT,
        check("id", "No es un ID de Mongo válido").isMongoId(),
        validateFields
    ],
    updateMateriaPrima
);

router.delete(
    "/:id",
    [
        validateJWT,
        check("id", "No es un ID de Mongo válido").isMongoId(),
        validateFields
    ],
    deleteMateriaPrima
);

export default router;