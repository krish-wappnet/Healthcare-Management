import { Model } from 'mongoose';
import { Diagnosis, DiagnosisDocument } from './schemas/diagnosis.schema';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
export declare class DiagnosisService {
    private diagnosisModel;
    private patientsService;
    private doctorsService;
    constructor(diagnosisModel: Model<DiagnosisDocument>, patientsService: PatientsService, doctorsService: DoctorsService);
    create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: Diagnosis[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Diagnosis>;
    findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{
        data: Diagnosis[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDoctor(doctorId: string, paginationDto: PaginationDto): Promise<{
        data: Diagnosis[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis>;
    remove(id: string): Promise<Diagnosis>;
    analyzeSymptoms(symptoms: string[], medicalHistory?: string[], allergies?: string[], currentMedications?: string[]): Promise<any>;
}
