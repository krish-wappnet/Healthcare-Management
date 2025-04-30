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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const doctor_schema_1 = require("./schemas/doctor.schema");
const users_service_1 = require("../users/users.service");
const user_roles_enum_1 = require("../common/enums/user-roles.enum");
let DoctorsService = class DoctorsService {
    constructor(doctorModel, usersService) {
        this.doctorModel = doctorModel;
        this.usersService = usersService;
    }
    async create(createDoctorDto) {
        try {
            const user = await this.usersService.findOne(createDoctorDto.user);
            if (user.role !== user_roles_enum_1.UserRole.DOCTOR) {
                throw new common_1.BadRequestException('User must have a doctor role');
            }
            const existingDoctor = await this.doctorModel.findOne({ user: createDoctorDto.user }).exec();
            if (existingDoctor) {
                throw new common_1.BadRequestException('Doctor profile already exists for this user');
            }
            const newDoctor = new this.doctorModel({
                ...createDoctorDto,
                averageRating: 0,
                totalRatings: 0,
            });
            return newDoctor.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create doctor profile');
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.doctorModel
            .find()
            .populate('user', '-password -refreshToken')
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.doctorModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const doctor = await this.doctorModel
            .findById(id)
            .populate('user', '-password -refreshToken')
            .exec();
        if (!doctor) {
            throw new common_1.NotFoundException(`Doctor with ID ${id} not found`);
        }
        return doctor;
    }
    async findByUserId(userId) {
        const doctor = await this.doctorModel
            .findOne({ user: userId })
            .populate('user', '-password -refreshToken')
            .exec();
        if (!doctor) {
            throw new common_1.NotFoundException(`Doctor profile for user ID ${userId} not found`);
        }
        return doctor;
    }
    async findBySpecialization(specialization, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.doctorModel
            .find({ specialization })
            .populate('user', '-password -refreshToken')
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.doctorModel.countDocuments({ specialization });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async update(id, updateDoctorDto) {
        const updatedDoctor = await this.doctorModel
            .findByIdAndUpdate(id, updateDoctorDto, { new: true })
            .populate('user', '-password -refreshToken')
            .exec();
        if (!updatedDoctor) {
            throw new common_1.NotFoundException(`Doctor with ID ${id} not found`);
        }
        return updatedDoctor;
    }
    async remove(id) {
        const deletedDoctor = await this.doctorModel
            .findByIdAndDelete(id)
            .populate('user', '-password -refreshToken')
            .exec();
        if (!deletedDoctor) {
            throw new common_1.NotFoundException(`Doctor with ID ${id} not found`);
        }
        return deletedDoctor;
    }
    async updateRating(id, rating) {
        const doctor = await this.doctorModel.findById(id).exec();
        if (!doctor) {
            throw new common_1.NotFoundException(`Doctor with ID ${id} not found`);
        }
        const newTotalRatings = doctor.totalRatings + 1;
        const currentRatingSum = doctor.averageRating * doctor.totalRatings;
        const newAverageRating = (currentRatingSum + rating) / newTotalRatings;
        return this.doctorModel
            .findByIdAndUpdate(id, {
            averageRating: newAverageRating,
            totalRatings: newTotalRatings
        }, { new: true })
            .populate('user', '-password -refreshToken')
            .exec();
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(doctor_schema_1.Doctor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map