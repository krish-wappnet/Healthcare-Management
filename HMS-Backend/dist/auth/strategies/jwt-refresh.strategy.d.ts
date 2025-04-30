import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(req: Request, payload: any): Promise<{
        userId: any;
        email: any;
        role: any;
        refreshToken: string;
    }>;
}
export {};
