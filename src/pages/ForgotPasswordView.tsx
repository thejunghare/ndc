import { NavLink } from "react-router-dom";
import { TextInput, Button, Label } from "flowbite-react";
import Header from "../reuseables/Header";
import { useState } from "react";

const ForgotPasswordView = () => {
  const [email, setEmail] = useState<string>("");

  const handleForgotPasswordSubmit = (email: string) => {
    console.log(email);
  };

  return (
    <div className="min-h-screen flex">
      {/*<Header />*/}
      <div className="w-1/2 bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <h1 className="text-4xl font-bold">Forgot Password?</h1>
          <p className="text-lg">Don't worry! We'll help you reset it.</p>
          <img src="https://illustrations.popsy.co/gray/work-from-home.svg" alt="Forgot Password" className="w-3/4 mx-auto" />
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">Reset Your Password</h2>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email" value="Registered Email" />
              <TextInput type="email" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <Button className="w-full" type="button" onClick={() => handleForgotPasswordSubmit(email)}>
              Send Reset Link
            </Button>

            <div className="text-sm text-center mt-4">
              Remembered your password?{" "}
              <NavLink to="/" className="text-blue-600 hover:underline">Log In</NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
