import { Router } from 'express';
import { login, register} from './auth.controller.js';
import { registerValidator, loginValidator} from "../middlewares/validator.js";
import { uploadProfilePicture } from "../middlewares/multer-upload.js";
import { deleteFileOnError } from "../middlewares/deleteFileOnError.js";

const router = Router();

router.post(
    '/login',
    loginValidator,
    login
);  

router.post(
    '/register',
    uploadProfilePicture.single("profile_picture"),
    registerValidator,
    deleteFileOnError,
    register
);


export default router;