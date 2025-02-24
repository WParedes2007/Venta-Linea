import { Router } from "express";
import { check } from "express-validator";
import { createBill, getUserBills, getBillById, cancelBill } from "./bill.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        check("products", "Los productos son obligatorios").isArray().notEmpty(),
        check("shippingAddress", "La dirección de envío es obligatoria").not().isEmpty(),
        validarCampos
    ],
    createBill
);

router.get("/", validarJWT, getUserBills);

router.get(
    "/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    getBillById
);

router.put(
    "/cancel/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    cancelBill
);

export default router;
