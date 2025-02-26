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

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { password, ...data } = req.body;

        if (req.usuario.role === "CLIENT_ROLE" && id !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                msg: "No Hay Autorizacion Para Actualizar La Información De Otro Usuario"
            });
        }

        if (password) {
            data.password = await hash(password);
        }

        const user = await User.findByIdAndUpdate(id, data, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Usuario Actualizado!",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al actualizar usuario",
            error
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                msg: "La contraseña no coincide"
            });
        }

        const encryptedPassword = await hash(password);

        const user = await User.findByIdAndUpdate(id, { password: encryptedPassword }, { new: true });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Contraseña actualizada correctamente",
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar la contraseña",
            error
        });
    }
};

export const unsubscribe = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.usuario._id, { estado: false }, { new: true });

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
