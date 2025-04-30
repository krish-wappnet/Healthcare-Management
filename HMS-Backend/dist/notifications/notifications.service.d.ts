import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
export declare class NotificationsService {
    private notificationModel;
    private usersService;
    constructor(notificationModel: Model<NotificationDocument>, usersService: UsersService);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Notification>;
    findByUser(userId: string, paginationDto: PaginationDto): Promise<{
        data: Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    findUnreadByUser(userId: string): Promise<Notification[]>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification>;
    markAsRead(id: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    remove(id: string): Promise<Notification>;
    createAppointmentNotification(userId: string, appointmentId: string, doctorName: string, appointmentDate: Date, message: string): Promise<Notification>;
    createHealthAlertNotification(userId: string, deviceType: string, abnormalityReason: string, data: any): Promise<Notification>;
    createSystemNotification(userId: string, title: string, message: string, data?: any): Promise<Notification>;
    createMessageNotification(userId: string, senderName: string, message: string, data?: any): Promise<Notification>;
}
