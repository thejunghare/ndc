import { Button, Label, TextInput } from "flowbite-react";
// import Header from "../reuseables/Header";
import { useState } from "react";
import { useUser } from "../lib/UserContext";
import { ToastContainer, toast } from "react-toastify";
import { NavLink } from "react-router-dom";

const CreateAccountView = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [disable, setDisable] = useState<boolean>(false);
  const { signUp } = useUser();

  const accountCreated = () => toast("Account created!");
  const accountCreatedFailed = () => toast("Error while creating account!");

  const handleCreateAccount = async (
    email: string,
    confirmPassword: string,
  ) => {
    setDisable(true);
    if (password === confirmPassword) {
      try {
        await signUp(email, confirmPassword);
        accountCreated();
        alert("Please confirm your email and login");
      } catch (error) {
        accountCreatedFailed();
        setDisable(false);
      }
    } else {
      alert("Password and Confirm password do not match!");
    }
  };

  return (
    <div className="flex min-h-screen">
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />

      {/* Left side image */}
      <div className="m-8 hidden w-1/2 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-700 md:flex">
        <div className="p-8 text-center">
          <h1
            className="mb-4 text-4xl
 font-bold tracking-tighter text-white antialiased"
          >
            Join Us!
          </h1>
          <p className="text-lg font-semibold tracking-tighter antialiased">
            Create your account and start your journey
          </p>
          <img
            src="https://illustrations.popsy.co/gray/work-from-home.svg"
            alt="Create Account"
            className="mx-auto w-3/4"
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 md:w-1/2">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8">
          <h2 className="mb-6 text-3xl font-bold tracking-tighter text-gray-900 antialiased">
            Sign Up
          </h2>
          <p className="mb-6 text-sm tracking-tighter text-gray-500 antialiased">
            By continuing, you agree to our User Agreement and acknowledge that
            you understand the Privacy Policy.
          </p>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password" value="Password" />
              <TextInput
                id="password"
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirm_password" value="Confirm Password" />
              <TextInput
                id="confirm_password"
                type="password"
                required
                value={confirmPassword}
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              type="button"
              color={"dark"}
              onClick={() => handleCreateAccount(email, confirmPassword)}
              disabled={disable}
            >
              Register
            </Button>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <NavLink to="/" className="text-blue-600 hover:underline">
                Log In
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountView;
