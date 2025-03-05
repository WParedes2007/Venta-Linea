import { Router } from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../categories/category.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarRol } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/",
    [
    validarJWT,
    validarRol("ADMIN_ROLE")
    ],
    createCategory
);

router.get("/", getCategories);

router.put(
    "/:id",
    [
        validarJWT,
        validarRol("ADMIN_ROLE")
    ],
    updateCategory
);

router.delete(
    "/:id", 
    [
        validarJWT,
        validarRol("ADMIN_ROLE")
    ],
    deleteCategory
    );

export default router;
