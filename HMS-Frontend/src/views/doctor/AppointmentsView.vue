<template>
  <div class="appointments-view">
    <h1 class="dashboard-title">Appointments</h1>
    
    <div class="appointments-container">
      <div class="calendar-section">
        <AppointmentCalendar
          @appointment-selected="handleAppointmentSelected"
          @appointment-created="handleAppointmentCreated"
        />
      </div>
      
      <div class="appointments-list">
        <!-- Appointments list will be implemented here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppointmentCalendar from '../../components/calendar/AppointmentCalendar.vue'

const handleAppointmentSelected = (appointments: any[]) => {
  console.log('Selected appointments:', appointments)
}

const handleAppointmentCreated = (appointment: any) => {
  console.log('New appointment created:', appointment)
}
</script>

<style lang="scss" scoped>
.appointments-view {
  padding: var(--space-4);
  
  .dashboard-title {
    font-size: var(--font-2xl);
    margin-bottom: var(--space-4);
    color: var(--neutral-800);
  }
  
  .appointments-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>