export interface User {
  id: string;
  email?: string;
  username: string,
  role:string,
  createdAt: string;
}

export interface Session {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserContextType {
  current: User | null; // `current` can be `User` or `null`
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}
