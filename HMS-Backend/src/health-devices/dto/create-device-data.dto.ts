import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsMongoId, 
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceDataDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ example: 'WD-123456' })
  @IsString()
  deviceId: string;

  @ApiProperty({ example: 'smartwatch' })
  @IsString()
  deviceType: string;

  @ApiProperty({ example: '2023-10-15T10:30:00Z' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({
    example: {
      heartRate: 75,
      bloodPressure: '120/80',
      oxygenSaturation: 98,
      temperature: 98.6,
      steps: 8500,
    }
  })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAbnormal?: boolean;

  @ApiProperty({ example: 'Heart rate above normal range', required: false })
  @IsString()
  @IsOptional()
  abnormalityReason?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  notificationSent?: boolean;
}