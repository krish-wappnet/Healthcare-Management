import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private usersService: UsersService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      // Verify user exists
      await this.usersService.findOne(createNotificationDto.user);
      
      // Create notification
      const newNotification = new this.notificationModel(createNotificationDto);
      return newNotification.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create notification');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.notificationModel
      .find()
      .populate('user', '-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.notificationModel.countDocuments();
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return notification;
  }

  async findByUser(userId: string, paginationDto: PaginationDto): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const data = await this.notificationModel
      .find({ user: userId, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const total = await this.notificationModel.countDocuments({ user: userId, isActive: true });
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: userId, isRead: false, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!updatedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return updatedNotification;
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationModel.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
    
    return { count: result.modifiedCount };
  }

  async remove(id: string): Promise<Notification> {
    const deletedNotification = await this.notificationModel
      .findByIdAndDelete(id)
      .populate('user', '-password -refreshToken')
      .exec();
    
    if (!deletedNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return deletedNotification;
  }

  // Create a notification for appointment reminders
  async createAppointmentNotification(
    userId: string,
    appointmentId: string,
    doctorName: string,
    appointmentDate: Date,
    message: string,
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      user: userId,
      title: 'Appointment Reminder',
      message,
      type: NotificationType.APPOINTMENT,
      data: {
        appointmentId,
        doctorName,
        appointmentDate,
      },
    };
    
    return this.create(createDto);
  }

  // Create a notification for health alerts from devices
  async createHealthAlertNotification(
    userId: string,
    deviceType: string,
    abnormalityReason: string,
    data: any,
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      user: userId,
      title: 'Health Alert',
      message: `Abnormal reading detected from your ${deviceType}: ${abnormalityReason}`,
      type: NotificationType.HEALTH_ALERT,
      data: {
        deviceType,
        abnormalityReason,
        readings: data,
        timestamp: new Date(),
      },
    };
    
    return this.create(createDto);
  }

  // Create a system notification
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      user: userId,
      title,
      message,
      type: NotificationType.SYSTEM,
      data,
    };
    
    return this.create(createDto);
  }

  // Create a message notification
  async createMessageNotification(
    userId: string,
    senderName: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      user: userId,
      title: `New message from ${senderName}`,
      message,
      type: NotificationType.MESSAGE,
      data: {
        ...data,
        senderName,
        timestamp: new Date(),
      },
    };
    
    return this.create(createDto);
  }
}