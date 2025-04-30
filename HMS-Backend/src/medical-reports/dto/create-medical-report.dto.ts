import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsMongoId, 
  IsArray,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class MedicationDto {
  @ApiProperty({ example: 'Aspirin' })
  @IsString()
  name: string;

  @ApiProperty({ example: '100mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ example: 'Once daily' })
  @IsString()
  frequency: string;

  @ApiProperty({ example: '2023-10-15' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2023-10-30' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ example: 'Take with food' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

class TestResultDto {
  @ApiProperty({ example: 'Blood Glucose' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2023-10-15' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: '95' })
  @IsString()
  result: string;

  @ApiProperty({ example: '70-100' })
  @IsString()
  @IsOptional()
  normalRange?: string;

  @ApiProperty({ example: 'mg/dL' })
  @IsString()
  @IsOptional()
  units?: string;

  @ApiProperty({ example: 'Fasting blood glucose test' })
  @IsString()
  @IsOptional()
  notes?: string;
}

class VitalSignsDto {
  @ApiProperty({ example: '120/80' })
  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @ApiProperty({ example: 75 })
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiProperty({ example: 16 })
  @IsNumber()
  @IsOptional()
  respiratoryRate?: number;

  @ApiProperty({ example: 98.6 })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiProperty({ example: 98 })
  @IsNumber()
  @IsOptional()
  oxygenSaturation?: number;
}

export class CreateMedicalReportDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dcf' })
  @IsMongoId()
  doctor: string;

  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dcg', required: false })
  @IsMongoId()
  @IsOptional()
  appointment?: string;

  @ApiProperty({ example: 'Annual Physical Examination' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2023-10-15' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'Hypertension Stage 1' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: ['Headache', 'Dizziness'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];

  @ApiProperty({ example: 'Diet modification and daily exercise' })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ApiProperty({ type: [MedicationDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  @IsOptional()
  medications?: MedicationDto[];

  @ApiProperty({ type: [TestResultDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  @IsOptional()
  testResults?: TestResultDto[];

  @ApiProperty({ type: VitalSignsDto, required: false })
  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsOptional()
  vitalSigns?: VitalSignsDto;

  @ApiProperty({ example: 'Patient responded well to initial treatment.' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: '2023-11-15', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  followUpDate?: Date;
}