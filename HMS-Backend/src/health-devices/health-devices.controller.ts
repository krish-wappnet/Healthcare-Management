/* eslint-disable prettier/prettier */
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
import { HealthDevicesService } from './health-devices.service';
import { CreateDeviceDataDto } from './dto/create-device-data.dto';
import { UpdateDeviceDataDto } from './dto/update-device-data.dto';
import { SimulateDeviceDataDto } from './dto/simulate-device-data.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-roles.enum';

@ApiTags('health-devices')
@Controller('health-devices')
export class HealthDevicesController {
  constructor(private readonly healthDevicesService: HealthDevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device data entry' })
  @ApiResponse({ status: 201, description: 'Device data created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDeviceDataDto: CreateDeviceDataDto) {
    return this.healthDevicesService.create(createDeviceDataDto);
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate device data for testing' })
  @ApiResponse({ status: 201, description: 'Simulated data created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  simulateData(@Body() simulateDeviceDataDto: SimulateDeviceDataDto) {
    return this.healthDevicesService.simulateDeviceData(simulateDeviceDataDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all device data (paginated)' })
  @ApiResponse({ status: 200, description: 'Return all device data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.healthDevicesService.findAll(paginationDto);
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device data by patient ID' })
  @ApiResponse({ status: 200, description: 'Return patient device data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByPatient(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.healthDevicesService.findByPatient(id, paginationDto);
  }

  @Get('patient/:id/device/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device data by patient ID and device type' })
  @ApiResponse({ status: 200, description: 'Return filtered device data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByDeviceType(
    @Param('id') id: string, 
    @Param('type') type: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.healthDevicesService.findByDeviceType(id, type, paginationDto);
  }

  @Get('patient/:id/abnormal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get abnormal readings for a patient' })
  @ApiResponse({ status: 200, description: 'Return abnormal readings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAbnormalReadings(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
    return this.healthDevicesService.findAbnormalReadings(id, paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a device data entry by ID' })
  @ApiResponse({ status: 200, description: 'Return the device data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Device data not found' })
  findOne(@Param('id') id: string) {
    return this.healthDevicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a device data entry' })
  @ApiResponse({ status: 200, description: 'Device data updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Device data not found' })
  update(@Param('id') id: string, @Body() updateDeviceDataDto: UpdateDeviceDataDto) {
    return this.healthDevicesService.update(id, updateDeviceDataDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a device data entry' })
  @ApiResponse({ status: 200, description: 'Device data deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Device data not found' })
  remove(@Param('id') id: string) {
    return this.healthDevicesService.remove(id);
  }
}