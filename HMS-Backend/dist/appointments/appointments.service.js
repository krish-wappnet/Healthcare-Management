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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const appointment_schema_1 = require("./schemas/appointment.schema");
const doctors_service_1 = require("../doctors/doctors.service");
const patients_service_1 = require("../patients/patients.service");
let AppointmentsService = class AppointmentsService {
    constructor(appointmentModel, doctorsService, patientsService) {
        this.appointmentModel = appointmentModel;
        this.doctorsService = doctorsService;
        this.patientsService = patientsService;
    }
    async create(createAppointmentDto) {
        try {
            await this.doctorsService.findOne(createAppointmentDto.doctor);
            console.log('Received patient ID:', createAppointmentDto.patient);
            if (!createAppointmentDto.patient.match(/^[0-9a-fA-F]{24}$/)) {
                throw new common_1.BadRequestException(`Invalid patient ID format: ${createAppointmentDto.patient}`);
            }
            const patient = await this.patientsService.findOne(createAppointmentDto.patient);
            if (!patient) {
                const patientByUserId = await this.patientsService.findByUserId(createAppointmentDto.patient);
                if (patientByUserId) {
                    const patientDoc = patientByUserId;
                    const patientId = patientDoc.id;
                    throw new common_1.BadRequestException(`Found patient by user ID but not by patient ID. Please use patient ID: ${patientId}`);
                }
                throw new common_1.NotFoundException(`Patient with ID ${createAppointmentDto.patient} not found in database`);
            }
            await this.checkDoctorAvailability(createAppointmentDto.doctor, createAppointmentDto.date, createAppointmentDto.startTime, createAppointmentDto.endTime);
            const newAppointment = new this.appointmentModel(createAppointmentDto);
            return newAppointment.save();
        }
        catch (error) {
            console.error('Error creating appointment:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create appointment');
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.appointmentModel
            .find()
            .populate('patient', '-password -refreshToken')
            .populate('doctor', '-password -refreshToken')
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.appointmentModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const appointment = await this.appointmentModel
            .findById(id)
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID ${id} not found`);
        }
        return appointment;
    }
    async findByPatient(patientId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.appointmentModel
            .find({ patient: patientId })
            .populate('doctor')
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.appointmentModel.countDocuments({ patient: patientId });
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
        const data = await this.appointmentModel
            .find({ doctor: doctorId })
            .populate('patient')
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.appointmentModel.countDocuments({ doctor: doctorId });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findUpcoming(userId, isDoctor, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const query = isDoctor
            ? { doctor: userId, date: { $gte: today } }
            : { patient: userId, date: { $gte: today } };
        const data = await this.appointmentModel
            .find(query)
            .populate('patient')
            .populate('doctor')
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.appointmentModel.countDocuments(query);
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async update(id, updateAppointmentDto) {
        if (updateAppointmentDto.date || updateAppointmentDto.startTime || updateAppointmentDto.endTime) {
            const appointment = await this.findOne(id);
            await this.checkDoctorAvailability(appointment.doctor.toString(), updateAppointmentDto.date || appointment.date, updateAppointmentDto.startTime || appointment.startTime, updateAppointmentDto.endTime || appointment.endTime, id);
        }
        const updatedAppointment = await this.appointmentModel
            .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!updatedAppointment) {
            throw new common_1.NotFoundException(`Appointment with ID ${id} not found`);
        }
        return updatedAppointment;
    }
    async remove(id) {
        const deletedAppointment = await this.appointmentModel
            .findByIdAndDelete(id)
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!deletedAppointment) {
            throw new common_1.NotFoundException(`Appointment with ID ${id} not found`);
        }
        return deletedAppointment;
    }
    async updateStatus(id, status) {
        const updatedAppointment = await this.appointmentModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!updatedAppointment) {
            throw new common_1.NotFoundException(`Appointment with ID ${id} not found`);
        }
        return updatedAppointment;
    }
    async generateMeetingLink(id) {
        const meetingId = Math.random().toString(36).substring(2, 10);
        const meetingLink = `https://meet.example.com/${meetingId}`;
        const updatedAppointment = await this.appointmentModel
            .findByIdAndUpdate(id, { meetingLink }, { new: true })
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!updatedAppointment) {
            throw new common_1.NotFoundException(`Appointment with ID ${id} not found`);
        }
        return updatedAppointment;
    }
    async checkDoctorAvailability(doctorId, date, startTime, endTime, excludeAppointmentId) {
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);
        const query = {
            doctor: doctorId,
            date: formattedDate,
            $or: [
                {
                    startTime: { $lte: startTime },
                    endTime: { $gt: startTime }
                },
                {
                    startTime: { $lt: endTime },
                    endTime: { $gte: endTime }
                },
                {
                    startTime: { $gte: startTime },
                    endTime: { $lte: endTime }
                }
            ]
        };
        if (excludeAppointmentId) {
            query._id = { $ne: excludeAppointmentId };
        }
        const conflictingAppointment = await this.appointmentModel.findOne(query).exec();
        if (conflictingAppointment) {
            throw new common_1.BadRequestException('Doctor is not available at the requested time');
        }
        const doctor = await this.doctorsService.findOne(doctorId);
        if (!doctor.isAvailableForAppointments) {
            throw new common_1.BadRequestException('Doctor is not available for appointments');
        }
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(appointment_schema_1.Appointment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        doctors_service_1.DoctorsService,
        patients_service_1.PatientsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map