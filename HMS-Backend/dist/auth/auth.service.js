"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
const user_roles_enum_1 = require("../common/enums/user-roles.enum");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        try {
            console.log('Attempting to validate user with email:', email);
            const user = await this.usersService.findByEmail(email);
            console.log('User fetched from DB:', user);
            if (!user) {
                console.error('User not found for email:', email);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (!user.password) {
                console.error('User has no password:', user);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            console.log('Comparing password with hashed:', user.password.substring(0, 20) + '...');
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password comparison result:', isPasswordValid);
            if (!isPasswordValid) {
                console.error('Invalid password for email:', email);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
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
        }
        catch (error) {
            console.error('Error in validateUser:', error);
            throw error;
        }
    }
    async login(user) {
        try {
            if (!user || typeof user !== 'object') {
                console.error('Invalid user object format:', user);
                throw new common_1.UnauthorizedException('Invalid user data');
            }
            if (!user.id || !user.email) {
                console.error('Missing required fields in user object:', user);
                throw new common_1.UnauthorizedException('Invalid user data');
            }
            console.log('Generating JWT for user:', {
                id: user.id,
                email: user.email,
                role: user.role
            });
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role || user_roles_enum_1.UserRole.PATIENT
            };
            console.log('JWT payload:', payload);
            const accessToken = this.jwtService.sign(payload);
            console.log('Generated access token:', this.jwtService.decode(accessToken));
            const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
            if (!user.id) {
                console.error('Cannot set refresh token: Missing user ID');
                throw new common_1.UnauthorizedException('Invalid user data');
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
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    async register(registerDto) {
        console.log('Register payload:', registerDto);
        const { email, password, role } = registerDto;
        if (role === user_roles_enum_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Admin role cannot be selected during registration');
        }
        try {
            const existing = await this.usersService.findByEmail(email);
            if (existing) {
                throw new common_1.BadRequestException('User already exists');
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
            }
            else {
                throw error;
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
        console.log('Register response:', response);
        return response;
    }
    async refreshTokens(userId, refreshToken) {
        console.log(`Refreshing tokens for userId: ${userId}`);
        try {
            const user = await this.usersService.findOne(userId);
            if (!user || !user.refreshToken) {
                throw new common_1.UnauthorizedException('Access denied');
            }
            const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!refreshTokenMatches) {
                throw new common_1.UnauthorizedException('Access denied');
            }
            const tokens = await this.getTokens(user._id, user.email, user.role);
            await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
            return tokens;
        }
        catch (error) {
            console.error('Error refreshing tokens:', error.message);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        console.log(`Logging out userId: ${userId}`);
        await this.usersService.setRefreshToken(userId, null);
        return { message: 'Logout successful' };
    }
    async getTokens(userId, email, role) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
                role,
            }, {
                expiresIn: '15m',
                secret: process.env.JWT_SECRET || 'your-secret-key',
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
                role,
            }, {
                expiresIn: '7d',
                secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map