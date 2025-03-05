export const validarRol = (...roles) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(500).json({
                success: false,
                msg: "Se quiere verificar un rol sin validar el token antes"
            });
        }

        const { role, _id } = req.usuario;
        
        if (roles.includes(role)) {
            return next();
        }

        if (role === "CLIENT_ROLE") {
            if (req.params.id === _id.toString() || req.originalUrl.includes("/unsubscribe")) {
                return next(); 
            }
        }

        if (role === "ADMIN_ROLE") {
            if (req.params.id === _id.toString() || req.originalUrl.includes("/unsubscribe")) {
                return next(); 
            }
        }

        return res.status(403).json({
            success: false,
            msg: `Usuario no autorizado, posee un rol ${role}, los roles autorizados son ${roles.join(", ")}`
        });
    };
};
