import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
export declare class UpdateAppointmentDto {
    date?: Date;
    startTime?: string;
    endTime?: string;
    status?: AppointmentStatus;
    type?: string;
    reasonForVisit?: string;
    notes?: string;
    symptoms?: string[];
    isPaid?: boolean;
    paymentAmount?: number;
    meetingLink?: string;
    followUpDate?: Date;
}
