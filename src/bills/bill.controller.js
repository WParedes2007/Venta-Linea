import Bill from "./bill.model.js";
import Product from "../products/product.model.js";
import User from "../users/user.model.js";
import Cart from "../carts/cart.model.js"; 

export const createBill = async (req, res) => {
    const { products, shippingAddress } = req.body;
    try {
        const user = await User.findById(req.usuario._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        let total = 0;
        for (let i = 0; i < products.length; i++) {
            const product = await Product.findById(products[i].product);
            if (!product || product.stock < products[i].quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente o producto no encontrado: ${products[i].product}`
                });
            }
            total += product.price * products[i].quantity;
        }

        const bill = new Bill({
            user: user._id,
            products,
            total,
            shippingAddress
        });

        for (let i = 0; i < products.length; i++) {
            await Product.findByIdAndUpdate(products[i].product, {
                $inc: { stock: -products[i].quantity }
            });
        }

        await bill.save();

        await Cart.findOneAndDelete({ user: user._id });

        res.status(200).json({
            success: true,
            message: "Compra realizada exitosamente",
            bill
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al procesar la compra",
            error
        });
    }
};

export const getUserBills = async (req, res) => {
    try {
        const bills = await Bill.find({ user: req.usuario._id })
            .populate("products.product", "name price")
            .populate("user", "name surname email")
            .exec();

        res.status(200).json({
            success: true,
            bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las facturas del usuario",
            error
        });
    }
};

export const getBillById = async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await Bill.findById(id)
            .populate("products.product", "name price")
            .populate("user", "name surname email")
            .exec();

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la factura",
            error
        });
    }
};

export const cancelBill = async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await Bill.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        // Solo se pueden cancelar facturas con estado "pendiente"
        if (bill.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden cancelar facturas pendientes"
            });
        }

        bill.status = "canceled";

        // Revertir el stock de los productos
        for (let i = 0; i < bill.products.length; i++) {
            await Product.findByIdAndUpdate(bill.products[i].product, {
                $inc: { stock: bill.products[i].quantity }
            });
        }

        await bill.save();

        res.status(200).json({
            success: true,
            message: "Factura cancelada con éxito"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al cancelar la factura",
            error
        });
    }
};
