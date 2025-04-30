import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsEnum, 
  IsArray, 
  IsBoolean,
  IsNumber,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class UpdateAppointmentDto {
  @ApiProperty({ example: '2023-10-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @ApiProperty({ example: '10:00', required: false })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
    message: 'Start time must be in the format HH:MM (24-hour)',
  })
  @IsOptional()
  startTime?: string;

  @ApiProperty({ example: '10:30', required: false })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
    message: 'End time must be in the format HH:MM (24-hour)',
  })
  @IsOptional()
  endTime?: string;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED, required: false })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ example: 'Video Consultation', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'Annual checkup', required: false })
  @IsString()
  @IsOptional()
  reasonForVisit?: string;

  @ApiProperty({ example: 'Patient requested a general health checkup.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: ['Headache', 'Fatigue'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({ example: 150, required: false })
  @IsNumber()
  @IsOptional()
  paymentAmount?: number;

  @ApiProperty({ example: 'https://meet.example.com/room123', required: false })
  @IsString()
  @IsOptional()
  meetingLink?: string;

  @ApiProperty({ example: '2023-11-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  followUpDate?: Date;
}