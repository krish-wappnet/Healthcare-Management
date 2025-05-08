import * as cloudinary from 'cloudinary';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryConfigService implements OnModuleInit {
  private cloudinary: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.cloudinary = cloudinary;
    this.cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  getCloudinaryInstance() {
    return this.cloudinary;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await this.cloudinary.v2.uploader.upload(file.path, {
        folder: 'profile-pictures',
        resource_type: 'image',
      });
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
