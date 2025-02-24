import Product from "../products/product.model.js";
import Category from "../categories/category.model.js";
import User from "../users/user.model.js";

export const saveProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Categoría no válida"
            });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            status: true
        });

        await product.save();

        res.status(200).json({
            success: true,
            message: "Producto Creado",
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al guardar el Producto",
            error
        });
    }
};

export const getProducts = async (req, res) => {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };

    try {
        const products = await Product.find(query)
            .populate("category", "name") // Poblamos la categoría
            .skip(Number(desde))
            .limit(Number(limite));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los productos",
            error
        });
    }
};

export const searchProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id)
            .populate("category", "name");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto No Encontrado"
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al buscar el producto",
            error
        });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto No Encontrado"
            });
        }

        if (req.usuario.role === "CLIENT_ROLE") {
            return res.status(403).json({ 
                success: false, 
                message: "No autorizado para eliminar este producto" 
            });
        }

        product.status = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: "Producto Eliminado Exitosamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar el producto",
            error
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, ...data } = req.body;

        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto No Encontrado"
            });
        }

        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Categoría no válida"
                });
            }
            product.category = category;
        }

        Object.assign(product, data);
        await product.save();

        res.status(200).json({
            success: true,
            message: "Producto Actualizado",
            product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar el producto",
            error
        });
    }
};
