import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LibraryHomepage from "./Pages/Home/LibraryHomepage";
import SearchPage from "./Pages/Home/SearchPage";
import BookDetail from "./Pages/Home/BookDetail";
import StudentDashboard from "./Pages/StudentDashboard";
import AdminDashboard from "./Pages/Administrator/Dashboard";
import BookInventory from "./Pages/Administrator/BookInventory";
import StudentsManagement from "./Pages/Administrator/StudentManagement";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./context/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProtectedRoute element={<LibraryHomepage />} isPublic />} />
          <Route path="/search" element={<ProtectedRoute element={<SearchPage />} isPublic />} />
          <Route path="/book/:id" element={<ProtectedRoute element={<BookDetail />} isPublic />} />

          {/* Student Routes - Public/Guest Access */}
          <Route
            path="/student"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />

          {/* Admin Routes - Public/Guest Access */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/inventory"
            element={<BookInventory />}
          />
          <Route
            path="/admin/students"
            element={<StudentsManagement />}
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div style={{ textAlign: "center", padding: "40px" }}>
                <h1>Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
                <a href="/">Go back home</a>
              </div>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;