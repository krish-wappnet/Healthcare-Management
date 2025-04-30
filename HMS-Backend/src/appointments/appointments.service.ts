import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private doctorsService: DoctorsService,
    private patientsService: PatientsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    try {
      // Verify doctor and patient exist
      await this.doctorsService.findOne(createAppointmentDto.doctor);
      await this.patientsService.findOne(createAppointmentDto.patient);
      
      // Check doctor availability for the requested time slot
      await this.checkDoctorAvailability(
        createAppointmentDto.doctor, 
        createAppointmentDto.date, 
        createAppointmentDto.startTime, 
        createAppointmentDto.endTime
      );
      
      // Create the appointment
      const newAppointment = new this.appointmentModel(createAppointmentDto);
      return newAppointment.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create appointment');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.appointmentModel
      .find()
      .populate('patient', '-password -refreshToken')
      .populate('doctor', '-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.appointmentModel.countDocuments();
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  async findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.appointmentModel
      .find({ patient: patientId })
      .populate('doctor')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.appointmentModel.countDocuments({ patient: patientId });
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByDoctor(doctorId: string, paginationDto: PaginationDto): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.appointmentModel
      .find({ doctor: doctorId })
      .populate('patient')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.appointmentModel.countDocuments({ doctor: doctorId });
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findUpcoming(userId: string, isDoctor: boolean, paginationDto: PaginationDto): Promise<{ data: Appointment[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query = isDoctor 
      ? { doctor: userId, date: { $gte: today } } 
      : { patient: userId, date: { $gte: today } };
    
    const data = await this.appointmentModel
      .find(query)
      .populate('patient')
      .populate('doctor')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.appointmentModel.countDocuments(query);
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    // If updating date or time, check availability
    if (updateAppointmentDto.date || updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
      const appointment = await this.findOne(id);
      
      // Check doctor availability for the new time slot
      await this.checkDoctorAvailability(
        appointment.doctor.toString(),
        updateAppointmentDto.date || appointment.date,
        updateAppointmentDto.startTime || appointment.startTime,
        updateAppointmentDto.endTime || appointment.endTime,
        id
      );
    }
    
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return updatedAppointment;
  }

  async remove(id: string): Promise<Appointment> {
    const deletedAppointment = await this.appointmentModel
      .findByIdAndDelete(id)
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!deletedAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return deletedAppointment;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return updatedAppointment;
  }

  async generateMeetingLink(id: string): Promise<Appointment> {
    // In a real implementation, this would integrate with a video API
    // For now, we'll generate a mock meeting link
    const meetingId = Math.random().toString(36).substring(2, 10);
    const meetingLink = `https://meet.example.com/${meetingId}`;
    
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, { meetingLink }, { new: true })
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!updatedAppointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return updatedAppointment;
  }

  private async checkDoctorAvailability(
    doctorId: string, 
    date: Date, 
    startTime: string, 
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<void> {
    // Format date to YYYY-MM-DD
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);
    
    // Check for conflicting appointments
    const query: any = {
      doctor: doctorId,
      date: formattedDate,
      $or: [
        // New appointment starts during existing
        { 
          startTime: { $lte: startTime }, 
          endTime: { $gt: startTime } 
        },
        // New appointment ends during existing
        { 
          startTime: { $lt: endTime }, 
          endTime: { $gte: endTime } 
        },
        // New appointment encompasses existing
        { 
          startTime: { $gte: startTime }, 
          endTime: { $lte: endTime } 
        }
      ]
    };
    
    // Exclude current appointment if updating
    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }
    
    const conflictingAppointment = await this.appointmentModel.findOne(query).exec();
    
    if (conflictingAppointment) {
      throw new BadRequestException('Doctor is not available at the requested time');
    }
    
    // Check doctor's working hours and availability
    // This would be more complex in a real implementation
    // For simplicity, we'll just check if doctor is generally available
    const doctor = await this.doctorsService.findOne(doctorId);
    
    if (!doctor.isAvailableForAppointments) {
      throw new BadRequestException('Doctor is not available for appointments');
    }
  }
}