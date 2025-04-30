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
exports.CreateDeviceDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateDeviceDataDto {
}
exports.CreateDeviceDataDto = CreateDeviceDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ec9d1a6d8236f4673dce' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateDeviceDataDto.prototype, "patient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WD-123456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDataDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'smartwatch' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeviceDataDto.prototype, "deviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-10-15T10:30:00Z' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateDeviceDataDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            heartRate: 75,
            bloodPressure: '120/80',
            oxygenSaturation: 98,
            temperature: 98.6,
            steps: 8500,
        }
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateDeviceDataDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDeviceDataDto.prototype, "isAbnormal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Heart rate above normal range', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDeviceDataDto.prototype, "abnormalityReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDeviceDataDto.prototype, "notificationSent", void 0);
//# sourceMappingURL=create-device-data.dto.js.map