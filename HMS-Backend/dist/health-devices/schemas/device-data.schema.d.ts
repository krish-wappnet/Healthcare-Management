import { Document, Schema as MongooseSchema } from 'mongoose';
export type DeviceDataDocument = DeviceData & Document;
export declare class DeviceData {
    patient: MongooseSchema.Types.ObjectId;
    deviceId: string;
    deviceType: string;
    timestamp: Date;
    data: Record<string, any>;
    isAbnormal: boolean;
    abnormalityReason: string;
    notificationSent: boolean;
}
export declare const DeviceDataSchema: MongooseSchema<DeviceData, import("mongoose").Model<DeviceData, any, any, any, Document<unknown, any, DeviceData> & DeviceData & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DeviceData, Document<unknown, {}, import("mongoose").FlatRecord<DeviceData>> & import("mongoose").FlatRecord<DeviceData> & {
    _id: import("mongoose").Types.ObjectId;
}>;
