import { response } from "express";
import { hash } from 'argon2';
import User from "./user.model.js";

export const getUsers = async (req = request, res = response) => {  
    try {
        const {limite, desde = 0 } = req.query;
        const query = {status: true}
        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite) || 0)
        ])

        res.status(200).json({
            success: true,
            total,
            users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuarios",
            error
        })
    }
}
export const updateUser = async (req, res) => {
  try {
      const { id } = req.params;
      const { _id, password, email, ...data } = req.body;
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({
              success: false,
              msg: 'User not found'
          });
      }
      if (password) {
          user.password = await hash(password);
      }
      if(email){
        user.email = email;
      }

      Object.assign(user, data);

      const updateUser = await user.save();
            
        res.status(200).json({
            success: true,
            msg: "User update successfully!",
            user: updateUser
        })

  } catch (error) {
      console.error(error); 
      res.status(500).json({
          success: false,
          msg: 'Error when updating user',
          error
      });
  }
};



export const deleteUser = async (req, res) => {
  try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);
      if (!user) {
          return res.status(404).json({
              success: false,
              msg: "User not found"
          });
      }
      res.status(200).json({
          success: true,
          msg: 'User disabled',
          user,
          authenticatedUser
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          msg: 'Error deactivating user',
          error
      });
  }
};

export const getUserProfile = (req, res) => {
    try {
        const user = req.usuario;
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener el perfil del usuario"
        })
    }
}

export const getPlanilla = async (req, res) => {
    try {
        const usuarios = await User.find({ status: true }).select(
            "name surname puesto salarioBase bonoIncentivo"
        );

        const IGSS_PORCENTAJE = 0.0483; 

        const planilla = usuarios.map(emp => {
            const salarioBase = emp.salarioBase || 0;
            const bonoIncentivo = emp.bonoIncentivo || 0;

            const totalDevengado = salarioBase + bonoIncentivo;
            
            const igss = parseFloat((salarioBase * IGSS_PORCENTAJE).toFixed(2));
            
            const totalLiquido = parseFloat((totalDevengado - igss).toFixed(2));

            return {
                id: emp._id,
                nombreEmpleado: `${emp.name} ${emp.surname}`,
                puesto: emp.puesto,
                salarioBase,
                bonoIncentivo,
                totalDevengado,
                igss,
                totalLiquido
            };
        });

        res.status(200).json({
            success: true,
            totalEmpleados: planilla.length,
            planilla
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al generar la planilla",
            error: error.message
        });
    }
};