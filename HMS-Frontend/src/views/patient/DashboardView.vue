<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { healthDataService, appointmentService } from '../../services/api';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import HealthDataCard from '../../components/patient/HealthDataCard.vue';
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue';
import AppointmentCalendar from '../../components/calendar/AppointmentCalendar.vue';
import dayjs from 'dayjs';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import Textarea from "primevue/textarea";
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import MultiSelect from 'primevue/multiselect';

// Define interfaces for type safety
interface HealthData {
  heartRate?: { value: number; change: number; time: string; history?: any[] };
  bloodPressure?: { value: string; change: number; time: string };
  temperature?: { value: number; change: number; time: string };
  oxygen?: { value: number; change: number; time: string };
}

interface Appointment {
  id: string;
  doctor: { name: string };
  date: string;
  startTime: string;
}

interface PatientStats {
  totalAppointments: number;
  completedConsultations: number;
  upcomingAppointments: number;
  lastCheckup: string | null;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const healthData = ref<HealthData | null>(null);
const upcomingAppointment = ref<Appointment | null>(null);
const stats = ref<PatientStats>({
  totalAppointments: 0,
  completedConsultations: 0,
  upcomingAppointments: 0,
  lastCheckup: null,
});
const displayAppointmentModal = ref(false);
const selectedDoctor = ref(null);
const doctors = ref([]);
const patientId = ref<string | null>(null);
const appointmentForm = ref({
  patient: patientId.value,
  doctor: null,
  date: '',
  startTime: '',
  endTime: '',
  status: 'scheduled',
  type: 'Video Consultation',
  reasonForVisit: '',
  notes: '',
  symptoms: [],
  isPaid: false,
  paymentAmount: 150
});

const selectedDoctorFee = computed(() => {
  if (!selectedDoctor.value) return null;
  const doctor = doctors.value.find(d => d.value === selectedDoctor.value);
  return doctor ? doctor.doctor.consultationFee : null;
});

// Methods
const bookNewAppointment = () => {
  displayAppointmentModal.value = true;
  fetchDoctors();
};

const handleAppointmentSelected = (appointment: Appointment) => {
  router.push(`/patient/appointments/${appointment.id}`);
};

const fetchDashboardData = async () => {
  try {
    // Fetch patient data
    const [health, appointments] = await Promise.all([
      healthDataService.getLatestHealthData(),
      appointmentService.getUpcomingAppointments()
    ]);

    healthData.value = health;
    upcomingAppointment.value = appointments[0] || null;
    
    // Update stats
    stats.value = {
      totalAppointments: appointments.length,
      completedConsultations: await appointmentService.getCompletedConsultationsCount(),
      upcomingAppointments: appointments.filter(app => new Date(app.date) >= new Date()).length,
      lastCheckup: await appointmentService.getLastCheckupDate()
    };
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load patient dashboard data',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMMM D, YYYY');
};

const formatTime = (timeString: string) => {
  return dayjs(`2000-01-01T${timeString}`).format('h:mm A');
};

const fetchDoctors = async () => {
  try {
    const response = await fetch('http://localhost:3000/doctors?page=1&limit=100');
    const data = await response.json();
    doctors.value = data.data.map(doctor => ({
      id: doctor._id,
      label: `${doctor.user.firstName} ${doctor.user.lastName} - ${doctor.specialization}`,
      value: doctor._id,
      doctor
    }));
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load doctors list',
      life: 3000
    });
  }
};

const fetchPatientId = async () => {
  try {
    const response = await apiClient.get('/patients/profile');
    if (response.data && response.data._id) {
      patientId.value = response.data._id;  
      appointmentForm.value.patient = patientId.value;
      console.log('Fetched patient ID:', patientId.value);
    } else {
      throw new Error('Invalid patient profile response');
    }
  } catch (error) {
    console.error('Error fetching patient ID:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to fetch patient ID',
      life: 3000
    });
  }
};

