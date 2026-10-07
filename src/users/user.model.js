import { Schema, model } from "mongoose";

const UserSchema = Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            maxLength: [25, "Can't exceed 25 characters"]
        },
        surname: {
            type: String,
            required: [true, "Surname is required"],
            maxLength: [25, "Can't exceed 25 characters"]
        },
        username: {
            type: String,
            unique: true,
            required: [true, "Username is required"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: 8
        },
        phone: {
            type: String,
            minLength: 8,
            maxLength: 8,
            required: true,
        },
        puesto: {
            type: String,
            required: [true, "Puesto is required"]
        },
        salarioBase: {
            type: Number,
            required: [true, "Salario base is required"],
            min: [0, "Salario base can't be negative"]
        },
        bonoIncentivo: {
            type: Number,
            default: 250.00
        },
        role: {
            type: String,
            enum: ["ADMIN_ROL", "TECNICO_ROL"],
            default: "TECNICO_ROL"
        },
        status: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default model("User", UserSchema);