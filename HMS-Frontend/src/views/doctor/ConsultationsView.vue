<template>
  <div class="consultations-view">
    <h1 class="dashboard-title">Video Consultations</h1>
    
    <div class="consultations-container">
      <div v-if="activeConsultation" class="video-section">
        <VideoConsultation
          :consultation-id="activeConsultation.id"
          :doctor-name="activeConsultation.doctorName"
          :patient-name="activeConsultation.patientName"
          role="doctor"
          @end-call="handleEndCall"
        />
      </div>
      
      <div v-else class="no-active-consultation">
        <i class="pi pi-video"></i>
        <h2>No Active Consultation</h2>
        <p>Select a scheduled consultation to begin</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VideoConsultation from '../../components/video/VideoConsultation.vue'

const activeConsultation = ref<any>(null)

const handleEndCall = () => {
  activeConsultation.value = null
}
</script>

<style lang="scss" scoped>
.consultations-view {
  padding: var(--space-4);
  
  .dashboard-title {
    font-size: var(--font-2xl);
    margin-bottom: var(--space-4);
    color: var(--neutral-800);
  }
  
  .consultations-container {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    min-height: 600px;
  }
  
  .no-active-consultation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: var(--space-6);
    color: var(--neutral-500);
    
    i {
      font-size: 48px;
      margin-bottom: var(--space-3);
    }
    
    h2 {
      font-size: var(--font-xl);
      margin-bottom: var(--space-2);
    }
    
    p {
      font-size: var(--font-md);
    }
  }
}
</style>