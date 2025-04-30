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
exports.DiagnosisSchema = exports.Diagnosis = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Diagnosis = class Diagnosis {
};
exports.Diagnosis = Diagnosis;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Patient', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Diagnosis.prototype, "patient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Doctor' }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Diagnosis.prototype, "doctor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Array)
], Diagnosis.prototype, "symptoms", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "medicalHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "allergies", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "currentMedications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Diagnosis.prototype, "diagnosisResult", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Diagnosis.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "possibleConditions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "recommendedTests", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "recommendedSpecialists", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Diagnosis.prototype, "treatmentSuggestions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Diagnosis.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Diagnosis.prototype, "isReviewedByDoctor", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Diagnosis.prototype, "doctorFeedback", void 0);
exports.Diagnosis = Diagnosis = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Diagnosis);
exports.DiagnosisSchema = mongoose_1.SchemaFactory.createForClass(Diagnosis);
//# sourceMappingURL=diagnosis.schema.js.map