import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DiagnosisDocument = Diagnosis & Document;

@Schema({ timestamps: true })
export class Diagnosis {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor' })
  doctor: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  symptoms: string[];

  @Prop()
  medicalHistory: string[];

  @Prop()
  allergies: string[];

  @Prop()
  currentMedications: string[];

  @Prop({ required: true })
  diagnosisResult: string;

  @Prop()
  confidence: number;

  @Prop()
  possibleConditions: {
    name: string;
    probability: number;
    description: string;
  }[];

  @Prop()
  recommendedTests: string[];

  @Prop()
  recommendedSpecialists: string[];

  @Prop()
  treatmentSuggestions: string[];

  @Prop()
  notes: string;

  @Prop({ default: false })
  isReviewedByDoctor: boolean;

  @Prop()
  doctorFeedback: string;
}

export const DiagnosisSchema = SchemaFactory.createForClass(Diagnosis);