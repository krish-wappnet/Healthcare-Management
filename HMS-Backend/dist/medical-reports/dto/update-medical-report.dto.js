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
exports.UpdateMedicalReportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MedicationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Aspirin' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '100mg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "dosage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Once daily' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-10-15' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], MedicationDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-10-30' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], MedicationDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Take with food' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "instructions", void 0);
class TestResultDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Blood Glucose' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-10-15' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], TestResultDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '95' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '70-100' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "normalRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mg/dL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "units", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fasting blood glucose test' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "notes", void 0);
class VitalSignsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '120/80' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VitalSignsDto.prototype, "bloodPressure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "heartRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 16 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "respiratoryRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 98.6 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "temperature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 98 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "oxygenSaturation", void 0);
class UpdateMedicalReportDto {
}
exports.UpdateMedicalReportDto = UpdateMedicalReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Annual Physical Examination', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMedicalReportDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-10-15', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateMedicalReportDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hypertension Stage 1', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMedicalReportDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Headache', 'Dizziness'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateMedicalReportDto.prototype, "symptoms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Diet modification and daily exercise', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMedicalReportDto.prototype, "treatmentPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MedicationDto], required: false }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MedicationDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateMedicalReportDto.prototype, "medications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TestResultDto], required: false }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TestResultDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateMedicalReportDto.prototype, "testResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: VitalSignsDto, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VitalSignsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", VitalSignsDto)
], UpdateMedicalReportDto.prototype, "vitalSigns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Patient responded well to initial treatment.', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMedicalReportDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-11-15', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateMedicalReportDto.prototype, "followUpDate", void 0);
//# sourceMappingURL=update-medical-report.dto.js.map