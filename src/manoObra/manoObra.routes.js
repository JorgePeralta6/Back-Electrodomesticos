import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { getManoObra, saveManoObra } from "./manoObra.controller.js";

const router = Router();

router.get("/", validateJWT, getManoObra);

router.post(
    "/",
    [
        validateJWT,
        check("proceso", "El proceso es obligatorio").not().isEmpty(),
        check("horasTrabajadas", "Las horas deben ser numéricas").isNumeric(),
        check("tarifaPorHora", "La tarifa debe ser numérica").isNumeric(),
        check("productoTerminado", "Debe ser un ID de Producto válido").isMongoId(),
        validateFields
    ],
    saveManoObra
);

export default router;