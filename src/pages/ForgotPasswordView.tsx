// TODO: fix resposnive desgin

import { NavLink } from "react-router-dom";
import { TextInput, Button, Label } from "flowbite-react";
// import Header from "../reuseables/Header";
import { useState } from "react";

const ForgotPasswordView = () => {
  const [email, setEmail] = useState<string>("");

  const handleForgotPasswordSubmit = (email: string) => {
    console.log(email);
  };

  return (
    <div className="flex min-h-screen">
      {/*<Header />*/}
      <div className="m-8 flex w-1/2 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-red-500">
        <div className="space-y-4 text-center text-white">
          <h1 className="text-4xl font-bold">Forgot Password?</h1>
          <p className="text-lg">Don't worry! We'll help you reset it.</p>
          <img
            src="https://illustrations.popsy.co/gray/work-from-home.svg"
            alt="Forgot Password"
            className="mx-auto w-3/4"
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 md:w-1/2">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            By continuing, you agree to our User Agreement and acknowledge that
            you understand the Privacy Policy.
          </p>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email" value="Registered Email" />
              <TextInput
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              type="button"
              color={"dark"}
              onClick={() => handleForgotPasswordSubmit(email)}
            >
              Send Reset Link
            </Button>

            <div className="mt-4 text-center text-sm">
              Remembered your password?{" "}
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

export default ForgotPasswordView;
