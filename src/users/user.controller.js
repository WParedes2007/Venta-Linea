import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js";


export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;

        const query = { estado: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener usuario",
            error
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario Not Found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuario",
            error
        });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { role, password, ...rest } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        if (req.usuario.role !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para editar a este usuario"
            });
        }

        if (req.usuario.role !== "ADMIN_ROLE" && role) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para cambiar tu rol"
            });
        }

        if (role && role === "ADMIN_ROLE" && req.usuario.role !== "ADMIN_ROLE") {
            return res.status(403).json({
                success: false,
                message: "Solo los administradores pueden asignar el rol de administrador"
            });
        }

        if (password) {
            const hashedPassword = await hash(password);
            rest.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(id, { ...rest, role }, { new: true });

        res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente",
            updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el usuario",
            error
        });
    }
};


export const unsubscribe = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.usuario._id, { status: false }, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Sesión cerrada exitosamente",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al cerrar sesión",
            error
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            msg: "Usuario desactivado",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al desactivar el usuario",
            error
        });
    }
};
