import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CloudinaryConfigService } from '../config/cloudinary.config';
export declare class UsersService {
    private userModel;
    private cloudinaryService;
    constructor(userModel: Model<UserDocument>, cloudinaryService: CloudinaryConfigService);
    create(createUserDto: CreateUserDto, profilePicture?: Express.Multer.File): Promise<User>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string | Types.ObjectId): Promise<User>;
    findByEmail(email: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto, profilePicture?: Express.Multer.File): Promise<User>;
    remove(id: string): Promise<User>;
    setRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
}
