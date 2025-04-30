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
exports.DiagnosisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diagnosis_service_1 = require("./diagnosis.service");
const create_diagnosis_dto_1 = require("./dto/create-diagnosis.dto");
const update_diagnosis_dto_1 = require("./dto/update-diagnosis.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_roles_enum_1 = require("../common/enums/user-roles.enum");
class AnalyzeSymptomsDto {
}
let DiagnosisController = class DiagnosisController {
    constructor(diagnosisService) {
        this.diagnosisService = diagnosisService;
    }
    create(createDiagnosisDto) {
        return this.diagnosisService.create(createDiagnosisDto);
    }
    analyzeSymptoms(analyzeSymptomsDto) {
        return this.diagnosisService.analyzeSymptoms(analyzeSymptomsDto.symptoms, analyzeSymptomsDto.medicalHistory, analyzeSymptomsDto.allergies, analyzeSymptomsDto.currentMedications);
    }
    findAll(paginationDto) {
        return this.diagnosisService.findAll(paginationDto);
    }
    findByPatient(id, paginationDto) {
        return this.diagnosisService.findByPatient(id, paginationDto);
    }
    findByDoctor(id, paginationDto) {
        return this.diagnosisService.findByDoctor(id, paginationDto);
    }
    findOne(id) {
        return this.diagnosisService.findOne(id);
    }
    update(id, updateDiagnosisDto) {
        return this.diagnosisService.update(id, updateDiagnosisDto);
    }
    remove(id) {
        return this.diagnosisService.remove(id);
    }
};
exports.DiagnosisController = DiagnosisController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new diagnosis' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Diagnosis created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_diagnosis_dto_1.CreateDiagnosisDto]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze symptoms for diagnosis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return analysis results' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyzeSymptomsDto]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "analyzeSymptoms", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all diagnoses (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all diagnoses' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR, user_roles_enum_1.UserRole.PATIENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get diagnoses by patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return patient diagnoses' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)('doctor/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get diagnoses by doctor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return doctor diagnoses' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "findByDoctor", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a diagnosis by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the diagnosis' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diagnosis not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN, user_roles_enum_1.UserRole.DOCTOR),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a diagnosis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diagnosis updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diagnosis not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_diagnosis_dto_1.UpdateDiagnosisDto]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_roles_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a diagnosis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diagnosis deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diagnosis not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiagnosisController.prototype, "remove", null);
exports.DiagnosisController = DiagnosisController = __decorate([
    (0, swagger_1.ApiTags)('diagnosis'),
    (0, common_1.Controller)('diagnosis'),
    __metadata("design:paramtypes", [diagnosis_service_1.DiagnosisService])
], DiagnosisController);
//# sourceMappingURL=diagnosis.controller.js.map