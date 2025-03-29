import { NavLink, useNavigate } from "react-router-dom"; 
import { Button, Checkbox, Label, TextInput, Select } from "flowbite-react";
import Header from "../reuseables/Header";
import { useState } from "react";
import { useUser } from "../lib/UserContext";
import { ToastContainer, toast } from 'react-toastify'

const LoginView = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(false);
  const [role, setRole] = useState<string>("Student"); 
  const navigate = useNavigate();
  const { login } = useUser();
  const loginFailed = (err:string) => toast(`Login Failed! ${err}`);
  const loginSuccess = () => toast("Welcome back!");

  const handleLogin = async (email: string, password: string) => {
    setDisable(true);
    try {
      await login(email, password);
      loginSuccess();
      // Role-based redirection can be added here if needed
      navigate(role === "Admin" ? "/admin-dashboard" : "/dashboard");
    } catch (err) {
      loginFailed(err.message);
      console.error(err);
      setDisable(false);
    }
  };

  return (
    <div>
        <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        // transition={Slide}
        />
      <Header />
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-2xl font-semibold">Login</h2>
          <form className="mt-4 space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="select" value="Select your role" />
              </div>
              <Select
                id="roles"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Student</option>
                <option>Admin</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput
                id="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Your password" />
              </div>
              <TextInput
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <NavLink
                to="/forgot-password"
                className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
              >
                Lost password?
              </NavLink>
            </div>

            <div className="w-full">
              <Button
                disabled={!email || !password || disable}
                isProcessing={disable}
                onClick={() => {
                  if (email && password) {
                    handleLogin(email, password);
                  } else {
                    console.warn("Email or password is missing.");
                  }
                }}
              >
                Log in to your account
              </Button>
            </div>

            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?{" "}
              <NavLink
                to="/create-account"
                className="text-cyan-700 hover:underline dark:text-cyan-500"
              >
                Create account
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;