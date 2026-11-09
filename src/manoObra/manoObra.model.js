import { Schema, model } from "mongoose";

const ManoObraSchema = new Schema(
    {
        proceso: {
            type: String,
            required: [true, "El nombre del proceso o ensamblado es obligatorio"],
            trim: true
        },
        horasTrabajadas: {
            type: Number,
            required: [true, "Las horas trabajadas son obligatorias"],
            min: [0.1, "Las horas deben ser mayores a 0"]
        },
        tarifaPorHora: {
            type: Number,
            required: [true, "La tarifa por hora es obligatoria"],
            min: [0, "La tarifa no puede ser negativa"]
        },
        costoTotal: {
            type: Number
        },
        // Producto en el que se trabajó, escrito a mano (opcional).
        // Así se puede registrar mano de obra aunque el producto aún no exista.
        producto: {
            type: String,
            trim: true,
            maxLength: [60, "El producto no puede exceder 60 caracteres"]
        },
        // (Legado) vínculo a un producto terminado ya existente
        productoTerminado: {
            type: Schema.Types.ObjectId,
            ref: "ProductoTerminado"
        },
        // Quién realizó el trabajo (se elige en el formulario)
        empleado: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // Quién lo registró en el sistema (el usuario con sesión iniciada)
        registradoPor: {
            type: Schema.Types.ObjectId,
            ref: "User"
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

// Middleware para calcular automáticamente el costoTotal de la mano de obra
ManoObraSchema.pre("save", function (next) {
    this.costoTotal = this.horasTrabajadas * this.tarifaPorHora;
    next();
});

export default model("ManoObra", ManoObraSchema);