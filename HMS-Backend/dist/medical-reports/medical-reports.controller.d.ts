import { MedicalReportsService } from './medical-reports.service';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class MedicalReportsController {
    private readonly medicalReportsService;
    constructor(medicalReportsService: MedicalReportsService);
    create(createMedicalReportDto: CreateMedicalReportDto): Promise<import("./schemas/medical-report.schema").MedicalReport>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/medical-report.schema").MedicalReport[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByPatient(id: string, paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/medical-report.schema").MedicalReport[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDoctor(id: string, paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/medical-report.schema").MedicalReport[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByAppointment(id: string): Promise<import("./schemas/medical-report.schema").MedicalReport>;
    findOne(id: string): Promise<import("./schemas/medical-report.schema").MedicalReport>;
    update(id: string, updateMedicalReportDto: UpdateMedicalReportDto): Promise<import("./schemas/medical-report.schema").MedicalReport>;
    remove(id: string): Promise<import("./schemas/medical-report.schema").MedicalReport>;
}
