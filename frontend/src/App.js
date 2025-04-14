import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/custom.css";
import "./styles/Resources.css";
import "./styles/attendance.css";
import "./App.css";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OAuthCallback from "./pages/OAuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import EditAnnouncement from "./pages/EditAnnouncement";
import LostItems from "./pages/LostItems";
import LostItemDetail from "./pages/LostItemDetail";
import CreateLostItem from "./pages/CreateLostItem";
import EditLostItem from "./pages/EditLostItem";
import Assignments from "./pages/Assignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import CreateAssignment from "./pages/CreateAssignment";
import EditAssignment from "./pages/EditAssignment";
import SubmitAssignment from "./pages/SubmitAssignment";
import Submissions from "./pages/Submissions";
import Attendance from "./pages/Attendance";
import MarkAttendance from "./pages/MarkAttendance";
import StudentAttendance from "./pages/StudentAttendance";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import CreateResource from "./pages/CreateResource";
import EditResource from "./pages/EditResource";
import CourseManagement from "./pages/admin/CourseManagement";
import CourseDetail from "./pages/admin/CourseDetail";
import EditCourse from "./pages/admin/EditCourse";
import UserManagement from "./pages/admin/UserManagement";
import FacultyDashboard from "./pages/faculty/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import CourseAssignments from "./pages/courses/Assignments";
import CourseResources from "./pages/courses/Resources";
import CourseAttendance from "./pages/courses/Attendance";
import CourseStudents from "./pages/courses/Students";
import AuthSuccess from "./pages/AuthSuccess";
import AuthFailure from "./pages/AuthFailure";
import AuthPending from "./pages/AuthPending";
import ApproveUsers from "./pages/ApproveUsers";
import SubmissionDetail from "./pages/SubmissionDetail";
import StudentCourseDetail from "./pages/student/CourseDetail";
import { AuthProvider } from "./context/AuthContext";
import MarkCourseAttendance from "./pages/MarkAttendance";
import CreateCourse from "./pages/admin/CreateCourse";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import JobApplications from "./pages/JobApplications";
import MyApplications from "./pages/MyApplications";
import PlacementDashboard from "./pages/placement/Dashboard";
import EditJob from "./pages/EditJob";
import JobApplicationForm from "./pages/JobApplicationForm";
import CanteenLogin from "./pages/canteen/CanteenLogin";
import CanteenLayout from "./components/canteen/CanteenLayout";
import UserDashboard from "./pages/canteen/UserDashboard";
import Checkout from "./pages/canteen/Checkout";
import UserOrders from "./pages/canteen/UserOrders";
import CanteenAdminDashboard from "./pages/canteen/admin/AdminDashboard";
import ProductManagement from "./pages/canteen/admin/ProductManagement";
import ProductForm from "./pages/canteen/admin/ProductForm";
import OrdersManagement from "./pages/canteen/admin/OrdersManagement";
import OrderDetail from "./pages/canteen/admin/OrderDetail";

// Components
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import ApiDebugger from "./components/ApiDebugger";
import Footer from "./components/Footer";
import HealthCheck from "./components/HealthCheck";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content main-container-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <PrivateRoute role="admin">
                    <CourseManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/courses/:id"
                element={
                  <PrivateRoute role="admin">
                    <CourseDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/courses/:id/edit"
                element={
                  <PrivateRoute role="admin">
                    <EditCourse />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute role="admin">
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route path="/admin/courses/create" element={<CreateCourse />} />
              <Route
                path="/faculty/dashboard"
                element={
                  <PrivateRoute role="faculty">
                    <FacultyDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/dashboard"
                element={
                  <PrivateRoute role="student">
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/announcements" element={<Announcements />} />
              <Route
                path="/announcements/:id"
                element={<AnnouncementDetail />}
              />
              <Route
                path="/announcements/new"
                element={
                  <AdminRoute>
                    <CreateAnnouncement />
                  </AdminRoute>
                }
              />
              <Route
                path="/announcements/edit/:id"
                element={
                  <AdminRoute>
                    <EditAnnouncement />
                  </AdminRoute>
                }
              />
              <Route path="/lost-items" element={<LostItems />} />
              <Route path="/lost-items/:id" element={<LostItemDetail />} />
              <Route
                path="/lost-items/new"
                element={
                  <PrivateRoute>
                    <CreateLostItem />
                  </PrivateRoute>
                }
              />
              <Route
                path="/lost-items/edit/:id"
                element={
                  <PrivateRoute>
                    <EditLostItem />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <PrivateRoute>
                    <Assignments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments/:id"
                element={
                  <PrivateRoute>
                    <AssignmentDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments/new"
                element={
                  <PrivateRoute>
                    <CreateAssignment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments/edit/:id"
                element={
                  <PrivateRoute>
                    <EditAssignment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments/:id/submit"
                element={
                  <PrivateRoute>
                    <SubmitAssignment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments/:id/submissions"
                element={
                  <PrivateRoute>
                    <Submissions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignments/:assignmentId/submission/:submissionId"
                element={<SubmissionDetail />}
              />
              <Route
                path="/attendance"
                element={
                  <PrivateRoute>
                    <Attendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/attendance/mark"
                element={
                  <PrivateRoute>
                    <MarkAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/attendance/student"
                element={
                  <PrivateRoute>
                    <StudentAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <PrivateRoute>
                    <Resources />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resources/:resourceId"
                element={
                  <PrivateRoute>
                    <ResourceDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resources/new"
                element={
                  <PrivateRoute>
                    <CreateResource />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resources/edit/:id"
                element={
                  <PrivateRoute>
                    <EditResource />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id"
                element={
                  <PrivateRoute>
                    {({ user }) =>
                      user.role === "student" ? (
                        <StudentCourseDetail />
                      ) : (
                        <CourseDetail />
                      )
                    }
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id/assignments"
                element={
                  <PrivateRoute>
                    <CourseAssignments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id/resources"
                element={
                  <PrivateRoute>
                    <CourseResources />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id/attendance"
                element={
                  <PrivateRoute>
                    <CourseAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id/attendance/mark"
                element={
                  <PrivateRoute role="faculty">
                    <MarkCourseAttendance />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:id/students"
                element={
                  <PrivateRoute role="faculty">
                    <CourseStudents />
                  </PrivateRoute>
                }
              />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/auth/failure" element={<AuthFailure />} />
              <Route path="/auth/pending" element={<AuthPending />} />
              <Route
                path="/placement/dashboard"
                element={
                  <PrivateRoute role="placement">
                    <PlacementDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/create"
                element={
                  <PrivateRoute role="placement">
                    <CreateJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/:id/applications"
                element={
                  <PrivateRoute role="placement">
                    <JobApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/:id/edit"
                element={
                  <PrivateRoute role="placement">
                    <EditJob />
                  </PrivateRoute>
                }
              />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route
                path="/my-applications"
                element={
                  <PrivateRoute role="student">
                    <MyApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobs/:id/apply"
                element={
                  <PrivateRoute role="student">
                    <JobApplicationForm />
                  </PrivateRoute>
                }
              />
              <Route path="/canteen/login" element={<CanteenLogin />} />
              <Route path="/canteen" element={<CanteenLayout />}>
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <UserOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <CanteenAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ProductManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products/new"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <OrdersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="/approve/new-users" element={<ApproveUsers />} />
            </Routes>
          </main>
          <Footer />
          <HealthCheck />
          <ToastContainer position="bottom-right" />
          {process.env.NODE_ENV === "development" && <ApiDebugger />}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
