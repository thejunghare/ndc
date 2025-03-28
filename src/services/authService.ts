import dummy from "../db/dummy.json";
import { User, Session } from "../types/auth";

export async function login(email: string, password: string): Promise<Session> {
  const user = dummy.users.find(
    (u: User) => u.email === email && u.password === password
  );
  if (!user) throw new Error("Invalid credentials");

  const existingSession = dummy.sessions.find((s: Session) => s.userId === user.id);
  if (existingSession) return existingSession;

  const newSession: Session = {
    userId: user.id,
    token: `mock-token-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  dummy.sessions.push(newSession);
  return newSession;
}

export async function register(email: string, password: string): Promise<User> {
  const existingUser = dummy.users.find((u: User) => u.email === email);
  if (existingUser) throw new Error("User already exists");

  const newUser: User = {
    id: `${dummy.users.length + 1}`,
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  dummy.users.push(newUser);
  return newUser;
}

export async function logout(token: string): Promise<void> {
  const sessionIndex = dummy.sessions.findIndex((s: Session) => s.token === token);
  if (sessionIndex === -1) throw new Error("Session not found");
  dummy.sessions.splice(sessionIndex, 1);
}

export async function checkSession(): Promise<Session | null> {
  const session = dummy.sessions[0];
  if (session && new Date(session.expiresAt) > new Date()) {
    return session;
  }
  return null;
}