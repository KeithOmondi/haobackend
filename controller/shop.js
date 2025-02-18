const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Admin creates an agent
router.post("/create-agent", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, name, address, phoneNumber, zipCode } = req.body;

    // Check if agent already exists
    const existingAgent = await Shop.findOne({ email });
    if (existingAgent) {
      return next(new ErrorHandler("Agent already exists", 400));
    }

    // Upload avatar to Cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
    });

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString("hex");

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create the agent in the database
    const agent = await Shop.create({
      name,
      email,
      password: hashedPassword,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      address,
      phoneNumber,
      zipCode,
      role: "Agent", // Set role explicitly
      firstLogin: true, // Force password change on first login
    });

    // Send login details via email
    const resetToken = agent.getResetPasswordToken();
    await agent.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Update to your frontend reset password page

    const message = `
      Hello ${agent.name},

      Your agent account has been created.

      Login details:
      - Email: ${agent.email}
      - Temporary Password: ${randomPassword}

      Please reset your password using the link below before logging in:
      ${resetUrl}

      Regards,
      Admin Team
    `;

    try {
      await sendMail({
        email: agent.email,
        subject: "Your Agent Account Details",
        message,
      });

      res.status(201).json({
        success: true,
        message: `Agent created successfully! Login details sent to ${agent.email}`,
      });
    } catch (error) {
      return next(new ErrorHandler("Failed to send email", 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));


//login
router.post("/login", catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await Shop.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // If first login, force password reset
  if (user.firstLogin) {
    return res.status(403).json({
      success: false,
      message: "You must reset your password before logging in.",
    });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({
    success: true,
    token,
    user,
  });
}));

//forgot password for the agent
router.post("/forgot-password", catchAsyncErrors(async (req, res, next) => {
  const user = await Shop.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Generate password reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `https://your-app.com/reset-password/${resetToken}`;

  const message = `Click the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore.`;

  try {
    await sendMail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Reset password email sent!",
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to send email", 500));
  }
}));

//reset password
router.put("/reset-password/:token", catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await Shop.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.firstLogin = false; // Remove first login restriction

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully!",
  });
}));




module.exports = router;
