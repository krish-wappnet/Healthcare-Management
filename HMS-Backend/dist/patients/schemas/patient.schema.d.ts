import { Document, Schema as MongooseSchema } from 'mongoose';
export type PatientDocument = Patient & Document;
export declare class Patient {
    user: MongooseSchema.Types.ObjectId;
    dateOfBirth: Date;
    gender: string;
    bloodType: string;
    height: number;
    weight: number;
    allergies: string[];
    medications: string[];
    chronicConditions: string[];
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    insuranceProvider: string;
    insurancePolicyNumber: string;
}
export declare const PatientSchema: MongooseSchema<Patient, import("mongoose").Model<Patient, any, any, any, Document<unknown, any, Patient> & Patient & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Patient, Document<unknown, {}, import("mongoose").FlatRecord<Patient>> & import("mongoose").FlatRecord<Patient> & {
    _id: import("mongoose").Types.ObjectId;
}>;
