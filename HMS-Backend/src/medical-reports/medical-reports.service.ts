import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalReport, MedicalReportDocument } from './schemas/medical-report.schema';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class MedicalReportsService {
  constructor(
    @InjectModel(MedicalReport.name) private medicalReportModel: Model<MedicalReportDocument>,
    private doctorsService: DoctorsService,
    private patientsService: PatientsService,
  ) {}

  async create(createMedicalReportDto: CreateMedicalReportDto): Promise<MedicalReport> {
    try {
      // Verify doctor and patient exist
      await this.doctorsService.findOne(createMedicalReportDto.doctor);
      await this.patientsService.findOne(createMedicalReportDto.patient);
      
      // Create the medical report
      const newMedicalReport = new this.medicalReportModel(createMedicalReportDto);
      return newMedicalReport.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create medical report');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: MedicalReport[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.medicalReportModel
      .find()
      .populate('patient')
      .populate('doctor')
      .populate('appointment')
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.medicalReportModel.countDocuments();
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<MedicalReport> {
    const medicalReport = await this.medicalReportModel
      .findById(id)
      .populate('patient')
      .populate('doctor')
      .populate('appointment')
      .exec();
    
    if (!medicalReport) {
      throw new NotFoundException(`Medical report with ID ${id} not found`);
    }
    
    return medicalReport;
  }

  async findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{ data: MedicalReport[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.medicalReportModel
      .find({ patient: patientId })
      .populate('doctor')
      .populate('appointment')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.medicalReportModel.countDocuments({ patient: patientId });
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByDoctor(doctorId: string, paginationDto: PaginationDto): Promise<{ data: MedicalReport[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.medicalReportModel
      .find({ doctor: doctorId })
      .populate('patient')
      .populate('appointment')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.medicalReportModel.countDocuments({ doctor: doctorId });
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByAppointment(appointmentId: string): Promise<MedicalReport> {
    const medicalReport = await this.medicalReportModel
      .findOne({ appointment: appointmentId })
      .populate('patient')
      .populate('doctor')
      .populate('appointment')
      .exec();
    
    if (!medicalReport) {
      throw new NotFoundException(`Medical report for appointment ID ${appointmentId} not found`);
    }
    
    return medicalReport;
  }

  async update(id: string, updateMedicalReportDto: UpdateMedicalReportDto): Promise<MedicalReport> {
    const updatedMedicalReport = await this.medicalReportModel
      .findByIdAndUpdate(id, updateMedicalReportDto, { new: true })
      .populate('patient')
      .populate('doctor')
      .populate('appointment')
      .exec();
    
    if (!updatedMedicalReport) {
      throw new NotFoundException(`Medical report with ID ${id} not found`);
    }
    
    return updatedMedicalReport;
  }

  async remove(id: string): Promise<MedicalReport> {
    const deletedMedicalReport = await this.medicalReportModel
      .findByIdAndDelete(id)
      .populate('patient')
      .populate('doctor')
      .populate('appointment')
      .exec();
    
    if (!deletedMedicalReport) {
      throw new NotFoundException(`Medical report with ID ${id} not found`);
    }
    
    return deletedMedicalReport;
  }
}