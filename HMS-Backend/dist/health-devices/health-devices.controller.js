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
exports.HealthDevicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const health_devices_service_1 = require("./health-devices.service");
const create_device_data_dto_1 = require("./dto/create-device-data.dto");
const update_device_data_dto_1 = require("./dto/update-device-data.dto");
const simulate_device_data_dto_1 = require("./dto/simulate-device-data.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_roles_enum_1 = require("../common/enums/user-roles.enum");
let HealthDevicesController = class HealthDevicesController {
    constructor(healthDevicesService) {
        this.healthDevicesService = healthDevicesService;
    }
    create(createDeviceDataDto) {
        return this.healthDevicesService.create(createDeviceDataDto);
    }
    simulateData(simulateDeviceDataDto) {
        return this.healthDevicesService.simulateDeviceData(simulateDeviceDataDto);
    }
    findAll(paginationDto) {
        return this.healthDevicesService.findAll(paginationDto);
    }
    findByPatient(id, paginationDto) {
        return this.healthDevicesService.findByPatient(id, paginationDto);
    }
    findByDeviceType(id, type, paginationDto) {
        return this.healthDevicesService.findByDeviceType(id, type, paginationDto);
    }
    findAbnormalReadings(id, paginationDto) {
        return this.healthDevicesService.findAbnormalReadings(id, paginationDto);
    }
    findOne(id) {
        return this.healthDevicesService.findOne(id);
    }
    update(id, updateDeviceDataDto) {
        return this.healthDevicesService.update(id, updateDeviceDataDto);
    }
    remove(id) {
        return this.healthDevicesService.remove(id);
    }
};
exports.HealthDevicesController = HealthDevicesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new device data entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Device data created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_device_data_dto_1.CreateDeviceDataDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('simulate'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate device data for testing' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Simulated data created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [simulate_device_data_dto_1.SimulateDeviceDataDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "simulateData", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all device data (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all device data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR, user_roles_enum_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get device data by patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return patient device data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)('patient/:id/device/:type'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR, user_roles_enum_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get device data by patient ID and device type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return filtered device data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "findByDeviceType", null);
__decorate([
    (0, common_1.Get)('patient/:id/abnormal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR, user_roles_enum_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get abnormal readings for a patient' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return abnormal readings' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "findAbnormalReadings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a device data entry by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the device data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Device data not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a device data entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Device data updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Device data not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_device_data_dto_1.UpdateDeviceDataDto]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a device data entry' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Device data deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Device data not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthDevicesController.prototype, "remove", null);
exports.HealthDevicesController = HealthDevicesController = __decorate([
    (0, swagger_1.ApiTags)('health-devices'),
    (0, common_1.Controller)('health-devices'),
    __metadata("design:paramtypes", [health_devices_service_1.HealthDevicesService])
], HealthDevicesController);
//# sourceMappingURL=health-devices.controller.js.map