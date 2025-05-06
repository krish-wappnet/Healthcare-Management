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
exports.CreateMedicalReportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MedicationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Metformin',
        description: 'Name of the medication'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'tablet',
        description: 'Form of the medication (tablet, syrup, capsule, etc.)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "form", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '500',
        description: 'Dosage value of the medication'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "dosageValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'mg',
        description: 'Unit of dosage (mg, ml, mcg, etc.)'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1',
        description: 'Number of doses to take with breakfast'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "breakfast", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0',
        description: 'Number of doses to take with lunch'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "lunch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1',
        description: 'Number of doses to take with dinner'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "dinner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'after_breakfast,after_dinner',
        description: 'Timing of medication administration'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "timing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Take with food',
        description: 'Additional instructions for medication'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MedicationDto.prototype, "instructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-04T18:30:00.000Z',
        description: 'Start date of medication'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], MedicationDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-11T18:30:00.000Z',
        description: 'End date of medication'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], MedicationDto.prototype, "endDate", void 0);
class TestResultDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Complete Blood Count',
        description: 'Name of the medical test'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-02T18:30:00.000Z',
        description: 'Date when the test was performed'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], TestResultDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Normal',
        description: 'Result of the test'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '120/80',
        description: 'Blood pressure reading'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "bloodPressure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '180',
        description: 'Cholesterol level in mg/dL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "cholesterol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '100',
        description: 'Blood glucose level in mg/dL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "glucose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '14',
        description: 'Hemoglobin level in g/dL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "hemoglobin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '250',
        description: 'Platelet count in 10^3/uL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "platelets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '5',
        description: 'Red blood cell count in 10^6/uL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "redBloodCells", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '150',
        description: 'Triglycerides level in mg/dL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "triglycerides", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '7',
        description: 'White blood cell count in 10^3/uL'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "whiteBloodCells", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'All values within normal range',
        description: 'Additional notes about the test results'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TestResultDto.prototype, "notes", void 0);
class VitalSignsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { systolic: '120', diastolic: '80' },
        description: 'Blood pressure reading (systolic/diastolic)'
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], VitalSignsDto.prototype, "bloodPressure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 75,
        description: 'Heart rate in beats per minute'
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "heartRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 18,
        description: 'Respiratory rate in breaths per minute'
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "respiratoryRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 37,
        description: 'Body temperature in Celsius'
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "temperature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 98,
        description: 'Oxygen saturation percentage'
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VitalSignsDto.prototype, "oxygenSaturation", void 0);
class CreateMedicalReportDto {
}
exports.CreateMedicalReportDto = CreateMedicalReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '6813761e8cbc04988b6a8b84',
        description: 'ID of the associated appointment'
    }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "appointment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '681375e78cbc04988b6a8b63',
        description: 'ID of the patient'
    }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "patient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '681314d4fa5aef9dd5d05437',
        description: 'ID of the doctor'
    }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "doctor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Annual Health Checkup',
        description: 'Title of the medical report'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-02T18:30:00.000Z',
        description: 'Date of the medical report'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateMedicalReportDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Hypertension Stage 1',
        description: 'Medical diagnosis'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['Headache', 'Dizziness', 'Fatigue'],
        description: 'List of symptoms reported by the patient'
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMedicalReportDto.prototype, "symptoms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Continue current treatment with lifestyle modifications',
        description: 'Treatment plan for the condition'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "treatmentPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-05-16T18:30:00.000Z',
        description: 'Scheduled follow-up date'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateMedicalReportDto.prototype, "followUpDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [MedicationDto],
        description: 'List of prescribed medications'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MedicationDto),
    __metadata("design:type", Array)
], CreateMedicalReportDto.prototype, "medications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TestResultDto],
        description: 'List of test results'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TestResultDto),
    __metadata("design:type", Array)
], CreateMedicalReportDto.prototype, "testResults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: VitalSignsDto,
        description: 'Vital signs measurements'
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VitalSignsDto),
    __metadata("design:type", VitalSignsDto)
], CreateMedicalReportDto.prototype, "vitalSigns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Patient is responding well to treatment. Blood pressure under control.',
        description: 'Additional notes about the medical report'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMedicalReportDto.prototype, "notes", void 0);
//# sourceMappingURL=create-medical-report.dto.js.map