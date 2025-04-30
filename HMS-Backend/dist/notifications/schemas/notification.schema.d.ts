import { Document, Schema as MongooseSchema } from 'mongoose';
export declare enum NotificationType {
    APPOINTMENT = "appointment",
    HEALTH_ALERT = "health_alert",
    SYSTEM = "system",
    MESSAGE = "message"
}
export type NotificationDocument = Notification & Document;
export declare class Notification {
    user: MongooseSchema.Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    data: Record<string, any>;
    isRead: boolean;
    isActive: boolean;
    expiresAt: Date;
}
export declare const NotificationSchema: MongooseSchema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: import("mongoose").Types.ObjectId;
}>;
