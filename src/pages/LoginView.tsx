import { NavLink } from "react-router-dom";

const LoginView = () => {
  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center">Login</h2>
      <form className="space-y-4 mxt-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            type="password"
            id="password"

            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your password"
          />
        </div>

        <div className="mt-4 text-left">
        <button
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
           <NavLink to="/forgot-password">Forgot Password?</NavLink>
        </button>
      </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
        <NavLink to="/dashboard">Login</NavLink> 
        </button>
      </form>

      
      <div className="mt-2 text-left">
        <button
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          <NavLink to="/create-account">Create Account</NavLink>
        </button>
      </div>
    </div>
  );
};

export default LoginView;
