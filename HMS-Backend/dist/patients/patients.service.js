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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const patient_schema_1 = require("./schemas/patient.schema");
const users_service_1 = require("../users/users.service");
const user_roles_enum_1 = require("../common/enums/user-roles.enum");
let PatientsService = class PatientsService {
    constructor(patientModel, usersService) {
        this.patientModel = patientModel;
        this.usersService = usersService;
    }
    async create(createPatientDto) {
        try {
            const user = await this.usersService.findOne(createPatientDto.user);
            if (user.role !== user_roles_enum_1.UserRole.PATIENT) {
                throw new common_1.BadRequestException('User must have a patient role');
            }
            const existingPatient = await this.patientModel.findOne({ user: createPatientDto.user }).exec();
            if (existingPatient) {
                throw new common_1.BadRequestException('Patient profile already exists for this user');
            }
            const newPatient = new this.patientModel(createPatientDto);
            return newPatient.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create patient profile');
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.patientModel
            .find()
            .populate('user', '-password -refreshToken')
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.patientModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const patient = await this.patientModel
            .findById(id)
            .populate('user', '-password -refreshToken')
            .exec();
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }
    async findByUserId(userId) {
        const patient = await this.patientModel
            .findOne({ user: userId })
            .populate('user', '-password -refreshToken')
            .exec();
        if (!patient) {
            throw new common_1.NotFoundException(`Patient profile for user ID ${userId} not found`);
        }
        return patient;
    }
    async update(id, updatePatientDto) {
        const updatedPatient = await this.patientModel
            .findByIdAndUpdate(id, updatePatientDto, { new: true })
            .populate('user', '-password -refreshToken')
            .exec();
        if (!updatedPatient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return updatedPatient;
    }
    async remove(id) {
        const deletedPatient = await this.patientModel
            .findByIdAndDelete(id)
            .populate('user', '-password -refreshToken')
            .exec();
        if (!deletedPatient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return deletedPatient;
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(patient_schema_1.Patient.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map