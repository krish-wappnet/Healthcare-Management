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
exports.HealthDevicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const device_data_schema_1 = require("./schemas/device-data.schema");
const patients_service_1 = require("../patients/patients.service");
const notifications_service_1 = require("../notifications/notifications.service");
let HealthDevicesService = class HealthDevicesService {
    constructor(deviceDataModel, patientsService, notificationsService) {
        this.deviceDataModel = deviceDataModel;
        this.patientsService = patientsService;
        this.notificationsService = notificationsService;
    }
    async create(createDeviceDataDto) {
        try {
            await this.patientsService.findOne(createDeviceDataDto.patient);
            const newDeviceData = new this.deviceDataModel(createDeviceDataDto);
            const isAbnormal = this.checkForAbnormalities(createDeviceDataDto.deviceType, createDeviceDataDto.data);
            if (isAbnormal.isAbnormal) {
                newDeviceData.isAbnormal = true;
                newDeviceData.abnormalityReason = isAbnormal.reason;
                await this.notificationsService.createHealthAlertNotification(createDeviceDataDto.patient, createDeviceDataDto.deviceType, isAbnormal.reason, createDeviceDataDto.data);
                newDeviceData.notificationSent = true;
            }
            return newDeviceData.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create device data entry');
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.deviceDataModel
            .find()
            .populate('patient')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.deviceDataModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const deviceData = await this.deviceDataModel
            .findById(id)
            .populate('patient')
            .exec();
        if (!deviceData) {
            throw new common_1.NotFoundException(`Device data with ID ${id} not found`);
        }
        return deviceData;
    }
    async findByPatient(patientId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.deviceDataModel
            .find({ patient: patientId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.deviceDataModel.countDocuments({ patient: patientId });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findByDeviceType(patientId, deviceType, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.deviceDataModel
            .find({ patient: patientId, deviceType })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.deviceDataModel.countDocuments({ patient: patientId, deviceType });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findAbnormalReadings(patientId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.deviceDataModel
            .find({ patient: patientId, isAbnormal: true })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.deviceDataModel.countDocuments({ patient: patientId, isAbnormal: true });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async update(id, updateDeviceDataDto) {
        const updatedDeviceData = await this.deviceDataModel
            .findByIdAndUpdate(id, updateDeviceDataDto, { new: true })
            .populate('patient')
            .exec();
        if (!updatedDeviceData) {
            throw new common_1.NotFoundException(`Device data with ID ${id} not found`);
        }
        return updatedDeviceData;
    }
    async remove(id) {
        const deletedDeviceData = await this.deviceDataModel
            .findByIdAndDelete(id)
            .populate('patient')
            .exec();
        if (!deletedDeviceData) {
            throw new common_1.NotFoundException(`Device data with ID ${id} not found`);
        }
        return deletedDeviceData;
    }
    async simulateDeviceData(simulateDto) {
        await this.patientsService.findOne(simulateDto.patient);
        const simulatedData = this.generateSimulatedData(simulateDto.deviceType);
        const createDto = {
            patient: simulateDto.patient,
            deviceId: simulateDto.deviceId,
            deviceType: simulateDto.deviceType,
            timestamp: new Date(),
            data: simulatedData,
        };
        return this.create(createDto);
    }
    checkForAbnormalities(deviceType, data) {
        switch (deviceType) {
            case 'smartwatch':
                if (data.heartRate > 100 || data.heartRate < 50) {
                    return {
                        isAbnormal: true,
                        reason: `Abnormal heart rate: ${data.heartRate} bpm`
                    };
                }
                break;
            case 'blood_pressure':
                const systolic = parseInt(data.bloodPressure.split('/')[0]);
                const diastolic = parseInt(data.bloodPressure.split('/')[1]);
                if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) {
                    return {
                        isAbnormal: true,
                        reason: `Abnormal blood pressure: ${data.bloodPressure}`
                    };
                }
                break;
            case 'glucose_monitor':
                if (data.glucoseLevel > 180 || data.glucoseLevel < 70) {
                    return {
                        isAbnormal: true,
                        reason: `Abnormal glucose level: ${data.glucoseLevel} mg/dL`
                    };
                }
                break;
            case 'pulse_oximeter':
                if (data.oxygenSaturation < 90) {
                    return {
                        isAbnormal: true,
                        reason: `Low oxygen saturation: ${data.oxygenSaturation}%`
                    };
                }
                break;
            case 'thermometer':
                if (data.temperature > 100.4 || data.temperature < 97) {
                    return {
                        isAbnormal: true,
                        reason: `Abnormal body temperature: ${data.temperature}°F`
                    };
                }
                break;
        }
        return { isAbnormal: false };
    }
    generateSimulatedData(deviceType) {
        const random = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        const generateAbnormal = Math.random() < 0.1;
        switch (deviceType) {
            case 'smartwatch':
                return {
                    heartRate: generateAbnormal ? random(100, 140) : random(60, 90),
                    bloodPressure: generateAbnormal
                        ? `${random(140, 180)}/${random(90, 110)}`
                        : `${random(100, 130)}/${random(65, 85)}`,
                    oxygenSaturation: generateAbnormal ? random(85, 89) : random(95, 100),
                    temperature: generateAbnormal
                        ? (random(1001, 1030) / 10)
                        : (random(970, 986) / 10),
                    steps: random(1000, 15000),
                    caloriesBurned: random(500, 3000),
                    sleepHours: random(4, 9),
                };
            case 'blood_pressure':
                return {
                    bloodPressure: generateAbnormal
                        ? `${random(140, 180)}/${random(90, 110)}`
                        : `${random(100, 130)}/${random(65, 85)}`,
                    pulseRate: generateAbnormal ? random(100, 120) : random(60, 90),
                    measurementTime: new Date().toISOString(),
                };
            case 'glucose_monitor':
                return {
                    glucoseLevel: generateAbnormal ? random(180, 300) : random(70, 120),
                    measurementType: 'Blood',
                    measurementTime: new Date().toISOString(),
                    isFasting: Math.random() > 0.5,
                };
            case 'pulse_oximeter':
                return {
                    oxygenSaturation: generateAbnormal ? random(85, 89) : random(95, 100),
                    pulseRate: generateAbnormal ? random(100, 120) : random(60, 90),
                    measurementTime: new Date().toISOString(),
                };
            case 'thermometer':
                return {
                    temperature: generateAbnormal
                        ? (random(1001, 1030) / 10)
                        : (random(970, 986) / 10),
                    measurementLocation: 'Oral',
                    measurementTime: new Date().toISOString(),
                };
            case 'weight_scale':
                return {
                    weight: random(120, 250),
                    bmi: (random(180, 350) / 10),
                    bodyFatPercentage: random(10, 35),
                    measurementTime: new Date().toISOString(),
                };
            default:
                return {
                    value: random(1, 100),
                    timestamp: new Date().toISOString(),
                };
        }
    }
};
exports.HealthDevicesService = HealthDevicesService;
exports.HealthDevicesService = HealthDevicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_data_schema_1.DeviceData.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        patients_service_1.PatientsService,
        notifications_service_1.NotificationsService])
], HealthDevicesService);
//# sourceMappingURL=health-devices.service.js.map