import { Schema, model } from "mongoose";

const DetalleProductoSchema = new Schema(
    {
        materiaPrima: {
            type: Schema.Types.ObjectId,
            ref: "MateriaPrima",
            required: true
        },
        cantidadRequerida: {
            type: Number,
            required: true,
            min: [1, "La cantidad requerida debe ser al menos 1"]
        }
    },
    { _id: false }
);

const ProductoTerminadoSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre del producto es obligatorio"],
            trim: true
        },
        precio: {
            type: Number,
            default: 0,
            min: [0, "El precio no puede ser negativo"]
        },
        margenGanancia: {
            type: Number,
            default: 0,
            min: [0, "El margen no puede ser negativo"],
            max: [99.99, "El margen debe ser menor a 100"]
        },
        costoMateriaPrima: { type: Number, default: 0 },
        costoManoObra: { type: Number, default: 0 },
        stock: {
            type: Number,
            default: 0,
            min: [0, "El stock no puede ser negativo"]
        },
        ventas: {
            type: Number,
            default: 0
        },
        receta: [DetalleProductoSchema],
        manoObra: [{
            type: Schema.Types.ObjectId,
            ref: "ManoObra"
        }],
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

export default model("ProductoTerminado", ProductoTerminadoSchema);