declare class MedicationDto {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate: Date;
    instructions?: string;
}
declare class TestResultDto {
    name: string;
    date: Date;
    result: string;
    normalRange?: string;
    units?: string;
    notes?: string;
}
declare class VitalSignsDto {
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
}
export declare class CreateMedicalReportDto {
    patient: string;
    doctor: string;
    appointment?: string;
    title: string;
    date: Date;
    diagnosis: string;
    symptoms?: string[];
    treatmentPlan?: string;
    medications?: MedicationDto[];
    testResults?: TestResultDto[];
    vitalSigns?: VitalSignsDto;
    notes?: string;
    followUpDate?: Date;
}
export {};
