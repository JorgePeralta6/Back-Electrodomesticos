import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { getManoObra, saveManoObra, updateManoObra, deleteManoObra } from "./manoObra.controller.js";
import { validateAdmin } from "../middlewares/validate-user.js";

const router = Router();

router.get("/", validateJWT, getManoObra);

router.post(
    "/",
    [
        validateJWT,
        check("proceso", "El proceso es obligatorio").not().isEmpty(),
        check("horasTrabajadas", "Las horas deben ser numéricas").isNumeric(),
        check("tarifaPorHora", "La tarifa debe ser numérica").isNumeric(),
        check("producto", "El producto debe ser texto (máx. 60 caracteres)").optional({ checkFalsy: true }).isString().isLength({ max: 60 }),
        check("productoTerminado", "Debe ser un ID de Producto válido").optional({ checkFalsy: true }).isMongoId(),
        check("empleado", "El ID de empleado no es válido").optional({ checkFalsy: true }).isMongoId(),
        validateFields
    ],
    saveManoObra
);

router.put(
    "/:id",
    [
        validateJWT,
        validateAdmin,
        check("id", "No es un ID válido de Mongo").isMongoId(),
        check("empleado", "El ID de empleado no es válido").optional().isMongoId(),
        check("producto", "El producto debe ser texto (máx. 60 caracteres)").optional().isString().isLength({ max: 60 }),
        validateFields
    ],
    updateManoObra
);

router.delete(
    "/:id",
    [
        validateJWT,
        validateAdmin,
        check("id", "No es un ID válido de Mongo").isMongoId(),
        validateFields
    ],
    deleteManoObra
);

export default router;