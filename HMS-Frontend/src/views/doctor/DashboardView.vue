<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { dashboardService, appointmentService, patientService, apiClient, healthDataService } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';

// Interfaces for type safety
interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingConsultations: number;
  completedAppointmentsThisWeek: number;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar?: string;
  lastVisit?: string;
}

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    user: {
      firstName?: string;
      lastName?: string;
    };
    dateOfBirth: string;
    gender: string;
    bloodType: string;
    height: number;
    weight: number;
    allergies: string[];
    medications: string[];
    chronicConditions: string[];
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    insuranceProvider: string;
    insurancePolicyNumber: string;
  };
  doctor: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  reasonForVisit: string;
  notes?: string;
  symptoms?: string[];
  isPaid: boolean;
  paymentAmount: number;
  meetingLink?: string;
}

interface HealthData {
  heartRate: { timestamp: string; value: number }[];
  bloodPressure: { timestamp: string; systolic: number; diastolic: number }[];
}

interface DoctorProfile {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'doctor';
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  specialization?: string;
  qualifications?: string[];
  licenseNumber?: string;
  experience?: number;
  bio?: string;
  officeAddress?: string;
  officePhone?: string;
  consultationFee?: number;
  isAvailableForAppointments?: boolean;
  workingHours?: { _id: string };
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

// Device type mapping for readable display
const deviceTypeMap: { [key: string]: { name: string; icon: string; color: string } } = {
  smartwatch: { name: 'Smartwatch', icon: 'pi pi-clock', color: '#3b82f6' },
  blood_pressure: { name: 'Blood Pressure Monitor', icon: 'pi pi-heart', color: '#ef4444' },
  glucose_monitor: { name: 'Glucose Monitor', icon: 'pi pi-tint', color: '#22c55e' },
  pulse_oximeter: { name: 'Pulse Oximeter', icon: 'pi pi-pulse', color: '#f59e0b' },
  thermometer: { name: 'Thermometer', icon: 'pi pi-thermometer', color: '#14b8a6' },
  weight_scale: { name: 'Weight Scale', icon: 'pi pi-balance-scale', color: '#8b5cf6' },
};

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const stats = ref<DashboardStats>({
  totalPatients: 0,
  todayAppointments: 0,
  pendingConsultations: 0,
  completedAppointmentsThisWeek: 0,
});
const recentPatients = ref<Patient[]>([]);
const upcomingAppointments = ref<Appointment[]>([]);
const selectedPatient = ref<Patient | null>(null);
const selectedPatientData = ref<HealthData | null>(null);
const loadingPatientData = ref(false);
const doctorProfile = ref<DoctorProfile | null>(null);
const loadingProfile = ref(false);
const healthMetrics = ref<any[]>([]);
const abnormalReadings = ref<any[]>([]);
const patients = ref<Patient[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const patientsPerPage = ref(10);
const totalPatients = ref(0);
const healthData = ref<any[]>([]);
const healthDataTotal = ref(0);
const healthDataPage = ref(1);
const healthDataPerPage = ref(10);
const expandedHealthData = ref<string[]>([]);

// Computed properties
const isAuthorized = computed(() => {
  return authStore.isAuthenticated && authStore.userRole === 'doctor';
});

const isProfileIncomplete = computed(() => {
  return authStore.userRole === 'doctor' && (!doctorProfile.value || !doctorProfile.value.specialization);
});

// Fetch doctor profile
const fetchDoctorProfile = async () => {
  if (!isAuthorized.value) return;

  loadingProfile.value = true;

  try {
    const response = await apiClient.get('/doctors/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    doctorProfile.value = response.data;
  } catch (error: any) {
    console.error('Error fetching doctor profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to load doctor profile',
      life: 3000,
    });
    if (error.response?.status === 401 || error.response?.status === 403) {
      await authStore.logout();
      router.push('/login');
    }
  } finally {
    loadingProfile.value = false;
  }
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  if (!isAuthorized.value) {
    console.log('Not authorized to access dashboard');
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'You must be logged in as a doctor to view this dashboard.',
      life: 3000,
    });
    router.push('/login');
    return;
  }

