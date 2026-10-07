import MateriaPrima from "./materiaPrima.model.js";

export const getMateriasPrimas = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: true };

        const [total, materiasPrimas] = await Promise.all([
            MateriaPrima.countDocuments(query),
            MateriaPrima.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            materiasPrimas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener materias primas",
            error: error.message
        });
    }
};

export const saveMateriaPrima = async (req, res) => {
    try {
        const data = req.body;
        const materiaPrima = new MateriaPrima(data);
        await materiaPrima.save();

        res.status(201).json({
            success: true,
            msg: "Materia prima creada exitosamente",
            materiaPrima
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al registrar materia prima",
            error: error.message
        });
    }
};

export const updateMateriaPrima = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const materiaPrima = await MateriaPrima.findByIdAndUpdate(id, data, { new: true });

        if (!materiaPrima) {
            return res.status(404).json({
                success: false,
                msg: "Materia prima no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Materia prima actualizada correctamente",
            materiaPrima
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar materia prima",
            error: error.message
        });
    }
};

export const deleteMateriaPrima = async (req, res) => {
    try {
        const { id } = req.params;
        const materiaPrima = await MateriaPrima.findByIdAndUpdate(id, { status: false }, { new: true });

        if (!materiaPrima) {
            return res.status(404).json({
                success: false,
                msg: "Materia prima no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Materia prima desactivada correctamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al desactivar materia prima",
            error: error.message
        });
    }
};