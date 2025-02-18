const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Completed", "Failed"],
      default: "Processing",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the agent name!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter agent email address"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password must be at least 6 characters"],
      select: false, // Prevents password from being returned in queries
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"], // Validates international format
    },
    role: {
      type: String,
      enum: ["agent", "admin"],
      default: "agent",
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    zipCode: {
      type: String,
      required: true,
    },
    withdrawMethod: {
      type: Object,
      default: {},
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    transactions: [transactionSchema], // Uses a separate schema for better structure
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTime: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt timestamps
);

// 🔒 **Pre-save Middleware for Password Hashing**
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 **Generate JWT Token**
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES || "1d",
  });
};

// 🔐 **Compare Password**
shopSchema.methods.validatePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ **Prevent Returning Sensitive Data by Default**
shopSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordTime;
    return ret;
  },
});

module.exports = mongoose.model("Shop", shopSchema);