  loading.value = true;
  console.log('Fetching dashboard data...');

  try {
    console.log('Fetching doctor profile...');
    const profileResponse = await apiClient.get('/doctors/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    const doctorId = profileResponse.data._id;
    console.log('Got doctor ID:', doctorId);

    console.log('Fetching appointments for doctor:', doctorId);
    const appointmentsResponse = await apiClient.get(`/appointments/doctor/${doctorId}?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    
    console.log('Received appointments:', appointmentsResponse.data.data);
    upcomingAppointments.value = appointmentsResponse.data.data;

    if (upcomingAppointments.value.length === 0) {
      console.log('No upcoming appointments found');
    } else {
      console.log('Found appointments:', upcomingAppointments.value.length);
    }

    if (recentPatients.value.length > 0) {
      await selectPatient(recentPatients.value[0]);
    }
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    const message =
      error.response?.data?.message || 'Failed to load dashboard data. Please try again.';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      await authStore.logout();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

// Fetch patient health data
const fetchPatientHealthData = async (patientId: string) => {
  try {
    const metricsResponse = await healthDataService.getPatientData(patientId, { page: 1, limit: 5 });
    healthMetrics.value = metricsResponse.data;

    const abnormalResponse = await healthDataService.getAbnormalReadings(patientId, { page: 1, limit: 10 });
    abnormalReadings.value = abnormalResponse.data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load health data',
      life: 3000,
    });
  }
};

// Fetch health data
const fetchHealthData = async (patientId: string, page: number = 1) => {
  try {
    loadingPatientData.value = true;
    healthDataPage.value = page;
    
    const response = await apiClient.get(`/health-devices/patient/${patientId}?page=${page}&limit=${healthDataPerPage.value}`);
    
    healthData.value = response.data.data;
    healthDataTotal.value = response.data.total;
    
    healthData.value = healthData.value.map(data => {
      const metrics: { [key: string]: string | number } = { ...data.data };
      
      if (data.data.bloodPressure) {
        const [systolic, diastolic] = data.data.bloodPressure.split('/').map(Number);
        metrics.systolic = systolic || 'N/A';
        metrics.diastolic = diastolic || 'N/A';
        delete metrics.bloodPressure;
      }

      return {
        ...data,
        timestamp: dayjs(data.timestamp).format('MMM D, YYYY - h:mm A'),
        deviceType: deviceTypeMap[data.deviceType]?.name || data.deviceType,
        deviceIcon: deviceTypeMap[data.deviceType]?.icon || 'pi pi-heart',
        deviceColor: deviceTypeMap[data.deviceType]?.color || '#3b82f6',
        deviceId: data.deviceId,
        isAbnormal: data.isAbnormal,
        abnormalityReason: data.abnormalityReason || '',
        metrics,
      };
    });
  } catch (error: any) {
    console.error('Error fetching health data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to load health data',
      life: 3000,
    });
  } finally {
    loadingPatientData.value = false;
  }
};

// Select a patient
const selectPatient = async (patient: Patient) => {
  selectedPatient.value = patient;
  loadingPatientData.value = true;
  
  try {
    await fetchHealthData(patient.id);
  } catch (error) {
    console.error('Error fetching health devices data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load health devices data',
      life: 3000,
    });
  } finally {
    loadingPatientData.value = false;
  }
};

// Fetch patients
const fetchPatients = async (page: number = 1) => {
  try {
    loading.value = true;
    currentPage.value = page;
    
    const response = await apiClient.get(`/patients?page=${page}&limit=${patientsPerPage.value}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    patients.value = response.data.data;
    totalPatients.value = response.data.total || 0;
    totalPages.value = Math.ceil(totalPatients.value / patientsPerPage.value);
    
    patients.value = patients.value.map(patient => {
      const user = patient.user || {};
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const dateOfBirth = patient.dateOfBirth || '';
      const gender = patient.gender || '';
      
      return {
        id: patient._id || '',
        name: `${firstName} ${lastName}`.trim() || 'Unknown Patient',
        age: dateOfBirth ? dayjs().diff(dateOfBirth, 'year') : 0,
        gender: gender || 'Unknown',
      };
    });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    
    const errorMessage = error.response?.data?.message || 
      error.message || 
      'Failed to load patients';
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Go to previous page
const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await fetchPatients(currentPage.value);
  }
};

// Go to next page
const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await fetchPatients(currentPage.value);
  }
};

