import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  gender: string;

  @Prop()
  bloodType: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop([String])
  allergies: string[];

  @Prop([String])
  medications: string[];

  @Prop([String])
  chronicConditions: string[];

  @Prop()
  emergencyContactName: string;

  @Prop()
  emergencyContactPhone: string;

  @Prop()
  emergencyContactRelation: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop()
  country: string;

  @Prop()
  phone: string;

  @Prop()
  insuranceProvider: string;

  @Prop()
  insurancePolicyNumber: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);