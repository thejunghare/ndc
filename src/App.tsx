import LoginView from "./pages/LoginView";
import DashboardView from "./pages/DashboardView";
import NotFoundView from "./pages/NotFoundView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgotPasswordView from "./pages/ForgotPasswordView";
import CreateAccountView from "./pages/CreateAccountView";

function App() {
  return (
    <Router>
      <Routes>
        <Route index path="/" element={<LoginView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="*" element={<NotFoundView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />
        <Route path="/create-account" element={<CreateAccountView />} />
      </Routes>
    </Router>
  );
}

export default App;