// Go to specific page
const goToPage = async (page: number) => {
  currentPage.value = page;
  await fetchPatients(page);
};

// Format appointment date
const formatAppointmentDate = (date: string, time: string) => {
  try {
    const datePart = date.split('T')[0];
    const dateTimeString = `${datePart}T${time}:00.000Z`;
    const formatted = dayjs(dateTimeString);
    if (!formatted.isValid()) {
      throw new Error('Invalid date');
    }
    return formatted.format('MMM D, YYYY - h:mm A');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Unavailable';
  }
};

// Navigate to doctor registration
const goToDoctorRegistration = () => {
  if (!isAuthorized.value) {
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'Only doctors can complete their profile.',
      life: 3000,
    });
    return;
  }
  router.push('/doctor-registration');
};

// Navigate to doctor profile
const goToDoctorProfile = () => {
  if (!isAuthorized.value) {
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'Only doctors can view their profile.',
      life: 3000,
    });
    return;
  }
  
  if (!doctorProfile.value) {
    toast.add({
      severity: 'warning',
      summary: 'Profile Required',
      detail: 'Please complete your doctor profile first.',
      life: 3000,
    });
    router.push('/doctor-registration');
    return;
  }
  
  router.push('/doctor/profile');
};

// Navigate to appointments page
const viewAllAppointments = () => {
  router.push('/doctor/appointments');
};

// Toggle health data expansion
const toggleHealthData = (id: string) => {
  if (expandedHealthData.value.includes(id)) {
    expandedHealthData.value = expandedHealthData.value.filter(item => item !== id);
  } else {
    expandedHealthData.value.push(id);
  }
};

// Initial data load
onMounted(async () => {
  if (!(await authStore.checkAuth())) {
    toast.add({
      severity: 'error',
      summary: 'Session Expired',
      detail: 'Please log in again.',
      life: 3000,
    });
    router.push('/login');
    return;
  }
  await Promise.all([fetchDoctorProfile(), fetchDashboardData(), fetchPatients(1)]);
});

// Watch for patient selection changes
watch(selectedPatient, async (newPatient) => {
  if (newPatient) {
    await fetchHealthData(newPatient.id);
  }
});
</script>

