import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum NotificationType {
  APPOINTMENT = 'appointment',
  HEALTH_ALERT = 'health_alert',
  SYSTEM = 'system',
  MESSAGE = 'message',
}

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: MongooseSchema.Types.Mixed })
  data: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  expiresAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);