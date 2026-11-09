import ProductoFinal from "./productoFinal.model.js";
import MateriaPrima from "../materiaPrima/materiaPrima.model.js";

export const saveProductoFinal = async (req, res) => {
    const { productoTerminado, materiales } = req.body;

    const juntos = new Map();
    for (const m of materiales) {
        const id = String(m.materiaPrima);
        juntos.set(id, (juntos.get(id) ?? 0) + Number(m.cantidad));
    }

    const descontados = [];
    try {
        for (const [id, cantidad] of juntos) {
            const mp = await MateriaPrima.findOneAndUpdate(
                { _id: id, status: true, stock: { $gte: cantidad } },
                { $inc: { stock: -cantidad } },
                { new: true }
            );

            if (!mp) {
                const existe = await MateriaPrima.findOne({ _id: id, status: true });
                throw Object.assign(
                    new Error(
                        existe
                            ? `Stock insuficiente de "${existe.nombre}". Disponible: ${existe.stock}`
                            : "Materia prima no encontrada"
                    ),
                    { statusCode: existe ? 409 : 404 }
                );
            }
            descontados.push({ id, cantidad });
        }

        const productoFinal = new ProductoFinal({
            productoTerminado: productoTerminado || undefined,
            materiales: [...juntos].map(([materiaPrima, cantidad]) => ({ materiaPrima, cantidad })),
            solicitadoPor: req.usuario._id
        });
        await productoFinal.save();

        res.status(201).json({
            success: true,
            msg: "Solicitud registrada y stock descontado",
            productoFinal
        });
    } catch (error) {
        await Promise.all(
            descontados.map(d => MateriaPrima.updateOne({ _id: d.id }, { $inc: { stock: d.cantidad } }))
        );

        res.status(error.statusCode || 500).json({
            success: false,
            msg: error.statusCode ? error.message : "Error al registrar el producto final",
            error: error.message
        });
    }
};

export const getProductosFinales = async (req, res) => {
    try {
        const { limite, desde = 0 } = req.query;
        const query = { status: true };
        if (req.usuario.role !== "ADMIN_ROL") query.solicitadoPor = req.usuario._id;

        const [total, registros] = await Promise.all([
            ProductoFinal.countDocuments(query),
            ProductoFinal.find(query)
                .sort({ createdAt: -1 })
                .skip(Number(desde))
                .limit(Number(limite) || 0)
                .populate("productoTerminado", "nombre")
                .populate("materiales.materiaPrima", "nombre")
                .populate("solicitadoPor", "name surname username")
        ]);

        res.status(200).json({ success: true, total, registros });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener los productos finales",
            error: error.message
        });
    }
};
