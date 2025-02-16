import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js";


export const getUsers = async(req = request, res = response) => {
    try {
        const{limite = 10, desde = 0} = req.query;

        const query = {estado : true}

        const[total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
        ])

        res.status(200).json({
            succes: true,
            total,
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Obtener Usuario",
            error
        })
    }
}

export const getUserById = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);   
        console.log("prueba1");
        if(!user){
            return res.status(404).json({
                success: false,
                msg: "Usuario Not Found"
            })
        }

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            msg: "Error Al Obtener Usuario",
            error
        })
    }
}

export const updateUser = async(req, res = response) => {
    try {
        const {id} = req.params;
        const {_id, password, email, ...data} = req.body;

        if(password){
            data.password = await hash(password)
        }

        const user = await User.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            success: true,
            msg: "Usuario Actualizado!",
            user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error Al Actualizar User",
            error
        })
    }
}

export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params; 
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false, 
                msg: "La Contraseña No Coincide"
            });
        }

        // Crea la contraseña encriptada
        const encryptedPassword = await hash(password);

        // Actualiza el usuario en la base de datos
        const user = await User.findByIdAndUpdate(id, { password: encryptedPassword }, { new: true });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Usuario No Encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Contraseña Actualizada Correctamente",
            user
        });

    } catch (error) {
        console.error(error); // Para depuración
        res.status(500).json({
            success: false,
            msg: 'Error al Actualizar La Contraseña',
            error  
        });
    }
}


export const deleteUser = async (req, res)=>{
    try {
        const { id } = req.params
        const user = await User.findByIdAndUpdate(id,{estado: false}, {new:true});
        
        const authenticatedUser = req.user
        res.status(200).json({
            succes: true,
            msg: 'Usuario desactivado',
            user,
            authenticatedUser
        })



        } catch (error) {
            res.status(500).json({
                succes:false,
                msg:'Error al Desactivar El Usuario',
                error  
                })
}
}