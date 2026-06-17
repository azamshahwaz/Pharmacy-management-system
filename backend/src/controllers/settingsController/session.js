import Session from "../../models/SessionModel.js";

// =====================================
// GET ACTIVE SESSIONS
// =====================================
export const getSessions = async (
  req,
  res,
  next
) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
    })
      .select("-token")
      .sort({
        createdAt: -1,
      });

    const formattedSessions =
      sessions.map((session) => ({
        ...session.toObject(),
      }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions,
    });

  } catch (error) {
    console.error(
      "getSessions error:",
      error
    );
    next(error);
  }
};

// =====================================
// LOGOUT SINGLE SESSION
// =====================================
export const logoutSession = async (
  req,
  res,
  next
) => {
  try {
    const session =
      await Session.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!session) {
      const error = new Error(
        "Session not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Session removed",
    });

  } catch (error) {
    console.error(
      "logoutSession error:",
      error
    );
    next(error);
  }
};

// =====================================
// LOGOUT ALL EXCEPT CURRENT SESSION
// =====================================
export const logoutAllSessions =
  async (req, res, next) => {
    try {
      await Session.deleteMany({
        user: req.user.id,
        token: {
          $ne: req.token,
        },
      });

      res.status(200).json({
        success: true,
        message:
          "Logged out from all other devices",
      });

    } catch (error) {
      console.error(
        "logoutAllSessions error:",
        error
      );
      next(error);
    }
  };