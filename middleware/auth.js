const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

// Authenticate User
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return next(new ErrorHandler("User not found", 404));
  }

  next();
});

// Admin Authorization Middleware
exports.isAdmin = (...roles) => {
  return (req,res,next) => {
      if(!roles.includes(req.user.role)){
          return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
      };
      next();
  }
}

