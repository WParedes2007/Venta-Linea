import { Router } from "express";
import { check } from "express-validator";
import { getUsers, getUserById, updateUser, deleteUser, updatePassword} from "./user.controller.js";
import { existeUsuarioById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();


router.get("/", getUsers);

router.get(
    "/findUser/:id",
    [
        check("id", "No es un ID Valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    getUserById
)

router.put(
    "/:id",
    [
        check("id", "No es un ID Valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateUser
)

router.put(
    "/update-password/:id",
    [
        validarJWT,
        check("id", "No es un ID Valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updatePassword
)

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "No es un ID Valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    deleteUser
)


export default router;