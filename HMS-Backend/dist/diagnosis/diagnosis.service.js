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
exports.DiagnosisService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const diagnosis_schema_1 = require("./schemas/diagnosis.schema");
const patients_service_1 = require("../patients/patients.service");
const doctors_service_1 = require("../doctors/doctors.service");
let DiagnosisService = class DiagnosisService {
    constructor(diagnosisModel, patientsService, doctorsService) {
        this.diagnosisModel = diagnosisModel;
        this.patientsService = patientsService;
        this.doctorsService = doctorsService;
    }
    async create(createDiagnosisDto) {
        try {
            await this.patientsService.findOne(createDiagnosisDto.patient);
            if (createDiagnosisDto.doctor) {
                await this.doctorsService.findOne(createDiagnosisDto.doctor);
            }
            const newDiagnosis = new this.diagnosisModel(createDiagnosisDto);
            return newDiagnosis.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create diagnosis');
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.diagnosisModel
            .find()
            .populate('patient')
            .populate('doctor')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.diagnosisModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const diagnosis = await this.diagnosisModel
            .findById(id)
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!diagnosis) {
            throw new common_1.NotFoundException(`Diagnosis with ID ${id} not found`);
        }
        return diagnosis;
    }
    async findByPatient(patientId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.diagnosisModel
            .find({ patient: patientId })
            .populate('doctor')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.diagnosisModel.countDocuments({ patient: patientId });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findByDoctor(doctorId, paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.diagnosisModel
            .find({ doctor: doctorId })
            .populate('patient')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.diagnosisModel.countDocuments({ doctor: doctorId });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async update(id, updateDiagnosisDto) {
        const updatedDiagnosis = await this.diagnosisModel
            .findByIdAndUpdate(id, updateDiagnosisDto, { new: true })
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!updatedDiagnosis) {
            throw new common_1.NotFoundException(`Diagnosis with ID ${id} not found`);
        }
        return updatedDiagnosis;
    }
    async remove(id) {
        const deletedDiagnosis = await this.diagnosisModel
            .findByIdAndDelete(id)
            .populate('patient')
            .populate('doctor')
            .exec();
        if (!deletedDiagnosis) {
            throw new common_1.NotFoundException(`Diagnosis with ID ${id} not found`);
        }
        return deletedDiagnosis;
    }
    async analyzeSymptoms(symptoms, medicalHistory, allergies, currentMedications) {
        const conditions = [
            {
                name: 'Common Cold',
                symptoms: ['runny nose', 'sneezing', 'cough', 'sore throat', 'congestion', 'mild fever'],
                description: 'A viral infection affecting the nose and throat',
                specialists: ['General Practitioner'],
                tests: ['None required in most cases'],
                treatments: ['Rest', 'Fluids', 'Over-the-counter cold medicine'],
            },
            {
                name: 'Influenza',
                symptoms: ['fever', 'chills', 'cough', 'sore throat', 'body aches', 'fatigue', 'headache'],
                description: 'A viral infection that attacks your respiratory system',
                specialists: ['Infectious Disease Specialist'],
                tests: ['Flu Test', 'Complete Blood Count'],
                treatments: ['Antiviral medications', 'Rest', 'Fluids'],
            },
            {
                name: 'Allergic Rhinitis',
                symptoms: ['sneezing', 'runny nose', 'congestion', 'itchy eyes', 'watery eyes'],
                description: 'Inflammation of the nasal passages caused by allergens',
                specialists: ['Allergist', 'ENT Specialist'],
                tests: ['Allergy Testing', 'Nasal Endoscopy'],
                treatments: ['Antihistamines', 'Nasal Corticosteroids', 'Allergen Avoidance'],
            },
            {
                name: 'Migraine',
                symptoms: ['headache', 'nausea', 'vomiting', 'sensitivity to light', 'sensitivity to sound'],
                description: 'A neurological condition characterized by intense headaches',
                specialists: ['Neurologist'],
                tests: ['MRI', 'CT Scan'],
                treatments: ['Pain relievers', 'Triptans', 'Anti-nausea medications', 'Preventive medications'],
            },
            {
                name: 'Gastroenteritis',
                symptoms: ['diarrhea', 'nausea', 'vomiting', 'abdominal pain', 'fever', 'headache'],
                description: 'Inflammation of the gastrointestinal tract',
                specialists: ['Gastroenterologist'],
                tests: ['Stool Sample', 'Blood Test'],
                treatments: ['Fluids', 'Electrolyte replacement', 'Rest', 'Bland diet'],
            },
        ];
        const results = conditions.map(condition => {
            const matchingSymptoms = symptoms.filter(symptom => condition.symptoms.includes(symptom.toLowerCase()));
            const probability = matchingSymptoms.length / condition.symptoms.length;
            return {
                name: condition.name,
                probability: parseFloat(probability.toFixed(2)),
                description: condition.description,
                matchingSymptoms,
                specialistsRecommended: condition.specialists,
                testsRecommended: condition.tests,
                treatmentSuggestions: condition.treatments,
            };
        });
        results.sort((a, b) => b.probability - a.probability);
        const topCondition = results[0];
        const possibleConditions = results
            .filter(result => result.probability > 0)
            .map(({ name, probability, description }) => ({
            name,
            probability,
            description
        }));
        return {
            diagnosisResult: topCondition.name,
            confidence: topCondition.probability,
            possibleConditions,
            recommendedTests: topCondition.testsRecommended,
            recommendedSpecialists: topCondition.specialistsRecommended,
            treatmentSuggestions: topCondition.treatmentSuggestions,
            notes: `Based on the provided symptoms, the most likely diagnosis is ${topCondition.name}. This is a preliminary assessment and should be confirmed by a healthcare professional.`,
        };
    }
};
exports.DiagnosisService = DiagnosisService;
exports.DiagnosisService = DiagnosisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(diagnosis_schema_1.Diagnosis.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        patients_service_1.PatientsService,
        doctors_service_1.DoctorsService])
], DiagnosisService);
//# sourceMappingURL=diagnosis.service.js.map