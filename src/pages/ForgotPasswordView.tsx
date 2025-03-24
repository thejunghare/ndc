import { NavLink } from "react-router-dom";
import { TextInput, Button, Label } from "flowbite-react";
import Header from "../reuseables/Header";

const ForgotPasswordView = () => {
  return (
    <div>
      <Header />
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-2xl font-semibold">
            Forgot Password
          </h2>
          <form className="mt-4 space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your Registered Email" />
              </div>
              <TextInput
                type="email"
                id="email"
                placeholder="Enter your email"
              />
            </div>

            <Button type="submit">Send Reset Link</Button>
          </form>

          <div className="mt-2 flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
            Remembered?&nbsp;
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

export default ForgotPasswordView;
