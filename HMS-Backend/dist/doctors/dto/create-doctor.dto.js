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
exports.CreateDoctorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WorkingHoursDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkingHoursDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '17:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkingHoursDto.prototype, "end", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkingHoursDto.prototype, "isAvailable", void 0);
class ScheduleDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "monday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "tuesday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "wednesday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "thursday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "friday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "saturday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkingHoursDto),
    __metadata("design:type", WorkingHoursDto)
], ScheduleDto.prototype, "sunday", void 0);
class CreateDoctorDto {
}
exports.CreateDoctorDto = CreateDoctorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ec9d1a6d8236f4673dce' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateDoctorDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cardiology' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDoctorDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['MD', 'PhD', 'Board Certified'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDoctorDto.prototype, "qualifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MD12345' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDoctorDto.prototype, "licenseNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDoctorDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dr. John Doe is a cardiologist with over 10 years of experience...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDoctorDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Medical Center Dr, Suite 100' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDoctorDto.prototype, "officeAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDoctorDto.prototype, "officePhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDoctorDto.prototype, "consultationFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDoctorDto.prototype, "isAvailableForAppointments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ScheduleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateDoctorDto.prototype, "workingHours", void 0);
//# sourceMappingURL=create-doctor.dto.js.map