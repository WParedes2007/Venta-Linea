import { Router } from "express";
import { check } from "express-validator";
import { getUserBills, getBillById, cancelBill, updateBill, markBillAsPaid,checkout } from "./bill.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import {validarRol} from "../middlewares/validar-roles.js"

const router = Router();

router.get("/", 
    [
        validarJWT,
    ],
    getUserBills);

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
        validarRol("ADMIN_ROLE"),
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    cancelBill
);

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

router.post(
    "/checkout",
    [
        validarJWT,
        validarRol("CLIENT_ROLE"),
    ],
    checkout
);




export default router;
