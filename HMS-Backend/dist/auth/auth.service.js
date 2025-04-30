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
            const user = await this.usersService.findByEmail(email);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const { password, ...result } = user.toObject();
                return result;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.getTokens(user._id, user.email, user.role);
        await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
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
    async register(registerDto) {
        const newUser = await this.usersService.create({
            ...registerDto,
            role: user_roles_enum_1.UserRole.PATIENT,
        });
        const tokens = await this.getTokens(newUser._id, newUser.email, newUser.role);
        await this.usersService.setRefreshToken(newUser._id, tokens.refreshToken);
        const { password, ...result } = newUser.toObject();
        return {
            user: result,
            ...tokens,
        };
    }
    async refreshTokens(userId, refreshToken) {
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
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
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