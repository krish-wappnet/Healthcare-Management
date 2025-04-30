import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Diagnosis, DiagnosisDocument } from './schemas/diagnosis.schema';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectModel(Diagnosis.name) private diagnosisModel: Model<DiagnosisDocument>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    try {
      // Verify patient exists
      await this.patientsService.findOne(createDiagnosisDto.patient);
      
      // Verify doctor exists if provided
      if (createDiagnosisDto.doctor) {
        await this.doctorsService.findOne(createDiagnosisDto.doctor);
      }
      
      // Create diagnosis
      const newDiagnosis = new this.diagnosisModel(createDiagnosisDto);
      return newDiagnosis.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create diagnosis');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Diagnosis[]; total: number; page: number; limit: number }> {
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

  async findOne(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisModel
      .findById(id)
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    
    return diagnosis;
  }

  async findByPatient(patientId: string, paginationDto: PaginationDto): Promise<{ data: Diagnosis[]; total: number; page: number; limit: number }> {
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

  async findByDoctor(doctorId: string, paginationDto: PaginationDto): Promise<{ data: Diagnosis[]; total: number; page: number; limit: number }> {
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

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    const updatedDiagnosis = await this.diagnosisModel
      .findByIdAndUpdate(id, updateDiagnosisDto, { new: true })
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!updatedDiagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    
    return updatedDiagnosis;
  }

  async remove(id: string): Promise<Diagnosis> {
    const deletedDiagnosis = await this.diagnosisModel
      .findByIdAndDelete(id)
      .populate('patient')
      .populate('doctor')
      .exec();
    
    if (!deletedDiagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    
    return deletedDiagnosis;
  }

  async analyzeSymptoms(symptoms: string[], medicalHistory?: string[], allergies?: string[], currentMedications?: string[]): Promise<any> {
    // This is a mock implementation of an AI diagnosis engine
    // In a real-world scenario, this would integrate with a medical AI service or API
    
    // Define some mock conditions and their associated symptoms
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
    
    // Calculate matching symptoms for each condition
    const results = conditions.map(condition => {
      const matchingSymptoms = symptoms.filter(symptom => 
        condition.symptoms.includes(symptom.toLowerCase())
      );
      
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
    
    // Sort by probability
    results.sort((a, b) => b.probability - a.probability);
    
    // Get top condition as the diagnosis
    const topCondition = results[0];
    
    // Only include conditions with some probability
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
}