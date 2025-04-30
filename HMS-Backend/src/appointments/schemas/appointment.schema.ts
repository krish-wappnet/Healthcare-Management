import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Prop()
  type: string;

  @Prop()
  reasonForVisit: string;

  @Prop()
  notes: string;

  @Prop()
  symptoms: string[];

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paymentAmount: number;

  @Prop()
  meetingLink: string;

  @Prop()
  followUpDate: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);