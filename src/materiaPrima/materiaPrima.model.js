import { Schema, model } from "mongoose";

const MateriaPrimaSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre de la materia prima es obligatorio"],
            trim: true
        },
        costoUnitario: {
            type: Number,
            required: [true, "El costo unitario es obligatorio"],
            min: [0, "El costo unitario no puede ser negativo"]
        },
        stock: {
            type: Number,
            required: [true, "El stock es obligatorio"],
            default: 0,
            min: [0, "El stock no puede ser negativo"]
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

export default model("MateriaPrima", MateriaPrimaSchema);