import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El Nombre del Producto es Obligatorio"]
    },
    description: {
        type: String,
        required: [true, "La Descripción del Producto es Obligatoria"]
    },
    price: {
        type: Number,
        required: [true, "El Precio es Obligatorio"],
        min: [0, "El Precio no puede ser menor a 0"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    stock: {
        type: Number,
        required: [true, "El Stock es Obligatorio"],
        min: [0, "El Stock no puede ser negativo"]
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Product", ProductSchema);

