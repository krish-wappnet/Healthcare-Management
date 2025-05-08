import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, profilePicture: Express.Multer.File): Promise<import("./schemas/user.schema").User>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/user.schema").User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./schemas/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto, profilePicture: Express.Multer.File): Promise<import("./schemas/user.schema").User>;
    remove(id: string): Promise<import("./schemas/user.schema").User>;
}
