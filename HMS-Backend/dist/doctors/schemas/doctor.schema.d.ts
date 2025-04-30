import { Document, Schema as MongooseSchema } from 'mongoose';
export type DoctorDocument = Doctor & Document;
export declare class Doctor {
    user: MongooseSchema.Types.ObjectId;
    specialization: string;
    qualifications: string[];
    licenseNumber: string;
    experience: number;
    bio: string;
    officeAddress: string;
    officePhone: string;
    consultationFee: number;
    isAvailableForAppointments: boolean;
    workingHours: {
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
    averageRating: number;
    totalRatings: number;
}
export declare const DoctorSchema: MongooseSchema<Doctor, import("mongoose").Model<Doctor, any, any, any, Document<unknown, any, Doctor> & Doctor & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Doctor, Document<unknown, {}, import("mongoose").FlatRecord<Doctor>> & import("mongoose").FlatRecord<Doctor> & {
    _id: import("mongoose").Types.ObjectId;
}>;
