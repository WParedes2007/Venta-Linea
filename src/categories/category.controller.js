import Category from "../categories/category.model.js"
import Product from "../products/product.model.js"

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = new Category({ name });
        await category.save();

        res.status(201).json({
            success: true,
            message: "Categoría creada",
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear la categoría",
            error
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: true });
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener categorías",
            error
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findByIdAndUpdate(id, { name }, { new: true });

        res.status(200).json({
            success: true,
            message: "Categoría actualizada",
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar la categoría",
            error
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const defaultCategory = await Category.findOne({ name: "General" });
        if (!defaultCategory) {
            return res.status(500).json({
                success: false,
                message: "No se encontró la categoría por defecto"
            });
        }

        await Product.updateMany({ category: id }, { category: defaultCategory._id });

        await Category.findByIdAndUpdate(id, { status: false });

        res.status(200).json({
            success: true,
            message: "Categoría eliminada y publicaciones reasignadas"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar la categoría",
            error: error.message 
        });
    }
};
