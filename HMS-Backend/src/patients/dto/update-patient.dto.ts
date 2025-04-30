import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsEnum, 
  IsNumber, 
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export class UpdatePatientDto {
  @ApiProperty({ example: '1990-01-01', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ enum: Gender, example: Gender.MALE, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: string;

  @ApiProperty({ enum: BloodType, example: BloodType.A_POSITIVE, required: false })
  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: string;

  @ApiProperty({ example: 180, required: false })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ example: 75, required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: ['Peanuts', 'Penicillin'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @ApiProperty({ example: ['Aspirin', 'Insulin'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medications?: string[];

  @ApiProperty({ example: ['Diabetes', 'Hypertension'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronicConditions?: string[];

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Spouse', required: false })
  @IsString()
  @IsOptional()
  emergencyContactRelation?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Blue Cross', required: false })
  @IsString()
  @IsOptional()
  insuranceProvider?: string;

  @ApiProperty({ example: 'BC123456789', required: false })
  @IsString()
  @IsOptional()
  insurancePolicyNumber?: string;
}