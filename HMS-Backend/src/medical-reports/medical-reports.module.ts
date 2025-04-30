import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalReportsService } from './medical-reports.service';
import { MedicalReportsController } from './medical-reports.controller';
import { MedicalReport, MedicalReportSchema } from './schemas/medical-report.schema';
import { DoctorsModule } from '../doctors/doctors.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MedicalReport.name, schema: MedicalReportSchema }]),
    DoctorsModule,
    PatientsModule,
  ],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService],
  exports: [MedicalReportsService],
})
export class MedicalReportsModule {}