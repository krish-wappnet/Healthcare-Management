import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../schemas/notification.schema';

export class UpdateNotificationDto {
  @ApiProperty({ example: 'Appointment Reminder', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'You have an appointment with Dr. Smith tomorrow at 10:00 AM.', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.APPOINTMENT, required: false })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    example: {
      appointmentId: '60d5ec9d1a6d8236f4673dcf',
      doctorName: 'Dr. Smith',
      appointmentDate: '2023-10-15T10:00:00Z',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: '2023-11-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;
}