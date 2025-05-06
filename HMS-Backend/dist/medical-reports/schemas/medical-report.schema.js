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
exports.MedicalReportSchema = exports.MedicalReport = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MedicalReport = class MedicalReport {
};
exports.MedicalReport = MedicalReport;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Appointment', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], MedicalReport.prototype, "appointment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Patient', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], MedicalReport.prototype, "patient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Doctor', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], MedicalReport.prototype, "doctor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MedicalReport.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], MedicalReport.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MedicalReport.prototype, "diagnosis", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], MedicalReport.prototype, "symptoms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MedicalReport.prototype, "treatmentPlan", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MedicalReport.prototype, "followUpDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                name: { type: String, required: true },
                form: { type: String, required: true },
                dosageValue: { type: String, required: true },
                dosageUnit: { type: String, required: true },
                breakfast: { type: String, required: true },
                lunch: { type: String, required: true },
                dinner: { type: String, required: true },
                timing: { type: String, required: true },
                instructions: { type: String },
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
            },
        ],
        required: true,
    }),
    __metadata("design:type", Array)
], MedicalReport.prototype, "medications", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                name: { type: String, required: true },
                date: { type: Date, required: true },
                result: { type: String, required: true },
                bloodPressure: { type: String },
                cholesterol: { type: String },
                glucose: { type: String },
                hemoglobin: { type: String },
                platelets: { type: String },
                redBloodCells: { type: String },
                triglycerides: { type: String },
                whiteBloodCells: { type: String },
                notes: { type: String },
            },
        ],
        required: true,
    }),
    __metadata("design:type", Array)
], MedicalReport.prototype, "testResults", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            bloodPressure: {
                systolic: { type: String, required: true },
                diastolic: { type: String, required: true },
            },
            heartRate: { type: Number, required: true },
            respiratoryRate: { type: Number, required: true },
            temperature: { type: Number, required: true },
            oxygenSaturation: { type: Number, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], MedicalReport.prototype, "vitalSigns", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MedicalReport.prototype, "notes", void 0);
exports.MedicalReport = MedicalReport = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MedicalReport);
exports.MedicalReportSchema = mongoose_1.SchemaFactory.createForClass(MedicalReport);
//# sourceMappingURL=medical-report.schema.js.map