import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsNumber, 
  IsBoolean,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHoursDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsOptional()
  start?: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @IsOptional()
  end?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

class ScheduleDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  monday?: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  tuesday?: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  wednesday?: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  thursday?: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  friday?: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  saturday?: WorkingHoursDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  sunday?: WorkingHoursDto;
}

export class UpdateDoctorDto {
  @ApiProperty({ example: 'Cardiology', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ example: ['MD', 'PhD', 'Board Certified'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiProperty({ example: 'MD12345', required: false })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  experience?: number;

  @ApiProperty({ example: 'Dr. John Doe is a cardiologist with over 10 years of experience...', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: '123 Medical Center Dr, Suite 100', required: false })
  @IsString()
  @IsOptional()
  officeAddress?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  officePhone?: string;

  @ApiProperty({ example: 150, required: false })
  @IsNumber()
  @IsOptional()
  consultationFee?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isAvailableForAppointments?: boolean;

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => ScheduleDto)
  @IsOptional()
  workingHours?: {
    monday?: { start?: string; end?: string; isAvailable?: boolean };
    tuesday?: { start?: string; end?: string; isAvailable?: boolean };
    wednesday?: { start?: string; end?: string; isAvailable?: boolean };
    thursday?: { start?: string; end?: string; isAvailable?: boolean };
    friday?: { start?: string; end?: string; isAvailable?: boolean };
    saturday?: { start?: string; end?: string; isAvailable?: boolean };
    sunday?: { start?: string; end?: string; isAvailable?: boolean };
  };
}