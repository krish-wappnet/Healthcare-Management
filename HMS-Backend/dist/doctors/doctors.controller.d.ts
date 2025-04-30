import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    create(createDoctorDto: CreateDoctorDto): Promise<import("./schemas/doctor.schema").Doctor>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/doctor.schema").Doctor[];
        total: number;
        page: number;
        limit: number;
    }>;
    getProfile(req: any): Promise<import("./schemas/doctor.schema").Doctor>;
    findBySpecialization(specialization: string, paginationDto: PaginationDto): Promise<{
        data: import("./schemas/doctor.schema").Doctor[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./schemas/doctor.schema").Doctor>;
    update(id: string, updateDoctorDto: UpdateDoctorDto, req: any): Promise<import("./schemas/doctor.schema").Doctor>;
    remove(id: string): Promise<import("./schemas/doctor.schema").Doctor>;
}
