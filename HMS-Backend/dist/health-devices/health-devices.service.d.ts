import { Model } from 'mongoose';
import { DeviceData, DeviceDataDocument } from './schemas/device-data.schema';
import { CreateDeviceDataDto } from './dto/create-device-data.dto';
import { UpdateDeviceDataDto } from './dto/update-device-data.dto';
import { SimulateDeviceDataDto } from './dto/simulate-device-data.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PatientsService } from '../patients/patients.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class HealthDevicesService {
    private deviceDataModel;
    private patientsService;
    private notificationsService;
    constructor(deviceDataModel: Model<DeviceDataDocument>, patientsService: PatientsService, notificationsService: NotificationsService);
    create(createDeviceDataDto: CreateDeviceDataDto): Promise<DeviceData>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<DeviceData>;
    findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{
        data: DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDeviceType(patientId: string, deviceType: string, paginationDto: PaginationDto): Promise<{
        data: DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAbnormalReadings(patientId: string, paginationDto: PaginationDto): Promise<{
        data: DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateDeviceDataDto: UpdateDeviceDataDto): Promise<DeviceData>;
    remove(id: string): Promise<DeviceData>;
    simulateDeviceData(simulateDto: SimulateDeviceDataDto): Promise<DeviceData>;
    private checkForAbnormalities;
    private generateSimulatedData;
}
