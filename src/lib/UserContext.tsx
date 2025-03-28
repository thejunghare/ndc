import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { UserContextType } from "../types/auth";
import { login, logout, register, checkSession } from "../services/authService";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<boolean | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(email: string, password: string) {
    try {
      const session = await login(email, password);
      setSessionToken(session.token);
      setUser(true);
      navigate("/dashboard");
    } catch (error) {
      setUser(false);
      console.error(`Login failed: ${error}`);
      throw error;
    }
  }

  async function handleRegister(email: string, password: string) {
    try {
      await register(email, password);
      await handleLogin(email, password);
    } catch (error) {
      console.error(`Registration failed: ${error}`);
      throw error;
    }
  }

  async function handleLogout() {
    try {
      if (sessionToken) {
        await logout(sessionToken);
        setSessionToken(null);
      }
      setUser(false);
      navigate("/");
    } catch (error) {
      console.error(`Logout failed: ${error}`);
      throw error;
    }
  }

  async function init() {
    try {
      const session = await checkSession();
      if (session) {
        setSessionToken(session.token);
        setUser(false);
      } else {
        setUser(false);
      }
    } catch (error) {
      setUser(false);
      console.error(`Session check failed: ${error}`);
    }
  }

  useEffect(() => {
    init();
  }, []);

  const value: UserContextType = {
    current: user,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}