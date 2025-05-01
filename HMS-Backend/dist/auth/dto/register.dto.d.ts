import { UserRole } from 'src/common/enums/user-roles.enum';
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profilePicture?: string;
}
