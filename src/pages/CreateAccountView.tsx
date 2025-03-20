import { NavLink } from "react-router-dom";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";

const CreateAccountView = () => {
  return (
    <div className="mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
      <h2 className="text-center text-2xl font-semibold">Create Account</h2>
      <form className="mt-4 space-y-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="Your email" />
          </div>
          <TextInput id="email" placeholder="name@company.com" required />
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="Set Password" />
          </div>
          <TextInput id="email" required />
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="Confirm Password" />
          </div>
          <TextInput id="email" required />
        </div>

        <Button type="submit">Register</Button>
      </form>

      <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
        Already registered?&nbsp;
        <a
          href="#"
          className="text-cyan-700 hover:underline dark:text-cyan-500"
        >
          <NavLink to="/">Log In</NavLink>
        </a>
      </div>
    </div>
  );
};

export default CreateAccountView;
