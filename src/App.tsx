import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import { UserProvider, useUser } from "./lib/UserContext";
import { FormProvider } from "./lib/ndcFormContext";
import LoginView from "./pages/LoginView";
import DashboardView from "./pages/DashboardView";
import NotFoundView from "./pages/NotFoundView";
import ForgotPasswordView from "./pages/ForgotPasswordView";
import CreateAccountView from "./pages/CreateAccountView";
import AdminDashboard from "./pages/AdminDashboard";
// import Header from "./reuseables/Header";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import RoleProtectedRoute from "./lib/RoleProtectedRoute";

function AppContent() {
  const { current } = useUser();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (current !== undefined) {
      setLoading(false);
    }
  }, [current]);

  if (loading) {
    return (
      <div className="relative m-6 h-screen w-screen outline-dashed outline-1 outline-black">
        <div className="absolute left-1/2 top-1/2 h-[50px] w-[50px] -translate-x-1/2 -translate-y-1/2 transform">
          <Spinner aria-label="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* {current && <Header onLogout={logout} />} */}
      <Routes>
        <Route
          path="/"
          element={current ? <Navigate to="/dashboard" /> : <LoginView />}
        />
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={[1]}>
              <DashboardView />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/super-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={[3]}>
              <SuperAdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={[2]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/create-account" element={<CreateAccountView />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <FormProvider>
          <AppContent />
        </FormProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