const submitAppointment = async () => {
  try {
    if (!patientId.value) {
      throw new Error('Patient ID not found');
    }

    // Create appointment data using the patient ID from profile
    const appointmentData = {
      patient: patientId.value,  
      doctor: selectedDoctor.value,
      date: appointmentForm.value.date,
      startTime: appointmentForm.value.startTime,
      endTime: appointmentForm.value.endTime,
      status: 'scheduled',
      type: appointmentForm.value.type,
      reasonForVisit: appointmentForm.value.reasonForVisit,
      notes: appointmentForm.value.notes,
      symptoms: appointmentForm.value.symptoms,
      isPaid: appointmentForm.value.isPaid,
      paymentAmount: appointmentForm.value.paymentAmount
    };

    console.log('Submitting appointment with patient ID:', patientId.value);
    
    const response = await apiClient.post('/appointments', appointmentData);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appointment booked successfully',
      life: 3000
    });
    displayAppointmentModal.value = false;
    await fetchDashboardData();
  } catch (error) {
    console.error('Error submitting appointment:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to book appointment',
      life: 3000
    });
  }
};

const resetForm = () => {
  appointmentForm.value = {
    patient: patientId.value,
    doctor: null,
    date: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    type: 'Video Consultation',
    reasonForVisit: '',
    notes: '',
    symptoms: [],
    isPaid: false,
    paymentAmount: 150
  };
  selectedDoctor.value = null;
};

const clearDoctor = () => {
  selectedDoctor.value = null;
  appointmentForm.value.doctor = null;
  appointmentForm.value.paymentAmount = 150; // Reset payment amount
};

onMounted(async () => {
  await fetchDashboardData();
  await fetchPatientId();
});
</script>

