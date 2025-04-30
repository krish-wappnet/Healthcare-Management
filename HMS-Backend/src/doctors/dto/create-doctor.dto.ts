import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsNumber, 
  IsBoolean, 
  IsMongoId,
  ValidateNested,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHoursDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  start: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  end: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;
}

class ScheduleDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  monday: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  tuesday: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  wednesday: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  thursday: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  friday: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  saturday: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  sunday: WorkingHoursDto;
}

export class CreateDoctorDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  user: string;

  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: ['MD', 'PhD', 'Board Certified'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiProperty({ example: 'MD12345' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsOptional()
  experience?: number;

  @ApiProperty({ example: 'Dr. John Doe is a cardiologist with over 10 years of experience...' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: '123 Medical Center Dr, Suite 100' })
  @IsString()
  @IsOptional()
  officeAddress?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  officePhone?: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @IsOptional()
  consultationFee?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailableForAppointments?: boolean;

  @ApiProperty()
  @ValidateNested()
  @Type(() => ScheduleDto)
  @IsOptional()
  workingHours?: {
    monday: { start: string; end: string; isAvailable: boolean };
    tuesday: { start: string; end: string; isAvailable: boolean };
    wednesday: { start: string; end: string; isAvailable: boolean };
    thursday: { start: string; end: string; isAvailable: boolean };
    friday: { start: string; end: string; isAvailable: boolean };
    saturday: { start: string; end: string; isAvailable: boolean };
    sunday: { start: string; end: string; isAvailable: boolean };
  };
}