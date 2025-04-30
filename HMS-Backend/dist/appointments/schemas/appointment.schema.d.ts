import { Document, Schema as MongooseSchema } from 'mongoose';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
export type AppointmentDocument = Appointment & Document;
export declare class Appointment {
    patient: MongooseSchema.Types.ObjectId;
    doctor: MongooseSchema.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    type: string;
    reasonForVisit: string;
    notes: string;
    symptoms: string[];
    isPaid: boolean;
    paymentAmount: number;
    meetingLink: string;
    followUpDate: Date;
}
export declare const AppointmentSchema: MongooseSchema<Appointment, import("mongoose").Model<Appointment, any, any, any, Document<unknown, any, Appointment> & Appointment & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Appointment, Document<unknown, {}, import("mongoose").FlatRecord<Appointment>> & import("mongoose").FlatRecord<Appointment> & {
    _id: import("mongoose").Types.ObjectId;
}>;
