import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthDevicesService } from './health-devices.service';
import { HealthDevicesController } from './health-devices.controller';
import { DeviceData, DeviceDataSchema } from './schemas/device-data.schema';
import { PatientsModule } from '../patients/patients.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DeviceData.name, schema: DeviceDataSchema }]),
    PatientsModule,
    forwardRef(() => NotificationsModule), // Use forwardRef to resolve circular dependency
  ],
  controllers: [HealthDevicesController],
  providers: [HealthDevicesService],
  exports: [HealthDevicesService],
})
export class HealthDevicesModule {}