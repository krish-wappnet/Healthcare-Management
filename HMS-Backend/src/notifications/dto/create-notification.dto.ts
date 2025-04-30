import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsMongoId, 
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  user: string;

  @ApiProperty({ example: 'Appointment Reminder' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'You have an appointment with Dr. Smith tomorrow at 10:00 AM.' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.APPOINTMENT })
  @IsEnum(NotificationType)
  type: NotificationType;

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

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: '2023-11-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;
}