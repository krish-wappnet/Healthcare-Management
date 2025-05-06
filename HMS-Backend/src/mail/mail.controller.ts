import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-appointment-notification')
  @ApiOperation({ summary: 'Send appointment notification to doctor' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Failed to send notification' })
  async sendAppointmentNotification(@Body() data: any) {
    if (!data.doctorEmail || !data.appointmentDetails) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    
    try {
      await this.mailService.sendAppointmentNotification(data.doctorEmail, data.appointmentDetails);
      return { message: 'Notification sent successfully' };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new HttpException('Failed to send notification', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
