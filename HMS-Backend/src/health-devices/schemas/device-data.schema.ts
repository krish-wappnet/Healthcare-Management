import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DeviceDataDocument = DeviceData & Document;

@Schema({ timestamps: true })
export class DeviceData {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  deviceType: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  data: Record<string, any>;

  @Prop({ default: false })
  isAbnormal: boolean;

  @Prop()
  abnormalityReason: string;

  @Prop({ default: false })
  notificationSent: boolean;
}

export const DeviceDataSchema = SchemaFactory.createForClass(DeviceData);