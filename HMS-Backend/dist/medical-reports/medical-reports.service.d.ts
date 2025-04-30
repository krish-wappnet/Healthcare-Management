import { Model } from 'mongoose';
import { MedicalReport, MedicalReportDocument } from './schemas/medical-report.schema';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
export declare class MedicalReportsService {
    private medicalReportModel;
    private doctorsService;
    private patientsService;
    constructor(medicalReportModel: Model<MedicalReportDocument>, doctorsService: DoctorsService, patientsService: PatientsService);
    create(createMedicalReportDto: CreateMedicalReportDto): Promise<MedicalReport>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: MedicalReport[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<MedicalReport>;
    findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{
        data: MedicalReport[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDoctor(doctorId: string, paginationDto: PaginationDto): Promise<{
        data: MedicalReport[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByAppointment(appointmentId: string): Promise<MedicalReport>;
    update(id: string, updateMedicalReportDto: UpdateMedicalReportDto): Promise<MedicalReport>;
    remove(id: string): Promise<MedicalReport>;
}
