import Session from "../../models/SessionModel.js";
export const logout = async (
  req,
  res,
  next
) => {
  try {

    await Session.deleteOne({
      token: req.token,
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
    });

    res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
    });

  } catch (error) {
    next(error);
  }
};