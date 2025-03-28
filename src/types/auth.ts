export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: string;
  }
  
  export interface Session {
    userId: string;
    token: string;
    createdAt: string;
    expiresAt: string;
  }
  
  export interface UserContextType {
    current: boolean | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
  }