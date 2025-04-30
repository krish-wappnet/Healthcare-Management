"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const medical_reports_service_1 = require("./medical-reports.service");
const create_medical_report_dto_1 = require("./dto/create-medical-report.dto");
const update_medical_report_dto_1 = require("./dto/update-medical-report.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_roles_enum_1 = require("../common/enums/user-roles.enum");
let MedicalReportsController = class MedicalReportsController {
    constructor(medicalReportsService) {
        this.medicalReportsService = medicalReportsService;
    }
    create(createMedicalReportDto) {
        return this.medicalReportsService.create(createMedicalReportDto);
    }
    findAll(paginationDto) {
        return this.medicalReportsService.findAll(paginationDto);
    }
    findByPatient(id, paginationDto, req) {
        return this.medicalReportsService.findByPatient(id, paginationDto);
    }
    findByDoctor(id, paginationDto, req) {
        return this.medicalReportsService.findByDoctor(id, paginationDto);
    }
    findByAppointment(id) {
        return this.medicalReportsService.findByAppointment(id);
    }
    findOne(id) {
        return this.medicalReportsService.findOne(id);
    }
    update(id, updateMedicalReportDto) {
        return this.medicalReportsService.update(id, updateMedicalReportDto);
    }
    remove(id) {
        return this.medicalReportsService.remove(id);
    }
};
exports.MedicalReportsController = MedicalReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new medical report' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Medical report created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medical_report_dto_1.CreateMedicalReportDto]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all medical reports (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all medical reports' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR, user_roles_enum_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get medical reports by patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return patient medical reports' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)('doctor/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get medical reports by doctor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return doctor medical reports' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "findByDoctor", null);
__decorate([
    (0, common_1.Get)('appointment/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get medical report by appointment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the medical report' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medical report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "findByAppointment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a medical report by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the medical report' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medical report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a medical report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical report updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medical report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_medical_report_dto_1.UpdateMedicalReportDto]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a medical report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical report deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Medical report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalReportsController.prototype, "remove", null);
exports.MedicalReportsController = MedicalReportsController = __decorate([
    (0, swagger_1.ApiTags)('medical-reports'),
    (0, common_1.Controller)('medical-reports'),
    __metadata("design:paramtypes", [medical_reports_service_1.MedicalReportsService])
], MedicalReportsController);
//# sourceMappingURL=medical-reports.controller.js.map