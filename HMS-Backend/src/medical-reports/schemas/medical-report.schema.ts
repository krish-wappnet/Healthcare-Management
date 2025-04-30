/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MedicalReportDocument = MedicalReport & Document;

@Schema({ timestamps: true })
export class MedicalReport {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Appointment' })
  appointment: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  diagnosis: string;

  @Prop({ type: [String], default: [] })
  symptoms: string[];

  @Prop()
  treatmentPlan: string;

  @Prop({
    type: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        instructions: { type: String },
      },
    ],
    default: [],
  })
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate: Date;
    instructions: string;
  }[];

  @Prop({
    type: [
      {
        name: { type: String },
        date: { type: Date },
        result: { type: String },
        normalRange: { type: String },
        units: { type: String },
        notes: { type: String },
      },
    ],
    default: [],
  })
  testResults: {
    name: string;
    date: Date;
    result: string;
    normalRange: string;
    units: string;
    notes: string;
  }[];

  @Prop({
    type: {
      bloodPressure: { type: String },
      heartRate: { type: Number },
      respiratoryRate: { type: Number },
      temperature: { type: Number },
      oxygenSaturation: { type: Number },
    },
    default: {
      bloodPressure: '',
      heartRate: 0,
      respiratoryRate: 0,
      temperature: 0,
      oxygenSaturation: 0,
    },
  })
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    oxygenSaturation: number;
  };

  @Prop()
  notes: string;

  @Prop()
  followUpDate: Date;
}

export const MedicalReportSchema = SchemaFactory.createForClass(MedicalReport);