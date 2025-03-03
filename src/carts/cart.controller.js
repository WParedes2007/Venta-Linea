import Cart from "./cart.model.js";
import Product from "../products/product.model.js";

export const getCart = async (req, res) => {
    try {
        let carts;

        if (req.usuario.role === "ADMIN_ROLE") {
            carts = await Cart.find().populate("products.product", "name price");
        } else {
            carts = await Cart.findOne({ user: req.usuario._id }).populate("products.product", "name price");
        }

        if (!carts) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            carts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el carrito",
            error
        });
    }
};

export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Producto no encontrado" 
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: "Stock insuficiente" 
            });
        }

        let cart = await Cart.findOne({ user: req.usuario._id });
        if (!cart) {
            cart = new Cart({ user: req.usuario._id, products: [] });
        }

        const productIndex = cart.products.findIndex(p => p.product.equals(productId));
        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        res.status(200).json({ 
            success: true,
            message: "Producto agregado al carrito",
            cart });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error al agregar producto", 
            error 
        });
    }
};

export const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    try {
        const cart = await Cart.findOne({ user: req.usuario._id });
        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: "Carrito no encontrado" 
            });
        }

        cart.products = cart.products.filter(p => !p.product.equals(productId));
        await cart.save();

        res.status(200).json({ 
            success: true, 
            message: "Producto eliminado del carrito", 
            cart 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error al eliminar producto", 
            error 
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.usuario._id });
        res.status(200).json({ 
            success: true, 
            message: "Carrito vaciado" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error al vaciar el carrito", error 
        });
    }
};
