import { Document, Schema as MongooseSchema } from 'mongoose';
export type MedicalReportDocument = MedicalReport & Document;
export declare class MedicalReport {
    appointment: MongooseSchema.Types.ObjectId;
    patient: MongooseSchema.Types.ObjectId;
    doctor: MongooseSchema.Types.ObjectId;
    title: string;
    date: Date;
    diagnosis: string;
    symptoms: string[];
    treatmentPlan: string;
    followUpDate: Date;
    medications: {
        name: string;
        form: string;
        dosageValue: string;
        dosageUnit: string;
        breakfast: string;
        lunch: string;
        dinner: string;
        timing: string;
        instructions: string;
        startDate: Date;
        endDate: Date;
    }[];
    testResults: {
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
        notes: string;
    }[];
    vitalSigns: {
        bloodPressure: {
            systolic: string;
            diastolic: string;
        };
        heartRate: number;
        respiratoryRate: number;
        temperature: number;
        oxygenSaturation: number;
    };
    notes: string;
}
export declare const MedicalReportSchema: MongooseSchema<MedicalReport, import("mongoose").Model<MedicalReport, any, any, any, Document<unknown, any, MedicalReport> & MedicalReport & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MedicalReport, Document<unknown, {}, import("mongoose").FlatRecord<MedicalReport>> & import("mongoose").FlatRecord<MedicalReport> & {
    _id: import("mongoose").Types.ObjectId;
}>;