<template>
  <div class="doctor-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-actions">
        <button
          v-if="isProfileIncomplete && !loadingProfile"
          class="button primary-button"
          @click="goToDoctorRegistration"
          aria-label="Complete your profile"
        >
          <i class="pi pi-user-edit"></i> Complete Profile
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner class="spinner" />
      <p>Loading dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Stats Overview -->
      <div class="stats-container">
        <div class="stat-card patients">
          <i class="pi pi-users stat-icon"></i>
          <div class="stat-info">
            <h3>{{ stats.totalPatients }}</h3>
            <p>Total Patients</p>
            <div class="progress-bar" :style="{ width: `${Math.min(stats.totalPatients * 2, 100)}%` }"></div>
          </div>
        </div>
        <div class="stat-card appointments">
          <i class="pi pi-calendar stat-icon"></i>
          <div class="stat-info">
            <h3>{{ stats.todayAppointments }}</h3>
            <p>Today's Appointments</p>
            <div class="progress-bar" :style="{ width: `${Math.min(stats.todayAppointments * 10, 100)}%` }"></div>
          </div>
        </div>
        <div class="stat-card consultations">
          <i class="pi pi-video stat-icon"></i>
          <div class="stat-info">
            <h3>{{ stats.pendingConsultations }}</h3>
            <p>Pending Consultations</p>
            <div class="progress-bar" :style="{ width: `${Math.min(stats.pendingConsultations * 10, 100)}%` }"></div>
          </div>
        </div>
        <div class="stat-card completed">
          <i class="pi pi-check-circle stat-icon"></i>
          <div class="stat-info">
            <h3>{{ stats.completedAppointmentsThisWeek }}</h3>
            <p>Completed This Week</p>
            <div class="progress-bar" :style="{ width: `${Math.min(stats.completedAppointmentsThisWeek * 5, 100)}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div class="dashboard-left">
          <!-- Patient Selection -->
          <div class="card patient-selection">
            <div class="card-header">
              <h2>Select a Patient</h2>
              <button
                class="button icon-button"
                @click="router.push('/doctor/patients')"
                aria-label="View all patients"
                v-tooltip.bottom="'View all patients'"
              >
                <i class="pi pi-users"></i>
              </button>
            </div>
            <div class="patients-list">
              <div
                v-for="patient in patients"
                :key="patient.id"
                class="patient-item"
                :class="{ active: selectedPatient?.id === patient.id }"
                @click="selectPatient(patient)"
              >
                <div class="patient-avatar"></div>
                <div class="patient-info">
                  <h3 class="patient-name">{{ patient.name }}</h3>
                  <p class="patient-details">
                    <span>{{ patient.age }} years</span>
                    <span class="divider">•</span>
                    <span>{{ patient.gender }}</span>
                  </p>
                </div>
              </div>
              <div v-if="!patients.length" class="no-data">
                <i class="pi pi-users"></i>
                <p>No patients found</p>
              </div>
            </div>
            <div class="pagination" v-if="totalPages > 1">
              <button
                class="pagination-button"
                @click="previousPage"
                :disabled="currentPage === 1"
                aria-label="Previous page"
              >
                <i class="pi pi-angle-left"></i>
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                class="pagination-button"
                :class="{ active: currentPage === page }"
                @click="goToPage(page)"
                :aria-label="`Go to page ${page}`"
              >
                {{ page }}
              </button>
              <button
                class="pagination-button"
                @click="nextPage"
                :disabled="currentPage === totalPages"
                aria-label="Next page"
              >
                <i class="pi pi-angle-right"></i>
              </button>
            </div>
          </div>

          <!-- Upcoming Appointments -->
          <div class="card upcoming-appointments">
            <div class="card-header">
              <h2>Upcoming Appointments</h2>
              <button
                class="button text-button"
                @click="viewAllAppointments"
              >
                <i class="pi pi-external-link"></i> View All
              </button>
            </div>
            <div class="appointments-list">
              <div v-if="loading" class="loading-state">
                <ProgressSpinner class="spinner" />
                <p>Loading appointments...</p>
              </div>
              <div v-else-if="upcomingAppointments.length === 0" class="no-data">
                <i class="pi pi-calendar-times"></i>
                <p>No upcoming appointments</p>
              </div>
              <div
                v-for="(appointment, index) in upcomingAppointments"
                :key="appointment._id"
                class="appointment-item"
                :class="{ 'first-appointment': index === 0 }"
              >
                <div class="appointment-status" :class="`status-${appointment.status.toLowerCase()}`" v-tooltip.bottom="appointment.status"></div>
                <div class="appointment-info">
                  <div class="appointment-date">
                    <i class="pi pi-calendar"></i>
                    {{ formatAppointmentDate(appointment.date, appointment.startTime) }}
                  </div>
                  <div class="appointment-type">{{ appointment.type }}</div>
                  <div class="appointment-reason">{{ appointment.reasonForVisit }}</div>
                </div>
                <button
                  class="button text-button"
                  @click="router.push(`/doctor/appointments/${appointment._id}`)"
                >
                  <i class="pi pi-arrow-right"></i> Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="dashboard-right">
          <div v-if="selectedPatient" class="card health-data">
            <div class="card-header">
              <h2>{{ selectedPatient.name }}'s Health Data</h2>
            </div>
            <div class="health-data-content">
              <div v-if="loadingPatientData" class="loading-state">
                <ProgressSpinner class="spinner" />
                <p>Loading health data...</p>
              </div>
              <div v-else-if="!healthData.length" class="no-data">
                <i class="pi pi-heart"></i>
                <p>No health data available</p>
              </div>
              <div v-else class="health-data-container">
                <div class="health-data-list">
                  <div v-for="data in healthData" :key="data._id" class="health-data-item" :style="{ 'border-left': `4px solid ${data.deviceColor}` }">
                    <div class="data-header" @click="toggleHealthData(data._id)">
                      <div class="device-info">
                        <i :class="data.deviceIcon" class="device-icon"></i>
                        <h3>{{ data.deviceType }}</h3>
                      </div>
                      <span class="timestamp">{{ data.timestamp }}</span>
                      <i :class="expandedHealthData.includes(data._id) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="toggle-icon"></i>
                    </div>
                    <div v-if="expandedHealthData.includes(data._id)" class="metrics-grid">
                      <div v-for="(value, metric) in data.metrics" :key="metric" class="metric-item">
                        <span class="metric-label">{{ metric.replace(/([A-Z])/g, ' $1').trim() }}</span>
                        <span class="metric-value" :class="{ abnormal: data.isAbnormal }">{{ value }}</span>
                      </div>
                    </div>
                    <div v-if="data.isAbnormal && data.abnormalityReason && expandedHealthData.includes(data._id)" class="abnormal-alert">
                      <i class="pi pi-exclamation-triangle pulse"></i>
                      <span>{{ data.abnormalityReason }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="healthDataTotal > healthDataPerPage" class="health-data-pagination">
                  <button
                    class="pagination-button"
                    @click="fetchHealthData(selectedPatient.id, healthDataPage - 1)"
                    :disabled="healthDataPage === 1"
                    aria-label="Previous page"
                  >
                    <i class="pi pi-angle-left"></i>
                  </button>
                  <button
                    v-for="page in Math.ceil(healthDataTotal / healthDataPerPage)"
                    :key="page"
                    class="pagination-button"
                    :class="{ active: healthDataPage === page }"
                    @click="fetchHealthData(selectedPatient.id, page)"
                    :aria-label="`Go to page ${page}`"
                  >
                    {{ page }}
                  </button>
                  <button
                    class="pagination-button"
                    @click="fetchHealthData(selectedPatient.id, healthDataPage + 1)"
                    :disabled="healthDataPage === Math.ceil(healthDataTotal / healthDataPerPage)"
                    aria-label="Next page"
                  >
                    <i class="pi pi-angle-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-selection">
            <i class="pi pi-user-plus"></i>
            <p>Select a patient to view their health data</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #4f46e5;
  --primary-dark: #3730a3;
  --success: #22c55e;
  --danger: #f43f5e;
  --warning: #f97316;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background: #ffffff;
  --card-background: #ffffff;
  --patient-card-background: #ffffff;
  --border-color: #e5e7eb;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --hover-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.doctor-dashboard {
  padding: 1.5rem;
  background: var(--background);
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: fadeIn 0.6s ease-in-out;
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem;
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--card-background);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05);
}

