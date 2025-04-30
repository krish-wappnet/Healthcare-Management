import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceData, DeviceDataDocument } from './schemas/device-data.schema';
import { CreateDeviceDataDto } from './dto/create-device-data.dto';
import { UpdateDeviceDataDto } from './dto/update-device-data.dto';
import { SimulateDeviceDataDto } from './dto/simulate-device-data.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PatientsService } from '../patients/patients.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class HealthDevicesService {
  constructor(
    @InjectModel(DeviceData.name) private deviceDataModel: Model<DeviceDataDocument>,
    private patientsService: PatientsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createDeviceDataDto: CreateDeviceDataDto): Promise<DeviceData> {
    try {
      // Verify patient exists
      await this.patientsService.findOne(createDeviceDataDto.patient);
      
      // Create device data entry
      const newDeviceData = new this.deviceDataModel(createDeviceDataDto);
      
      // Check if data is abnormal and flag it
      const isAbnormal = this.checkForAbnormalities(createDeviceDataDto.deviceType, createDeviceDataDto.data);
      
      if (isAbnormal.isAbnormal) {
        newDeviceData.isAbnormal = true;
        newDeviceData.abnormalityReason = isAbnormal.reason;
        
        // Send notification for abnormal reading
        await this.notificationsService.createHealthAlertNotification(
          createDeviceDataDto.patient,
          createDeviceDataDto.deviceType,
          isAbnormal.reason,
          createDeviceDataDto.data,
        );
        
        newDeviceData.notificationSent = true;
      }
      
      return newDeviceData.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create device data entry');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: DeviceData[]; total: number; page: number; limit: number }> {
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

  async findOne(id: string): Promise<DeviceData> {
    const deviceData = await this.deviceDataModel
      .findById(id)
      .populate('patient')
      .exec();
    
    if (!deviceData) {
      throw new NotFoundException(`Device data with ID ${id} not found`);
    }
    
    return deviceData;
  }

  async findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{ data: DeviceData[]; total: number; page: number; limit: number }> {
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

  async findByDeviceType(patientId: string, deviceType: string, paginationDto: PaginationDto): Promise<{ data: DeviceData[]; total: number; page: number; limit: number }> {
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

  async findAbnormalReadings(patientId: string, paginationDto: PaginationDto): Promise<{ data: DeviceData[]; total: number; page: number; limit: number }> {
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

  async update(id: string, updateDeviceDataDto: UpdateDeviceDataDto): Promise<DeviceData> {
    const updatedDeviceData = await this.deviceDataModel
      .findByIdAndUpdate(id, updateDeviceDataDto, { new: true })
      .populate('patient')
      .exec();
    
    if (!updatedDeviceData) {
      throw new NotFoundException(`Device data with ID ${id} not found`);
    }
    
    return updatedDeviceData;
  }

  async remove(id: string): Promise<DeviceData> {
    const deletedDeviceData = await this.deviceDataModel
      .findByIdAndDelete(id)
      .populate('patient')
      .exec();
    
    if (!deletedDeviceData) {
      throw new NotFoundException(`Device data with ID ${id} not found`);
    }
    
    return deletedDeviceData;
  }

  async simulateDeviceData(simulateDto: SimulateDeviceDataDto): Promise<DeviceData> {
    // Verify patient exists
    await this.patientsService.findOne(simulateDto.patient);
    
    // Generate simulated data based on device type
    const simulatedData = this.generateSimulatedData(simulateDto.deviceType);
    
    // Create device data entry
    const createDto: CreateDeviceDataDto = {
      patient: simulateDto.patient,
      deviceId: simulateDto.deviceId,
      deviceType: simulateDto.deviceType,
      timestamp: new Date(),
      data: simulatedData,
    };
    
    return this.create(createDto);
  }

  // Check for abnormal readings based on device type and data
  private checkForAbnormalities(deviceType: string, data: any): { isAbnormal: boolean; reason?: string } {
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

  // Generate random simulated data based on device type
  private generateSimulatedData(deviceType: string): Record<string, any> {
    const random = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };
    
    // Add a 10% chance of generating abnormal data
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
}