import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsEnum, 
  IsMongoId, 
  IsArray,
  IsBoolean,
  IsNumber,
  Matches 
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class CreateAppointmentDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dcf' })
  @IsMongoId()
  doctor: string;

  @ApiProperty({ example: '2023-10-15' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
    message: 'Start time must be in the format HH:MM (24-hour)',
  })
  startTime: string;

  @ApiProperty({ example: '10:30' })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
    message: 'End time must be in the format HH:MM (24-hour)',
  })
  endTime: string;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.SCHEDULED })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ example: 'Video Consultation' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'Annual checkup' })
  @IsString()
  @IsOptional()
  reasonForVisit?: string;

  @ApiProperty({ example: 'Patient requested a general health checkup.' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: ['Headache', 'Fatigue'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @IsOptional()
  paymentAmount?: number;
}