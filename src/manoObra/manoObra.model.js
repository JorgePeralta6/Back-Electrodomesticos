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
        productoTerminado: {
            type: Schema.Types.ObjectId,
            ref: "ProductoTerminado",
            required: true
        },
        empleado: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
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