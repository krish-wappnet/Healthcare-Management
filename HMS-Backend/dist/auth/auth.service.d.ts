import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../common/enums/user-roles.enum';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<{
        id: any;
        email: any;
        role: any;
        firstName: any;
        lastName: any;
        profilePicture: any;
        isActive: any;
        emailVerified: any;
    }>;
    login(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            profilePicture: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<any>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getTokens(userId: string, email: string, role: UserRole): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
