import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El Nombre Es Obligatorio"]
    },
    surname: {
        type: String,
        required: [true, "El Apellido Es Obligatorio"]
    },
    username: {
        type: String,
        required: [true, "El Nombre De Usuario Es Obligatorio"]
    },
    email:{
        type: String,
        required: [true, "El Correo Es Obligatorio"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "La Contraseña Es Obligatoria"]
    },
    profile_picture:{
        type: String,
    },
    img:{
        type: String,
    },
    phone: {
        type: String,
        minlength:8,
        maxlength:8,
        required: [true,"El Numero Es Obligatorio"]
    },
    role: {
        type: String,
        required: [true, "El Rol Es Obligatorio"],
        enum: ["ADMIN_ROLE","CLIENT_ROLE"],
        default: ["CLIENT_ROLE"]
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

UserSchema.methods.toJSON = function() {
    const {__v,password, _id, ...usuario} = this.toObject();
    usuario.uid = _id;
    return usuario;
}

export default mongoose.model("User", UserSchema);