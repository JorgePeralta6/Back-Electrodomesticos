import Role from "./role.model.js"

export const createRoles = async () => {
    try {
        const existRoles = await Role.find({ role: { $in: ["ADMIN_ROL", "TECNICO_ROL"] } });

        if (existRoles.length < 2) {
            if (!existRoles.some(role => role.role === "ADMIN_ROL")) {
                await new Role({ role: "ADMIN_ROL" }).save();
            }
            if (!existRoles.some(role => role.role === "TECNICO_ROL")) {
                await new Role({ role: "TECNICO_ROL" }).save();
            }
        }
    } catch (error) {
        console.error("Error creating roles:", error);
    }
};
