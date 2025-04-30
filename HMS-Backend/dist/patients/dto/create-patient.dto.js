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
exports.CreatePatientDto = void 0;
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
class CreatePatientDto {
}
exports.CreatePatientDto = CreatePatientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ec9d1a6d8236f4673dce' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1990-01-01' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreatePatientDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Gender, example: Gender.MALE }),
    (0, class_validator_1.IsEnum)(Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BloodType, example: BloodType.A_POSITIVE }),
    (0, class_validator_1.IsEnum)(BloodType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "bloodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 180 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Peanuts', 'Penicillin'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePatientDto.prototype, "allergies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Aspirin', 'Insulin'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePatientDto.prototype, "medications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Diabetes', 'Hypertension'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePatientDto.prototype, "chronicConditions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "emergencyContactName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Spouse' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "emergencyContactRelation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NY' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "zipCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Blue Cross' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "insuranceProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BC123456789' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "insurancePolicyNumber", void 0);
//# sourceMappingURL=create-patient.dto.js.map