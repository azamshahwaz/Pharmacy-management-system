export const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    // 1. User check
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    // 2. Role check
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};