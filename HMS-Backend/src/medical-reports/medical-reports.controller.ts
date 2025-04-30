import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalReportsService } from './medical-reports.service';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-roles.enum';

@ApiTags('medical-reports')
@Controller('medical-reports')
export class MedicalReportsController {
  constructor(private readonly medicalReportsService: MedicalReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new medical report' })
  @ApiResponse({ status: 201, description: 'Medical report created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createMedicalReportDto: CreateMedicalReportDto) {
    return this.medicalReportsService.create(createMedicalReportDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all medical reports (paginated)' })
  @ApiResponse({ status: 200, description: 'Return all medical reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.medicalReportsService.findAll(paginationDto);
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get medical reports by patient ID' })
  @ApiResponse({ status: 200, description: 'Return patient medical reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByPatient(@Param('id') id: string, @Query() paginationDto: PaginationDto, @Request() req) {
    // You may want to add additional checks to ensure patients can only view their own reports
    return this.medicalReportsService.findByPatient(id, paginationDto);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get medical reports by doctor ID' })
  @ApiResponse({ status: 200, description: 'Return doctor medical reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByDoctor(@Param('id') id: string, @Query() paginationDto: PaginationDto, @Request() req) {
    // You may want to add additional checks to ensure doctors can only view their own reports
    return this.medicalReportsService.findByDoctor(id, paginationDto);
  }

  @Get('appointment/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get medical report by appointment ID' })
  @ApiResponse({ status: 200, description: 'Return the medical report' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Medical report not found' })
  findByAppointment(@Param('id') id: string) {
    return this.medicalReportsService.findByAppointment(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a medical report by ID' })
  @ApiResponse({ status: 200, description: 'Return the medical report' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Medical report not found' })
  findOne(@Param('id') id: string) {
    return this.medicalReportsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a medical report' })
  @ApiResponse({ status: 200, description: 'Medical report updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Medical report not found' })
  update(@Param('id') id: string, @Body() updateMedicalReportDto: UpdateMedicalReportDto) {
    return this.medicalReportsService.update(id, updateMedicalReportDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a medical report' })
  @ApiResponse({ status: 200, description: 'Medical report deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Medical report not found' })
  remove(@Param('id') id: string) {
    return this.medicalReportsService.remove(id);
  }
}