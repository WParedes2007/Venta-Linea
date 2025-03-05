import { Router } from "express";
import { check } from "express-validator";
import { createBill, getUserBills, getBillById, cancelBill, updateBill, markBillAsPaid, checkout, getPurchaseHistory } from "./bill.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarRol } from "../middlewares/validar-roles.js";

const router = Router();

// Ruta para crear una nueva factura
router.post(
    "/",
    [
        validarJWT,
        check("cartId", "El ID del carrito es obligatorio").not().isEmpty(),
        check("cartId", "No es un ID válido").isMongoId(),
        check("shippingAddress", "La dirección de envío es obligatoria").not().isEmpty(),
        validarCampos
    ],
    createBill
);

// Ruta para obtener todas las facturas del usuario (dependiendo del rol)
router.get("/", 
    [
        validarJWT,
    ],
    getUserBills);

// Ruta para obtener una factura específica por ID
router.get(
    "/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    getBillById
);

// Ruta para cancelar una factura por ID (solo administradores pueden hacerlo)
router.put(
    "/cancel/:id",
    [
        validarJWT,
        validarRol("ADMIN_ROLE"),
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    cancelBill
);

// Ruta para actualizar una factura (solo administradores pueden hacerlo)
router.put(
    "/:id",
    [
        validarJWT,
        validarRol("ADMIN_ROLE"),
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    updateBill
);

// Ruta para marcar una factura como pagada (solo administradores pueden hacerlo)
router.put(
    "/paid/:id", 
    [
        validarJWT,  
        validarRol("ADMIN_ROLE"), 
        check("id", "No es un ID válido").isMongoId(), 
        validarCampos 
    ], 
    markBillAsPaid
);

// Ruta para realizar el checkout
router.post(
    "/checkout",
    [
        validarJWT,
        validarRol("CLIENT_ROLE"),
    ],
    checkout
);


export default router;
