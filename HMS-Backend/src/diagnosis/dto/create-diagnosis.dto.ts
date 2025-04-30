import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsMongoId, 
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class PossibleConditionDto {
  @ApiProperty({ example: 'Common Cold' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0.85 })
  @IsNumber()
  @Min(0)
  @Max(1)
  probability: number;

  @ApiProperty({ example: 'Viral infection affecting the nose and throat' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateDiagnosisDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dcf', required: false })
  @IsMongoId()
  @IsOptional()
  doctor?: string;

  @ApiProperty({ example: ['headache', 'fever', 'fatigue'] })
  @IsArray()
  @IsString({ each: true })
  symptoms: string[];

  @ApiProperty({ example: ['Hypertension', 'Type 2 Diabetes'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicalHistory?: string[];

  @ApiProperty({ example: ['Penicillin', 'Peanuts'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @ApiProperty({ example: ['Lisinopril', 'Metformin'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications?: string[];

  @ApiProperty({ example: 'Influenza A' })
  @IsString()
  diagnosisResult: string;

  @ApiProperty({ example: 0.92, required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidence?: number;

  @ApiProperty({ type: [PossibleConditionDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => PossibleConditionDto)
  @IsOptional()
  possibleConditions?: PossibleConditionDto[];

  @ApiProperty({ example: ['Complete Blood Count', 'Flu Test'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recommendedTests?: string[];

  @ApiProperty({ example: ['Infectious Disease Specialist'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recommendedSpecialists?: string[];

  @ApiProperty({ example: ['Rest', 'Fluids', 'Antiviral medication'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  treatmentSuggestions?: string[];

  @ApiProperty({ example: 'Symptoms consistent with influenza. Recommend starting Tamiflu.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}