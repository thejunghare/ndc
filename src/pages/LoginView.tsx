import { NavLink, useNavigate } from "react-router-dom";
import { Button, Checkbox, Label, TextInput, Select } from "flowbite-react";
import Header from "../reuseables/Header";
import { useState } from "react";
import { useUser } from "../lib/UserContext";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from '../db/supabase';

const LoginView = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(false);
  const navigate = useNavigate();
  const { signIn } = useUser();
  const loginFailed = (err: any) => toast(`Login Failed! ${err}`);

  const handleLogin = async (email: string, password: string) => {
    setDisable(true);
    try {
      // First, sign in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (authError || !authData.user) throw authError || new Error("Login failed");
  
      const userId = authData.user.id;
  
      // Fetch role from profile table using the userId
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", userId)
        .single();
  
      if (profileError) throw profileError;
      if (!profileData) throw new Error("Profile not found");

      const userRole = profileData.role;
      console.log("User role is:", userRole);
  
      // Store the role in localStorage
      localStorage.setItem('userRole', userRole.toString());

      // Call the signIn function from UserContext to update the user state
      await signIn(email, password);
  
      // Navigate based on role
      if (userRole === 3) {
        navigate("/super-dashboard", { replace: true });
      } else if (userRole === 2) {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
  
    } catch (err: any) {
      loginFailed(err.message || err);
      console.error(err.message || err);
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
      />

      <Header />
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-2xl font-semibold">Login</h2>
          <form className="mt-4 space-y-4">
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

            <Button
              className="w-full"
              onClick={() => handleLogin(email, password)}
              disabled={disable}
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
