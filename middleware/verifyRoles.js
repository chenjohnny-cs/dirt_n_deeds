const verifyRoles = function(...allowedRoles) {
    return (req, res, next) => {
        if (!req?.roles) return res.status(401).json({ message: "Unauthorized" });
    
        const rolesArray = [...allowedRoles];
        const hasRole = req.roles.some(role => rolesArray.includes(role));
    
        if (!hasRole) return res.status(403).json({ message: "Forbidden" });
        next();
      };
}

module.exports = verifyRoles;