const express = require("express");
const {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  updateProfile,
  enrollUserToCourses,
  getFacultyByCourse,
  getStudentsByCourse,
  getUserCourses,
  updateUser,
  getProfile,
  getUsersWithStatus,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const { admin } = require("../middleware/admin");
const { faculty } = require("../middleware/faculty");
const { cacheMiddleware } = require("../middleware/cache");

const router = express.Router();

router.get("/userWithStatus", protect, authorize("admin"), getUsersWithStatus);

// User profile routes - place these BEFORE the /:id routes to avoid conflicts
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// User courses route
router.get("/courses", protect, getUserCourses);

// Admin routes
router
  .route("/")
  .get(protect, authorize("admin"), cacheMiddleware(300), getUsers);

router
  .route("/:id")
  .get(protect, authorize("admin"), getUser)
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

// Faculty routes
router.get("/faculty/course/:courseId", protect, getFacultyByCourse);

// Student routes
router.get(
  "/students/course/:courseId",
  protect,
  authorize("faculty", "admin"),
  getStudentsByCourse
);

module.exports = router;
