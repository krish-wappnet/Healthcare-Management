/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        const { password, ...result } = (user as any).toObject();
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const tokens = await this.getTokens((user as any)._id, user.email, user.role);
    await this.usersService.setRefreshToken((user as any)._id, tokens.refreshToken);
    
    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const newUser = await this.usersService.create({
      ...registerDto,
      role: UserRole.PATIENT, // Default role for registration is PATIENT
    });
    
    const tokens = await this.getTokens((newUser as any)._id, newUser.email, newUser.role);
    await this.usersService.setRefreshToken((newUser as any)._id, tokens.refreshToken);
    
    const { password, ...result } = (newUser as any).toObject();
    
    return {
      user: result,
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
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
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
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