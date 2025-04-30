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
exports.SimulateDeviceDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DeviceType;
(function (DeviceType) {
    DeviceType["SMARTWATCH"] = "smartwatch";
    DeviceType["BLOOD_PRESSURE"] = "blood_pressure";
    DeviceType["GLUCOSE_MONITOR"] = "glucose_monitor";
    DeviceType["PULSE_OXIMETER"] = "pulse_oximeter";
    DeviceType["THERMOMETER"] = "thermometer";
    DeviceType["WEIGHT_SCALE"] = "weight_scale";
})(DeviceType || (DeviceType = {}));
class SimulateDeviceDataDto {
}
exports.SimulateDeviceDataDto = SimulateDeviceDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ec9d1a6d8236f4673dce' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], SimulateDeviceDataDto.prototype, "patient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DeviceType, example: DeviceType.SMARTWATCH }),
    (0, class_validator_1.IsEnum)(DeviceType),
    __metadata("design:type", String)
], SimulateDeviceDataDto.prototype, "deviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WD-123456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimulateDeviceDataDto.prototype, "deviceId", void 0);
//# sourceMappingURL=simulate-device-data.dto.js.map