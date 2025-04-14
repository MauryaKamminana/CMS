const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "iiitdwd.ac.in";

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.API_URL || "http://localhost:5000"
      }/api/auth/google/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the email domain is allowed
        const email = profile.emails[0].value;
        const domain = email.split("@")[1];

        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email });

        if (user) {
          // Update with Google ID if missing
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email,
          googleId: profile.id,
          role: "student", // default role
          status: domain === ALLOWED_DOMAIN ? "approved" : "pending",
        });

        await newUser.save();

        return done(null, newUser);
      } catch (error) {
        console.error("Google auth error:", error);
        done(error, null);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
