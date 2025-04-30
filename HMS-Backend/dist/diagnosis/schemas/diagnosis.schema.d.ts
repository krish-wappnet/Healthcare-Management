import { Document, Schema as MongooseSchema } from 'mongoose';
export type DiagnosisDocument = Diagnosis & Document;
export declare class Diagnosis {
    patient: MongooseSchema.Types.ObjectId;
    doctor: MongooseSchema.Types.ObjectId;
    symptoms: string[];
    medicalHistory: string[];
    allergies: string[];
    currentMedications: string[];
    diagnosisResult: string;
    confidence: number;
    possibleConditions: {
        name: string;
        probability: number;
        description: string;
    }[];
    recommendedTests: string[];
    recommendedSpecialists: string[];
    treatmentSuggestions: string[];
    notes: string;
    isReviewedByDoctor: boolean;
    doctorFeedback: string;
}
export declare const DiagnosisSchema: MongooseSchema<Diagnosis, import("mongoose").Model<Diagnosis, any, any, any, Document<unknown, any, Diagnosis> & Diagnosis & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Diagnosis, Document<unknown, {}, import("mongoose").FlatRecord<Diagnosis>> & import("mongoose").FlatRecord<Diagnosis> & {
    _id: import("mongoose").Types.ObjectId;
}>;
