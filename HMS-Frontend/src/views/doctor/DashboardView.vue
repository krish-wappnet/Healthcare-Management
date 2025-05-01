<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue';
import { dashboardService, appointmentService, patientService, apiClient } from '../../services/api';
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
  id: string;
  date: string;
  startTime: string;
  patient: {
    name: string;
    avatar?: string;
  };
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

  try {
    const statsResponse = await dashboardService.getDoctorStats();
    stats.value = statsResponse.data;

    const patientsResponse = await patientService.getAll({
      limit: 5,
      sort: 'lastVisit:desc',
    });
    recentPatients.value = patientsResponse.data;

    const today = dayjs().format('YYYY-MM-DD');
    const nextWeek = dayjs().add(7, 'day').format('YYYY-MM-DD');
    const appointmentsResponse = await appointmentService.getAll({
      startDate: today,
      endDate: nextWeek,
      status: 'scheduled',
      limit: 5,
      sort: 'date:asc',
    });
    upcomingAppointments.value = appointmentsResponse.data;

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

// Select a patient
const selectPatient = async (patient: Patient) => {
  if (!patient?.id) return;

  selectedPatient.value = patient;
  loadingPatientData.value = true;

  try {
    const response = await patientService.getHealth(patient.id);
    selectedPatientData.value = response.data;
  } catch (error: any) {
    console.error('Error fetching patient health data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to load patient health data',
      life: 3000,
    });
    selectedPatientData.value = null;
  } finally {
    loadingPatientData.value = false;
  }
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
  await Promise.all([fetchDoctorProfile(), fetchDashboardData()]);
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
          <!-- Recent patients -->
          <Card class="recent-patients">
            <template #header>
              <div class="card-header">
                <h2>Recent Patients</h2>
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
                  v-for="patient in recentPatients"
                  :key="patient.id"
                  class="patient-item"
                  :class="{ active: selectedPatient?.id === patient.id }"
                  @click="selectPatient(patient)"
                >
                  <img
                    :src="patient.avatar || 'https://via.placeholder.com/40'"
                    :alt="`${patient.name}'s avatar`"
                    class="patient-avatar"
                  />
                  <div class="patient-info">
                    <h3 class="patient-name">{{ patient.name }}</h3>
                    <p class="patient-details">
                      <span>{{ patient.age }} years</span>
                      <span class="divider">•</span>
                      <span>{{ patient.gender }}</span>
                    </p>
                  </div>
                  <div class="patient-actions">
                    <Button
                      icon="pi pi-user"
                      rounded
                      text
                      size="small"
                      v-tooltip.bottom="'View patient'"
                      @click.stop="router.push(`/doctor/patients/${patient.id}`)"
                    />
                  </div>
                </div>

                <div v-if="recentPatients.length === 0" class="no-data">
                  <i class="pi pi-users"></i>
                  <p>No recent patients</p>
                </div>
              </div>
            </template>
          </Card>

          <!-- Upcoming appointments -->
          <Card class="upcoming-appointments">
            <template #header>
              <div class="card-header">
                <h2>Upcoming Appointments</h2>
                <Button
                  icon="pi pi-calendar"
                  rounded
                  text
                  aria-label="View all appointments"
                  v-tooltip.bottom="'View all appointments'"
                  @click="router.push('/doctor/appointments')"
                />
              </div>
            </template>

            <template #content>
              <div class="appointments-list">
                <div
                  v-for="appointment in upcomingAppointments"
                  :key="appointment.id"
                  class="appointment-item"
                >
                  <div class="appointment-time">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatAppointmentDate(appointment.date, appointment.startTime) }}</span>
                  </div>
                  <div class="appointment-patient">
                    <img
                      :src="appointment.patient.avatar || 'https://via.placeholder.com/30'"
                      :alt="`${appointment.patient.name}'s avatar`"
                      class="patient-avatar"
                    />
                    <span class="patient-name">{{ appointment.patient.name }}</span>
                  </div>
                  <div class="appointment-actions">
                    <Button
                      icon="pi pi-video"
                      rounded
                      text
                      size="small"
                      aria-label="Start consultation"
                      v-tooltip.bottom="'Start consultation'"
                      @click="router.push(`/doctor/consultations?appointmentId=${appointment.id}`)"
                    />
                  </div>
                </div>

                <div v-if="upcomingAppointments.length === 0" class="no-data">
                  <i class="pi pi-calendar"></i>
                  <p>No upcoming appointments</p>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Right column: Patient health data -->
        <div class="dashboard-right">
          <Card v-if="selectedPatient" class="patient-data">
            <template #header>
              <div class="card-header">
                <h2>Patient Health Data</h2>
                <div class="header-actions">
                  <Button
                    icon="pi pi-file"
                    rounded
                    text
                    aria-label="View medical records"
                    v-tooltip.bottom="'View medical records'"
                    @click="router.push(`/doctor/patients/${selectedPatient.id}`)"
                  />
                  <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    aria-label="Refresh data"
                    v-tooltip.bottom="'Refresh data'"
                    :loading="loadingPatientData"
                    @click="selectPatient(selectedPatient)"
                  />
                </div>
              </div>
            </template>

            <template #content>
              <div v-if="loadingPatientData" class="loading-data">
                <ProgressSpinner />
                <p>Loading patient data...</p>
              </div>

              <div v-else-if="selectedPatientData" class="patient-vitals">
                <VitalSignsChart
                  title="Heart Rate"
                  type="heart-rate"
                  :data="selectedPatientData.heartRate"
                  :height="250"
                >
                  <template #actions>
                    <Button
                      icon="pi pi-calendar"
                      rounded
                      text
                      size="small"
                      aria-label="Change time range"
                      v-tooltip.bottom="'Change time range'"
                    />
                  </template>
                </VitalSignsChart>

                <VitalSignsChart
                  title="Blood Pressure"
                  type="blood-pressure"
                  :data="selectedPatientData.bloodPressure"
                  :height="250"
                >
                  <template #actions>
                    <Button
                      icon="pi pi-calendar"
                      rounded
                      text
                      size="small"
                      aria-label="Change time range"
                      v-tooltip.bottom="'Change time range'"
                    />
                  </template>
                </VitalSignsChart>
              </div>

              <div v-else class="no-data">
                <i class="pi pi-chart-line"></i>
                <p>No health data available for this patient</p>
              </div>
            </template>

            <template v-if="selectedPatientData" #footer>
              <div class="card-footer">
                <Button
                  label="View Full Health Record"
                  icon="pi pi-chart-line"
                  @click="router.push(`/doctor/patients/${selectedPatient.id}?tab=health`)"
                />
              </div>
            </template>
          </Card>

          <Card v-else class="no-patient-selected">
            <template #content>
              <div class="no-data large">
                <i class="pi pi-user"></i>
                <p>Select a patient to view their health data</p>
              </div>
            </template>
          </Card>
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

            .patient-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
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

            .appointment-time {
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
        .patient-data {
          height: 100%;
          border-radius: $radius-lg;

          :deep(.p-card-header) {
            padding: $space-3 $space-3 0;
          }

          :deep(.p-card-content) {
            padding: $space-3;
          }

          :deep(.p-card-footer) {
            padding: $space-3;
            text-align: center;
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

            .header-actions {
              display: flex;
              gap: $space-1;
            }
          }

          .loading-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: $space-4;
            gap: $space-2;

            p {
              color: $neutral-600;
            }
          }

          .patient-vitals {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: $space-3;
          }
        }

        .no-patient-selected {
          height: 100%;
          border-radius: $radius-lg;

          :deep(.p-card-content) {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
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
}

@media (max-width: 1200px) {
  .doctor-dashboard {
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
}

@media (max-width: 768px) {
  .doctor-dashboard {
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
}
</style>