<template>
  <div class="patient-dashboard">
    <!-- Header with Title and Profile Icon -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Patient Dashboard</h1>
      <div class="profile-icon-container">
        <Button
          icon="pi pi-user"
          class="p-button-rounded p-button-text profile-icon"
          @click="router.push('/patient/profile')"
          aria-label="View Profile"
        />
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content" v-if="!loading">
      <!-- Welcome message with upcoming appointment alert -->
      <div class="welcome-banner">
        <div class="welcome-content">
          <h2>Welcome back, {{ authStore.user?.firstName || 'Patient' }}</h2>
          <p>Here's a summary of your health data and upcoming appointments</p>
        </div>

        <div v-if="upcomingAppointment" class="appointment-alert">
          <i class="pi pi-calendar"></i>
          <div class="alert-content">
            <p>Your next appointment with Dr. {{ upcomingAppointment.doctor.name }} is on</p>
            <strong>{{ formatDate(upcomingAppointment.date) }} at {{ formatTime(upcomingAppointment.startTime) }}</strong>
          </div>
          <Button
            label="View Details"
            icon="pi pi-arrow-right"
            text
            @click="$router.push(`/patient/appointments?id=${upcomingAppointment.id}`)"
          />
        </div>

        <div v-else class="appointment-alert no-appointment">
          <i class="pi pi-calendar-plus"></i>
          <div class="alert-content">
            <p>You don't have any upcoming appointments</p>
            <strong>Schedule a check-up with your doctor</strong>
          </div>
          <Button
            label="Book Now"
            icon="pi pi-calendar-plus"
            @click="bookNewAppointment"
          />
        </div>
      </div>

      <!-- Health statistics -->
      <div class="health-stats">
        <HealthDataCard
          title="Heart Rate"
          :value="healthData?.heartRate?.value || 0"
          type="heart-rate"
          :change="healthData?.heartRate?.change || 0"
          :time="healthData?.heartRate?.time || 'N/A'"
          :loading="loading"
        />
        <HealthDataCard
          title="Blood Pressure"
          :value="healthData?.bloodPressure?.value || 0"
          type="blood-pressure"
          :change="healthData?.bloodPressure?.change || 0"
          :time="healthData?.bloodPressure?.time || 'N/A'"
          :loading="loading"
        />
        <HealthDataCard
          title="Temperature"
          :value="healthData?.temperature?.value || 0"
          type="temperature"
          :change="healthData?.temperature?.change || 0"
          :time="healthData?.temperature?.time || 'N/A'"
          :loading="loading"
        />
        <HealthDataCard
          title="Oxygen Saturation"
          :value="healthData?.oxygen?.value || 0"
          type="oxygen"
          :change="healthData?.oxygen?.change || 0"
          :time="healthData?.oxygen?.time || 'N/A'"
          :loading="loading"
        />
      </div>

      <!-- Main dashboard content -->
      <div class="dashboard-grid">
        <!-- Left column: Charts -->
        <div class="dashboard-left">
          <Card class="health-chart-card">
            <template #header>
              <div class="card-header">
                <h2>Heart Rate Monitoring</h2>
                <Button
                  icon="pi pi-ellipsis-h"
                  rounded
                  text
                  aria-label="More options"
                  @click="$router.push('/patient/health?type=heart-rate')"
                />
              </div>
            </template>

            <template #content>
              <div v-if="healthData?.heartRate?.history?.length" class="chart-container">
                <VitalSignsChart
                  title="Heart Rate"
                  type="heart-rate"
                  :data="healthData.heartRate.history"
                  :height="300"
                />
              </div>

              <div v-else class="no-data">
                <i class="pi pi-chart-line"></i>
                <p>No heart rate data available</p>
                <Button
                  label="Connect Device"
                  icon="pi pi-link"
                  outlined
                  @click="$router.push('/patient/health')"
                />
              </div>
            </template>
          </Card>

          <Card class="health-tips-card">
            <template #header>
              <div class="card-header">
                <h2>Health Tips & Reminders</h2>
              </div>
            </template>

            <template #content>
              <div class="tips-list">
                <div class="tip-item">
                  <div class="tip-icon">
                    <i class="pi pi-heart"></i>
                  </div>
                  <div class="tip-content">
                    <h3>Stay Hydrated</h3>
                    <p>Remember to drink at least 8 glasses of water today</p>
                  </div>
                </div>

                <div class="tip-item">
                  <div class="tip-icon">
                    <i class="pi pi-heart-fill"></i>
                  </div>
                  <div class="tip-content">
                    <h3>Take Your Medication</h3>
                    <p>Don't forget to take your evening medication at 8:00 PM</p>
                  </div>
                </div>

                <div class="tip-item">
                  <div class="tip-icon">
                    <i class="pi pi-walking"></i>
                  </div>
                  <div class="tip-content">
                    <h3>Daily Exercise</h3>
                    <p>Try to get 30 minutes of moderate exercise today</p>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Right column: Calendar & Activity -->
        <div class="dashboard-right">
          <Card class="calendar-card">
            <template #header>
              <div class="card-header">
                <h2>Appointments Calendar</h2>
                <Button
                  icon="pi pi-plus"
                  rounded
                  text
                  aria-label="Book appointment"
                  tooltip="Book new appointment"
                  :tooltipOptions="{ position: 'bottom' as const }"
                  @click="$router.push('/patient/appointments')"
                />
              </div>
            </template>

            <template #content>
              <AppointmentCalendar
                readOnly
                @appointment-selected="handleAppointmentSelected"
              />
            </template>
          </Card>

          <Card class="activity-card">
            <template #header>
              <div class="card-header">
                <h2>Recent Activity</h2>
              </div>
            </template>

            <template #content>
              <div class="activity-timeline">
                <div class="timeline-item">
                  <div class="timeline-icon">
                    <i class="pi pi-calendar-check"></i>
                  </div>
                  <div class="timeline-content">
                    <h3>Appointment Completed</h3>
                    <p>Checkup with Dr. Smith</p>
                    <span class="timeline-date">Yesterday at 10:30 AM</span>
                  </div>
                </div>

                <div class="timeline-item">
                  <div class="timeline-icon">
                    <i class="pi pi-file-pdf"></i>
                  </div>
                  <div class="timeline-content">
                    <h3>Test Results Available</h3>
                    <p>Blood work results uploaded by lab</p>
                    <span class="timeline-date">3 days ago</span>
                  </div>
                </div>

                <div class="timeline-item">
                  <div class="timeline-icon">
                    <i class="pi pi-heart"></i>
                  </div>
                  <div class="timeline-content">
                    <h3>Health Update</h3>
                    <p>Your blood pressure readings have improved</p>
                    <span class="timeline-date">1 week ago</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <div class="loading-container" v-else>
      <ProgressSpinner />
      <p>Loading your health data...</p>
    </div>

    <Dialog 
      v-model:visible="displayAppointmentModal" 
      header="Book Appointment" 
      :modal="true" 
      :style="{ width: '60vw' }"
      :closable="true"
    >
      <form class="appointment-form">
        <div class="form-header">
          <h3>Appointment Details</h3>
          <div v-if="selectedDoctorFee" class="consultation-fee">
            <span class="fee-label">Consultation Fee:</span>
            <span class="fee-amount">₹{{ selectedDoctorFee }}</span>
          </div>
        </div>

        <div class="form-grid">
          <!-- Doctor Selection -->
          <div class="form-group">
            <label for="doctor" class="form-label">Select Doctor</label>
            <Dropdown
              v-model="selectedDoctor"
              :options="doctors"
              optionLabel="label"
              optionValue="value"
              placeholder="Select a doctor"
              class="w-full"
              @change="appointmentForm.paymentAmount = selectedDoctorFee"
            />
            
            <!-- Doctor Info Display -->
            <div v-if="selectedDoctor" class="doctor-info mt-2">
              <div class="doctor-details">
                <div class="doctor-name">{{ doctors.find(d => d.value === selectedDoctor)?.doctor.user.firstName }} {{ doctors.find(d => d.value === selectedDoctor)?.doctor.user.lastName }}</div>
                <div class="doctor-specialty">{{ doctors.find(d => d.value === selectedDoctor)?.doctor.specialization }}</div>
                <div class="doctor-fee">Fee: ₹{{ selectedDoctorFee }}</div>
              </div>
            </div>
            <Button
              v-if="selectedDoctor"
              label="Clear Doctor"
              icon="pi pi-times"
              class="p-button-text p-button-danger mt-2"
              @click="clearDoctor"
            />
          </div>

          <!-- Date and Time -->
          <div class="form-group">
            <label for="date" class="form-label">Date</label>
            <Calendar
              v-model="appointmentForm.date"
              dateFormat="dd/mm/yy"
              :minDate="new Date()"
              class="w-full"
            />
          </div>

          <!-- Start Time Selection -->
          <div class="form-group">
            <label for="startTime" class="form-label">Start Time</label>
            <InputText
              v-model="appointmentForm.startTime"
              type="time"
              class="w-full"
              placeholder="HH:MM"
            />
          </div>

          <!-- End Time Selection -->
          <div class="form-group">
            <label for="endTime" class="form-label">End Time</label>
            <InputText
              v-model="appointmentForm.endTime"
              type="time"
              class="w-full"
              placeholder="HH:MM"
            />
          </div>

          <!-- Appointment Type -->
          <div class="form-group">
            <label for="type" class="form-label">Appointment Type</label>
            <Dropdown
              v-model="appointmentForm.type"
              :options="['Video Consultation', 'In-Person']"
              placeholder="Select appointment type"
              class="w-full"
            />
          </div>

          <!-- Reason for Visit -->
          <div class="form-group">
            <label for="reason" class="form-label">Reason for Visit</label>
            <Textarea
              v-model="appointmentForm.reasonForVisit"
              :rows="3"
              class="w-full"
              placeholder="Briefly describe your reason for visit"
            />
          </div>

          <!-- Additional Information -->
          <div class="form-group">
            <label for="notes" class="form-label">Additional Notes</label>
            <Textarea
              v-model="appointmentForm.notes"
              :rows="3"
              class="w-full"
              placeholder="Any additional information for the doctor"
            />
          </div>

          <!-- Symptoms -->
          <div class="form-group">
            <label class="form-label">Symptoms</label>
            <MultiSelect
              v-model="appointmentForm.symptoms"
              :options="['Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Other']"
              placeholder="Select symptoms"
              class="w-full"
            />
          </div>

          <!-- Payment Section -->
          <div class="form-group">
            <div class="payment-section">
              <div class="payment-checkbox">
                <Checkbox v-model="appointmentForm.isPaid" :binary="true" />
                <label class="ml-2">Pre-Payment</label>
              </div>
              <div class="payment-amount" v-if="appointmentForm.isPaid">
                Amount: ₹{{ appointmentForm.paymentAmount }}
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            label="Reset Form"
            icon="pi pi-refresh"
            class="p-button-text p-button-warning"
            @click="resetForm"
          />
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="displayAppointmentModal = false"
          />
          <Button
            label="Book Appointment"
            icon="pi pi-check"
            class="p-button-success"
            @click="submitAppointment"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
