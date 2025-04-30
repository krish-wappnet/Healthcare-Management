/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalReportsModule } from './medical-reports/medical-reports.module';
import { HealthDevicesModule } from './health-devices/health-devices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost/healthcare',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalReportsModule,
    HealthDevicesModule,
    NotificationsModule,
    DiagnosisModule,
  ],
})
export class AppModule {}