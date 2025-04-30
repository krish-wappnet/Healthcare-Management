import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
export declare class PatientsService {
    private patientModel;
    private usersService;
    constructor(patientModel: Model<PatientDocument>, usersService: UsersService);
    create(createPatientDto: CreatePatientDto): Promise<Patient>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: Patient[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Patient>;
    findByUserId(userId: string): Promise<Patient>;
    update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient>;
    remove(id: string): Promise<Patient>;
}
