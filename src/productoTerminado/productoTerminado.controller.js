import ProductoTerminado from "./productoTerminado.model.js";

export const getProductosTerminados = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: true };

        const [total, productos] = await Promise.all([
            ProductoTerminado.countDocuments(query),
            ProductoTerminado.find(query)
                .populate("receta.materiaPrima", "nombre costoUnitario")
                .skip(Number(desde))
                .limit(Number(limite))
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
        const data = req.body;
        const producto = new ProductoTerminado(data);
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
        const { _id, ...data } = req.body;

        const producto = await ProductoTerminado.findByIdAndUpdate(id, data, { new: true })
            .populate("receta.materiaPrima", "nombre costoUnitario");

        if (!producto) {
            return res.status(404).json({
                success: false,
                msg: "Producto no encontrado"
            });
        }

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

// Compra pública (sin sesión): descuenta stock y suma ventas de forma atómica
export const comprarProducto = async (req, res) => {
    try {
        const { productoId } = req.body;
        const cantidad = Number(req.body.cantidad ?? 1);

        // El filtro incluye stock >= cantidad, así dos compras simultáneas no dejan el stock negativo
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
