import Product from "../products/product.model.js";
import Purchase from "./purchase.model.js";
import Bill from "../bills/bill.model.js";

export const createPurchase = async (req, res) => {
    try {
        const { products, shippingAddress } = req.body;
        const userId = req.usuario.id;

        let total = 0;
        const purchaseProducts = await Promise.all(products.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${product?.name || item.product}`);
            }
            product.stock -= item.quantity;  
            await product.save();  
            total += product.price * item.quantity;  
            return { 
                product: product._id, 
                quantity: item.quantity, 
                priceAtPurchase: product.price 
            };
        }));

        const purchase = new Purchase({ user: userId, products: purchaseProducts, total });
        await purchase.save();

        const bill = new Bill({
            user: userId,
            products: purchaseProducts.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.priceAtPurchase
            })),
            total,
            shippingAddress,
            status: "pending"
        });

        await bill.save();

        res.status(200).json({
            success: true,
            message: "Compra y factura realizadas con éxito",
            purchase,
            bill  
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al procesar la compra y generar la factura",
            error: error.message
        });
    }
};


export const getUserPurchases = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const purchases = await Purchase.find({ user: userId }).populate("products.product", "name price");

        res.status(200).json({
            success: true,
            purchases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener historial de compras",
            error
        });
    }
};
