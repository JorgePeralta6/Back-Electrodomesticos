import argon2 from "argon2";
import User from '../users/user.model.js';

export const createAdmin = async () => {
    try {
        const existAdmin = await User.findOne({ role: "ADMIN_ROL" });
        
        if (!existAdmin) {
            const hashed = await argon2.hash("12345678");
            const adminUser = new User({
                name: "Admin",
                surname: "Admin",
                username: "admin",
                email: "admin@gmail.com",
                phone: "12345678",
                puesto: "Administrador del Sistema",
                salarioBase: 0,
                bonoIncentivo: 250,
                password: hashed,
                role: "ADMIN_ROL"
            });

            await adminUser.save();
            console.log("Usuario Administrador creado por defecto con éxito.");
        } 
    } catch (error) {
        console.error("Error al crear el administrador por defecto:", error);
    }
};