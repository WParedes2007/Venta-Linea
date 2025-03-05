import { Router } from "express";
import { createPurchase, getUserPurchases } from "./purchase.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/", validarJWT, createPurchase);

router.get("/history", validarJWT, getUserPurchases);

export default router;
