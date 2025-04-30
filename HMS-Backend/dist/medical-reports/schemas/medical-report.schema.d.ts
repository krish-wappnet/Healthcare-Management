import { Document, Schema as MongooseSchema } from 'mongoose';
export type MedicalReportDocument = MedicalReport & Document;
export declare class MedicalReport {
    patient: MongooseSchema.Types.ObjectId;
    doctor: MongooseSchema.Types.ObjectId;
    appointment: MongooseSchema.Types.ObjectId;
    title: string;
    date: Date;
    diagnosis: string;
    symptoms: string[];
    treatmentPlan: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: Date;
        endDate: Date;
        instructions: string;
    }[];
    testResults: {
        name: string;
        date: Date;
        result: string;
        normalRange: string;
        units: string;
        notes: string;
    }[];
    vitalSigns: {
        bloodPressure: string;
        heartRate: number;
        respiratoryRate: number;
        temperature: number;
        oxygenSaturation: number;
    };
    notes: string;
    followUpDate: Date;
}
export declare const MedicalReportSchema: MongooseSchema<MedicalReport, import("mongoose").Model<MedicalReport, any, any, any, Document<unknown, any, MedicalReport> & MedicalReport & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MedicalReport, Document<unknown, {}, import("mongoose").FlatRecord<MedicalReport>> & import("mongoose").FlatRecord<MedicalReport> & {
    _id: import("mongoose").Types.ObjectId;
}>;
