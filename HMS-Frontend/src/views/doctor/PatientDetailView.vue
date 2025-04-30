<template>
  <div class="patient-detail-view">
    <h1 class="dashboard-title">Patient Details</h1>
    
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading patient data...</p>
    </div>
    
    <div v-else-if="patient" class="patient-container">
      <div class="patient-header">
        <div class="patient-info">
          <img 
            :src="patient.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
            :alt="patient.name"
            class="patient-avatar"
          />
          <div class="patient-details">
            <h2>{{ patient.name }}</h2>
            <p class="patient-meta">
              <span>{{ patient.age }} years old</span>
              <span class="separator">•</span>
              <span>{{ patient.gender }}</span>
            </p>
          </div>
        </div>
        
        <div class="action-buttons">
          <Button 
            label="Schedule Appointment" 
            icon="pi pi-calendar-plus"
            class="p-button-outlined"
          />
          <Button 
            label="Start Consultation" 
            icon="pi pi-video"
          />
        </div>
      </div>
      
      <div class="patient-content">
        <TabView>
          <TabPanel header="Health Data">
            <div class="health-data-grid">
              <VitalSignsChart
                title="Heart Rate"
                type="heart-rate"
                :data="healthData.heartRate"
              />
              <VitalSignsChart
                title="Blood Pressure"
                type="blood-pressure"
                :data="healthData.bloodPressure"
              />
              <VitalSignsChart
                title="Temperature"
                type="temperature"
                :data="healthData.temperature"
              />
              <VitalSignsChart
                title="Oxygen Saturation"
                type="oxygen"
                :data="healthData.oxygen"
              />
            </div>
          </TabPanel>
          
          <TabPanel header="Medical History">
            <!-- Medical history content -->
          </TabPanel>
          
          <TabPanel header="Appointments">
            <!-- Appointments history -->
          </TabPanel>
          
          <TabPanel header="Notes">
            <!-- Clinical notes -->
          </TabPanel>
        </TabView>
      </div>
    </div>
    
    <div v-else class="error-container">
      <i class="pi pi-exclamation-circle"></i>
      <h2>Patient Not Found</h2>
      <p>The requested patient information could not be found.</p>
      <Button 
        label="Back to Patients" 
        icon="pi pi-arrow-left"
        @click="$router.push('/doctor/patients')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ProgressSpinner from 'primevue/progressspinner'
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue'
import { patientService } from '../../services/api'

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const patient = ref<any>(null)
const healthData = ref<any>({
  heartRate: [],
  bloodPressure: [],
  temperature: [],
  oxygen: []
})

const fetchPatientData = async () => {
  const patientId = route.params.id as string
  
  try {
    // Fetch patient details
    const patientResponse = await patientService.getById(patientId)
    patient.value = patientResponse.data
    
    // Fetch health data
    const healthResponse = await patientService.getHealth(patientId)
    healthData.value = healthResponse.data
  } catch (error) {
    console.error('Error fetching patient data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load patient data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPatientData()
})
</script>

<style lang="scss" scoped>
.patient-detail-view {
  padding: var(--space-4);
  
  .dashboard-title {
    font-size: var(--font-2xl);
    margin-bottom: var(--space-4);
    color: var(--neutral-800);
  }
  
  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    gap: var(--space-3);
    text-align: center;
    
    i {
      font-size: 48px;
      color: var(--error);
    }
    
    h2 {
      font-size: var(--font-xl);
      color: var(--neutral-800);
    }
    
    p {
      color: var(--neutral-600);
      margin-bottom: var(--space-3);
    }
  }
  
  .patient-container {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    
    .patient-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
      
      .patient-info {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        
        .patient-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .patient-details {
          h2 {
            font-size: var(--font-xl);
            margin: 0 0 var(--space-1);
            color: var(--neutral-800);
          }
          
          .patient-meta {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            color: var(--neutral-600);
            
            .separator {
              color: var(--neutral-400);
            }
          }
        }
      }
      
      .action-buttons {
        display: flex;
        gap: var(--space-2);
      }
    }
    
    .patient-content {
      padding: var(--space-4);
      
      .health-data-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-3);
        
        @media (max-width: 992px) {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>