<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue';
import HealthDataCard from '../../components/health-data/HealthDataCard.vue';
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
    user: string;
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
const selectedDevice = ref<string>('');
const patients = ref<Patient[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const patientsPerPage = ref(10);
const totalPatients = ref(0);
const healthData = ref<any[]>([]);
const healthDataTotal = ref(0);
const healthDataPage = ref(1);
const healthDataPerPage = ref(10);
const selectedDeviceType = ref<string>('');
const deviceTypes = ref<string[]>([]);

// Computed properties
const isAuthorized = computed(() => {
  return authStore.isAuthenticated && authStore.userRole === 'doctor';
});

const isProfileIncomplete = computed(() => {
  return authStore.userRole === 'doctor' && (!doctorProfile.value || !doctorProfile.value.specialization);
});

const filteredHealthData = computed(() => {
  if (!selectedDeviceType.value) return healthData.value;
  return healthData.value.filter(data => data.deviceType === selectedDeviceType.value);
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
    // Get latest health metrics
    const metricsResponse = await healthDataService.getPatientData(patientId, { page: 1, limit: 5 });
    healthMetrics.value = metricsResponse.data;

    // Get abnormal readings
    const abnormalResponse = await healthDataService.getAbnormalReadings(patientId, { page: 1, limit: 10 });
    abnormalReadings.value = abnormalResponse.data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load health data',
      life: 3000
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
    
    // Extract unique device types
    deviceTypes.value = [...new Set(response.data.data.map(data => data.deviceType))];
    
    // Format health data
    healthData.value = healthData.value.map(data => ({
      ...data,
      timestamp: dayjs(data.timestamp).format('MMM D, YYYY - h:mm A'),
      deviceType: data.deviceType,
      deviceId: data.deviceId,
      isAbnormal: data.isAbnormal,
      abnormalityReason: data.abnormalityReason,
      metrics: data.data
    }));
  } catch (error: any) {
    console.error('Error fetching health data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to load health data',
      life: 3000
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
    // Only fetch health devices data
    await fetchHealthData(patient.id);
  } catch (error) {
    console.error('Error fetching health devices data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load health devices data',
      life: 3000
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
    
    // First check if we got valid data
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    patients.value = response.data.data;
    totalPatients.value = response.data.total || 0;
    totalPages.value = Math.ceil(totalPatients.value / patientsPerPage.value);
    
    // Format patient data with null checks
    patients.value = patients.value.map(patient => {
      // Handle undefined or null values
      const user = patient.user || {};
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const dateOfBirth = patient.dateOfBirth || '';
      const gender = patient.gender || '';
      const profilePicture = user.profilePicture || 'https://via.placeholder.com/40';
      
      return {
        id: patient._id || '',
        name: `${firstName} ${lastName}`.trim() || 'Unknown Patient',
        age: dateOfBirth ? dayjs().diff(dateOfBirth, 'year') : 0,
        gender: gender || 'Unknown',
        avatar: profilePicture
      };
    });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    
    // Handle different types of errors
    const errorMessage = error.response?.data?.message || 
      error.message || 
      'Failed to load patients';
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 3000
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
  return dayjs(`${date}T${time}`).format('MMM D, YYYY - h:mm A');
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
  
  // Check if profile exists
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

// Format date
const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY');
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
    <div class="dashboard-header">
      <h1 class="dashboard-title">Doctor Dashboard</h1>
      <div class="header-actions">
        <Button
          v-if="isProfileIncomplete && !loadingProfile"
          label="Complete Your Profile"
          icon="pi pi-user-edit"
          class="profile-button"
          v-tooltip.bottom="'Complete your doctor profile'"
          @click="goToDoctorRegistration"
        />
        <Button
          icon="pi pi-user"
          rounded
          text
          aria-label="View profile"
          v-tooltip.bottom="'View your profile'"
          @click="goToDoctorProfile"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading dashboard data...</p>
    </div>

    <!-- Dashboard content -->
    <div v-else class="dashboard-content">
      <!-- Stats overview -->
      <div class="stats-container">
        <Card class="stat-card">
          <template #content>
            <div class="stat-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalPatients }}</h3>
              <p>Total Patients</p>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-icon">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.todayAppointments }}</h3>
              <p>Today's Appointments</p>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-icon">
              <i class="pi pi-video"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.pendingConsultations }}</h3>
              <p>Pending Consultations</p>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-info">
              <h3>{{ stats.completedAppointmentsThisWeek }}</h3>
              <p>Completed This Week</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Main dashboard content -->
      <div class="dashboard-grid">
        <!-- Left column: Patients & Appointments -->
        <div class="dashboard-left">
          <!-- Patient selection section -->
          <Card class="patient-selection">
            <template #header>
              <div class="card-header">
                <h2>Select a Patient</h2>
                <Button
                  icon="pi pi-users"
                  rounded
                  text
                  aria-label="View all patients"
                  v-tooltip.bottom="'View all patients'"
                  @click="router.push('/doctor/patients')"
                />
              </div>
            </template>

            <template #content>
              <div class="patients-list">
                <div
                  v-for="patient in patients"
                  :key="patient.id"
                  class="patient-item"
                  :class="{ active: selectedPatient?.id === patient.id }"
                  @click="selectPatient(patient)"
                >
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

              <!-- Pagination -->
              <div class="pagination" v-if="totalPages > 1">
                <Button
                  icon="pi pi-angle-left"
                  @click="previousPage"
                  :disabled="currentPage === 1"
                />
                <Button
                  v-for="page in totalPages"
                  :key="page"
                  :label="page"
                  @click="goToPage(page)"
                  :class="{ 'p-button-active': currentPage === page }"
                />
                <Button
                  icon="pi pi-angle-right"
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                />
              </div>
            </template>
          </Card>

          <!-- Upcoming appointments -->
          <Card class="upcoming-appointments">
            <template #title>
              <div class="card-header">
                <h5>Upcoming Appointments</h5>
                <Button
                  label="View All"
                  icon="pi pi-external-link"
                  text
                  @click="viewAllAppointments"
                />
              </div>
            </template>

            <template #content>
              <div class="appointments-container">
                <div v-if="loading" class="loading-state">
                  <ProgressSpinner />
                  <p>Loading appointments...</p>
                </div>

                <div v-else-if="error" class="error-state">
                  <p>{{ error }}</p>
                </div>

                <div v-else class="appointments-list">
                  <div
                    v-if="upcomingAppointments.length === 0"
                    class="no-appointments"
                  >
                    <i class="pi pi-calendar-times"></i>
                    <p>No upcoming appointments</p>
                  </div>

                  <div
                    v-for="appointment in upcomingAppointments"
                    :key="appointment._id"
                    class="appointment-item"
                  >
                    <div class="appointment-date">{{ formatDate(appointment.date) }}</div>
                    <div class="appointment-type">{{ appointment.type }}</div>
                    <Button
                      label="Details"
                      icon="pi pi-arrow-right"
                      text
                      @click="router.push(`/doctor/appointments/${appointment._id}`)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>

        </div>

        <!-- Right column: Patient health data -->
        <div class="dashboard-right">
          <Card v-if="selectedPatient" class="health-data">
            <template #header>
              <div class="health-data-header">
                <h2>{{ selectedPatient.name }}'s Health Data</h2>
                <div class="device-filter" v-if="deviceTypes.length > 0">
                  <label for="deviceType">Filter by Device:</label>
                  <Dropdown
                    id="deviceType"
                    v-model="selectedDeviceType"
                    :options="deviceTypes"
                    placeholder="All Devices"
                    class="device-type-dropdown"
                  />
                </div>
              </div>
            </template>

            <template #content>
              <div class="health-data-content">
                <div v-if="loadingPatientData" class="loading-state">
                  <ProgressSpinner />
                  <p>Loading health data...</p>
                </div>

                <div v-else-if="!filteredHealthData.length" class="no-data">
                  <i class="pi pi-heart"></i>
                  <p>No health data available</p>
                </div>

                <div v-else class="health-data-container">
                  <div class="health-data-list">
                    <div v-for="data in filteredHealthData" :key="data._id" class="health-data-item">
                      <div class="data-header">
                        <h3>{{ data.deviceType }}</h3>
                        <span class="timestamp">{{ data.timestamp }}</span>
                      </div>

                      <div class="metrics-grid">
                        <div v-for="(value, metric) in data.metrics" :key="metric" class="metric-item">
                          <span class="metric-label">{{ metric.replace(/([A-Z])/g, ' $1').trim() }}:</span>
                          <span class="metric-value" :class="{ 'abnormal': data.isAbnormal }">{{ value }}</span>
                        </div>
                      </div>

                      <div v-if="data.isAbnormal" class="abnormal-alert">
                        <i class="pi pi-exclamation-triangle"></i>
                        <span>{{ data.abnormalityReason || 'Abnormal reading detected' }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="healthDataTotal > healthDataPerPage" class="health-data-pagination">
                    <Button
                      icon="pi pi-angle-left"
                      @click="() => fetchHealthData(selectedPatient.id, healthDataPage - 1)"
                      :disabled="healthDataPage === 1"
                    />
                    <Button
                      v-for="page in Math.ceil(healthDataTotal / healthDataPerPage)"
                      :key="page"
                      :label="page"
                      @click="() => fetchHealthData(selectedPatient.id, page)"
                      :class="{ 'p-button-active': healthDataPage === page }"
                    />
                    <Button
                      icon="pi pi-angle-right"
                      @click="() => fetchHealthData(selectedPatient.id, healthDataPage + 1)"
                      :disabled="healthDataPage === Math.ceil(healthDataTotal / healthDataPerPage)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <div v-else class="no-selection">
            <i class="pi pi-user-plus"></i>
            <p>Select a patient to view their health data</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$primary: #9b87f5;
$primary-light: rgba(155, 135, 245, 0.1);
$primary-dark: #7e69ab;
$neutral-100: #f7fafc;
$neutral-500: #a0aec0;
$neutral-600: #718096;
$neutral-800: #2d3748;
$radius-md: 8px;
$radius-lg: 12px;
$space-1: 0.25rem;
$space-2: 0.5rem;
$space-3: 1rem;
$space-4: 1.5rem;
$space-6: 3rem;
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$transition-fast: 0.2s ease;
$transition-normal: 0.3s ease;
$font-sm: 0.875rem;
$font-md: 1rem;
$font-lg: 1.125rem;
$font-2xl: 1.5rem;

.doctor-dashboard {
  padding: $space-4;
  background-color: $neutral-100;

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;

    .dashboard-title {
      font-size: $font-2xl;
      margin: 0;
      color: $neutral-800;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: $space-2;

      .profile-button {
        background-color: $primary;
        border-color: $primary;
        color: white;
        border-radius: $radius-md;
        padding: $space-2 $space-3;
        font-size: $font-md;
        transition: background-color $transition-fast;

        &:hover {
          background-color: $primary-dark;
        }
      }
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-6;
    gap: $space-3;

    p {
      color: $neutral-600;
      font-size: $font-lg;
    }
  }

  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: $space-4;

    .stats-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: $space-3;

      .stat-card {
        border-radius: $radius-lg;
        transition: transform $transition-normal, box-shadow $transition-normal;

        &:hover {
          transform: translateY(-3px);
          box-shadow: $shadow-lg;
        }

        :deep(.p-card-content) {
          padding: $space-3;
          display: flex;
          align-items: center;
          gap: $space-3;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background-color: $primary-light;
          border-radius: 12px;

          i {
            font-size: 24px;
            color: $primary;
          }
        }

        .stat-info {
          h3 {
            font-size: $font-2xl;
            margin: 0 0 $space-1;
            color: $neutral-800;
          }

          p {
            font-size: $font-sm;
            margin: 0;
            color: $neutral-600;
          }
        }
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: $space-3;

      .dashboard-left {
        display: flex;
        flex-direction: column;
        gap: $space-3;

        .recent-patients,
        .upcoming-appointments {
          border-radius: $radius-lg;

          :deep(.p-card-header) {
            padding: $space-3 $space-3 0;
          }

          :deep(.p-card-content) {
            padding: $space-3;
          }

          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            h2 {
              font-size: $font-lg;
              margin: 0;
              color: $neutral-800;
            }
          }
        }

        .patients-list {
          display: flex;
          flex-direction: column;
          gap: $space-2;

          .patient-item {
            display: flex;
            align-items: center;
            gap: $space-2;
            padding: $space-2;
            border-radius: $radius-md;
            cursor: pointer;
            transition: background-color $transition-fast;

            &:hover {
              background-color: $neutral-100;
            }

            &.active {
              background-color: $primary-light;

              .patient-name {
                color: $primary-dark;
              }
            }

            .patient-info {
              flex: 1;

              .patient-name {
                font-size: $font-md;
                font-weight: 600;
                margin: 0 0 $space-1;
                color: $neutral-800;
              }

              .patient-details {
                display: flex;
                align-items: center;
                gap: $space-1;
                font-size: $font-sm;
                color: $neutral-600;
                margin: 0;

                .divider {
                  font-size: 10px;
                }
              }
            }

            .patient-actions {
              display: flex;
              gap: $space-1;
            }
          }
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: $space-2;

          .appointment-item {
            padding: $space-2;
            border-radius: $radius-md;
            background-color: $neutral-100;

            .appointment-date {
              display: flex;
              align-items: center;
              gap: $space-1;
              font-size: $font-sm;
              color: $neutral-600;
              margin-bottom: $space-1;

              i {
                font-size: 14px;
              }
            }

            .appointment-patient {
              display: flex;
              align-items: center;
              gap: $space-2;
              margin-bottom: $space-1;

              .patient-avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                object-fit: cover;
              }

              .patient-name {
                font-size: $font-md;
                font-weight: 500;
                color: $neutral-800;
              }
            }

            .appointment-actions {
              display: flex;
              justify-content: flex-end;
            }
          }
        }
      }

      .dashboard-right {
        height: calc(100vh - 200px);
        overflow-y: auto;

        .health-data {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .health-data-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .health-data-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .health-data-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .health-data-item {
          background: var(--surface-card);
          border-radius: 8px;
          padding: 1rem;
          box-shadow: var(--shadow-1);
        }

        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .timestamp {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .metric-value {
          font-weight: 600;
          font-size: 1rem;
        }

        .metric-value.abnormal {
          color: var(--red-500);
        }

        .abnormal-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.5rem;
          background: var(--red-50);
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .health-data-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--surface-border);
        }

        .no-selection {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .no-selection i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .loading-state {
          text-align: center;
          padding: 2rem;
        }

        .health-data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .device-filter {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .device-type-dropdown {
          width: 200px;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .no-data i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
      }
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-4;
    color: $neutral-500;

    i {
      font-size: 24px;
      margin-bottom: $space-2;
    }

    p {
      margin: 0;
      text-align: center;
    }

    &.large {
      padding: $space-6;

      i {
        font-size: 32px;
      }

      p {
        font-size: $font-lg;
      }
    }
  }

  .upcoming-appointments {
    margin: 1rem 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 8px;
    background: var(--surface-100);
    transition: background-color 0.2s;
  }

  .appointment-item:hover {
    background: var(--surface-200);
  }

  .appointment-date {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
  }

  .appointment-type {
    flex: 1;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
  }

  :deep(.p-button-text) {
    color: var(--primary-color);
    font-size: 0.85rem;
    padding: 0.3rem 0.8rem;
  }

  :deep(.p-button-text:hover) {
    background: rgba(155, 135, 245, 0.1);
  }

  .loading-state,
  .error-state,
  .no-appointments {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    color: var(--text-color-secondary);
  }

  .loading-state p,
  .error-state p,
  .no-appointments p {
    font-size: 0.9rem;
    margin: 0;
  }

  .no-appointments i {
    font-size: 2rem;
    color: var(--text-color-secondary);
  }

  @media (max-width: 1200px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $space-2;

      .header-actions {
        align-self: flex-end;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
    }

    .stats-container {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;

      .dashboard-right {
        .patient-data {
          .patient-vitals {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: $space-3;

    .stats-container {
      grid-template-columns: 1fr;
    }

    .dashboard-title {
      font-size: $font-lg;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;

      .profile-button {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .health-data-content {
    padding: 1rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .device-selector {
    margin: 1rem 0;
    select {
      padding: 0.5rem;
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-sm);
      width: 200px;
    }
  }

  .device-data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .abnormal-section {
    background: #fff8f8;
    padding: 1rem;
    border-radius: var(--radius-lg);
    margin-top: 1rem;
  }

  .abnormal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .reason {
    color: var(--error);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .patient-selection {
    height: 400px;  /* Fixed height for the card */
    overflow-y: auto;  /* Enable scrolling */
    
    .patients-list {
      padding: $space-3;
      
      .patient-item {
        display: flex;
        align-items: center;
        padding: $space-2;
        margin-bottom: $space-2;
        border-radius: $radius-md;
        cursor: pointer;
        transition: background-color $transition-normal;
        
        &:hover {
          background-color: $primary-light;
        }
        
        &.active {
          background-color: $primary;
          color: white;
        }
        
        .patient-info {
          flex: 1;
          
          .patient-name {
            margin: 0;
            font-size: $font-md;
            font-weight: 600;
          }
          
          .patient-details {
            margin: 0;
            font-size: $font-sm;
            color: $neutral-600;
            
            .divider {
              margin: 0 $space-2;
            }
          }
        }
      }
      
      .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: $space-4;
        
        i {
          font-size: 3rem;
          color: $neutral-500;
          margin-bottom: $space-3;
        }
        
        p {
          margin: 0;
          color: $neutral-600;
        }
      }
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: $space-3;
      
      button {
        margin: 0 $space-1;
        
        &:first-child,
        &:last-child {
          width: 32px;
          height: 32px;
        }
        
        &.p-button-active {
          background-color: $primary;
          color: white;
        }
      }
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-4;
    color: $neutral-500;

    i {
      font-size: 24px;
      margin-bottom: $space-2;
    }

    p {
      margin: 0;
      text-align: center;
    }

    &.large {
      padding: $space-6;

      i {
        font-size: 32px;
      }

      p {
        font-size: $font-lg;
      }
    }
  }

  .upcoming-appointments {
    margin: 1rem 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 8px;
    background: var(--surface-100);
    transition: background-color 0.2s;
  }

  .appointment-item:hover {
    background: var(--surface-200);
  }

  .appointment-date {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
  }

  .appointment-type {
    flex: 1;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
  }

  :deep(.p-button-text) {
    color: var(--primary-color);
    font-size: 0.85rem;
    padding: 0.3rem 0.8rem;
  }

  :deep(.p-button-text:hover) {
    background: rgba(155, 135, 245, 0.1);
  }

  .loading-state,
  .error-state,
  .no-appointments {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    color: var(--text-color-secondary);
  }

  .loading-state p,
  .error-state p,
  .no-appointments p {
    font-size: 0.9rem;
    margin: 0;
  }

  .no-appointments i {
    font-size: 2rem;
    color: var(--text-color-secondary);
  }

  @media (max-width: 1200px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $space-2;

      .header-actions {
        align-self: flex-end;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
    }

    .stats-container {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;

      .dashboard-right {
        .patient-data {
          .patient-vitals {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: $space-3;

    .stats-container {
      grid-template-columns: 1fr;
    }

    .dashboard-title {
      font-size: $font-lg;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;

      .profile-button {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .health-data-content {
    padding: 1rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .device-selector {
    margin: 1rem 0;
    select {
      padding: 0.5rem;
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-sm);
      width: 200px;
    }
  }

  .device-data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .abnormal-section {
    background: #fff8f8;
    padding: 1rem;
    border-radius: var(--radius-lg);
    margin-top: 1rem;
  }

  .abnormal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .reason {
    color: var(--error);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .patient-selection {
    margin-bottom: 2rem;
  }

  .patients-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .patient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .patient-item:hover {
    background-color: var(--surface-hover);
  }

  .patient-item.active {
    background-color: var(--surface-ground);
  }

  .patient-info {
    flex: 1;
  }

  .patient-name {
    margin: 0;
    font-size: 1rem;
  }

  .patient-details {
    margin: 0.25rem 0 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .divider {
    margin: 0 0.5rem;
    color: var(--text-secondary);
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .no-selection {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }

  .no-selection i {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
}

.health-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-filter {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.device-type-dropdown {
  width: 200px;
}

.health-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.health-data-item {
  background: var(--surface-card);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--shadow-1);
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.timestamp {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.metric-value {
  font-weight: 600;
}

.metric-value.abnormal {
  color: var(--red-500);
}

.abnormal-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: var(--red-50);
  border-radius: 4px;
}

.health-data-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.no-selection {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-selection i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}
</style>