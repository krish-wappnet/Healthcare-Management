import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
export declare class AppointmentsService {
    private appointmentModel;
    private doctorsService;
    private patientsService;
    constructor(appointmentModel: Model<AppointmentDocument>, doctorsService: DoctorsService, patientsService: PatientsService);
    create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Appointment>;
    findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{
        data: Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDoctor(doctorId: string, paginationDto: PaginationDto): Promise<{
        data: Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findUpcoming(userId: string, isDoctor: boolean, paginationDto: PaginationDto): Promise<{
        data: Appointment[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment>;
    remove(id: string): Promise<Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
    generateMeetingLink(id: string): Promise<Appointment>;
    private checkDoctorAvailability;
}
