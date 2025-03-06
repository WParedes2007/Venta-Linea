import Bill from "./bill.model.js";
import Product from "../products/product.model.js";
import Cart from "../carts/cart.model.js"

export const createBill = async (req, res) => {
    const { cartId, shippingAddress } = req.body;

    if (!shippingAddress || shippingAddress.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "El campo 'shippingAddress' es obligatorio y no puede estar vacío."
        });
    }

    try {
        const cart = await Cart.findOne({ _id: cartId, user: req.usuario._id }).populate("products.product");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "El carrito no existe o no pertenece al usuario"
            });
        }

        if (cart.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El carrito está vacío, agrega productos antes de comprar"
            });
        }

        let total = 0;
        const purchasedProducts = cart.products.map(item => {
            total += item.product.price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity,
                priceAtPurchase: item.product.price
            };
        });

        const newBill = new Bill({
            user: req.usuario._id,
            products: purchasedProducts,
            shippingAddress,
            total,
            status: "pending"
        });

        await newBill.save();
        cart.products = []; 
        await cart.save();

        res.status(201).json({
            success: true,
            message: "Factura creada exitosamente",
            bill: newBill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear la factura",
            error
        });
    }
};



export const getUserBills = async (req, res) => {
    try {
        let bills;
        if (req.usuario.role === "ADMIN_ROLE") {
            bills = await Bill.find()
                .populate("products.product", "name price")
                .populate("user", "name surname email")
                .exec();
        } else {
            bills = await Bill.find({ user: req.usuario._id })
                .populate("products.product", "name price")
                .populate("user", "name surname email")
                .exec();
        }

        res.status(200).json({ 
            success: true, 
            bills 
        });
    } catch (error) {
        res.status(500).json({ success: false, 
            message: "Error al obtener las facturas", 
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

        if (req.usuario.role === "CLIENT_ROLE" && bill.user._id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "No tienes permisos para ver esta factura" 
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

        if (req.usuario.role === "CLIENT_ROLE" && bill.user.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: "No tienes permiso para cancelar esta factura" 
            });
        }

        bill.status = "canceled";

        for (let i = 0; i < bill.products.length; i++) {
            await Product.findByIdAndUpdate(bill.products[i].product, { $inc: { stock: bill.products[i].quantity } });
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

        // **Devolver stock de los productos actuales**
        for (let i = 0; i < bill.products.length; i++) {
            await Product.findByIdAndUpdate(bill.products[i].product, {
                $inc: { stock: bill.products[i].quantity }
            });
        }

        let total = 0;
        let updatedProducts = [];

        // **Verificar stock y calcular precios automáticamente**
        for (let i = 0; i < products.length; i++) {
            const product = await Product.findById(products[i].product);

            if (!product || product.stock < products[i].quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente o producto no encontrado: ${products[i].product}`
                });
            }

            total += product.price * products[i].quantity;

            // **Restar stock actualizado**
            await Product.findByIdAndUpdate(products[i].product, {
                $inc: { stock: -products[i].quantity }
            });

            // **Guardar producto con precio automático**
            updatedProducts.push({
                product: products[i].product,
                quantity: products[i].quantity,
                priceAtPurchase: product.price // Precio tomado automáticamente
            });
        }

        // **Actualizar la factura**
        bill.products = updatedProducts;
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


export const checkout = async (req, res) => {
    try {
        const userId = req.usuario._id;
        const cart = await Cart.findOne({ user: userId }).populate("products.product");

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No puedes comprar sin productos en el carrito."
            });
        }

        let total = 0;
        const productsToBuy = req.body.products; 

        for (let item of productsToBuy) {
            const productInCart = cart.products.find(p => p.product._id.toString() === item.product);

            if (!productInCart) {
                return res.status(400).json({
                    success: false,
                    message: `El producto ${item.product} no está en tu carrito. Agrega primero al carrito.`
                });
            }

            if (productInCart.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente en el carrito para el producto ${item.product}.`
                });
            }

            total += productInCart.product.price * item.quantity;
        }

        const bill = new Bill({
            user: userId,
            products: productsToBuy.map(item => ({
                product: item.product,
                quantity: item.quantity,
                priceAtPurchase: cart.products.find(p => p.product._id.toString() === item.product).product.price
            })),
            total
        });

        await bill.save();

        cart.products = cart.products.filter(p => 
            !productsToBuy.some(item => item.product === p.product._id.toString())
        );

        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Compra realizada con éxito",
            bill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al procesar la compra",
            error
        });
    }
};
