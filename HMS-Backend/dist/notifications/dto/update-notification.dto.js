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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNotificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const notification_schema_1 = require("../schemas/notification.schema");
class UpdateNotificationDto {
}
exports.UpdateNotificationDto = UpdateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Appointment Reminder', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'You have an appointment with Dr. Smith tomorrow at 10:00 AM.', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_schema_1.NotificationType, example: notification_schema_1.NotificationType.APPOINTMENT, required: false }),
    (0, class_validator_1.IsEnum)(notification_schema_1.NotificationType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            appointmentId: '60d5ec9d1a6d8236f4673dcf',
            doctorName: 'Dr. Smith',
            appointmentDate: '2023-10-15T10:00:00Z',
        },
        required: false,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateNotificationDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateNotificationDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateNotificationDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-11-15', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateNotificationDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=update-notification.dto.js.map