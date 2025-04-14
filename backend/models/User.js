const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "iiitdwd.ac.in"; // fallback if not set

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["student", "faculty", "admin", "placement"],
    default: "student",
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password not required if using Google auth
    },
    minlength: 6,
    select: false,
  },
  googleId: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profile: {
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    degree: String,
    batch: String,
    skills: String,
    resumeLink: String,
  },
  status: {
    type: String,
    enum: ["approved", "pending"],
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Password hashing error:", error);
    next(error);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// create a function to delete the user
UserSchema.methods.deleteUser = async function () {
  try {
    await this.deleteOne(); // or await this.remove() for older Mongoose versions
    console.log("User deleted successfully");
    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Error deleting user");
  }
};

module.exports = mongoose.model("User", UserSchema);
