import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDate, 
  IsMongoId, 
  IsArray,
  IsNumber,
  ValidateNested,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';

class MedicationDto {
  @ApiProperty({ 
    example: 'Metformin',
    description: 'Name of the medication'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'tablet',
    description: 'Form of the medication (tablet, syrup, capsule, etc.)'
  })
  @IsString()
  form: string;

  @ApiProperty({ 
    example: '500',
    description: 'Dosage value of the medication'
  })
  @IsString()
  dosageValue: string;

  @ApiProperty({ 
    example: 'mg',
    description: 'Unit of dosage (mg, ml, mcg, etc.)'
  })
  @IsString()
  dosageUnit: string;

  @ApiProperty({ 
    example: '1',
    description: 'Number of doses to take with breakfast'
  })
  @IsString()
  breakfast: string;

  @ApiProperty({ 
    example: '0',
    description: 'Number of doses to take with lunch'
  })
  @IsString()
  lunch: string;

  @ApiProperty({ 
    example: '1',
    description: 'Number of doses to take with dinner'
  })
  @IsString()
  dinner: string;

  @ApiProperty({ 
    example: 'after_breakfast,after_dinner',
    description: 'Timing of medication administration'
  })
  @IsString()
  timing: string;

  @ApiProperty({ 
    example: 'Take with food',
    description: 'Additional instructions for medication'
  })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ 
    example: '2025-05-04T18:30:00.000Z',
    description: 'Start date of medication'
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ 
    example: '2025-05-11T18:30:00.000Z',
    description: 'End date of medication'
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

class TestResultDto {
  @ApiProperty({ 
    example: 'Complete Blood Count',
    description: 'Name of the medical test'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: '2025-05-02T18:30:00.000Z',
    description: 'Date when the test was performed'
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ 
    example: 'Normal',
    description: 'Result of the test'
  })
  @IsString()
  result: string;

  @ApiProperty({ 
    example: '120/80',
    description: 'Blood pressure reading'
  })
  @IsString()
  bloodPressure: string;

  @ApiProperty({ 
    example: '180',
    description: 'Cholesterol level in mg/dL'
  })
  @IsString()
  cholesterol: string;

  @ApiProperty({ 
    example: '100',
    description: 'Blood glucose level in mg/dL'
  })
  @IsString()
  glucose: string;

  @ApiProperty({ 
    example: '14',
    description: 'Hemoglobin level in g/dL'
  })
  @IsString()
  hemoglobin: string;

  @ApiProperty({ 
    example: '250',
    description: 'Platelet count in 10^3/uL'
  })
  @IsString()
  platelets: string;

  @ApiProperty({ 
    example: '5',
    description: 'Red blood cell count in 10^6/uL'
  })
  @IsString()
  redBloodCells: string;

  @ApiProperty({ 
    example: '150',
    description: 'Triglycerides level in mg/dL'
  })
  @IsString()
  triglycerides: string;

  @ApiProperty({ 
    example: '7',
    description: 'White blood cell count in 10^3/uL'
  })
  @IsString()
  whiteBloodCells: string;

  @ApiProperty({ 
    example: 'All values within normal range',
    description: 'Additional notes about the test results'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

class VitalSignsDto {
  @ApiProperty({ 
    example: { systolic: '120', diastolic: '80' },
    description: 'Blood pressure reading (systolic/diastolic)'
  })
  @IsObject()
  bloodPressure: {
    systolic: string;
    diastolic: string;
  };

  @ApiProperty({ 
    example: 75,
    description: 'Heart rate in beats per minute'
  })
  @IsNumber()
  heartRate: number;

  @ApiProperty({ 
    example: 18,
    description: 'Respiratory rate in breaths per minute'
  })
  @IsNumber()
  respiratoryRate: number;

  @ApiProperty({ 
    example: 37,
    description: 'Body temperature in Celsius'
  })
  @IsNumber()
  temperature: number;

  @ApiProperty({ 
    example: 98,
    description: 'Oxygen saturation percentage'
  })
  @IsNumber()
  oxygenSaturation: number;
}

export class CreateMedicalReportDto {
  @ApiProperty({ 
    example: '6813761e8cbc04988b6a8b84',
    description: 'ID of the associated appointment'
  })
  @IsMongoId()
  appointment: string;

  @ApiProperty({ 
    example: '681375e78cbc04988b6a8b63',
    description: 'ID of the patient'
  })
  @IsMongoId()
  patient: string;

  @ApiProperty({ 
    example: '681314d4fa5aef9dd5d05437',
    description: 'ID of the doctor'
  })
  @IsMongoId()
  doctor: string;

  @ApiProperty({ 
    example: 'Annual Health Checkup',
    description: 'Title of the medical report'
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    example: '2025-05-02T18:30:00.000Z',
    description: 'Date of the medical report'
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ 
    example: 'Hypertension Stage 1',
    description: 'Medical diagnosis'
  })
  @IsString()
  diagnosis: string;

  @ApiProperty({ 
    example: ['Headache', 'Dizziness', 'Fatigue'],
    description: 'List of symptoms reported by the patient'
  })
  @IsArray()
  symptoms: string[];

  @ApiProperty({ 
    example: 'Continue current treatment with lifestyle modifications',
    description: 'Treatment plan for the condition'
  })
  @IsString()
  treatmentPlan: string;

  @ApiProperty({ 
    example: '2025-05-16T18:30:00.000Z',
    description: 'Scheduled follow-up date'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  followUpDate?: Date;

  @ApiProperty({ 
    type: [MedicationDto],
    description: 'List of prescribed medications'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @ApiProperty({ 
    type: [TestResultDto],
    description: 'List of test results'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  testResults: TestResultDto[];

  @ApiProperty({ 
    type: VitalSignsDto,
    description: 'Vital signs measurements'
  })
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns: VitalSignsDto;

  @ApiProperty({ 
    example: 'Patient is responding well to treatment. Blood pressure under control.',
    description: 'Additional notes about the medical report'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}