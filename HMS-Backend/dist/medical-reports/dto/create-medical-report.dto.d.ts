declare class MedicationDto {
    name: string;
    form: string;
    dosageValue: string;
    dosageUnit: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    timing: string;
    instructions?: string;
    startDate: Date;
    endDate: Date;
}
declare class TestResultDto {
    name: string;
    date: Date;
    result: string;
    bloodPressure: string;
    cholesterol: string;
    glucose: string;
    hemoglobin: string;
    platelets: string;
    redBloodCells: string;
    triglycerides: string;
    whiteBloodCells: string;
    notes?: string;
}
declare class VitalSignsDto {
    bloodPressure: {
        systolic: string;
        diastolic: string;
    };
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    oxygenSaturation: number;
}
export declare class CreateMedicalReportDto {
    appointment: string;
    patient: string;
    doctor: string;
    title: string;
    date: Date;
    diagnosis: string;
    symptoms: string[];
    treatmentPlan: string;
    followUpDate?: Date;
    medications: MedicationDto[];
    testResults: TestResultDto[];
    vitalSigns: VitalSignsDto;
    notes?: string;
}
export {};
