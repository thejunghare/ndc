import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Spinner } from "flowbite-react";
import { UserProvider, useUser } from "./lib/UserContext";
import {FormProvider} from "./lib/ndcFormContext";
import LoginView from "./pages/LoginView";
import DashboardView from "./pages/DashboardView";
import NotFoundView from "./pages/NotFoundView";
import ForgotPasswordView from "./pages/ForgotPasswordView";
import CreateAccountView from "./pages/CreateAccountView";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "./reuseables/Header";


const AuthenticatedRoute = ({ element }: { element: JSX.Element }) => {
  const { current } = useUser();
  return current ? element : <Navigate to="/" />;
};

function AppContent() {
  const { current, logout } = useUser();
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
      {current && <Header onLogout={logout} />}
      <Routes>
        <Route
          path="/"
          element={current ? <Navigate to="/dashboard" /> : <LoginView />}
        />
        <Route
          path="/dashboard"
          element={<AuthenticatedRoute element={<DashboardView />} />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/create-account" element={<CreateAccountView />} />
        <Route
          path="/admin-dashboard"
          element={<AuthenticatedRoute element={<AdminDashboard />} />}
        />
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
