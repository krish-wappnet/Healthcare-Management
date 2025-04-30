
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { patientService, healthDataService, appointmentService } from '../../services/api';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import HealthDataCard from '../../components/patient/HealthDataCard.vue';
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue';
import AppointmentCalendar from '../../components/calendar/AppointmentCalendar.vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

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

interface TooltipOptions {
  position: 'top' | 'bottom' | 'left' | 'right';
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

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    // Fetch patient profile (assumed to include stats or used as a base)
    const profileResponse = await patientService.getCurrentProfile();
    // If profile includes stats, use them; otherwise, fetch appointments
    const appointmentsResponse = await appointmentService.getAll({
      startDate: dayjs().startOf('year').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('year').format('YYYY-MM-DD'),
      status: 'all',
      limit: 100,
      sort: 'date:desc',
    });
    const appointments = appointmentsResponse.data || [];
    stats.value = {
      totalAppointments: appointments.length,
      completedConsultations: appointments.filter((a: any) => a.status === 'completed').length,
      upcomingAppointments: appointments.filter((a: any) => a.status === 'scheduled').length,
      lastCheckup: appointments.find((a: any) => a.status === 'completed')?.date || null,
    };

    // Fetch latest health data readings
    const patientId = authStore.user?.id || '';
    const healthResponse = await healthDataService.getLatestReadings(patientId);
    healthData.value = healthResponse.data;

    // Fetch upcoming appointment (most immediate one)
    if (stats.value.upcomingAppointments > 0) {
      const today = dayjs().format('YYYY-MM-DD');
      const nextMonth = dayjs().add(1, 'month').format('YYYY-MM-DD');

      const upcomingResponse = await appointmentService.getAll({
        startDate: today,
        endDate: nextMonth,
        status: 'scheduled',
        limit: 1,
        sort: 'date:asc',
      });

      if (upcomingResponse.data?.length > 0) {
        upcomingAppointment.value = upcomingResponse.data[0];
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dashboard data. Please try again.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMMM D, YYYY');
};

// Format time
const formatTime = (timeString: string) => {
  return dayjs(`2000-01-01T${timeString}`).format('h:mm A');
};

// Handle appointment selected
const handleAppointmentSelected = (appointments: any[]) => {
  console.log('Selected appointments:', appointments);
};

// Book new appointment
const bookNewAppointment = () => {
  router.push('/patient/appointments');
};

// Initial data load
onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="patient-dashboard">
    <h1 class="dashboard-title">Patient Dashboard</h1>

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

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading your health data...</p>
    </div>

    <div v-else class="dashboard-content">
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
  </div>
</template>

<style lang="scss" scoped>
.patient-dashboard {
  .dashboard-title {
    font-size: var(--font-2xl);
    margin-bottom: var(--space-3);
    color: var(--neutral-800);
  }

  .welcome-banner {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-3);
    margin-bottom: var(--space-4);

    .welcome-content {
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      color: white;

      h2 {
        font-size: var(--font-xl);
        margin: 0 0 var(--space-1);
      }

      p {
        margin: 0;
        opacity: 0.9;
      }
    }

    .appointment-alert {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background-color: white;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);

      i {
        font-size: 24px;
        color: var(--primary);
        background-color: var(--primary-light);
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .alert-content {
        flex: 1;

        p {
          margin: 0 0 var(--space-1);
          color: var(--neutral-600);
        }

        strong {
          font-size: var(--font-lg);
          color: var(--neutral-800);
        }
      }

      &.no-appointment {
        i {
          color: var(--secondary);
          background-color: var(--secondary-light);
        }
      }
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    gap: var(--space-3);

    p {
      color: var(--neutral-600);
      font-size: var(--font-lg);
    }
  }

  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);

    .health-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: var(--space-3);

      .dashboard-left {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);

        .health-chart-card,
        .health-tips-card {
          border-radius: var(--radius-lg);

          :deep(.p-card-header) {
            padding: var(--space-3);
            padding-bottom: 0;
          }

          :deep(.p-card-content) {
            padding: var(--space-3);
          }

          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            h2 {
              font-size: var(--font-lg);
              margin: 0;
              color: var(--neutral-800);
            }
          }

          .chart-container {
            height: 100%;
          }

          .tips-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-3);

            .tip-item {
              display: flex;
              gap: var(--space-3);
              padding: var(--space-2);
              background-color: var(--neutral-100);
              border-radius: var(--radius-md);

              .tip-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background-color: var(--primary-light);
                border-radius: 50%;

                i {
                  font-size: 18px;
                  color: var(--primary);
                }
              }

              .tip-content {
                h3 {
                  font-size: var(--font-md);
                  margin: 0 0 var(--space-1);
                  color: var(--neutral-800);
                }

                p {
                  font-size: var(--font-sm);
                  margin: 0;
                  color: var(--neutral-600);
                }
              }
            }
          }
        }
      }

      .dashboard-right {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);

        .calendar-card,
        .activity-card {
          border-radius: var(--radius-lg);

          :deep(.p-card-header) {
            padding: var(--space-3);
            padding-bottom: 0;
          }

          :deep(.p-card-content) {
            padding: var(--space-3);
          }

          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            h2 {
              font-size: var(--font-lg);
              margin: 0;
              color: var(--neutral-800);
            }
          }
        }

        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);

          .timeline-item {
            display: flex;
            gap: var(--space-2);

            .timeline-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              background-color: var(--neutral-100);
              border-radius: 50%;

              i {
                font-size: 16px;
                color: var(--primary);
              }
            }

            .timeline-content {
              h3 {
                font-size: var(--font-md);
                margin: 0 0 var(--space-1);
                color: var(--neutral-800);
              }

              p {
                font-size: var(--font-sm);
                margin: 0 0 var(--space-1);
                color: var(--neutral-700);
              }

              .timeline-date {
                font-size: var(--font-xs);
                color: var(--neutral-500);
              }
            }
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
    padding: var(--space-4);
    gap: var(--space-2);
    color: var(--neutral-500);

    i {
      font-size: 32px;
      margin-bottom: var(--space-1);
    }

    p {
      margin: 0 0 var(--space-2);
      text-align: center;
    }
  }
}

// Responsive styles
@media (max-width: 1200px) {
  .patient-dashboard {
    .welcome-banner {
      grid-template-columns: 1fr;
    }

    .health-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .patient-dashboard {
    .health-stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
