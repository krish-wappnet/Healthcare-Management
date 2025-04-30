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
exports.UpdatePatientDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (Gender = {}));
var BloodType;
(function (BloodType) {
    BloodType["A_POSITIVE"] = "A+";
    BloodType["A_NEGATIVE"] = "A-";
    BloodType["B_POSITIVE"] = "B+";
    BloodType["B_NEGATIVE"] = "B-";
    BloodType["AB_POSITIVE"] = "AB+";
    BloodType["AB_NEGATIVE"] = "AB-";
    BloodType["O_POSITIVE"] = "O+";
    BloodType["O_NEGATIVE"] = "O-";
})(BloodType || (BloodType = {}));
class UpdatePatientDto {
}
exports.UpdatePatientDto = UpdatePatientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1990-01-01', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdatePatientDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Gender, example: Gender.MALE, required: false }),
    (0, class_validator_1.IsEnum)(Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BloodType, example: BloodType.A_POSITIVE, required: false }),
    (0, class_validator_1.IsEnum)(BloodType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "bloodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 180, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePatientDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePatientDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Peanuts', 'Penicillin'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdatePatientDto.prototype, "allergies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Aspirin', 'Insulin'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdatePatientDto.prototype, "medications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Diabetes', 'Hypertension'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdatePatientDto.prototype, "chronicConditions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Doe', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Spouse', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NY', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10001', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USA', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Blue Cross', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "insuranceProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BC123456789', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "insurancePolicyNumber", void 0);
//# sourceMappingURL=update-patient.dto.js.map