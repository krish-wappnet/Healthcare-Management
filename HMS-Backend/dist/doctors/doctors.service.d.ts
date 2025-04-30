import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
export declare class DoctorsService {
    private doctorModel;
    private usersService;
    constructor(doctorModel: Model<DoctorDocument>, usersService: UsersService);
    create(createDoctorDto: CreateDoctorDto): Promise<Doctor>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: Doctor[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Doctor>;
    findByUserId(userId: string): Promise<Doctor>;
    findBySpecialization(specialization: string, paginationDto: PaginationDto): Promise<{
        data: Doctor[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor>;
    remove(id: string): Promise<Doctor>;
    updateRating(id: string, rating: number): Promise<Doctor>;
}
