import { Router } from "express";
import { check } from "express-validator";
import { query } from "express-validator";
import { saveProduct, getProducts, searchProduct, deleteProduct, updateProduct, getBestSellingProducts, getOutOfStockProducts} from "./product.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import {validarRol} from "../middlewares/validar-roles.js"

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        validarRol("ADMIN_ROLE"),
        check("name", "El nombre del producto es obligatorio").not().isEmpty(),
        check("category", "La categoría es obligatoria").not().isEmpty(),
        check("price", "El precio es obligatorio").isFloat({ gt: 0 }).withMessage("El precio debe ser un número mayor a 0"),
        check("stock", "El stock es obligatorio").isInt({ gt: 0 }).withMessage("El stock debe ser un número mayor a 0"),
        validarCampos,
    ],
    saveProduct
);


router.get(
    '/',
    [
      query('limite').optional().isInt({ min: 1 }).withMessage('Limite debe ser un número mayor a 0'),
      query('desde').optional().isInt({ min: 0 }).withMessage('Desde debe ser un número mayor o igual a 0'),
      query('sort').optional().isIn(['name', 'price', 'stock']).withMessage('Orden de sort no válido'),
      query('order').optional().isIn(['asc', 'desc']).withMessage('Orden debe ser "asc" o "desc"'),
      validarCampos,
    ],
    getProducts
  );

router.get(
    "/findProduct/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    searchProduct
);

router.get("/out-of-stock", 
    [
        validarJWT
    ],
    getOutOfStockProducts
);

router.get("/best-selling", 
    [
        validarJWT
    ], getBestSellingProducts
);

router.put(
    "/:id",
    [
        validarJWT,
        validarRol("ADMIN_ROLE"),
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    updateProduct
);

router.delete(
    "/:id",
    [
        validarJWT,
        validarRol("ADMIN_ROLE"),
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    deleteProduct
);

export default router;
