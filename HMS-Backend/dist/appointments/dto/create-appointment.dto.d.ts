import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
export declare class CreateAppointmentDto {
    patient: string;
    doctor: string;
    date: Date;
    startTime: string;
    endTime: string;
    status?: AppointmentStatus;
    type?: string;
    reasonForVisit?: string;
    notes?: string;
    symptoms?: string[];
    isPaid?: boolean;
    paymentAmount?: number;
}
