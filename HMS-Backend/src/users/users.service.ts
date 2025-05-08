/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CloudinaryConfigService } from '../config/cloudinary.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryConfigService,
  ) {}

  async create(createUserDto: CreateUserDto, profilePicture?: Express.Multer.File): Promise<User> {
    const { email } = createUserDto;
    
    console.log('Creating user with payload:', createUserDto); // Log payload
  
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      console.log(`User with email ${email} already exists`); // Log conflict
      throw new ConflictException('Email already in use');
    }

    // Upload profile picture if provided
    if (profilePicture) {
      try {
        const imageUrl = await this.cloudinaryService.uploadImage(profilePicture);
        createUserDto.profilePicture = imageUrl;
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw new Error('Failed to upload profile picture');
      }
    }
  
    const newUser = new this.userModel(createUserDto);
  
    try {
      const savedUser = await newUser.save();
      console.log('Saved user:', savedUser); // Log saved user
      return savedUser;
    } catch (error) {
      console.error('Error saving user:', error.message); // Log save error
      throw error;
    }
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

  async findOne(id: string | Types.ObjectId): Promise<User> {
    if (typeof id === 'string') {
      id = new Types.ObjectId(id);
    }
    const user = await this.userModel.findById(id).exec();
    console.log('findByEmail - Found user:', user); // 
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<any> {
    try {
      console.log('Searching for user with email:', email);
      const user = await this.userModel.findOne({ email }).exec();
      
      if (!user) {
        console.error('User not found for email:', email);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      console.log('Found user in database:', {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password // Include password for authentication
      });

      // Format user object for authentication - include password
      const formattedUser = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        password: user.password // Include password for authentication
      };

      console.log('Returning formatted user:', formattedUser);
      return formattedUser;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto, profilePicture?: Express.Multer.File): Promise<User> {
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

    // Upload new profile picture if provided
    if (profilePicture) {
      try {
        const imageUrl = await this.cloudinaryService.uploadImage(profilePicture);
        updateUserDto.profilePicture = imageUrl;
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw new Error('Failed to upload profile picture');
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