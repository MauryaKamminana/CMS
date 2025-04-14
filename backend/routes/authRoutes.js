const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/auth/failure`,
    session: false,
  }),
  (req, res) => {
    if (req.user.status === "pending") {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/pending`
      );
    }

    // Successful authentication, redirect with token
    const token = req.user.getSignedJwtToken();

    // Redirect to frontend with token
    res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/auth/success?token=${token}`
    );
  }
);

router.post("/admin/approve", protect, authorize("admin"), async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndUpdate(
    { email },
    { status: "approved" },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, message: "User approved", user });
});

module.exports = router;
