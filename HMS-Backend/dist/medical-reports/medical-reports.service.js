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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const medical_report_schema_1 = require("./schemas/medical-report.schema");
const doctors_service_1 = require("../doctors/doctors.service");
const patients_service_1 = require("../patients/patients.service");
let MedicalReportsService = class MedicalReportsService {
    constructor(medicalReportModel, doctorsService, patientsService) {
        this.medicalReportModel = medicalReportModel;
        this.doctorsService = doctorsService;
        this.patientsService = patientsService;
    }
    async create(createMedicalReportDto) {
        try {
            await this.doctorsService.findOne(createMedicalReportDto.doctor);
            await this.patientsService.findOne(createMedicalReportDto.patient);
            const newMedicalReport = new this.medicalReportModel(createMedicalReportDto);
            return newMedicalReport.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create medical report');
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.medicalReportModel
            .find()
            .populate('patient')
            .populate('doctor')
            .populate('appointment')
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.medicalReportModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const medicalReport = await this.medicalReportModel
            .findById(id)
            .populate('patient')
            .populate('doctor')
            .populate('appointment')
            .exec();
        if (!medicalReport) {
            throw new common_1.NotFoundException(`Medical report with ID ${id} not found`);
        }
        return medicalReport;
    }
    async findByPatient(patientId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.medicalReportModel
            .find({ patient: patientId })
            .populate('doctor', 'name specialization')
            .populate('appointment', 'date status')
            .populate('patient', 'name age gender')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.medicalReportModel.countDocuments({ patient: patientId });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findByDoctor(doctorId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.medicalReportModel
            .find({ doctor: doctorId })
            .populate('patient', 'name age gender')
            .populate('appointment', 'date status')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.medicalReportModel.countDocuments({ doctor: doctorId });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findByAppointment(appointmentId) {
        const medicalReport = await this.medicalReportModel
            .findOne({ appointment: appointmentId })
            .populate('patient')
            .populate('doctor')
            .populate('appointment')
            .exec();
        if (!medicalReport) {
            throw new common_1.NotFoundException(`Medical report for appointment ID ${appointmentId} not found`);
        }
        return medicalReport;
    }
    async update(id, updateMedicalReportDto) {
        const updatedMedicalReport = await this.medicalReportModel
            .findByIdAndUpdate(id, updateMedicalReportDto, { new: true })
            .populate('patient')
            .populate('doctor')
            .populate('appointment')
            .exec();
        if (!updatedMedicalReport) {
            throw new common_1.NotFoundException(`Medical report with ID ${id} not found`);
        }
        return updatedMedicalReport;
    }
    async remove(id) {
        const deletedMedicalReport = await this.medicalReportModel
            .findByIdAndDelete(id)
            .populate('patient')
            .populate('doctor')
            .populate('appointment')
            .exec();
        if (!deletedMedicalReport) {
            throw new common_1.NotFoundException(`Medical report with ID ${id} not found`);
        }
        return deletedMedicalReport;
    }
};
exports.MedicalReportsService = MedicalReportsService;
exports.MedicalReportsService = MedicalReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(medical_report_schema_1.MedicalReport.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        doctors_service_1.DoctorsService,
        patients_service_1.PatientsService])
], MedicalReportsService);
//# sourceMappingURL=medical-reports.service.js.map