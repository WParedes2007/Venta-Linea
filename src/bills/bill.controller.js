import Bill from "./bill.model.js";
import Product from "../products/product.model.js";
import User from "../users/user.model.js";
import Cart from "../carts/cart.model.js"; 


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

        if (bill.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden cancelar facturas pendientes"
            });
        }

        bill.status = "canceled";

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

export const updateBill = async (req, res) => {
    const { id } = req.params;
    const { products, shippingAddress } = req.body;

    try {
        const bill = await Bill.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (bill.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden editar facturas pendientes"
            });
        }

        for (let i = 0; i < bill.products.length; i++) {
            await Product.findByIdAndUpdate(bill.products[i].product, {
                $inc: { stock: bill.products[i].quantity }
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

            await Product.findByIdAndUpdate(products[i].product, {
                $inc: { stock: -products[i].quantity }
            });
        }

        bill.products = products.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.priceAtPurchase 
        }));
        bill.shippingAddress = shippingAddress;
        bill.total = total;

        await bill.save();

        res.status(200).json({
            success: true,
            message: "Factura actualizada exitosamente",
            bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al editar la factura",
            error
        });
    }
};



export const markBillAsPaid = async (req, res) => {
    const { id } = req.params;

    try {
        const bill = await Bill.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (bill.status === "paid") {
            return res.status(400).json({
                success: false,
                message: "La factura ya está pagada"
            });
        }

        if (bill.status === "canceled") {
            return res.status(400).json({
                success: false,
                message: "No se puede pagar una factura cancelada"
            });
        }

        bill.status = "paid";

        await bill.save();

        res.status(200).json({
            success: true,
            message: "Factura marcada como pagada",
            bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar la factura",
            error: error.message
        });
    }
};
