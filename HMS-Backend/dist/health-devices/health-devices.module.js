"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthDevicesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const health_devices_service_1 = require("./health-devices.service");
const health_devices_controller_1 = require("./health-devices.controller");
const device_data_schema_1 = require("./schemas/device-data.schema");
const patients_module_1 = require("../patients/patients.module");
const notifications_module_1 = require("../notifications/notifications.module");
let HealthDevicesModule = class HealthDevicesModule {
};
exports.HealthDevicesModule = HealthDevicesModule;
exports.HealthDevicesModule = HealthDevicesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: device_data_schema_1.DeviceData.name, schema: device_data_schema_1.DeviceDataSchema }]),
            patients_module_1.PatientsModule,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
        ],
        controllers: [health_devices_controller_1.HealthDevicesController],
        providers: [health_devices_service_1.HealthDevicesService],
        exports: [health_devices_service_1.HealthDevicesService],
    })
], HealthDevicesModule);
//# sourceMappingURL=health-devices.module.js.map