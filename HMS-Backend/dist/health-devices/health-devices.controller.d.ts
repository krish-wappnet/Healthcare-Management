import { HealthDevicesService } from './health-devices.service';
import { CreateDeviceDataDto } from './dto/create-device-data.dto';
import { UpdateDeviceDataDto } from './dto/update-device-data.dto';
import { SimulateDeviceDataDto } from './dto/simulate-device-data.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class HealthDevicesController {
    private readonly healthDevicesService;
    constructor(healthDevicesService: HealthDevicesService);
    create(createDeviceDataDto: CreateDeviceDataDto): Promise<import("./schemas/device-data.schema").DeviceData>;
    simulateData(simulateDeviceDataDto: SimulateDeviceDataDto): Promise<import("./schemas/device-data.schema").DeviceData>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: import("./schemas/device-data.schema").DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByPatient(id: string, paginationDto: PaginationDto): Promise<{
        data: import("./schemas/device-data.schema").DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByDeviceType(id: string, type: string, paginationDto: PaginationDto): Promise<{
        data: import("./schemas/device-data.schema").DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAbnormalReadings(id: string, paginationDto: PaginationDto): Promise<{
        data: import("./schemas/device-data.schema").DeviceData[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("./schemas/device-data.schema").DeviceData>;
    update(id: string, updateDeviceDataDto: UpdateDeviceDataDto): Promise<import("./schemas/device-data.schema").DeviceData>;
    remove(id: string): Promise<import("./schemas/device-data.schema").DeviceData>;
}
