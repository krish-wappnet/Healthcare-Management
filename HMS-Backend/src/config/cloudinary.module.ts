import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryConfigService } from './cloudinary.config';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryConfigService],
  exports: [CloudinaryConfigService],
})
export class CloudinaryModule {}
