import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Connection Ready:', success);
      }
    });
  }

  async sendAppointmentNotification(doctorEmail: string, appointmentDetails: any): Promise<void> {
    const mailOptions = {
      from: `${this.configService.get<string>('EMAIL_FROM')} <${this.configService.get<string>('EMAIL_USER')}>`,
      to: doctorEmail,
      subject: 'New Appointment Notification',
      html: `
        <h2>New Appointment Booked</h2>
        <p>Dear Doctor,</p>
        <p>A new appointment has been booked with the following details:</p>
        <ul>
          <li><strong>Patient Name:</strong> ${appointmentDetails.patientName}</li>
          <li><strong>Date:</strong> ${appointmentDetails.date}</li>
          <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
          <li><strong>Notes:</strong> ${appointmentDetails.notes || 'No additional notes'}</li>
        </ul>
        <p>Thank you.</p>
        <p>Healthcare Management System</p>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', doctorEmail);
      console.log('Message ID:', info.messageId);
    } catch (error) {
      console.error('Error sending appointment notification:', error);
      if (error.responseCode === 535) {
        throw new Error('Invalid Gmail credentials. Please check your app-specific password and try again.');
      }
      throw new Error('Failed to send email notification');
    }
  }
}
