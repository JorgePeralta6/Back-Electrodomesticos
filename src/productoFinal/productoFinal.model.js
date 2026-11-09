import { Schema, model } from "mongoose";

const MaterialUsadoSchema = new Schema(
    {
        materiaPrima: {
            type: Schema.Types.ObjectId,
            ref: "MateriaPrima",
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: [1, "La cantidad debe ser al menos 1"]
        }
    },
    { _id: false }
);

const ProductoFinalSchema = new Schema(
    {
        productoTerminado: {
            type: Schema.Types.ObjectId,
            ref: "ProductoTerminado"
        },
        materiales: {
            type: [MaterialUsadoSchema],
            validate: [(v) => v.length > 0, "Debes indicar al menos una materia prima"]
        },
        solicitadoPor: {
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

export default model("ProductoFinal", ProductoFinalSchema);