.primary-button {
  background: var(--primary);
  color: white;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--hover-shadow);
}

.text-button {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.text-button:hover {
  background: rgba(79, 70, 229, 0.05);
  transform: translateY(-1px);
}

.icon-button {
  background: transparent;
  color: var(--text-secondary);
  padding: 0.5rem;
  font-size: 1.25rem;
}

.icon-button:hover {
  color: var(--primary);
  transform: scale(1.05);
}

.button:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.button:active:after {
  width: 150px;
  height: 150px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: var(--text-secondary);
}

.loading-container p {
  font-size: 1rem;
  font-weight: 500;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--card-background);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.stat-icon {
  font-size: 2rem;
  color: var(--primary);
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-info h3 {
  font-size: 1.75rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
}

.stat-info p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0.25rem 0;
  font-weight: 500;
}

.progress-bar {
  height: 3px;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
}

/* Left Column */
.dashboard-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Card */
.card {
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--card-background);
}

.card-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

/* Patient Selection */
.patient-selection {
  background: var(--patient-card-background);
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.patients-list {
  padding: 1rem;
}

.patient-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
  animation: slideIn 0.4s ease;
}

.patient-item:hover {
  background: rgba(79, 70, 229, 0.05);
  transform: translateY(-1px);
}

.patient-item.active {
  background: var(--primary);
  color: white;
}

