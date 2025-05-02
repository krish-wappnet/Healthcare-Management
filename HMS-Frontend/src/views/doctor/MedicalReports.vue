<template>
  <div class="medical-reports">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Medical Reports</h1>
        <button @click="openModal" class="add-button">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Report
        </button>
      </div>

      <!-- Error and Loading States -->
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="loading" class="loading-spinner">Loading...</div>

      <!-- Medical Reports Table -->
      <div class="table-container" v-if="!loading && medicalReports.data">
        <div class="table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Title</th>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th>Appointment Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in medicalReports.data" :key="report._id">
                <td>{{ report.patient.user?.name || 'N/A' }}</td>
                <td>{{ report.title }}</td>
                <td>{{ formatDate(report.date) }}</td>
                <td>{{ report.diagnosis }}</td>
                <td>
                  <span :class="`status-${report.appointment.status.toLowerCase()}`">
                    {{ report.appointment.status }}
                  </span>
                </td>
                <td>{{ formatDate(report.appointment.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination" v-if="medicalReports.total > medicalReports.limit">
          <span class="page-info">
            Showing {{ medicalReports.data.length }} of {{ medicalReports.total }} reports
          </span>
          <div class="page-controls">
            <button @click="loadPage(1)" :disabled="medicalReports.page === 1">First</button>
            <button @click="loadPage(medicalReports.page - 1)" :disabled="medicalReports.page === 1">Previous</button>
            <span>Page {{ medicalReports.page }} of {{ Math.ceil(medicalReports.total / medicalReports.limit) }}</span>
            <button @click="loadPage(medicalReports.page + 1)" :disabled="medicalReports.page === Math.ceil(medicalReports.total / medicalReports.limit)">Next</button>
            <button @click="loadPage(Math.ceil(medicalReports.total / medicalReports.limit))" :disabled="medicalReports.page === Math.ceil(medicalReports.total / medicalReports.limit)">Last</button>
          </div>
        </div>
      </div>

      <!-- Modal for Adding Report -->
      <transition name="modal">
        <div v-if="showModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Create Medical Report</h2>
              <button @click="closeModal" class="close-button">
                <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form @submit.prevent="submitReport" class="modal-form">
              <!-- Appointment Selection -->
              <div class="form-group">
                <label>Appointment</label>
                <div class="select-wrapper">
                  <select v-model="reportForm.appointment" @change="handleAppointmentChange" required>
                    <option value="" disabled>Select Appointment</option>
                    <option v-for="appointment in appointments" :key="appointment._id" :value="appointment._id">
                      {{ formatDate(appointment.date) }}
                    </option>
                  </select>
                  <svg class="select-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <!-- Title and Dates -->
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Title</label>
                  <input type="text" v-model="reportForm.title" placeholder="Enter report title" required />
                </div>
                <div class="form-group">
                  <label>Date</label>
                  <input type="date" v-model="reportForm.date" required />
                </div>
                <div class="form-group">
                  <label>Follow-Up Date</label>
                  <input type="date" v-model="reportForm.followUpDate" />
                </div>
              </div>

              <!-- Diagnosis and Symptoms -->
              <div class="form-section">
                <div class="form-group full-width">
                  <label>Diagnosis</label>
                  <input type="text" v-model="reportForm.diagnosis" placeholder="Enter diagnosis" required />
                </div>
                <div class="form-section">
                  <div class="section-header" @click="toggleSection('symptoms')">
                    <h3>Symptoms</h3>
                    <svg
                      :class="{ 'rotate-180': sectionsOpen.symptoms }"
                      class="toggle-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div v-show="sectionsOpen.symptoms" class="section-content">
                    <div class="symptoms-list">
                      <div v-for="(symptom, index) in reportForm.symptoms" :key="index" class="symptom-item">
                        {{ symptom }}
                        <button @click="removeSymptom(index)" class="remove-button">×</button>
                      </div>
                      <div class="form-group">
                        <input
                          v-model="symptomInput"
                          placeholder="Enter symptom"
                          @keyup.enter="addSymptom"
                        />
                        <button @click="addSymptom" class="add-button">Add</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Treatment Plan and Notes -->
              <div class="form-section">
                <div class="form-group full-width">
                  <label>Treatment Plan</label>
                  <textarea
                    v-model="reportForm.treatmentPlan"
                    rows="3"
                    placeholder="Describe the treatment plan"
                    required
                  ></textarea>
                </div>
                <div class="form-group full-width">
                  <label>Notes</label>
                  <textarea v-model="reportForm.notes" rows="3" placeholder="Additional notes"></textarea>
                </div>
              </div>

              <!-- Medications (Collapsible) -->
              <div class="form-section">
                <div class="section-header" @click="toggleSection('medications')">
                  <h3>Medications</h3>
                  <svg
                    :class="{ 'rotate-180': sectionsOpen.medications }"
                    class="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div v-show="sectionsOpen.medications" class="section-content">
                  <div class="input-grid">
                    <div class="form-group">
                      <label>Name</label>
                      <input v-model="medicationInput.name" placeholder="Medication Name" />
                    </div>
                    <div class="form-group">
                      <label>Dosage</label>
                      <input v-model="medicationInput.dosage" placeholder="e.g., 100mg" />
                    </div>
                    <div class="form-group">
                      <label>Frequency</label>
                      <input v-model="medicationInput.frequency" placeholder="e.g., Once daily" />
                    </div>
                    <div class="form-group">
                      <label>Start Date</label>
                      <input v-model="medicationInput.startDate" type="date" />
                    </div>
                    <div class="form-group">
                      <label>End Date</label>
                      <input v-model="medicationInput.endDate" type="date" />
                    </div>
                    <div class="form-group">
                      <label>Instructions</label>
                      <input v-model="medicationInput.instructions" placeholder="e.g., Take with food" />
                    </div>
                    <button @click.prevent="addMedication" class="add-button full-width">Add Medication</button>
                  </div>
                  <div class="symptoms-list">
                    <div v-for="(medication, index) in reportForm.medications" :key="index" class="symptom-item">
                      {{ medication.name }} ({{ medication.dosage }}, {{ medication.frequency }})
                      <button @click="removeMedication(index)" class="remove-button">×</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Test Results (Collapsible) -->
              <div class="form-section">
                <div class="section-header" @click="toggleSection('testResults')">
                  <h3>Test Results</h3>
                  <svg
                    :class="{ 'rotate-180': sectionsOpen.testResults }"
                    class="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div v-show="sectionsOpen.testResults" class="section-content">
                  <div class="input-grid">
                    <div class="form-group">
                      <label>Test Name</label>
                      <input v-model="testResultInput.name" placeholder="Test Name" />
                    </div>
                    <div class="form-group">
                      <label>Date</label>
                      <input v-model="testResultInput.date" type="date" />
                    </div>
                    <div class="form-group">
                      <label>Result</label>
                      <input v-model="testResultInput.result" placeholder="e.g., 95" />
                    </div>
                    <div class="form-group">
                      <label>Normal Range</label>
                      <input v-model="testResultInput.normalRange" placeholder="e.g., 70-100" />
                    </div>
                    <div class="form-group">
                      <label>Units</label>
                      <input v-model="testResultInput.units" placeholder="e.g., mg/dL" />
                    </div>
                    <div class="form-group">
                      <label>Notes</label>
                      <input v-model="testResultInput.notes" placeholder="e.g., Fasting test" />
                    </div>
                    <button @click.prevent="addTestResult" class="add-button full-width">Add Test Result</button>
                  </div>
                  <div class="symptoms-list">
                    <div v-for="(result, index) in reportForm.testResults" :key="index" class="symptom-item">
                      {{ result.name }}: {{ result.result }} {{ result.units }}
                      <button @click="removeTestResult(index)" class="remove-button">×</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vital Signs (Collapsible) -->
              <div class="form-section">
                <div class="section-header" @click="toggleSection('vitalSigns')">
                  <h3>Vital Signs</h3>
                  <svg
                    :class="{ 'rotate-180': sectionsOpen.vitalSigns }"
                    class="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div v-show="sectionsOpen.vitalSigns" class="section-content">
                  <div class="vitals-grid">
                    <div class="form-group">
                      <label>Blood Pressure</label>
                      <input
                        v-model="reportForm.vitalSigns.bloodPressure"
                        placeholder="e.g., 120/80"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label>Heart Rate</label>
                      <input
                        v-model="reportForm.vitalSigns.heartRate"
                        type="number"
                        placeholder="bpm"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label>Respiratory Rate</label>
                      <input
                        v-model="reportForm.vitalSigns.respiratoryRate"
                        type="number"
                        placeholder="breaths/min"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label>Temperature</label>
                      <input
                        v-model="reportForm.vitalSigns.temperature"
                        type="number"
                        step="0.1"
                        placeholder="°F"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label>Oxygen Saturation</label>
                      <input
                        v-model="reportForm.vitalSigns.oxygenSaturation"
                        type="number"
                        placeholder="%"
                        required
                      />
                    </div>
                  </div>
                  <div class="section-actions">
                    <button @click="resetVitalSigns" class="reset-button">Reset</button>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
                <button type="submit" class="submit-button" :disabled="loading">
                  {{ loading ? 'Creating...' : 'Create Report' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref(null)
const doctorId = ref(null)
const appointments = ref([])
const medicalReports = ref({
  data: [],
  total: 0,
  limit: 10,
  page: 1
})
const reportForm = ref({
  appointment: '',
  title: '',
  date: '',
  diagnosis: '',
  symptoms: [],
  treatmentPlan: '',
  medications: [],
  testResults: [],
  vitalSigns: {
    bloodPressure: '',
    heartRate: null,
    respiratoryRate: null,
    temperature: null,
    oxygenSaturation: null
  },
  notes: '',
  followUpDate: ''
})
const showModal = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const totalRecords = ref(0)
const sectionsOpen = ref({
  medications: false,
  testResults: false,
  vitalSigns: false,
  symptoms: false
})

const symptomInput = ref('')

onMounted(async () => {
  console.log('Component mounted')
  if (!(await authStore.checkAuth())) {
    console.log('Not authenticated, redirecting to login')
    router.push('/login')
    return
  }

  // Get token from auth store
  const token = authStore.token
  if (!token) {
    console.log('No token found')
    router.push('/login')
    return
  }

  // Fetch doctor profile
  try {
    const response = await axios.get('http://localhost:3000/doctors/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const doctorProfile = response.data
    console.log('Doctor profile response:', doctorProfile)
    
    if (doctorProfile && doctorProfile._id) {
      doctorId.value = doctorProfile._id
      console.log('Set doctor ID:', doctorId.value)
      
      if (doctorId.value) {
        console.log('Fetching appointments and medical reports')
        await Promise.all([
          fetchAppointments(),
          fetchMedicalReports()
        ])
      }
    } else {
      console.error('Invalid doctor profile response')
      error.value = 'Failed to fetch doctor profile'
    }
  } catch (error) {
    console.error('Error fetching doctor profile:', error)
    console.error('Error response:', error.response?.data)
    error.value = error.response?.data?.message || 'Failed to fetch doctor profile'
  }
})

async function fetchAppointments() {
  try {
    loading.value = true
    console.log('Fetching appointments for doctor:', doctorId.value)
    console.log('Current page:', currentPage.value)
    console.log('Rows per page:', rowsPerPage.value)
    
    if (!doctorId.value) {
      console.error('No doctor ID available')
      error.value = 'Doctor ID not available'
      return
    }

    const response = await axios.get(`http://localhost:3000/appointments/doctor/${doctorId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      params: {
        page: currentPage.value,
        limit: rowsPerPage.value
      }
    })
    console.log('Appointments API response:', response.data)
    appointments.value = response.data.data
    totalRecords.value = response.data.total
    loading.value = false
  } catch (error) {
    console.error('Error fetching appointments:', error)
    console.error('Error response:', error.response?.data)
    error.value = error.response?.data?.message || 'Failed to fetch appointments'
    loading.value = false
  }
}

function handleAppointmentChange() {
  const selectedAppointment = appointments.value.find(app => app._id === reportForm.value.appointment)
  if (selectedAppointment) {
    reportForm.value.appointment = selectedAppointment._id
    reportForm.value.patient = selectedAppointment.patient._id
    if (!reportForm.value.date) {
      reportForm.value.date = selectedAppointment.date
    }
  }
}

function getPatientFullName(patient) {
  return patient ? `${patient.firstName} ${patient.lastName}` : ''
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function resetForm() {
  reportForm.value = {
    appointment: '',
    title: '',
    date: '',
    diagnosis: '',
    symptoms: [],
    treatmentPlan: '',
    medications: [],
    testResults: [],
    vitalSigns: {
      bloodPressure: '',
      heartRate: null,
      respiratoryRate: null,
      temperature: null,
      oxygenSaturation: null
    },
    notes: '',
    followUpDate: ''
  }
  sectionsOpen.value = {
    medications: false,
    testResults: false,
    vitalSigns: false,
    symptoms: false
  }
}

function addMedication() {
  if (medicationInput.value.name.trim()) {
    reportForm.value.medications.push({ ...medicationInput.value })
    resetMedicationInput()
  }
}

function removeMedication(index) {
  reportForm.value.medications.splice(index, 1)
}

function addTestResult() {
  if (testResultInput.value.name.trim()) {
    reportForm.value.testResults.push({ ...testResultInput.value })
    resetTestResultInput()
  }
}

function removeTestResult(index) {
  reportForm.value.testResults.splice(index, 1)
}

function addSymptom() {
  if (symptomInput.value.trim()) {
    reportForm.value.symptoms.push(symptomInput.value.trim())
    symptomInput.value = ''
  }
}

function removeSymptom(index) {
  reportForm.value.symptoms.splice(index, 1)
}

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  error.value = null
  resetForm()
}

function toggleSection(section) {
  sectionsOpen.value[section] = !sectionsOpen.value[section]
}

const medicationInput = ref({
  name: '',
  dosage: '',
  frequency: '',
  startDate: '',
  endDate: '',
  instructions: ''
})

function resetMedicationInput() {
  medicationInput.value = {
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    instructions: ''
  }
}

const testResultInput = ref({
  name: '',
  date: '',
  result: '',
  normalRange: '',
  units: '',
  notes: ''
})

function resetTestResultInput() {
  testResultInput.value = {
    name: '',
    date: '',
    result: '',
    normalRange: '',
    units: '',
    notes: ''
  }
}

function resetVitalSigns() {
  reportForm.value.vitalSigns = {
    bloodPressure: '',
    heartRate: null,
    respiratoryRate: null,
    temperature: null,
    oxygenSaturation: null
  }
}

async function submitReport() {
  try {
    loading.value = true
    
    // Validate all required fields
    if (!reportForm.value.appointment) {
      error.value = 'Please select an appointment'
      return
    }
    if (!reportForm.value.title) {
      error.value = 'Title is required'
      return
    }
    if (!reportForm.value.date) {
      error.value = 'Date is required'
      return
    }
    if (!reportForm.value.diagnosis) {
      error.value = 'Diagnosis is required'
      return
    }
    if (!reportForm.value.symptoms.length) {
      error.value = 'At least one symptom is required'
      return
    }
    if (!reportForm.value.treatmentPlan) {
      error.value = 'Treatment plan is required'
      return
    }
    if (!reportForm.value.vitalSigns.bloodPressure) {
      error.value = 'Blood pressure is required'
      return
    }
    if (reportForm.value.vitalSigns.heartRate === null) {
      error.value = 'Heart rate is required'
      return
    }
    if (reportForm.value.vitalSigns.respiratoryRate === null) {
      error.value = 'Respiratory rate is required'
      return
    }
    if (reportForm.value.vitalSigns.temperature === null) {
      error.value = 'Temperature is required'
      return
    }
    if (reportForm.value.vitalSigns.oxygenSaturation === null) {
      error.value = 'Oxygen saturation is required'
      return
    }

    // Get the selected appointment to get the patient ID
    const selectedAppointment = appointments.value.find(a => a._id === reportForm.value.appointment)
    if (!selectedAppointment) {
      error.value = 'Appointment not found'
      return
    }

    // Prepare the data for submission
    const reportData = {
      appointment: reportForm.value.appointment,
      patient: selectedAppointment.patient._id, // Use the patient ID from the appointment
      title: reportForm.value.title,
      date: reportForm.value.date,
      diagnosis: reportForm.value.diagnosis,
      symptoms: reportForm.value.symptoms,
      treatmentPlan: reportForm.value.treatmentPlan,
      medications: reportForm.value.medications,
      testResults: reportForm.value.testResults,
      vitalSigns: reportForm.value.vitalSigns,
      notes: reportForm.value.notes,
      followUpDate: reportForm.value.followUpDate,
      doctor: doctorId.value
    }

    // Make the API call
    await axios.post('http://localhost:3000/medical-reports', reportData, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    // Reset form and close modal
    resetForm()
    closeModal()
    
    // Refresh the medical reports list
    await fetchMedicalReports()
  } catch (error) {
    error.value = error.response?.data?.message || 'Failed to create medical report'
  } finally {
    loading.value = false
  }
}

async function fetchMedicalReports() {
  try {
    loading.value = true
    const response = await axios.get(`http://localhost:3000/medical-reports/doctor/${doctorId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      params: {
        page: 1,
        limit: 10
      }
    })
    medicalReports.value = response.data
    loading.value = false
  } catch (error) {
    console.error('Error fetching medical reports:', error)
    error.value = error.response?.data?.message || 'Failed to fetch medical reports'
    loading.value = false
  }
}

async function loadPage(page: number) {
  try {
    loading.value = true
    const response = await axios.get(`http://localhost:3000/medical-reports/doctor/${doctorId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      params: {
        page: page,
        limit: 10
      }
    })
    medicalReports.value = response.data
    loading.value = false
  } catch (error) {
    console.error('Error loading page:', error)
    error.value = error.response?.data?.message || 'Failed to load page'
    loading.value = false
  }
}
</script>

<style scoped>
.medical-reports {
  min-height: 100vh;
  background-color: #f4f7fa;
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #4f46e5;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.add-button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}

.add-button.full-width {
  grid-column: span 3;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.error-message {
  padding: 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.loading-spinner {
  text-align: center;
  font-size: 1rem;
  color: #4f46e5;
  padding: 2rem;
}

.table-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
}

.reports-table th {
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  background-color: #f9fafb;
}

.reports-table td {
  color: #1f2937;
}

.reports-table tr {
  transition: background-color 0.2s ease;
}

.reports-table tr:hover {
  background-color: #f9fafb;
}

.status-completed {
  padding: 0.25rem 0.75rem;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  transition: color 0.3s ease, transform 0.2s ease;
}

.close-button:hover {
  color: #1f2937;
  transform: scale(1.1);
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.form-group textarea {
  resize: vertical;
}

/* Custom Dropdown Styling */
.select-wrapper {
  position: relative;
}

.form-group select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: white;
  color: #1f2937;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.form-group select:hover {
  border-color: #a5b4fc;
}

.form-group select option[disabled] {
  color: #9ca3af;
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  pointer-events: none;
}

.symptoms-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.symptom-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.remove-button {
  color: #ef4444;
  font-size: 1.25rem;
  transition: color 0.3s ease, transform 0.2s ease;
}

.remove-button:hover {
  color: #dc2626;
  transform: scale(1.1);
}

.form-section {
  background-color: #fafafa;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.75rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
}

.section-header:hover {
  background-color: #d1d5db;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.section-content {
  padding-top: 1rem;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-grid .form-group {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.cancel-button {
  background-color: #e5e7eb;
  color: #1f2937;
}

.cancel-button:hover {
  background-color: #d1d5db;
  transform: translateY(-2px);
}

.submit-button {
  background-color: #4f46e5;
  color: white;
}

.submit-button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}

.submit-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
  opacity: 0;
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.vitals-grid .form-group {
  margin-bottom: 0;
}

.section-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.reset-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  background-color: #e5e7eb;
  color: #1f2937;
}

.reset-button:hover {
  background-color: #d1d5db;
  transform: translateY(-2px);
}

.add-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  background-color: #2563eb;
  color: white;
}

.add-button:hover {
  background-color: #1d4ed8;
  transform: translateY(-2px);
}

.symptoms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.symptoms-grid .form-group {
  margin-bottom: 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.page-controls {
  display: flex;
  gap: 0.5rem;
}

.page-controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  background-color: #e5e7eb;
  color: #1f2937;
}

.page-controls button:hover {
  background-color: #d1d5db;
  transform: translateY(-2px);
}

.page-controls button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}
</style>