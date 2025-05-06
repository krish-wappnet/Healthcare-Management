<template>
  <div class="diagnosis-page">
    <!-- Header -->
    <div class="header">
      <h1>Diagnosis Records</h1>
      <button @click="showCreateModal = true" class="create-button">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Diagnosis
      </button>
    </div>

    <!-- Doctor Profile Header -->
    <div class="doctor-profile" v-if="doctor">
      <div class="profile-info">
        <div class="profile-details">
          <h2 class="profile-name">{{ doctor.user.firstName }} {{ doctor.user.lastName }}</h2>
          <div class="profile-meta">
            <p class="specialization">{{ doctor.specialization }}</p>
            <div class="info-grid">
              <p><span>Experience:</span> {{ doctor.experience }} years</p>
              <p><span>License:</span> {{ doctor.licenseNumber }}</p>
              <p><span>Fee:</span> {{ doctor.consultationFee }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diagnosis Section -->
    <div class="diagnosis-section">
      <div class="header">
        <h1>Diagnosis Records</h1>
      </div>
      <!-- Diagnosis List -->
      <div v-if="diagnoses.length" class="diagnosis-list">
        <div
          v-for="diagnosis in diagnoses"
          :key="diagnosis.id"
          class="diagnosis-card"
        >
          <div class="card-header">
            <div>
              <h2>{{ diagnosis.title }}</h2>
              <p>Diagnosed on {{ formatDate(diagnosis.date) }}</p>
            </div>
            <button
              @click="toggleExpand(diagnosis.id)"
              class="details-button"
            >
              {{ expandedDiagnosis === diagnosis.id ? 'Hide Details' : 'View Details' }}
              <svg
                class="icon"
                :class="{ 'rotate': expandedDiagnosis === diagnosis.id }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedDiagnosis === diagnosis.id" class="card-details">
            <div class="details-grid">
              <div>
                <h3>Diagnosis</h3>
                <p>{{ diagnosis.diagnosis }}</p>
              </div>
              <div>
                <h3>Symptoms</h3>
                <ul>
                  <li v-for="symptom in diagnosis.symptoms" :key="symptom">{{ symptom }}</li>
                </ul>
              </div>
            </div>
            <div>
              <h3>Treatment Plan</h3>
              <p>{{ diagnosis.treatmentPlan }}</p>
            </div>
            <div>
              <h3>Medications</h3>
              <div
                v-for="med in diagnosis.medications"
                :key="med.name"
                class="sub-card"
              >
                <p><strong>Name:</strong> {{ med.name }}</p>
                <p><strong>Dosage:</strong> {{ med.dosage }}</p>
                <p><strong>Frequency:</strong> {{ med.frequency }}</p>
                <p><strong>Duration:</strong> {{ formatDate(med.startDate) }} to {{ formatDate(med.endDate) }}</p>
                <p><strong>Instructions:</strong> {{ med.instructions }}</p>
              </div>
            </div>
            <div>
              <h3>Test Results</h3>
              <div
                v-for="test in diagnosis.testResults"
                :key="test.name"
                class="sub-card"
              >
                <p><strong>Test:</strong> {{ test.name }}</p>
                <p><strong>Date:</strong> {{ formatDate(test.date) }}</p>
                <p><strong>Result:</strong> {{ test.result }} {{ test.units }}</p>
                <p><strong>Normal Range:</strong> {{ test.normalRange }}</p>
                <p><strong>Notes:</strong> {{ test.notes }}</p>
              </div>
            </div>
            <div>
              <h3>Vital Signs</h3>
              <div class="vitals-grid">
                <p><strong>Blood Pressure:</strong> {{ diagnosis.vitalSigns.bloodPressure }}</p>
                <p><strong>Heart Rate:</strong> {{ diagnosis.vitalSigns.heartRate }} bpm</p>
                <p><strong>Respiratory Rate:</strong> {{ diagnosis.vitalSigns.respiratoryRate }} breaths/min</p>
                <p><strong>Temperature:</strong> {{ diagnosis.vitalSigns.temperature }} °F</p>
                <p><strong>Oxygen Saturation:</strong> {{ diagnosis.vitalSigns.oxygenSaturation }}%</p>
              </div>
            </div>
            <div>
              <h3>Notes</h3>
              <p>{{ diagnosis.notes }}</p>
            </div>
            <div>
              <h3>Follow-Up</h3>
              <p>{{ formatDate(diagnosis.followUpDate) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>No diagnoses recorded yet.</p>
        <button @click="showCreateModal = true" class="link-button">
          Create a new diagnosis
        </button>
      </div>
    </div>

    <!-- Create Diagnosis Modal -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Create Diagnosis</h2>
          <button @click="showCreateModal = false" class="close-button">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitDiagnosis" class="form">
          <div class="form-grid">
            <!-- Appointment Selection -->
            <div class="form-group">
              <label>Select Appointment</label>
              <select
                v-model="selectedAppointment"
                @change="handleAppointmentSelection(appointments.find(a => a._id === $event.target.value))"
                class="appointment-select"
                required
              >
                <option value="">Select an appointment</option>
                <option
                  v-for="appointment in appointments"
                  :key="appointment._id"
                  :value="appointment._id"
                >
                  {{ formatDate(appointment.date) }} - {{ formatTime(appointment.startTime) }}
                </option>
              </select>
            </div>
            <!-- Patient ID (Readonly) -->
            <div class="form-group">
              <label>Patient ID</label>
              <input
                v-model="form.patient"
                type="text"
                readonly
                placeholder="Patient ID"
              />
            </div>
            <!-- Doctor ID (Readonly) -->
            <div class="form-group">
              <label>Doctor ID</label>
              <input
                v-model="form.doctor"
                type="text"
                readonly
                placeholder="Doctor ID"
              />
            </div>
            <!-- Appointment Details (Readonly) -->
            <div class="form-group full-width">
              <label>Appointment Details</label>
              <div v-if="formattedAppointment" class="appointment-details">
                <div class="appointment-info">
                  <div class="info-item">
                    <strong>Date:</strong> {{ formatDate(formattedAppointment.date) }}
                  </div>
                  <div class="info-item">
                    <strong>Time:</strong> {{ formatTime(formattedAppointment.startTime) }} - {{ formatTime(formattedAppointment.endTime) }}
                  </div>
                  <div class="info-item">
                    <strong>Type:</strong> {{ formattedAppointment.type }}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong> {{ formattedAppointment.status }}
                  </div>
                  <div v-if="formattedAppointment.meetingLink" class="info-item">
                    <a :href="formattedAppointment.meetingLink" target="_blank" class="meeting-link">Join Meeting</a>
                  </div>
                </div>
              </div>
              <p v-else class="no-appointment">No appointment selected</p>
            </div>
            <!-- Symptoms -->
            <div class="form-group full-width">
              <label>Symptoms</label>
              <div class="chips-input">
                <input
                  v-model="newSymptom"
                  type="text"
                  @keyup.enter="addSymptom"
                  placeholder="Add symptom"
                />
                <div class="chips">
                  <span
                    v-for="(symptom, index) in form.symptoms"
                    :key="index"
                    class="chip"
                  >
                    {{ symptom }}
                    <button @click="removeSymptom(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Medical History -->
            <div class="form-group full-width">
              <label>Medical History</label>
              <div class="chips-input">
                <input
                  v-model="newMedicalHistory"
                  type="text"
                  @keyup.enter="addMedicalHistory"
                  placeholder="Add medical condition"
                />
                <div class="chips">
                  <span
                    v-for="(condition, index) in form.medicalHistory"
                    :key="index"
                    class="chip"
                  >
                    {{ condition }}
                    <button @click="removeMedicalHistory(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Allergies -->
            <div class="form-group full-width">
              <label>Allergies</label>
              <div class="chips-input">
                <input
                  v-model="newAllergy"
                  type="text"
                  @keyup.enter="addAllergy"
                  placeholder="Add allergy"
                />
                <div class="chips">
                  <span
                    v-for="(allergy, index) in form.allergies"
                    :key="index"
                    class="chip"
                  >
                    {{ allergy }}
                    <button @click="removeAllergy(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Current Medications -->
            <div class="form-group full-width">
              <label>Current Medications</label>
              <div class="chips-input">
                <input
                  v-model="newMedication"
                  type="text"
                  @keyup.enter="addMedication"
                  placeholder="Add medication"
                />
                <div class="chips">
                  <span
                    v-for="(med, index) in form.currentMedications"
                    :key="index"
                    class="chip"
                  >
                    {{ med }}
                    <button @click="removeMedication(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Diagnosis Result -->
            <div class="form-group">
              <label>Diagnosis Result</label>
              <input
                v-model="form.diagnosisResult"
                type="text"
                placeholder="e.g., Influenza A"
              />
            </div>
            <!-- Confidence -->
            <div class="form-group">
              <label>Confidence (0-1)</label>
              <input
                v-model="form.confidence"
                type="number"
                step="0.01"
                min="0"
                max="1"
              />
            </div>
            <!-- Possible Conditions -->
            <div class="form-group full-width">
              <label>Possible Conditions</label>
              <div class="possible-conditions">
                <div v-for="(condition, index) in form.possibleConditions" :key="index" class="condition">
                  <div class="condition-row">
                    <input
                      v-model="condition.name"
                      type="text"
                      placeholder="Condition name"
                      required
                    />
                    <input
                      v-model="condition.probability"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="Probability"
                      required
                    />
                    <textarea
                      v-model="condition.description"
                      placeholder="Condition description"
                      required
                    ></textarea>
                    <button @click="removeCondition(index)" class="remove-condition" v-if="form.possibleConditions.length > 1">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button @click="addCondition" class="add-condition">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Condition
                </button>
              </div>
            </div>
            <!-- Recommended Tests -->
            <div class="form-group full-width">
              <label>Recommended Tests</label>
              <div class="chips-input">
                <input
                  v-model="newTest"
                  type="text"
                  @keyup.enter="addTest"
                  placeholder="Add test"
                />
                <div class="chips">
                  <span
                    v-for="(test, index) in form.recommendedTests"
                    :key="index"
                    class="chip"
                  >
                    {{ test }}
                    <button @click="removeTest(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Recommended Specialists -->
            <div class="form-group full-width">
              <label>Recommended Specialists</label>
              <div class="chips-input">
                <input
                  v-model="newSpecialist"
                  type="text"
                  @keyup.enter="addSpecialist"
                  placeholder="Add specialist"
                />
                <div class="chips">
                  <span
                    v-for="(specialist, index) in form.recommendedSpecialists"
                    :key="index"
                    class="chip"
                  >
                    {{ specialist }}
                    <button @click="removeSpecialist(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Treatment Suggestions -->
            <div class="form-group full-width">
              <label>Treatment Suggestions</label>
              <div class="chips-input">
                <input
                  v-model="newTreatment"
                  type="text"
                  @keyup.enter="addTreatment"
                  placeholder="Add treatment"
                />
                <div class="chips">
                  <span
                    v-for="(treatment, index) in form.treatmentSuggestions"
                    :key="index"
                    class="chip"
                  >
                    {{ treatment }}
                    <button @click="removeTreatment(index)" class="chip-remove">
                      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            <!-- Notes -->
            <div class="form-group full-width">
              <label>Notes</label>
              <textarea
                v-model="form.notes"
                rows="4"
                placeholder="Additional notes about the diagnosis"
              ></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="resetForm" class="reset-button">Reset</button>
            <button type="button" @click="showCreateModal = false" class="cancel-button">Cancel</button>
            <button type="submit" class="submit-button">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const showCreateModal = ref(false);
const expandedDiagnosis = ref(null);
const diagnoses = ref([]);
const loading = ref(false);
const error = ref(null);
const doctor = ref(null);
const appointments = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10;

// Form state
const form = reactive({
  appointmentId: '',
  patient: '',
  doctor: '',
  symptoms: [],
  medicalHistory: [],
  allergies: [],
  currentMedications: [],
  diagnosisResult: '',
  confidence: 0.9,
  possibleConditions: [{
    name: '',
    probability: 0,
    description: ''
  }],
  recommendedTests: [],
  recommendedSpecialists: [],
  treatmentSuggestions: [],
  notes: ''
});

const newSymptom = ref('');
const newMedicalHistory = ref('');
const newAllergy = ref('');
const newMedication = ref('');
const newTest = ref('');
const newSpecialist = ref('');
const newTreatment = ref('');

// Track appointment details
const formattedAppointment = ref(null);

// Function to handle appointment selection
const handleAppointmentSelection = (appointment) => {
  if (!appointment) {
    // Clear form when no appointment is selected
    form.appointmentId = '';
    form.patient = '';
    form.symptoms = [];
    formattedAppointment.value = null;
    return;
  }

  // Set appointment ID
  form.appointmentId = appointment._id;
  
  // Set patient ID
  form.patient = appointment.patient._id;
  
  // Set symptoms from appointment
  form.symptoms = [...appointment.symptoms];
  
  // Update formattedAppointment
  formattedAppointment.value = appointment;
};

// Fetch doctor profile
const fetchDoctorProfile = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await axios.get('http://localhost:3000/doctors/profile', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    doctor.value = response.data;
    // Set the doctor ID in the form - using doctor's profile ID
    form.doctor = doctor.value._id;
    
    // Fetch appointments after getting doctor ID
    await fetchAppointments();
    
  } catch (err) {
    error.value = 'Failed to fetch doctor profile';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Fetch appointments for the doctor
const fetchAppointments = async (page = 1) => {
  if (!doctor?.value?._id) {
    console.warn('Cannot fetch appointments without doctor ID');
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    
    const response = await axios.get(`http://localhost:3000/appointments/doctor/${doctor.value._id}`, {
      params: {
        page,
        limit: itemsPerPage
      },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    appointments.value = response.data.data || [];
    totalPages.value = response.data.total || 1;
    currentPage.value = page;
    
  } catch (err) {
    error.value = 'Failed to fetch appointments';
    console.error('Error fetching appointments:', err);
  } finally {
    loading.value = false;
  }
};

// Load data when component mounts
onMounted(async () => {
  await fetchDoctorProfile();
});

// Methods to handle form operations
const addSymptom = () => {
  if (newSymptom.value.trim()) {
    form.symptoms.push(newSymptom.value.trim());
    newSymptom.value = '';
  }
};

const removeSymptom = (index) => {
  form.symptoms.splice(index, 1);
};

const addMedicalHistory = () => {
  if (newMedicalHistory.value.trim()) {
    form.medicalHistory.push(newMedicalHistory.value.trim());
    newMedicalHistory.value = '';
  }
};

const removeMedicalHistory = (index) => {
  form.medicalHistory.splice(index, 1);
};

const addAllergy = () => {
  if (newAllergy.value.trim()) {
    form.allergies.push(newAllergy.value.trim());
    newAllergy.value = '';
  }
};

const removeAllergy = (index) => {
  form.allergies.splice(index, 1);
};

const addMedication = () => {
  if (newMedication.value.trim()) {
    form.currentMedications.push(newMedication.value.trim());
    newMedication.value = '';
  }
};

const removeMedication = (index) => {
  form.currentMedications.splice(index, 1);
};

const addTest = () => {
  if (newTest.value.trim()) {
    form.recommendedTests.push(newTest.value.trim());
    newTest.value = '';
  }
};

const removeTest = (index) => {
  form.recommendedTests.splice(index, 1);
};

const addSpecialist = () => {
  if (newSpecialist.value.trim()) {
    form.recommendedSpecialists.push(newSpecialist.value.trim());
    newSpecialist.value = '';
  }
};

const removeSpecialist = (index) => {
  form.recommendedSpecialists.splice(index, 1);
};

const addTreatment = () => {
  if (newTreatment.value.trim()) {
    form.treatmentSuggestions.push(newTreatment.value.trim());
    newTreatment.value = '';
  }
};

const removeTreatment = (index) => {
  form.treatmentSuggestions.splice(index, 1);
};

const addCondition = () => {
  form.possibleConditions.push({
    name: '',
    probability: 0,
    description: ''
  });
};

const removeCondition = (index) => {
  form.possibleConditions.splice(index, 1);
};

const resetForm = () => {
  form.appointmentId = '';
  form.patient = '';
  form.doctor = '';
  form.symptoms = [];
  form.medicalHistory = [];
  form.allergies = [];
  form.currentMedications = [];
  form.diagnosisResult = '';
  form.confidence = 0.9;
  form.possibleConditions = [{
    name: '',
    probability: 0,
    description: ''
  }];
  form.recommendedTests = [];
  form.recommendedSpecialists = [];
  form.treatmentSuggestions = [];
  form.notes = '';
};

const submitDiagnosis = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Ensure we have an appointment selected
    if (!form.appointmentId) {
      error.value = 'Please select an appointment';
      return;
    }

    // Find the selected appointment to get patient and doctor IDs
    const selectedAppointment = appointments.value.find(app => app._id === form.appointmentId);
    if (!selectedAppointment) {
      error.value = 'Selected appointment not found';
      return;
    }

    // Create diagnosis payload with correct MongoDB IDs
    const diagnosisData = {
      patient: selectedAppointment.patient._id,  // Use patient's MongoDB ID
      doctor: selectedAppointment.doctor._id,    // Use doctor's MongoDB ID
      symptoms: form.symptoms,
      medicalHistory: form.medicalHistory,
      allergies: form.allergies,
      currentMedications: form.currentMedications,
      diagnosisResult: form.diagnosisResult,
      confidence: form.confidence,
      possibleConditions: form.possibleConditions,
      recommendedTests: form.recommendedTests,
      recommendedSpecialists: form.recommendedSpecialists,
      treatmentSuggestions: form.treatmentSuggestions,
      notes: form.notes
    };

    const response = await axios.post('http://localhost:3000/diagnosis', diagnosisData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    // Add the new diagnosis to the list
    diagnoses.value.unshift(response.data);
    
    // Reset form and close modal
    resetForm();
    showCreateModal.value = false;
  } catch (err) {
    error.value = err.message || 'Failed to create diagnosis';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time) => {
  return time ? time.replace(/:/g, ':') : '';
};

const formatAppointment = (appointment) => {
  const date = new Date(appointment.date);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = `${appointment.startTime} - ${appointment.endTime}`;
  return `${appointment.patient.name} - ${formattedDate} (${formattedTime})`;
};

const toggleExpand = (id) => {
  expandedDiagnosis.value = expandedDiagnosis.value === id ? null : id;
};
</script>

<style lang="scss" scoped>
:root {
  --primary: #3b82f6;
  --primary-light: #dbedff;
  --text-primary: #1f2a44;
  --text-secondary: #6b7280;
  --background: #ffffff;
  --surface-card: #f9fafb;
  --border-color: #e5e7eb;
}

.diagnosis-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2a44;
  }
}

.create-button {
  background: #3b82f6;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.doctor-profile {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 2rem;

  .profile-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    .profile-details {
      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
      }

      p {
        margin: 0.25rem 0;
        color: #6c757d;
      }
    }
  }
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 0.5rem;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .specialization {
    font-size: 1rem;
    font-weight: 500;
    color: #1f2a44;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;

    p {
      margin: 0.25rem 0;
      color: #6c757d;

      span {
        font-weight: 500;
      }
    }
  }
}

.diagnosis-list {
  display: grid;
  gap: 1.5rem;
}

.diagnosis-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2a44;
    margin: 0;
  }

  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0 0;
  }
}

