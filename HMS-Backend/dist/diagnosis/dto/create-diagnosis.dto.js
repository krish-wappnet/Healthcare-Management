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
exports.CreateDiagnosisDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PossibleConditionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Common Cold' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PossibleConditionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.85 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], PossibleConditionDto.prototype, "probability", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Viral infection affecting the nose and throat' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PossibleConditionDto.prototype, "description", void 0);
class CreateDiagnosisDto {
}
exports.CreateDiagnosisDto = CreateDiagnosisDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ec9d1a6d8236f4673dce' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateDiagnosisDto.prototype, "patient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ec9d1a6d8236f4673dcf', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiagnosisDto.prototype, "doctor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['headache', 'fever', 'fatigue'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "symptoms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Hypertension', 'Type 2 Diabetes'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "medicalHistory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Penicillin', 'Peanuts'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "allergies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Lisinopril', 'Metformin'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "currentMedications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Influenza A' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDiagnosisDto.prototype, "diagnosisResult", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.92, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDiagnosisDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PossibleConditionDto], required: false }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PossibleConditionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "possibleConditions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Complete Blood Count', 'Flu Test'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "recommendedTests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Infectious Disease Specialist'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "recommendedSpecialists", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Rest', 'Fluids', 'Antiviral medication'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiagnosisDto.prototype, "treatmentSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Symptoms consistent with influenza. Recommend starting Tamiflu.', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiagnosisDto.prototype, "notes", void 0);
//# sourceMappingURL=create-diagnosis.dto.js.map