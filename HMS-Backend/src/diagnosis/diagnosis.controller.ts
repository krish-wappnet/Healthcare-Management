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
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-roles.enum';

class AnalyzeSymptomsDto {
  symptoms: string[];
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

@ApiTags('diagnosis')
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new diagnosis' })
  @ApiResponse({ status: 201, description: 'Diagnosis created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return this.diagnosisService.create(createDiagnosisDto);
  }

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyze symptoms for diagnosis' })
  @ApiResponse({ status: 200, description: 'Return analysis results' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  analyzeSymptoms(@Body() analyzeSymptomsDto: AnalyzeSymptomsDto) {
    return this.diagnosisService.analyzeSymptoms(
      analyzeSymptomsDto.symptoms,
      analyzeSymptomsDto.medicalHistory,
      analyzeSymptomsDto.allergies,
      analyzeSymptomsDto.currentMedications
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all diagnoses (paginated)' })
  @ApiResponse({ status: 200, description: 'Return all diagnoses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.diagnosisService.findAll(paginationDto);
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get diagnoses by patient ID' })
  @ApiResponse({ status: 200, description: 'Return patient diagnoses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByPatient(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.diagnosisService.findByPatient(id, paginationDto);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get diagnoses by doctor ID' })
  @ApiResponse({ status: 200, description: 'Return doctor diagnoses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByDoctor(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.diagnosisService.findByDoctor(id, paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a diagnosis by ID' })
  @ApiResponse({ status: 200, description: 'Return the diagnosis' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  findOne(@Param('id') id: string) {
    return this.diagnosisService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a diagnosis' })
  @ApiResponse({ status: 200, description: 'Diagnosis updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  update(@Param('id') id: string, @Body() updateDiagnosisDto: UpdateDiagnosisDto) {
    return this.diagnosisService.update(id, updateDiagnosisDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a diagnosis' })
  @ApiResponse({ status: 200, description: 'Diagnosis deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  remove(@Param('id') id: string) {
    return this.diagnosisService.remove(id);
  }
}