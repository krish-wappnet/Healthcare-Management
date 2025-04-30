import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId, IsEnum } from 'class-validator';

enum DeviceType {
  SMARTWATCH = 'smartwatch',
  BLOOD_PRESSURE = 'blood_pressure',
  GLUCOSE_MONITOR = 'glucose_monitor',
  PULSE_OXIMETER = 'pulse_oximeter',
  THERMOMETER = 'thermometer',
  WEIGHT_SCALE = 'weight_scale',
}

export class SimulateDeviceDataDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.SMARTWATCH })
  @IsEnum(DeviceType)
  deviceType: string;

  @ApiProperty({ example: 'WD-123456' })
  @IsString()
  deviceId: string;
}