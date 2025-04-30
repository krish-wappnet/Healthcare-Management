import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("./schemas/notification.schema").Notification>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/notification.schema").Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByUser(paginationDto: PaginationDto, req: any): Promise<{
        data: import("./schemas/notification.schema").Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    findUnreadByUser(req: any): Promise<import("./schemas/notification.schema").Notification[]>;
    findOne(id: string): Promise<import("./schemas/notification.schema").Notification>;
    update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<import("./schemas/notification.schema").Notification>;
    markAsRead(id: string): Promise<import("./schemas/notification.schema").Notification>;
    markAllAsRead(req: any): Promise<{
        count: number;
    }>;
    remove(id: string): Promise<import("./schemas/notification.schema").Notification>;
}
