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
exports.UpdateAppointmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const appointment_status_enum_1 = require("../../common/enums/appointment-status.enum");
class UpdateAppointmentDto {
}
exports.UpdateAppointmentDto = UpdateAppointmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-10-15', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateAppointmentDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
        message: 'Start time must be in the format HH:MM (24-hour)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:30', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
        message: 'End time must be in the format HH:MM (24-hour)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: appointment_status_enum_1.AppointmentStatus, example: appointment_status_enum_1.AppointmentStatus.CONFIRMED, required: false }),
    (0, class_validator_1.IsEnum)(appointment_status_enum_1.AppointmentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Video Consultation', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Annual checkup', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "reasonForVisit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Patient requested a general health checkup.', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Headache', 'Fatigue'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateAppointmentDto.prototype, "symptoms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAppointmentDto.prototype, "isPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAppointmentDto.prototype, "paymentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://meet.example.com/room123', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "meetingLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-11-15', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateAppointmentDto.prototype, "followUpDate", void 0);
//# sourceMappingURL=update-appointment.dto.js.map