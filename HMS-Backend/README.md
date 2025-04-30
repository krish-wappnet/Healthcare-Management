# Healthcare Management System API

This NestJS application provides a complete backend API for a healthcare management system with features including:

- User authentication with role-based access control (Admin, Doctor, Patient)
- Patient and doctor profile management
- Appointment scheduling and video consultations
- Medical reports and health records
- Real-time IoT health device data integration
- AI-based diagnosis engine
- Notification system for abnormal readings and important events

## Requirements

- Node.js 16+
- MongoDB

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## Running the application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

After starting the application, you can access the Swagger API documentation at:

```
http://localhost:3000/api
```

## Features

### Authentication
- Registration
- Login
- Refresh tokens
- Role-based access control

### User Management
- Admin, Doctor, and Patient roles
- Profile management
- User CRUD operations

### Patient Management
- Patient profiles with medical history
- Patient CRUD operations

### Doctor Management
- Doctor profiles with specialization
- Availability settings
- Rating system

### Appointments
- Scheduling system
- Video consultation support
- Appointment status management

### Medical Reports
- Report creation by doctors
- Comprehensive health data
- Medical history tracking

### Health Device Integration
- Real-time data from wearable devices
- Abnormal reading detection
- Health metrics visualization

### AI Diagnosis
- Symptom analysis
- Treatment recommendations
- Doctor review system

### Notifications
- Email and in-app notifications
- Health alerts for abnormal readings
- Appointment reminders

## License

MIT