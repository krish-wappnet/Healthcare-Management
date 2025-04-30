export declare class CreatePatientDto {
    user: string;
    dateOfBirth?: Date;
    gender?: string;
    bloodType?: string;
    height?: number;
    weight?: number;
    allergies?: string[];
    medications?: string[];
    chronicConditions?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
}
