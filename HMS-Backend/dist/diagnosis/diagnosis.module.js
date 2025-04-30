"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosisModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const diagnosis_service_1 = require("./diagnosis.service");
const diagnosis_controller_1 = require("./diagnosis.controller");
const diagnosis_schema_1 = require("./schemas/diagnosis.schema");
const patients_module_1 = require("../patients/patients.module");
const doctors_module_1 = require("../doctors/doctors.module");
let DiagnosisModule = class DiagnosisModule {
};
exports.DiagnosisModule = DiagnosisModule;
exports.DiagnosisModule = DiagnosisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: diagnosis_schema_1.Diagnosis.name, schema: diagnosis_schema_1.DiagnosisSchema }]),
            patients_module_1.PatientsModule,
            doctors_module_1.DoctorsModule,
        ],
        controllers: [diagnosis_controller_1.DiagnosisController],
        providers: [diagnosis_service_1.DiagnosisService],
        exports: [diagnosis_service_1.DiagnosisService],
    })
], DiagnosisModule);
//# sourceMappingURL=diagnosis.module.js.map