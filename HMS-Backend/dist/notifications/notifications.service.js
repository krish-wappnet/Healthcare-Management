"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const users_service_1 = require("../users/users.service");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, usersService) {
        this.notificationModel = notificationModel;
        this.usersService = usersService;
    }
    async create(createNotificationDto) {
        try {
            await this.usersService.findOne(createNotificationDto.user);
            const newNotification = new this.notificationModel(createNotificationDto);
            return newNotification.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create notification');
        }
    }
    async findAll(paginationDto) {
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
    async findOne(id) {
        const notification = await this.notificationModel
            .findById(id)
            .populate('user', '-password -refreshToken')
            .exec();
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        return notification;
    }
    async findByUser(userId, paginationDto) {
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
    async findUnreadByUser(userId) {
        return this.notificationModel
            .find({ user: userId, isRead: false, isActive: true })
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(id, updateNotificationDto) {
        const updatedNotification = await this.notificationModel
            .findByIdAndUpdate(id, updateNotificationDto, { new: true })
            .populate('user', '-password -refreshToken')
            .exec();
        if (!updatedNotification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        return updatedNotification;
    }
    async markAsRead(id) {
        return this.update(id, { isRead: true });
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
        return { count: result.modifiedCount };
    }
    async remove(id) {
        const deletedNotification = await this.notificationModel
            .findByIdAndDelete(id)
            .populate('user', '-password -refreshToken')
            .exec();
        if (!deletedNotification) {
            throw new common_1.NotFoundException(`Notification with ID ${id} not found`);
        }
        return deletedNotification;
    }
    async createAppointmentNotification(userId, appointmentId, doctorName, appointmentDate, message) {
        const createDto = {
            user: userId,
            title: 'Appointment Reminder',
            message,
            type: notification_schema_1.NotificationType.APPOINTMENT,
            data: {
                appointmentId,
                doctorName,
                appointmentDate,
            },
        };
        return this.create(createDto);
    }
    async createHealthAlertNotification(userId, deviceType, abnormalityReason, data) {
        const createDto = {
            user: userId,
            title: 'Health Alert',
            message: `Abnormal reading detected from your ${deviceType}: ${abnormalityReason}`,
            type: notification_schema_1.NotificationType.HEALTH_ALERT,
            data: {
                deviceType,
                abnormalityReason,
                readings: data,
                timestamp: new Date(),
            },
        };
        return this.create(createDto);
    }
    async createSystemNotification(userId, title, message, data) {
        const createDto = {
            user: userId,
            title,
            message,
            type: notification_schema_1.NotificationType.SYSTEM,
            data,
        };
        return this.create(createDto);
    }
    async createMessageNotification(userId, senderName, message, data) {
        const createDto = {
            user: userId,
            title: `New message from ${senderName}`,
            message,
            type: notification_schema_1.NotificationType.MESSAGE,
            data: {
                ...data,
                senderName,
                timestamp: new Date(),
            },
        };
        return this.create(createDto);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map