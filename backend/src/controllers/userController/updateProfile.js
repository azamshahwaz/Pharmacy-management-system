import User from "../../models/User.js";
import ActivityLog from "../../models/Activitylog.js";

export const updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      const error = new Error(
        "User not found"
      );
      error.statusCode = 404;
      return next(error);
    }

    const {
      name,
      email,
      phone,
      shopName,
      street,
      city,
      removeAvatar,
    } = req.body;

    let updatedFields = [];
    let sameFields = [];

    // ================= EMAIL CHECK =================

    if (email !== undefined) {
      const newEmail =
        email.trim();

      const currentEmail =
        user.email?.trim() || "";

      if (
        newEmail === currentEmail
      ) {
        sameFields.push(
          "Email"
        );
      } else {
        const emailExists =
          await User.findOne({
            email: newEmail,
          });

        if (
          emailExists &&
          emailExists._id.toString() !==
            user._id.toString()
        ) {
          const error = new Error(
            "Email already in use"
          );

          error.statusCode = 400;

          return next(error);
        }

        user.email = newEmail;

        updatedFields.push(
          "Email"
        );
      }
    }

    // ================= NAME CHECK =================

    if (name !== undefined) {
      const newName =
        name.trim();

      const currentName =
        user.name?.trim() || "";

      if (
        newName === currentName
      ) {
        sameFields.push(
          "Name"
        );
      } else {
        user.name = newName;

        updatedFields.push(
          "Name"
        );
      }
    }

    // ================= PHONE CHECK =================

    if (phone !== undefined) {
      const newPhone =
        String(phone).trim();

      const currentPhone =
        user.phone
          ? String(
              user.phone
            ).trim()
          : "";

      if (
        newPhone ===
        currentPhone
      ) {
        sameFields.push(
          "Phone"
        );
      } else {
        const phoneExists =
          await User.findOne({
            phone: newPhone,
          });

        if (
          phoneExists &&
          phoneExists._id.toString() !==
            user._id.toString()
        ) {
          const error = new Error(
            "Phone already in use"
          );

          error.statusCode = 400;

          return next(error);
        }

        user.phone =
          newPhone;

        updatedFields.push(
          "Phone"
        );
      }
    }

    // ================= CUSTOMER ADDRESS =================

    if (
      user.role === "customer"
    ) {
      if (!user.address) {
        user.address = {};
      }

      if (
        shopName !== undefined
      ) {
        const newShopName =
          shopName.trim();

        const currentShopName =
          user.address.shopName?.trim() ||
          "";

        if (
          newShopName ===
          currentShopName
        ) {
          sameFields.push(
            "Shop Name"
          );
        } else {
          user.address.shopName =
            newShopName;

          updatedFields.push(
            "Shop Name"
          );
        }
      }

      if (
        street !== undefined
      ) {
        const newStreet =
          street.trim();

        const currentStreet =
          user.address.street?.trim() ||
          "";

        if (
          newStreet ===
          currentStreet
        ) {
          sameFields.push(
            "Street"
          );
        } else {
          user.address.street =
            newStreet;

          updatedFields.push(
            "Street"
          );
        }
      }

      if (
        city !== undefined
      ) {
        const newCity =
          city.trim();

        const currentCity =
          user.address.city?.trim() ||
          "";

        if (
          newCity ===
          currentCity
        ) {
          sameFields.push(
            "City"
          );
        } else {
          user.address.city =
            newCity;

          updatedFields.push(
            "City"
          );
        }
      }

      user.markModified(
        "address"
      );
    }

    // ================= AVATAR UPLOAD =================

    if (req.file) {
      user.avatar =
        req.file.path;

      updatedFields.push(
        "Avatar"
      );
    }

    // ================= AVATAR REMOVE =================

    if (
      removeAvatar ===
      "true"
    ) {
      user.avatar = "";

      updatedFields.push(
        "Avatar Removed"
      );
    }

    // ================= SAVE =================

    if (
      updatedFields.length > 0
    ) {
      await user.save();

      await ActivityLog.create({
        user: user._id,
        action:
          "PROFILE_UPDATED",
        targetId:
          user._id,
        targetType:
          "User",
      });
    }

    // ================= RESPONSE =================

    const userData =
      user.toObject();

    delete userData.password;

    let message = "";

    if (
      updatedFields.length ===
        0 &&
      sameFields.length > 0
    ) {
      message =
        "All fields are same";
    } else if (
      updatedFields.length >
        0 &&
      sameFields.length === 0
    ) {
      message = `${updatedFields.join(
        ", "
      )} updated`;
    } else if (
      updatedFields.length >
        0 &&
      sameFields.length > 0
    ) {
      message = `${updatedFields.join(
        ", "
      )} updated and ${sameFields.join(
        ", "
      )} are same`;
    } else {
      message =
        "No changes made";
    }

    res.status(200).json({
      success: true,
      message,
      user: userData,
    });

  } catch (error) {
    console.error(
      "Update Profile Error:",
      error
    );

    next(error);
  }
};