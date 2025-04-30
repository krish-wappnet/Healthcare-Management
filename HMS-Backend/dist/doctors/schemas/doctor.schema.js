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
exports.DoctorSchema = exports.Doctor = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Doctor = class Doctor {
};
exports.Doctor = Doctor;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Doctor.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Doctor.prototype, "specialization", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Doctor.prototype, "qualifications", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Doctor.prototype, "licenseNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Doctor.prototype, "experience", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Doctor.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Doctor.prototype, "officeAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Doctor.prototype, "officePhone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Doctor.prototype, "consultationFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "isAvailableForAppointments", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            monday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
            tuesday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
            wednesday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
            thursday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
            friday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
            saturday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
            sunday: {
                start: { type: String },
                end: { type: String },
                isAvailable: { type: Boolean },
            },
        },
        default: {
            monday: { start: '', end: '', isAvailable: false },
            tuesday: { start: '', end: '', isAvailable: false },
            wednesday: { start: '', end: '', isAvailable: false },
            thursday: { start: '', end: '', isAvailable: false },
            friday: { start: '', end: '', isAvailable: false },
            saturday: { start: '', end: '', isAvailable: false },
            sunday: { start: '', end: '', isAvailable: false },
        },
    }),
    __metadata("design:type", Object)
], Doctor.prototype, "workingHours", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Doctor.prototype, "averageRating", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Doctor.prototype, "totalRatings", void 0);
exports.Doctor = Doctor = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Doctor);
exports.DoctorSchema = mongoose_1.SchemaFactory.createForClass(Doctor);
//# sourceMappingURL=doctor.schema.js.map