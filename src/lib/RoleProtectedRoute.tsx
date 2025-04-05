// lib/RoleProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { supabase } from "../db/supabase";
import { Spinner } from "flowbite-react";

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

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!current) return;

      const { data, error } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", current.id) // ✅ use user_id, NOT id
        .maybeSingle();
        
      if (error || !data) {
        console.error("Error fetching role", error);
        setLoading(false);
        return;
      }

      setUserRole(data.role);
      setLoading(false);
    };

    fetchUserRole();
  }, [current]);

  if (!current) return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!allowedRoles.includes(userRole!)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleProtectedRoute;
