const User = require("../models/User");
const Course = require("../models/Course");
const { clearCache } = require("../middleware/cache");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Build query
    let query = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by search term
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select("-password")
      .sort("name")
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please provide a role",
      });
    }

    // Check if role is valid
    const validRoles = ["student", "faculty", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Enroll user to courses
// @route   PUT /api/users/:id/enroll
// @access  Private/Admin
exports.enrollUserToCourses = async (req, res) => {
  try {
    const { courses } = req.body;

    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of course IDs",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate all courses exist
    for (const courseId of courses) {
      const courseExists = await Course.findById(courseId);
      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${courseId} not found`,
        });
      }
    }

    // Update user's enrolled courses
    user.enrolledCourses = courses;
    await user.save();

    // Update course's faculty or students list
    for (const courseId of courses) {
      const course = await Course.findById(courseId);

      if (user.role === "faculty") {
        if (!course.faculty.includes(user._id)) {
          course.faculty.push(user._id);
          await course.save();
        }
      } else if (user.role === "student") {
        if (!course.students.includes(user._id)) {
          course.students.push(user._id);
          await course.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get faculty by course
// @route   GET /api/users/faculty/course/:courseId
// @access  Private
exports.getFacultyByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate(
      "faculty",
      "name email"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      count: course.faculty.length,
      data: course.faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get students by course
// @route   GET /api/users/students/course/:courseId
// @access  Private/Faculty
exports.getStudentsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if faculty is assigned to this course
    if (req.user.role === "faculty" && !course.faculty.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this course",
      });
    }

    const students = await User.find({
      _id: { $in: course.students },
      role: "student",
    }).select("name email");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteUser();

    // Clear cache
    clearCache("/api/users");

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { cgpa, degree, batch, skills, resumeLink } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile
    user.profile = {
      ...user.profile,
      cgpa: cgpa || user.profile?.cgpa,
      degree: degree || user.profile?.degree,
      batch: batch || user.profile?.batch,
      skills: skills || user.profile?.skills,
      resumeLink: resumeLink || user.profile?.resumeLink,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get user courses
// @route   GET /api/users/courses
// @access  Private
exports.getUserCourses = async (req, res) => {
  try {
    console.log(`Getting courses for user: ${req.user.id} (${req.user.role})`);

    let courses = [];

    // If user is a student, get enrolled courses
    if (req.user.role === "student") {
      courses = await Course.find({ students: req.user.id })
        .populate({
          path: "faculty",
          select: "name",
        })
        .sort("name");

      console.log(`Found ${courses.length} courses for student`);
    }
    // If user is a faculty, get assigned courses
    else if (req.user.role === "faculty") {
      courses = await Course.find({ faculty: req.user.id }).sort("name");

      console.log(`Found ${courses.length} courses for faculty`);
    }
    // If user is an admin, get all courses
    else if (req.user.role === "admin") {
      courses = await Course.find()
        .populate({
          path: "faculty",
          select: "name",
        })
        .sort("name");

      console.log(`Found ${courses.length} courses for admin`);
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Get user courses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clear cache
    clearCache("/api/users");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // User is already available in req.user from the protect middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        enrolledCourses: user.enrolledCourses,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getUsersWithStatus = async (req, res) => {
  try {
    const status = req.query.status;
    const users = await User.find({ status });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error getting users by status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
