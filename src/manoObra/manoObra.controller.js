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

export const updateManoObra = async (req, res) => {
    try {
        const { id } = req.params;
        // Solo omitimos _id para no sobreescribir la llave primaria de Mongo
        const { _id, ...data } = req.body;

        const manoObra = await ManoObra.findById(id);

        if (!manoObra || !manoObra.status) {
            return res.status(404).json({
                success: false,
                msg: "Registro de mano de obra no encontrado"
            });
        }

        // Asignamos las nuevas propiedades (incluyendo empleado si viene en el body)
        Object.assign(manoObra, data);

        // Al usar save(), se recalculan hooks y se aplican las referencias
        await manoObra.save();

        res.status(200).json({
            success: true,
            msg: "Registro de mano de obra actualizado correctamente",
            manoObra
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar la mano de obra",
            error: error.message
        });
    }
};

export const deleteManoObra = async (req, res) => {
    try {
        const { id } = req.params;

        const manoObra = await ManoObra.findByIdAndUpdate(
            id, 
            { status: false }, 
            { new: true }
        );

        if (!manoObra) {
            return res.status(404).json({
                success: false,
                msg: "Registro de mano de obra no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Registro de mano de obra eliminado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al eliminar la mano de obra",
            error: error.message
        });
    }
};