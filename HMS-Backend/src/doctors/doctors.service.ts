/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-roles.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    private usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    try {
      // Verify user exists and is a doctor
      const user = await this.usersService.findOne(createDoctorDto.user);
      
      if (user.role !== UserRole.DOCTOR) {
        throw new BadRequestException('User must have a doctor role');
      }
      
      // Check if doctor profile already exists
      const existingDoctor = await this.doctorModel.findOne({ user: createDoctorDto.user }).exec();
      
      if (existingDoctor) {
        throw new BadRequestException('Doctor profile already exists for this user');
      }
      
      // Create doctor profile with initial ratings
      const newDoctor = new this.doctorModel({
        ...createDoctorDto,
        averageRating: 0,
        totalRatings: 0,
      });
      
      return newDoctor.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create doctor profile');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Doctor[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.doctorModel
      .find()
      .populate('user', '-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.doctorModel.countDocuments();
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findById(id)
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    return doctor;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorModel
      .findOne({ user: userId })
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!doctor) {
      throw new NotFoundException(`Doctor profile for user ID ${userId} not found`);
    }
    
    return doctor;
  }

  async findBySpecialization(specialization: string, paginationDto: PaginationDto): Promise<{ data: Doctor[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.doctorModel
      .find({ specialization })
      .populate('user', '-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.doctorModel.countDocuments({ specialization });
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const updatedDoctor = await this.doctorModel
      .findByIdAndUpdate(id, updateDoctorDto, { new: true })
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!updatedDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    return updatedDoctor;
  }

  async remove(id: string): Promise<Doctor> {
    const deletedDoctor = await this.doctorModel
      .findByIdAndDelete(id)
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!deletedDoctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    return deletedDoctor;
  }

  async updateRating(id: string, rating: number): Promise<Doctor> {
    const doctor = await this.doctorModel.findById(id).exec();
    
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    // Calculate new average rating
    const newTotalRatings = doctor.totalRatings + 1;
    const currentRatingSum = doctor.averageRating * doctor.totalRatings;
    const newAverageRating = (currentRatingSum + rating) / newTotalRatings;
    
    // Update doctor profile with new rating
    return this.doctorModel
      .findByIdAndUpdate(
        id,
        { 
          averageRating: newAverageRating, 
          totalRatings: newTotalRatings 
        },
        { new: true }
      )
      .populate('user', '-password -refreshToken')
      .exec();
  }
}