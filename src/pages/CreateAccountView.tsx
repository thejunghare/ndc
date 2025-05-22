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
  // const navigate = useNavigate();
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
        // navigate("/");
        alert("Please confirm your mail and login")
      } catch (error) {
        accountCreatedFailed();
        setDisable(false);
      }
    }else {
      alert('Password and Confirm password does not match!')
    }
  
  };

  return (
    <div>
      <ToastContainer/>
      <Header />
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-2xl font-semibold">Create Account</h2>
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
                <Label htmlFor="password" value="Set Password" />
              </div>
              <TextInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="confirm_password" value="Confirm Password" />
              </div>
              <TextInput
                id="confirm_password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="button"
              onClick={() =>
                handleCreateAccount(email, confirmPassword)
              }
            >
              Register
            </Button>
          </form>

          <div className="mt-2 flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
            Already registered?&nbsp;
            <a
              href="#"
              className="text-cyan-700 hover:underline dark:text-cyan-500"
            >
              <NavLink to="/">Log In</NavLink>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountView;
