import { Document } from 'mongoose';
import { UserRole } from '../../common/enums/user-roles.enum';
export type UserDocument = User & Document;
export declare class User {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profilePicture?: string;
    isActive: boolean;
    emailVerified: boolean;
    refreshToken?: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
