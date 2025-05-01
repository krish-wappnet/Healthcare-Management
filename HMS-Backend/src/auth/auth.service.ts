/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/schemas/user.schema';
import { UserRole } from '../common/enums/user-roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    try {
      console.log('Attempting to validate user with email:', email);
      
      const user = await this.usersService.findByEmail(email);
      console.log('User fetched from DB:', user);
      
      if (!user) {
        console.error('User not found for email:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.password) {
        console.error('User has no password:', user);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Log the password hash for debugging (redacted)
      console.log('Comparing password with hashed:', user.password.substring(0, 20) + '...');
      
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isPasswordValid);

      if (!isPasswordValid) {
        console.error('Invalid password for email:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Create a clean user object without password for security
      const result = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        emailVerified: user.emailVerified
      };

      console.log('Returning validated user data:', result);
      return result;
    } catch (error) {
      console.error('Error in validateUser:', error);
      throw error;
    }
  }
  
 
  async login(user: any) {
    try {
      // Ensure we have a valid user object
      if (!user || typeof user !== 'object') {
        console.error('Invalid user object format:', user);
        throw new UnauthorizedException('Invalid user data');
      }

      // Ensure required fields exist
      if (!user.id || !user.email) {
        console.error('Missing required fields in user object:', user);
        throw new UnauthorizedException('Invalid user data');
      }

      console.log('Generating JWT for user:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role || UserRole.PATIENT 
      };
      
      console.log('JWT payload:', payload);
      
      const accessToken = this.jwtService.sign(payload);
      console.log('Generated access token:', this.jwtService.decode(accessToken));
      
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      
      // Ensure we have a valid user ID before setting refresh token
      if (!user.id) {
        console.error('Cannot set refresh token: Missing user ID');
        throw new UnauthorizedException('Invalid user data');
      }
      
      await this.usersService.setRefreshToken(user.id, refreshToken);
      
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<any> {
    console.log('Register payload:', registerDto); // Log incoming payload
    const { email, password, role } = registerDto;

    if (role === UserRole.ADMIN) {
      throw new BadRequestException('Admin role cannot be selected during registration');
    }

    try {
      const existing = await this.usersService.findByEmail(email);
      if (existing) {
        throw new BadRequestException('User already exists');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        // User does not exist, proceed with registration
      } else {
        throw error; // Rethrow unexpected errors
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role,
    });

    const tokens = await this.getTokens(user._id, user.email, user.role);
    await this.usersService.setRefreshToken(user._id, tokens.refreshToken);

    const response = {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    console.log('Register response:', response); // Log response
    return response;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    console.log(`Refreshing tokens for userId: ${userId}`); // Log refresh attempt
    try {
      const user = await this.usersService.findOne(userId);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied');
      }
      
      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access denied');
      }
      
      const tokens = await this.getTokens((user as any)._id, user.email, user.role);
      await this.usersService.setRefreshToken((user as any)._id, tokens.refreshToken);
      
      return tokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error.message); // Log error
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    console.log(`Logging out userId: ${userId}`); // Log logout
    await this.usersService.setRefreshToken(userId, null);
    return { message: 'Logout successful' };
  }

  async getTokens(userId: string, email: string, role: UserRole) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          expiresIn: '15m',
          secret: process.env.JWT_SECRET || 'your-secret-key',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}