import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { supabase } from "../db/supabase";
import { useUser } from "../lib/UserContext";
import { ToastContainer, toast } from "react-toastify";

const LoginView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disable, setDisable] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useUser();

  const loginFailed = (err) => toast.error(`Login Failed! ${err}`);

  const handleLogin = async (e) => {
    e.preventDefault();
    setDisable(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) throw authError || new Error("Login failed");

      const userId = authData.user.id;
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      const userRole = profileData.role;

      localStorage.setItem("userRole", userRole.toString());
      await signIn(email, password);

      if (userRole === 3) navigate("/super-dashboard", { replace: true });
      else if (userRole === 2) navigate("/admin-dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      loginFailed(err.message || err);
      setDisable(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />

      {/* Left side image */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-blue-600 to-indigo-700 justify-center items-center">
        <div className="text-center px-8">
          <h1 className="text-white text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-white/80 text-lg">
            Sign in to continue to your dashboard.
          </p>
          <img
            src="https://illustrations.popsy.co/gray/work-from-home.svg"
            alt="login"
            className="mt-10 max-w-xs mx-auto"
          />
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Login</h2>
          <p className="text-sm text-gray-500 mb-6">
            By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" value="Email" className="font-medium" />
              <TextInput
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password" value="Password" className="font-medium" />
              <TextInput
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="ml-2 text-sm">
                  Remember me
                </Label>
              </div>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button type="submit" disabled={disable} className="w-full text-white font-semibold">
              {disable ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <a href="/create-account" className="text-blue-600 font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