.patient-item.active .patient-name,
.patient-item.active .patient-details {
  color: white;
}

.patient-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--border-color);
  flex-shrink: 0;
}

.patient-info {
  flex: 1;
}

.patient-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.patient-details {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
}

.divider {
  margin: 0 0.5rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.pagination-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-button.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Upcoming Appointments */
.upcoming-appointments {
  background: var(--card-background);
  max-height: 300px;
  overflow-y: auto;
}

.appointments-list {
  padding: 1rem;
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--card-background);
  margin-bottom: 0.75rem;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: slideIn 0.4s ease;
}

.appointment-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--hover-shadow);
}

.appointment-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.first-appointment .appointment-status.status-completed {
  width: 14px;
  height: 7px;
  border-radius: 3px;
}

.status-scheduled { background: var(--primary); }
.status-completed { background: var(--success); }
.status-cancelled { background: var(--danger); }

.appointment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.appointment-date {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.appointment-type {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.appointment-reason {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Right Column */
.dashboard-right {
  display: flex;
  flex-direction: column;
}

.health-data {
  background: var(--card-background);
  max-height: 600px;
  overflow-y: auto;
}

.health-data-content {
  padding: 1rem;
}

.health-data-container {
  max-height: 500px;
  overflow-y: auto;
}

.health-data-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.health-data-item {
  background: var(--card-background);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.health-data-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--hover-shadow);
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding-bottom: 0.5rem;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.device-icon {
  font-size: 1.25rem;
  color: var(--primary);
}

.data-header h3 {
  font-size: 1rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.timestamp {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
}

.toggle-icon {
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.toggle-icon.pi-chevron-up {
  transform: rotate(180deg);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem 0;
  animation: slideDown 0.3s ease;
}

.metric-item {
  background: var(--card-background);
  padding: 0.5rem;
  border-radius: 6px;
  box-shadow: var(--card-shadow);
  transition: background 0.2s ease, transform 0.2s ease;
}

.metric-item:hover {
  background: rgba(229, 231, 235, 0.5);
  transform: translateY(-1px);
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  font-weight: 500;
}

.metric-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.metric-value.abnormal {
  color: var(--danger);
}

.abnormal-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(244, 63, 94, 0.1);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--danger);
  font-weight: 600;
  animation: pulseAlert 2s infinite;
}

.abnormal-alert i {
  font-size: 1rem;
}

.health-data-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.no-data,
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.no-data i,
.no-selection i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.no-data p,
.no-selection p {
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseAlert {
  0% { background: rgba(244, 63, 94, 0.1); }
  50% { background: rgba(244, 63, 94, 0.2); }
  100% { background: rgba(244, 63, 94, 0.1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-right {
    height: auto;
  }
}

@media (max-width: 768px) {
  .doctor-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    padding: 0.75rem;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-header h2 {
    font-size: 1.25rem;
  }

  .appointment-item,
  .patient-item,
  .health-data-item {
    padding: 0.5rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .pagination-button {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}
</style>