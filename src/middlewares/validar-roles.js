export const tieneRole = (...roles) => {
    return (req, res, next) => {
        if(!req.usuario){
            return res.status(500).json({
                success:false,
                msg: "Se quiere verificar un Role Sin Validar El Token Antes"
            })
        }

        if(!roles.includes(req.usuario.role)){
            return res.status(401).json({
                success: false,
                msg: `Usuario No Autorizado, Posee Un Rol ${req.usuario.role}, los roles autorizados son ${roles}`
            })
        }

        next();
    }
}