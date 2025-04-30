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
exports.DeviceDataSchema = exports.DeviceData = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DeviceData = class DeviceData {
};
exports.DeviceData = DeviceData;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Patient', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], DeviceData.prototype, "patient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DeviceData.prototype, "deviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DeviceData.prototype, "deviceType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], DeviceData.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, required: true }),
    __metadata("design:type", Object)
], DeviceData.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DeviceData.prototype, "isAbnormal", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DeviceData.prototype, "abnormalityReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DeviceData.prototype, "notificationSent", void 0);
exports.DeviceData = DeviceData = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DeviceData);
exports.DeviceDataSchema = mongoose_1.SchemaFactory.createForClass(DeviceData);
//# sourceMappingURL=device-data.schema.js.map