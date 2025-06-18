import { Button, Label, TextInput } from "flowbite-react";
import Header from "../reuseables/Header";
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

  const handleCreateAccount = async (email: string, confirmPassword: string) => {
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
    <div className="min-h-screen flex">
      <ToastContainer />
      {/*<Header />*/}
      <div className="w-1/2 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <h1 className="text-4xl font-bold">Join Us</h1>
          <p className="text-lg">Create your account and start your journey</p>
          <img src="https://illustrations.popsy.co/gray/work-from-home.svg" alt="Create Account" className="w-3/4 mx-auto" />
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">Create Account</h2>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email" value="Email" />
              <TextInput id="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="password" value="Password" />
              <TextInput id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="confirm_password" value="Confirm Password" />
              <TextInput id="confirm_password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <Button className="w-full" type="button" onClick={() => handleCreateAccount(email, confirmPassword)} disabled={disable}>
              Register
            </Button>

            <div className="text-sm text-center mt-4">
              Already have an account?{" "}
              <NavLink to="/" className="text-blue-600 hover:underline">Log In</NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountView;
