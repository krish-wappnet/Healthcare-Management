import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';
import { Diagnosis, DiagnosisSchema } from './schemas/diagnosis.schema';
import { PatientsModule } from '../patients/patients.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Diagnosis.name, schema: DiagnosisSchema }]),
    PatientsModule,
    DoctorsModule,
  ],
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}