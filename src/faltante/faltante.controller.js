import Faltante from "./faltante.model.js";

const poblar = (query) =>
    query
        .populate("solicitadoPor", "name surname username")
        .populate("atendidoPor", "name surname username");

// El técnico crea el aviso
export const saveFaltante = async (req, res) => {
    try {
        const faltante = await Faltante.create({
            mensaje: req.body.mensaje,
            solicitadoPor: req.usuario._id
        });

        res.status(201).json({
            success: true,
            msg: "Aviso enviado. El administrador verá que falta material.",
            faltante
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al registrar el faltante",
            error: error.message
        });
    }
};

// Admin ve todos; el técnico solo los suyos. Los pendientes salen primero.
export const getFaltantes = async (req, res) => {
    try {
        const { limite, desde = 0 } = req.query;
        const query = { status: true };
        if (req.usuario.role !== "ADMIN_ROL") query.solicitadoPor = req.usuario._id;

        const [total, pendientes, registros] = await Promise.all([
            Faltante.countDocuments(query),
            Faltante.countDocuments({ ...query, estado: "PENDIENTE" }),
            poblar(
                Faltante.find(query)
                    .sort({ estado: -1, createdAt: -1 }) // "PENDIENTE" > "COMPRADO" al ordenar descendente
                    .skip(Number(desde))
                    .limit(Number(limite) || 0)
            )
        ]);

        res.status(200).json({ success: true, total, pendientes, registros });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener los faltantes",
            error: error.message
        });
    }
};

// El administrador marca que ya compró lo que faltaba
export const atenderFaltante = async (req, res) => {
    try {
        const { id } = req.params;
        const respuesta = req.body.respuesta?.trim();

        const faltante = await Faltante.findOneAndUpdate(
            { _id: id, status: true, estado: "PENDIENTE" },
            {
                estado: "COMPRADO",
                respuesta: respuesta || undefined,
                atendidoPor: req.usuario._id,
                atendidoAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!faltante) {
            return res.status(404).json({
                success: false,
                msg: "Faltante no encontrado o ya fue atendido"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Faltante marcado como comprado",
            faltante: await poblar(Faltante.findById(faltante._id))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al atender el faltante",
            error: error.message
        });
    }
};