.patient-dashboard {
  padding: 2rem;
  background: var(--surface-ground);
}

/* Modal Styling */
.appointment-modal {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  background: var(--surface-ground);
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

:deep(.p-dialog-header) {
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
  padding: 2rem !important;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

:deep(.p-dialog-content) {
  padding: 2.5rem !important;
  background: var(--surface-ground);
  border-radius: 0 0 16px 16px;
}

:deep(.p-dialog-header .p-dialog-header-close) {
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

:deep(.p-dialog-header .p-dialog-header-close:hover) {
  color: var(--primary-color);
  background: rgba(155, 135, 245, 0.1);
}

/* Form Styling */
.appointment-form {
  padding: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: var(--text-color);
}

.consultation-fee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.doctor-info {
  background: var(--surface-card);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--surface-border);
}

.doctor-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doctor-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.doctor-specialty {
  color: var(--text-color-secondary);
}

.doctor-fee {
  color: var(--primary-color);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.payment-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-amount {
  color: var(--primary-color);
  font-weight: 500;
}

.p-button-text {
  flex: 1;
  min-width: 120px;
}

.p-button-warning {
  background: var(--warning-color);
  color: white;
}

.p-button-warning:hover {
  background: var(--warning-color-dark);
}

.p-button-danger {
  background: var(--danger-color);
  color: white;
}

.p-button-danger:hover {
  background: var(--danger-color-dark);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Existing Dashboard Styles (Unchanged) */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
}

.profile-icon-container {
  display: flex;
  align-items: center;
}

.profile-icon {
  color: var(--primary-color);
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.profile-icon:hover {
  background: rgba(155, 135, 245, 0.1);
  transform: scale(1.1);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.welcome-banner {
  background: var(--surface-ground);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.welcome-content {
  margin-bottom: 1.5rem;
}

.appointment-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.appointment-alert i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.alert-content {
  flex: 1;
}

.no-appointment {
  background: var(--surface-card);
  color: var(--text-color-secondary);
}

.no-appointment i {
  color: var(--text-color-secondary);
}

.health-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-left,
.dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.health-chart-card,
.health-tips-card,
.calendar-card,
.activity-card {
  height: 100%;
}

.chart-container {
  height: 300px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-data i {
  font-size: 3rem;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--surface-card);
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
}

.tip-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--surface-card);
}

.timeline-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
}

.timeline-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

:deep(.p-button) {
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.p-button:hover) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.2);
}

:deep(.p-button.p-button-text) {
  color: var(--primary-color);
  background: transparent;
  border: none;
  padding: 0.5rem;
}

:deep(.p-button.p-button-text:hover) {
  background: rgba(155, 135, 245, 0.1);
}
</style>