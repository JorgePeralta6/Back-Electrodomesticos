import { Schema, model } from "mongoose";

// Aviso de que falta algo para armar un producto (ej. "falta la memoria del iPhone").
// El técnico lo escribe, el administrador compra y lo marca como COMPRADO.
// No toca el stock: el stock se descuenta en Producto Final cuando el técnico solicita el material.
const FaltanteSchema = new Schema(
    {
        mensaje: {
            type: String,
            required: [true, "El mensaje es obligatorio"],
            trim: true,
            maxLength: [500, "El mensaje no puede exceder 500 caracteres"]
        },
        solicitadoPor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        estado: {
            type: String,
            enum: ["PENDIENTE", "COMPRADO"],
            default: "PENDIENTE"
        },
        // Nota opcional del administrador (ej. "Se compraron 5 memorias")
        respuesta: {
            type: String,
            trim: true,
            maxLength: [300, "La respuesta no puede exceder 300 caracteres"]
        },
        atendidoPor: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        atendidoAt: {
            type: Date
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default model("Faltante", FaltanteSchema);
