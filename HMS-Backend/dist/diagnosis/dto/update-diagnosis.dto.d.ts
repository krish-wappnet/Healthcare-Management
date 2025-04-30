declare class PossibleConditionDto {
    name: string;
    probability: number;
    description?: string;
}
export declare class UpdateDiagnosisDto {
    symptoms?: string[];
    medicalHistory?: string[];
    allergies?: string[];
    currentMedications?: string[];
    diagnosisResult?: string;
    confidence?: number;
    possibleConditions?: PossibleConditionDto[];
    recommendedTests?: string[];
    recommendedSpecialists?: string[];
    treatmentSuggestions?: string[];
    notes?: string;
    isReviewedByDoctor?: boolean;
    doctorFeedback?: string;
}
export {};
