import ProductoTerminado from "./productoTerminado.model.js";
import MateriaPrima from "../materiaPrima/materiaPrima.model.js";
import ManoObra from "../manoObra/manoObra.model.js";

const redondear = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// precio = (materia prima + mano de obra) / (1 - margen/100)
const calcularCostos = async ({ receta = [], manoObra = [], margenGanancia = 0 }) => {
    const ids = receta.map(d => d.materiaPrima);
    const materias = await MateriaPrima.find({ _id: { $in: ids } }, "costoUnitario");
    const costoPorId = new Map(materias.map(m => [String(m._id), m.costoUnitario]));
    const costoMateriaPrima = receta.reduce(
        (acc, d) => acc + (costoPorId.get(String(d.materiaPrima)) ?? 0) * d.cantidadRequerida, 0
    );

    const registros = await ManoObra.find({ _id: { $in: manoObra }, status: true }, "costoTotal horasTrabajadas tarifaPorHora");
    const costoManoObra = registros.reduce(
        (acc, r) => acc + (r.costoTotal ?? r.horasTrabajadas * r.tarifaPorHora), 0
    );

    const margen = Number(margenGanancia) || 0;
    const precio = (costoMateriaPrima + costoManoObra) / (1 - margen / 100);

    return {
        costoMateriaPrima: redondear(costoMateriaPrima),
        costoManoObra: redondear(costoManoObra),
        precio: redondear(precio)
    };
};

const populateProducto = (query) => query
    .populate("receta.materiaPrima", "nombre costoUnitario")
    .populate("manoObra", "proceso horasTrabajadas tarifaPorHora costoTotal");

export const getProductosTerminados = async (req, res) => {
    try {
        const { limite, desde = 0 } = req.query;
        const query = { status: true };

        const [total, productos] = await Promise.all([
            ProductoTerminado.countDocuments(query),
            populateProducto(ProductoTerminado.find(query))
                .skip(Number(desde))
                .limit(Number(limite) || 0)
        ]);

        res.status(200).json({
            success: true,
            total,
            productos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener los productos terminados",
            error: error.message
        });
    }
};

export const saveProductoTerminado = async (req, res) => {
    try {
        const { precio, costoMateriaPrima, costoManoObra, ...data } = req.body;
        const costos = await calcularCostos(data);
        const producto = new ProductoTerminado({ ...data, ...costos });
        await producto.save();

        res.status(201).json({
            success: true,
            msg: "Producto terminado registrado con éxito",
            producto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al registrar el producto terminado",
            error: error.message
        });
    }
};

export const updateProductoTerminado = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, precio, costoMateriaPrima, costoManoObra, ...data } = req.body;

        const actual = await ProductoTerminado.findById(id);
        if (!actual || !actual.status) {
            return res.status(404).json({
                success: false,
                msg: "Producto no encontrado"
            });
        }

        const merged = {
            receta: data.receta ?? actual.receta,
            manoObra: data.manoObra ?? actual.manoObra,
            margenGanancia: data.margenGanancia ?? actual.margenGanancia
        };
        const costos = await calcularCostos(merged);

        const producto = await populateProducto(
            ProductoTerminado.findByIdAndUpdate(id, { ...data, ...costos }, { new: true, runValidators: true })
        );

        res.status(200).json({
            success: true,
            msg: "Producto actualizado correctamente",
            producto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar producto",
            error: error.message
        });
    }
};

export const deleteProductoTerminado = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await ProductoTerminado.findByIdAndUpdate(id, { status: false }, { new: true });

        if (!producto) {
            return res.status(404).json({
                success: false,
                msg: "Producto no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Producto eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al eliminar producto",
            error: error.message
        });
    }
};

export const comprarProducto = async (req, res) => {
    try {
        const { productoId } = req.body;
        const cantidad = Number(req.body.cantidad ?? 1);

        const producto = await ProductoTerminado.findOneAndUpdate(
            { _id: productoId, status: true, stock: { $gte: cantidad } },
            { $inc: { stock: -cantidad, ventas: cantidad } },
            { new: true }
        );

        if (!producto) {
            const existe = await ProductoTerminado.findOne({ _id: productoId, status: true });
            if (!existe) {
                return res.status(404).json({
                    success: false,
                    msg: "Producto no encontrado"
                });
            }
            return res.status(409).json({
                success: false,
                msg: `Stock insuficiente. Disponible: ${existe.stock}`,
                stock: existe.stock
            });
        }

        res.status(200).json({
            success: true,
            msg: "Compra realizada con éxito",
            compra: {
                productoId: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad,
                total: Number((producto.precio * cantidad).toFixed(2)),
                stockRestante: producto.stock
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al procesar la compra",
            error: error.message
        });
    }
};
