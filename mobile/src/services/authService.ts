import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./api";

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

class AuthService {
  private readonly TOKEN_KEY = "authToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly USER_KEY = "user";

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post("/api/auth/register", data);
    const authData = response.data.data;
    await this.storeAuthData(authData);
    return authData;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post("/api/auth/login", data);
    const authData = response.data.data;
    await this.storeAuthData(authData);
    return authData;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_KEY,
    ]);
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post("/api/auth/password-reset-request", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/api/auth/password-reset", { token, newPassword });
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  async getStoredUser(): Promise<any | null> {
    const userJson = await AsyncStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return token !== null;
  }

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [this.TOKEN_KEY, authData.accessToken],
      [this.REFRESH_TOKEN_KEY, authData.refreshToken],
      [this.USER_KEY, JSON.stringify(authData.user)],
    ]);
  }
}

export default new AuthService();
