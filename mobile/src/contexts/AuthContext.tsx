import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import authService from "../services/authService";
import { TravelPreferences } from "../types";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: TravelPreferences;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  updatePreferences: (preferences: TravelPreferences) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      const isAuth = await authService.isAuthenticated();
      if (isAuth && storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize callbacks to prevent unnecessary re-renders
  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName?: string,
      lastName?: string
    ) => {
      const response = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });
      setUser(response.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: { firstName?: string; lastName?: string }) => {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    },
    []
  );

  const updatePreferences = useCallback(
    async (preferences: TravelPreferences) => {
      const updatedUser = await authService.updatePreferences(preferences);
      setUser(updatedUser);
    },
    []
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      updateProfile,
      updatePreferences,
    }),
    [user, isLoading, login, register, logout, updateProfile, updatePreferences]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
