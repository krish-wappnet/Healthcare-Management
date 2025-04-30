/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  specialization: string;

  @Prop()
  qualifications: string[];

  @Prop()
  licenseNumber: string;

  @Prop()
  experience: number;

  @Prop()
  bio: string;

  @Prop()
  officeAddress: string;

  @Prop()
  officePhone: string;

  @Prop()
  consultationFee: number;

  @Prop({ default: true })
  isAvailableForAppointments: boolean;

  @Prop({
    type: {
      monday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
      tuesday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
      wednesday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
      thursday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
      friday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
      saturday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
      sunday: {
        start: { type: String },
        end: { type: String },
        isAvailable: { type: Boolean },
      },
    },
    default: {
      monday: { start: '', end: '', isAvailable: false },
      tuesday: { start: '', end: '', isAvailable: false },
      wednesday: { start: '', end: '', isAvailable: false },
      thursday: { start: '', end: '', isAvailable: false },
      friday: { start: '', end: '', isAvailable: false },
      saturday: { start: '', end: '', isAvailable: false },
      sunday: { start: '', end: '', isAvailable: false },
    },
  })
  workingHours: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };

  @Prop()
  averageRating: number;

  @Prop()
  totalRatings: number;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);