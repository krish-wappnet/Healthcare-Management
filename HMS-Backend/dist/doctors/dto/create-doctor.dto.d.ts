export declare class CreateDoctorDto {
    user: string;
    specialization: string;
    qualifications?: string[];
    licenseNumber?: string;
    experience?: number;
    bio?: string;
    officeAddress?: string;
    officePhone?: string;
    consultationFee?: number;
    isAvailableForAppointments?: boolean;
    workingHours?: {
        monday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
        tuesday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
        wednesday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
        thursday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
        friday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
        saturday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
        sunday: {
            start: string;
            end: string;
            isAvailable: boolean;
        };
    };
}
