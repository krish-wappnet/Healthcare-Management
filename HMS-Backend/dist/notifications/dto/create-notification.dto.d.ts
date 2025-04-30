import { NotificationType } from '../schemas/notification.schema';
export declare class CreateNotificationDto {
    user: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: Record<string, any>;
    isRead?: boolean;
    isActive?: boolean;
    expiresAt?: Date;
}
