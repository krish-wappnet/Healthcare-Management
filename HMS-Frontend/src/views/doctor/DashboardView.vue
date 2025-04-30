<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardService, appointmentService, patientService } from '../../services/api'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue'
import dayjs from 'dayjs'

// State
const toast = useToast()
const loading = ref(true)
const stats = ref({
  totalPatients: 0,
  todayAppointments: 0,
  pendingConsultations: 0,
  completedAppointmentsThisWeek: 0
})
const recentPatients = ref<any[]>([])
const upcomingAppointments = ref<any[]>([])
const selectedPatient = ref<any>(null)
const selectedPatientData = ref<any>(null)
const loadingPatientData = ref(false)

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    // Fetch dashboard stats
    const statsResponse = await dashboardService.getDoctorStats()
    stats.value = statsResponse.data
    
    // Fetch recent patients
    const patientsResponse = await patientService.getAll({ limit: 5, sort: 'lastVisit:desc' })
    recentPatients.value = patientsResponse.data
    
    // Fetch upcoming appointments
    const today = dayjs().format('YYYY-MM-DD')
    const nextWeek = dayjs().add(7, 'day').format('YYYY-MM-DD')
    
    const appointmentsResponse = await appointmentService.getAll({
      startDate: today,
      endDate: nextWeek,
      status: 'scheduled',
      limit: 5,
      sort: 'date:asc'
    })
    
    upcomingAppointments.value = appointmentsResponse.data
    
    // If there are patients, select the first one by default
    if (recentPatients.value.length > 0) {
      selectPatient(recentPatients.value[0])
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dashboard data. Please try again.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Select a patient to view their data
const selectPatient = async (patient: any) => {
  selectedPatient.value = patient
  loadingPatientData.value = true
  
  try {
    // Fetch patient health data
    const response = await patientService.getHealth(patient.id)
    selectedPatientData.value = response.data
  } catch (error) {
    console.error('Error fetching patient health data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load patient health data',
      life: 3000
    })
    selectedPatientData.value = null
  } finally {
    loadingPatientData.value = false
  }
}

// Format appointment date
const formatAppointmentDate = (date: string, time: string) => {
  return dayjs(`${date}T${time}`).format('MMM D, YYYY - h:mm A')
}

