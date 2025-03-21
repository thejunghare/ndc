import { NavLink } from "react-router-dom";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import Header from "../component/header";

const LoginView = () => {
  return (
    <div>
      <Header />
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-2xl font-semibold">Login</h2>
          <form className="mxt-4 space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput id="email" placeholder="name@company.com" required />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your password" />
              </div>
              <TextInput id="password" type="password" required />
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
              <Button>
                <NavLink to="dashboard">Log in to your account</NavLink>
              </Button>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?&nbsp;
              <a
                href="#"
                className="text-cyan-700 hover:underline dark:text-cyan-500"
              >
                <NavLink to="/create-account">Create account</NavLink>
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
