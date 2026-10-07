import User from '../users/user.model.js';
import { hash, verify } from 'argon2';
import { generateJWT } from "../helpers/generate-jwt.js";

export const login = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const user = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Incorrect credentials, email or username does not exist'
            });
        }

        if (!user.status) {
            return res.status(400).json({
                success: false,
                msg: 'User is deactivated'
            });
        }

        const validPassword = await verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({
                success: false,
                msg: 'Password is incorrect'
            });
        }

        const token = await generateJWT(user.id);

        res.status(200).json({
            success: true,
            msg: 'Successful login',
            userDetails: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Contact the administrator",
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const data = req.body;

        const encryptedPassword = await hash(data.password);
        const user = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email,
            phone: data.phone,
            puesto: data.puesto,
            salarioBase: data.salarioBase,
            bonoIncentivo: data.bonoIncentivo || 250,
            password: encryptedPassword,
            role: data.role || "TECNICO_ROL"
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            userDetails: {
                user: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User registration failed",
            error: error.message
        });
    }
};