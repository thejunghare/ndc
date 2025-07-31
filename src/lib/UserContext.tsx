import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { UserContextType, User } from "../types/auth";
import { supabase } from "../db/supabase.tsx";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? undefined,
          username: data.session.user.user_metadata?.username ?? "N/A",
          role: data.session.user.user_metadata?.role ?? "User",
          createdAt:
            data.session.user.user_metadata?.created_at ||
            new Date().toISOString(),
        });
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? undefined,
            username: session.user.user_metadata?.username ?? "N/A",
            role: session.user.user_metadata?.role ?? "User",
            createdAt:
              session.user.user_metadata?.created_at ||
              new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw { user: null, error };

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        username: data.user.user_metadata?.username ?? "N/A",
        role: data.user.user_metadata?.role ?? "User",
        createdAt:
          data.user.user_metadata?.created_at || new Date().toISOString(),
      });
    }

    //return { user: data.user, error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    // username: string,
    // role: string,
  ): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) throw { user: null, error };

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        username: data.user.user_metadata?.username ?? "N/A",
        role: data.user.user_metadata?.role ?? "User",
        createdAt:
          data.user.user_metadata?.created_at || new Date().toISOString(),
      });
    }

    //return { user: data.user, error: null };
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: UserContextType = {
    current: user,
    signIn,
    signUp,
    logout: handleLogout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
