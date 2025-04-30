import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-roles.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private usersService: UsersService,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      // Verify user exists and is a patient
      const user = await this.usersService.findOne(createPatientDto.user);
      
      if (user.role !== UserRole.PATIENT) {
        throw new BadRequestException('User must have a patient role');
      }
      
      // Check if patient profile already exists
      const existingPatient = await this.patientModel.findOne({ user: createPatientDto.user }).exec();
      
      if (existingPatient) {
        throw new BadRequestException('Patient profile already exists for this user');
      }
      
      // Create the patient profile
      const newPatient = new this.patientModel(createPatientDto);
      return newPatient.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create patient profile');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.patientModel
      .find()
      .populate('user', '-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.patientModel.countDocuments();
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel
      .findById(id)
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return patient;
  }

  async findByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientModel
      .findOne({ user: userId })
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!patient) {
      throw new NotFoundException(`Patient profile for user ID ${userId} not found`);
    }
    
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const updatedPatient = await this.patientModel
      .findByIdAndUpdate(id, updatePatientDto, { new: true })
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!updatedPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return updatedPatient;
  }

  async remove(id: string): Promise<Patient> {
    const deletedPatient = await this.patientModel
      .findByIdAndDelete(id)
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!deletedPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return deletedPatient;
  }
}