// Initial data load
onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="doctor-dashboard">
    <h1 class="dashboard-title">Doctor Dashboard</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading dashboard data...</p>
    </div>
    
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
        <!-- Left column: Patient list & Appointments -->
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
                  tooltip="View all patients"
                  tooltipOptions={{ position: 'bottom' }}
                  @click="$router.push('/doctor/patients')"
                />
              </div>
            </template>
            
            <template #content>
              <div class="patients-list">
                <div
                  v-for="patient in recentPatients"
                  :key="patient.id"
                  class="patient-item"
                  :class="{ active: selectedPatient && selectedPatient.id === patient.id }"
                  @click="selectPatient(patient)"
                >
                  <img
                    :src="patient.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'"
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
                      @click.stop="$router.push(`/doctor/patients/${patient.id}`)"
                      tooltip="View patient"
                      tooltipOptions={{ position: 'bottom' }}
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
                  tooltip="View all appointments"
                  tooltipOptions={{ position: 'bottom' }}
                  @click="$router.push('/doctor/appointments')"
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
                      :src="appointment.patient.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'"
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
                      tooltip="Start consultation"
                      tooltipOptions={{ position: 'bottom' }}
                      @click="$router.push(`/doctor/consultations?appointmentId=${appointment.id}`)"
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
        
        <!-- Right column: Patient data and charts -->
        <div class="dashboard-right">
          <!-- Selected patient information -->
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
                    tooltip="View medical records"
                    tooltipOptions={{ position: 'bottom' }}
                    @click="$router.push(`/doctor/patients/${selectedPatient.id}`)"
                  />
                  <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    aria-label="Refresh data"
                    tooltip="Refresh data"
                    tooltipOptions={{ position: 'bottom' }}
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
                <!-- Heart rate chart -->
                <VitalSignsChart
                  title="Heart Rate"
                  type="heart-rate"
                  :data="selectedPatientData.heartRate"
                  height="250"
                >
                  <template #actions>
                    <Button
                      icon="pi pi-calendar"
                      rounded
                      text
                      size="small"
                      aria-label="Change time range"
                      tooltip="Change time range"
                      tooltipOptions={{ position: 'bottom' }}
                    />
                  </template>
                </VitalSignsChart>
                
                <!-- Blood pressure chart -->
                <VitalSignsChart
                  title="Blood Pressure"
                  type="blood-pressure"
                  :data="selectedPatientData.bloodPressure"
                  height="250"
                >
                  <template #actions>
                    <Button
                      icon="pi pi-calendar"
                      rounded
                      text
                      size="small"
                      aria-label="Change time range"
                      tooltip="Change time range"
                      tooltipOptions={{ position: 'bottom' }}
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
                  @click="$router.push(`/doctor/patients/${selectedPatient.id}?tab=health`)"
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
.doctor-dashboard {
  .dashboard-title {
    font-size: var(--font-2xl);
    margin-bottom: var(--space-4);
    color: var(--neutral-800);
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
    
    .stats-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);
      
      .stat-card {
        border-radius: var(--radius-lg);
        transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        
        :deep(.p-card-content) {
          padding: var(--space-3);
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background-color: var(--primary-light);
          border-radius: 12px;
          
          i {
            font-size: 24px;
            color: var(--primary);
          }
        }
        
        .stat-info {
          h3 {
            font-size: var(--font-2xl);
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
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-3);
      
      .dashboard-left {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        
        .recent-patients,
        .upcoming-appointments {
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
        
        .patients-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          
          .patient-item {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-2);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: background-color var(--transition-fast);
            
            &:hover {
              background-color: var(--neutral-100);
            }
            
            &.active {
              background-color: var(--primary-light);
              
              .patient-name {
                color: var(--primary-dark);
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
                font-size: var(--font-md);
                font-weight: 600;
                margin: 0 0 var(--space-1);
                color: var(--neutral-800);
              }
              
              .patient-details {
                display: flex;
                align-items: center;
                gap: var(--space-1);
                font-size: var(--font-sm);
                color: var(--neutral-600);
                margin: 0;
                
                .divider {
                  font-size: 10px;
                }
              }
            }
          }
        }
        
        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          
          .appointment-item {
            padding: var(--space-2);
            border-radius: var(--radius-md);
            background-color: var(--neutral-100);
            
            .appointment-time {
              display: flex;
              align-items: center;
              gap: var(--space-1);
              font-size: var(--font-sm);
              color: var(--neutral-600);
              margin-bottom: var(--space-1);
              
              i {
                font-size: 14px;
              }
            }
            
            .appointment-patient {
              display: flex;
              align-items: center;
              gap: var(--space-2);
              margin-bottom: var(--space-1);
              
              .patient-avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                object-fit: cover;
              }
              
              .patient-name {
                font-size: var(--font-md);
                font-weight: 500;
                color: var(--neutral-800);
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
          border-radius: var(--radius-lg);
          
          :deep(.p-card-header) {
            padding: var(--space-3);
            padding-bottom: 0;
          }
          
          :deep(.p-card-content) {
            padding: var(--space-3);
          }
          
          :deep(.p-card-footer) {
            padding: var(--space-3);
            text-align: center;
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
            
            .header-actions {
              display: flex;
              gap: var(--space-1);
            }
          }
          
          .loading-data {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--space-4);
            gap: var(--space-2);
            
            p {
              color: var(--neutral-600);
            }
          }
          
          .patient-vitals {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-3);
          }
        }
        
        .no-patient-selected {
          height: 100%;
          border-radius: var(--radius-lg);
          
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
    padding: var(--space-4);
    color: var(--neutral-500);
    
    i {
      font-size: 24px;
      margin-bottom: var(--space-2);
    }
    
    p {
      margin: 0;
      text-align: center;
    }
    
    &.large {
      padding: var(--space-6);
      
      i {
        font-size: 32px;
      }
      
      p {
        font-size: var(--font-lg);
      }
    }
  }
}

// Responsive styles
@media (max-width: 1200px) {
  .doctor-dashboard {
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
    .stats-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>