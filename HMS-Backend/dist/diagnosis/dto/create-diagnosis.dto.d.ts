declare class PossibleConditionDto {
    name: string;
    probability: number;
    description?: string;
}
export declare class CreateDiagnosisDto {
    patient: string;
    doctor?: string;
    symptoms: string[];
    medicalHistory?: string[];
    allergies?: string[];
    currentMedications?: string[];
    diagnosisResult: string;
    confidence?: number;
    possibleConditions?: PossibleConditionDto[];
    recommendedTests?: string[];
    recommendedSpecialists?: string[];
    treatmentSuggestions?: string[];
    notes?: string;
}
export {};
