import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: CreatePatientDto): Promise<import("./schemas/patient.schema").Patient>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/patient.schema").Patient[];
        total: number;
        page: number;
        limit: number;
    }>;
    getProfile(req: any): Promise<import("./schemas/patient.schema").Patient>;
    findOne(id: string): Promise<import("./schemas/patient.schema").Patient>;
    update(id: string, updatePatientDto: UpdatePatientDto, req: any): Promise<import("./schemas/patient.schema").Patient>;
    remove(id: string): Promise<import("./schemas/patient.schema").Patient>;
}
