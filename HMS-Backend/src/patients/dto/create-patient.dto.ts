import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsEnum, 
  IsNumber, 
  IsArray, 
  IsMongoId 
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

export class CreatePatientDto {
  @ApiProperty({ example: '60d5ec9d1a6d8236f4673dce' })
  @IsMongoId()
  user: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: string;

  @ApiProperty({ enum: BloodType, example: BloodType.A_POSITIVE })
  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: string;

  @ApiProperty({ example: 180 })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ example: 75 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: ['Peanuts', 'Penicillin'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @ApiProperty({ example: ['Aspirin', 'Insulin'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medications?: string[];

  @ApiProperty({ example: ['Diabetes', 'Hypertension'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronicConditions?: string[];

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  @IsOptional()
  emergencyContactRelation?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Blue Cross' })
  @IsString()
  @IsOptional()
  insuranceProvider?: string;

  @ApiProperty({ example: 'BC123456789' })
  @IsString()
  @IsOptional()
  insurancePolicyNumber?: string;
}