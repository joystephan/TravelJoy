import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  private readonly REFRESH_TOKEN_EXPIRES_IN = "30d";

  async register(data: RegisterInput): Promise<AuthToken> {
    // Validate email format
    if (!this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    if (!this.isValidPassword(data.password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Generate tokens
    return this.generateAuthTokens(user);
  }

  async login(data: LoginInput): Promise<AuthToken> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    return this.generateAuthTokens(user);
  }

  async resetPasswordRequest(email: string): Promise<void> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    // Generate password reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: "password-reset" },
      this.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // In production, send email with reset link
    // For now, we'll just log it (email service will be implemented separately)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(
      `Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== "password-reset") {
        throw new Error("Invalid token type");
      }

      // Validate new password
      if (!this.isValidPassword(newPassword)) {
        throw new Error(
          "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
        );
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update user password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash },
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid or expired reset token");
      }
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        userId: string;
        email: string;
      };

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid or expired token");
      }
      throw error;
    }
  }

  private generateAuthTokens(user: any): AuthToken {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
}

export default new AuthService();