.details-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #2563eb;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.2s ease;
  }

  .rotate {
    transform: rotate(180deg);
  }
}

.card-details {
  margin-top: 1.5rem;
  display: grid;
  gap: 1.5rem;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2a44;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  ul {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.sub-card {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;

  p {
    font-size: 0.875rem;
    margin: 0.25rem 0;

    strong {
      color: #1f2a44;
    }
  }
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.no-data {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;

  p {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
}

.link-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: #2563eb;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2a44;
  }
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.form {
  display: grid;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  input,
  textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      outline: none;
    }

    &.error {
      border-color: #ef4444;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
}

.chips-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  input {
    width: 100%;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  background: #3b82f6;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chip-remove {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
}

.sub-form {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.sub-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.vitals-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.add-button,
.remove-button {
  background: #3b82f6;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #2563eb;
  }
}

.remove-button {
  background: #ef4444;

  &:hover {
    background: #dc2626;
  }
}

.error-text {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-button,
.cancel-button,
.reset-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease, transform 0.2s ease;
}

.submit-button {
  background: #3b82f6;
  color: #ffffff;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
}

.cancel-button {
  background: #e5e7eb;
  color: #1f2a44;

  &:hover {
    background: #d1d5db;
  }
}

.reset-button {
  background: #f59e0b;
  color: #ffffff;

  &:hover {
    background: #d97706;
  }
}

.appointment-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #fff;
  color: #333;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
}

.appointment-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;

  p {
    margin: 0.25rem 0;
    color: #333;

    strong {
      color: #1a56db;
    }
  }

  .meeting-link {
    margin-top: 0.5rem;

    a {
      color: #1a56db;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.no-appointment {
  color: #6c757d;
  font-style: italic;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .diagnosis-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>