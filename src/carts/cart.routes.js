import { Router } from "express";
import { check } from "express-validator";
import { getCart, addToCart, removeFromCart, clearCart } from "./cart.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

router.get("/", 
    [
    validarJWT
    ],
    getCart
);

router.post(
    "/add",
    [
        validarJWT,
        check("productId", "El ID del producto es obligatorio").isMongoId(),
        check("quantity", "La cantidad debe ser mayor a 0").isInt({ min: 1 }),
        validarCampos
    ],
    addToCart
);

router.delete(
    "/remove/:productId",
    [
        validarJWT,
        check("productId", "El ID del producto es obligatorio").isMongoId(),
        validarCampos
    ],
    removeFromCart
);

router.delete("/clear", validarJWT, clearCart);

export default router;
