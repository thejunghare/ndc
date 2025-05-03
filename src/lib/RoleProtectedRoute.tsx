// lib/RoleProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { supabase } from "../db/supabase";
import { Spinner } from "flowbite-react";
import { toast } from "react-toastify";

const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: number[];
}) => {
  const { current } = useUser();
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!current) {
        console.log("No current user");
        setLoading(false);
        return;
      }

      // First check localStorage
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        console.log("Using stored role:", storedRole);
        setUserRole(parseInt(storedRole));
        setLoading(false);
        return;
      }

      console.log("Fetching role for user:", current.id);
      const { data, error } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", current.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching role:", error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log("No profile data found");
        setLoading(false);
        return;
      }

      console.log("User role found:", data.role);
      // Store the role in localStorage
      localStorage.setItem('userRole', data.role.toString());
      setUserRole(data.role);
      setLoading(false);
    };

    fetchUserRole();
  }, [current]);

  if (!current) {
    console.log("No current user, redirecting to home");
    return <Navigate to="/" />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  console.log("Checking role:", userRole, "against allowed roles:", allowedRoles);
  if (userRole === null || !allowedRoles.includes(userRole)) {
    console.log("Role check failed, redirecting to correct dashboard");
    
    // Show notification based on current route and user role
    const currentPath = location.pathname;
    if (userRole === 3 && currentPath !== "/super-dashboard") {
      toast.info("Redirecting to Super Admin Dashboard...");
      return <Navigate to="/super-dashboard" />;
    } else if (userRole === 2 && currentPath !== "/admin-dashboard") {
      toast.info("Redirecting to Admin Dashboard...");
      return <Navigate to="/admin-dashboard" />;
    } else if (userRole === 1 && currentPath !== "/dashboard") {
      toast.info("Redirecting to User Dashboard...");
      return <Navigate to="/dashboard" />;
    }
    
    // If no specific role match, redirect to home
    toast.error("Access denied. Redirecting to home...");
    return <Navigate to="/" />;
  }

  console.log("Role check passed, rendering children");
  return children;
};

export default RoleProtectedRoute;
