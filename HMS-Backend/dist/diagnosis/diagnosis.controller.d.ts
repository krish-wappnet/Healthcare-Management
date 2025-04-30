import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
declare class AnalyzeSymptomsDto {
    symptoms: string[];
    medicalHistory?: string[];
    allergies?: string[];
    currentMedications?: string[];
}
export declare class DiagnosisController {
    private readonly diagnosisService;
    constructor(diagnosisService: DiagnosisService);
    create(createDiagnosisDto: CreateDiagnosisDto): Promise<import("./schemas/diagnosis.schema").Diagnosis>;
    analyzeSymptoms(analyzeSymptomsDto: AnalyzeSymptomsDto): Promise<any>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/diagnosis.schema").Diagnosis[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByPatient(id: string, paginationDto: PaginationDto): Promise<{
        data: import("./schemas/diagnosis.schema").Diagnosis[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDoctor(id: string, paginationDto: PaginationDto): Promise<{
        data: import("./schemas/diagnosis.schema").Diagnosis[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./schemas/diagnosis.schema").Diagnosis>;
    update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<import("./schemas/diagnosis.schema").Diagnosis>;
    remove(id: string): Promise<import("./schemas/diagnosis.schema").Diagnosis>;
}
export {};
