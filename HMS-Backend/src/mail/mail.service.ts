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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f9;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background-color: #007bff;
              padding: 20px;
              text-align: center;
              color: #ffffff;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px;
            }
            .content p {
              line-height: 1.6;
              margin: 0 0 15px;
            }
            .appointment-details {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
            }
            .appointment-details ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .appointment-details li {
              margin-bottom: 10px;
              font-size: 16px;
            }
            .appointment-details li strong {
              color: #007bff;
            }
            .footer {
              background-color: #f4f4f9;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .footer a {
              color: #007bff;
              text-decoration: none;
            }
            @media only screen and (max-width: 600px) {
              .container {
                width: 100%;
                margin: 10px;
              }
              .content {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Appointment Booked</h1>
            </div>
            <div class="content">
              <p>Dear Doctor,</p>
              <p>A new appointment has been scheduled with the following details:</p>
              <div class="appointment-details">
                <ul>
                  <li><strong>Patient Name:</strong> ${appointmentDetails.patientName}</li>
                  <li><strong>Date:</strong> ${appointmentDetails.date}</li>
                  <li><strong>Time:</strong> ${appointmentDetails.startTime} - ${appointmentDetails.endTime}</li>
                  <li><strong>Notes:</strong> ${appointmentDetails.notes || 'No additional notes'}</li>
                </ul>
              </div>
              <p>Please review the details and prepare accordingly.</p>
              <p>Best regards,</p>
              <p>Healthcare Management System</p>
            </div>
            <div class="footer">
              <p>Healthcare Management System &copy; ${new Date().getFullYear()} | <a href="#">Contact Us</a></p>
            </div>
          </div>
        </body>
        </html>
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