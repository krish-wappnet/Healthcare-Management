import { UserRole } from '../../common/enums/user-roles.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profilePicture?: string;
}
