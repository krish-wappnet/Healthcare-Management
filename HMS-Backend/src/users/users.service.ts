/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return newUser.save();
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.userModel.countDocuments();
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // If updating email, check if it already exists
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({ 
        email: updateUserDto.email,
        _id: { $ne: id },
      }).exec();
      
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }
    
    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userModel.updateOne(
      { _id: userId },
      { refreshToken: hashedRefreshToken },
    );
  }
}