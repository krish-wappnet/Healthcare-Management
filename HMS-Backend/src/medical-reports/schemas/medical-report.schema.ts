/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MedicalReportDocument = MedicalReport & Document;

@Schema({ timestamps: true })
export class MedicalReport {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment', required: true })
  appointment: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  diagnosis: string;

  @Prop({ type: [String], required: true })
  symptoms: string[];

  @Prop({ required: true })
  treatmentPlan: string;

  @Prop()
  followUpDate: Date;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        form: { type: String, required: true },
        dosageValue: { type: String, required: true },
        dosageUnit: { type: String, required: true },
        breakfast: { type: String, required: true },
        lunch: { type: String, required: true },
        dinner: { type: String, required: true },
        timing: { type: String, required: true },
        instructions: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    required: true,
  })
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

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        date: { type: Date, required: true },
        result: { type: String, required: true },
        bloodPressure: { type: String },
        cholesterol: { type: String },
        glucose: { type: String },
        hemoglobin: { type: String },
        platelets: { type: String },
        redBloodCells: { type: String },
        triglycerides: { type: String },
        whiteBloodCells: { type: String },
        notes: { type: String },
      },
    ],
    required: true,
  })
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

  @Prop({
    type: {
      bloodPressure: {
        systolic: { type: String, required: true },
        diastolic: { type: String, required: true },
      },
      heartRate: { type: Number, required: true },
      respiratoryRate: { type: Number, required: true },
      temperature: { type: Number, required: true },
      oxygenSaturation: { type: Number, required: true },
    },
    required: true,
  })
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

  @Prop()
  notes: string;
}

export const MedicalReportSchema = SchemaFactory.createForClass(MedicalReport);