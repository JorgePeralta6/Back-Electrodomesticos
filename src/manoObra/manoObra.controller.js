import ManoObra from "./manoObra.model.js";

export const saveManoObra = async (req, res) => {
    try {
        const { proceso, horasTrabajadas, tarifaPorHora, productoTerminado } = req.body;
        const empleado = req.usuario._id; // Obtenido desde el token JWT

        const manoObra = new ManoObra({
            proceso,
            horasTrabajadas,
            tarifaPorHora,
            productoTerminado,
            empleado
        });

        await manoObra.save();

        res.status(201).json({
            success: true,
            msg: "Registro de mano de obra creado exitosamente",
            manoObra
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al registrar mano de obra",
            error: error.message
        });
    }
};

export const getManoObra = async (req, res) => {
    try {
        const query = { status: true };

        const registros = await ManoObra.find(query)
            .populate("productoTerminado", "nombre precio")
            .populate("empleado", "name surname role");

        res.status(200).json({
            success: true,
            total: registros.length,
            registros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener registros de mano de obra",
            error: error.message
        });
    }
};