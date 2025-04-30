import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto): Promise<import("./schemas/appointment.schema").Appointment>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/appointment.schema").Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByPatient(id: string, paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/appointment.schema").Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDoctor(id: string, paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/appointment.schema").Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUpcomingDoctorAppointments(paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/appointment.schema").Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUpcomingPatientAppointments(paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/appointment.schema").Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./schemas/appointment.schema").Appointment>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<import("./schemas/appointment.schema").Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<import("./schemas/appointment.schema").Appointment>;
    generateMeetingLink(id: string): Promise<import("./schemas/appointment.schema").Appointment>;
    remove(id: string): Promise<import("./schemas/appointment.schema").Appointment>;
}
