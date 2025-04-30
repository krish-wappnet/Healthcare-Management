import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsBoolean,
  IsObject,
} from 'class-validator';

export class UpdateDeviceDataDto {
  @ApiProperty({ 
    example: {
      heartRate: 75,
      bloodPressure: '120/80',
      oxygenSaturation: 98,
      temperature: 98.6,
      steps: 8500,
    },
    required: false 
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isAbnormal?: boolean;

  @ApiProperty({ example: 'Heart rate above normal range', required: false })
  @IsString()
  @IsOptional()
  abnormalityReason?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  notificationSent?: boolean;
}