import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { validateAdmin } from "../middlewares/validate-user.js";
import { saveFaltante, getFaltantes, atenderFaltante } from "./faltante.controller.js";

const router = Router();

router.get("/", validateJWT, getFaltantes);

router.post(
    "/",
    [
        validateJWT,
        check("mensaje", "Escribe qué es lo que falta").trim().not().isEmpty(),
        check("mensaje", "El mensaje no puede exceder 500 caracteres").isLength({ max: 500 }),
        validateFields
    ],
    saveFaltante
);

router.put(
    "/:id/atender",
    [
        validateJWT,
        validateAdmin,
        check("id", "No es un ID válido de Mongo").isMongoId(),
        check("respuesta", "La respuesta no puede exceder 300 caracteres").optional({ checkFalsy: true }).isLength({ max: 300 }),
        validateFields
    ],
    atenderFaltante
);

export default router;
