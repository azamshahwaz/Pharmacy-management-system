const adminMiddleware = (req, res, next) => {

  // Example admin check

  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

export default adminMiddleware;