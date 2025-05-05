<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import { useToast } from 'primevue/usetoast'
import { appointmentService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'

// Props and emits
interface Props {
  doctorId?: string // Required for patient when booking
  patientId?: string // Required for doctor when booking
  readOnly?: boolean // Whether calendar is read-only
}

const props = withDefaults(defineProps<Props>(), {
  doctorId: '',
  patientId: '',
  readOnly: false
})

const emit = defineEmits(['appointment-created', 'appointment-selected'])

// State
const authStore = useAuthStore()
const toast = useToast()
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const appointments = ref<any[]>([])
const availableTimeSlots = ref<any[]>([])
const selectedTimeSlot = ref<any>(null)
const loading = ref(false)
const bookingDialogVisible = ref(false)

// Role based formatting
const userRole = computed(() => authStore.userRole)

// Current month's appointments
const fetchAppointments = async () => {
  loading.value = true
  
  try {
    const startDate = dayjs(currentDate.value).startOf('month').format('YYYY-MM-DD')
    const endDate = dayjs(currentDate.value).endOf('month').format('YYYY-MM-DD')
    
    // Build params based on role
    const params: any = {
      startDate,
      endDate,
      patientId: authStore.user?.id
    }
    
    const response = await appointmentService.getAll(params)
    appointments.value = response.data.map((appointment: any) => ({
      ...appointment,
      date: new Date(appointment.date)
    }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load appointments',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Fetch available time slots for a specific date
const fetchTimeSlots = async (date: Date) => {
  if (!props.doctorId && userRole.value === 'patient') {
    console.error('Doctor ID is required to fetch time slots')
    return
  }
  
  loading.value = true
  
  try {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    const doctorId = props.doctorId || authStore.user?.id
    
    const response = await appointmentService.getTimeSlots(doctorId, formattedDate)
    
    availableTimeSlots.value = response.data.map((slot: any) => ({
      label: formatTimeSlot(slot.startTime, slot.endTime),
      value: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime
    }))
  } catch (error) {
    console.error('Error fetching time slots:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load available time slots',
      life: 3000
    })
    availableTimeSlots.value = []
  } finally {
    loading.value = false
  }
}

// Format time slot for display
const formatTimeSlot = (startTime: string, endTime: string) => {
  return `${dayjs(startTime).format('h:mm A')} - ${dayjs(endTime).format('h:mm A')}`
}

// Date select handler
const handleDateSelect = (date: Date) => {
  selectedDate.value = date
  
  if (!props.readOnly) {
    fetchTimeSlots(date)
    
    if (userRole.value === 'patient') {
      // For patients, open booking dialog
      bookingDialogVisible.value = true
    }
  }
  
  // Check if the date has appointments
  const dateAppointments = appointments.value.filter(appointment => 
    dayjs(appointment.date).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
  )
  
  if (dateAppointments.length > 0) {
    emit('appointment-selected', dateAppointments)
  }
}

// Handle month change
const handleMonthChange = (event: any) => {
  currentDate.value = event.value
  fetchAppointments()
}

// Book appointment
const bookAppointment = async () => {
  if (!selectedTimeSlot.value) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please select a time slot',
      life: 3000
    })
    return
  }
  
  loading.value = true
  
  try {
    // Prepare appointment data
    const appointmentData = {
      date: dayjs(selectedDate.value).format('YYYY-MM-DD'),
      startTime: selectedTimeSlot.value.startTime,
      endTime: selectedTimeSlot.value.endTime,
      doctorId: props.doctorId || authStore.user?.id,
      patientId: props.patientId || authStore.user?.id,
      status: 'scheduled'
    }
    
    // Create appointment
    const response = await appointmentService.create(appointmentData)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appointment has been booked successfully',
      life: 3000
    })
    
    // Close dialog and reset form
    bookingDialogVisible.value = false
    selectedTimeSlot.value = null
    
    // Refresh appointments
    fetchAppointments()
    
    // Emit event
    emit('appointment-created', response.data)
  } catch (error) {
    console.error('Error booking appointment:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to book appointment. Please try again later.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Date has appointments?
const dateHasAppointments = (date: Date) => {
  return appointments.value.some(appointment => 
    dayjs(appointment.date).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
  )
}

// Calendar template for date cell
const dateTemplate = (date: Date) => {
  const hasAppointments = dateHasAppointments(date);
  const classes = ['calendar-day', hasAppointments ? 'has-appointments' : ''].filter(Boolean).join(' ');

  return `
    <div class="${classes}">
      ${date.getDate()}
      ${hasAppointments ? '<span class="appointment-indicator"></span>' : ''}
    </div>
  `;
};

// Initial setup
onMounted(() => {
  fetchAppointments()
})
</script>

<template>
  <div class="appointment-calendar">
    <div class="calendar-container">
      <Calendar 
        v-model="currentDate" 
        selectionMode="single" 
        :inline="true"
        :showOtherMonths="false"
        :dateTemplate="dateTemplate"
        @date-select="handleDateSelect"
        @month-change="handleMonthChange"
      />
    </div>
    
    <!-- Booking Dialog -->
    <Dialog 
      v-model:visible="bookingDialogVisible" 
      modal 
      header="Book Appointment" 
      :style="{ width: '450px' }"
      :closable="!loading"
    >
      <div class="booking-form">
        <div class="form-group">
          <label>Selected Date</label>
          <div class="selected-date">
            {{ dayjs(selectedDate).format('dddd, MMMM D, YYYY') }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="timeSlot">Available Time Slots</label>
          <Dropdown 
            id="timeSlot"
            v-model="selectedTimeSlot" 
            :options="availableTimeSlots" 
            optionLabel="label" 
            placeholder="Select a time slot"
            :disabled="loading || availableTimeSlots.length === 0"
            class="w-full"
          />
          
          <div v-if="availableTimeSlots.length === 0 && !loading" class="no-slots-message">
            <i class="pi pi-info-circle"></i>
            <span>No available time slots for this date</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="bookingDialogVisible = false" 
          text
          :disabled="loading"
        />
        <Button 
          label="Book Appointment" 
          icon="pi pi-check" 
          @click="bookAppointment" 
          :loading="loading"
          :disabled="!selectedTimeSlot || loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.appointment-calendar {
  .calendar-container {
    background-color: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    
    :deep(.p-datepicker) {
      width: 100%;
      padding: var(--space-3);
      border: none;
      
      .p-datepicker-header {
        padding: var(--space-2) 0;
        margin-bottom: var(--space-2);
        border: none;
        
        .p-datepicker-title {
          .p-datepicker-month,
          .p-datepicker-year {
            font-size: var(--font-md);
            font-weight: 600;
            color: var(--neutral-800);
            margin: 0 var(--space-1);
          }
        }
        
        .p-datepicker-prev,
        .p-datepicker-next {
          color: var(--neutral-600);
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          
          &:hover {
            background-color: var(--neutral-100);
            color: var(--primary);
          }
          
          span {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
          }
        }
      }
      
      .p-datepicker-calendar {
        margin: 0;
        
        th {
          padding: var(--space-1);
          font-weight: 600;
          font-size: var(--font-sm);
          color: var(--neutral-600);
        }
        
        td {
          padding: 2px;
          
          .p-highlight {
            background-color: var(--primary) !important;
            color: white !important;
            
            .appointment-indicator {
              background-color: white;
            }
          }
          
          .p-disabled {
            opacity: 0.5;
          }
          
          > span {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
            
            &:hover {
              background-color: var(--neutral-200);
            }
          }
        }
      }
    }
  }
  
  .calendar-day {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    font-size: var(--font-sm);
    
    .appointment-indicator {
      position: absolute;
      bottom: 2px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--primary);
    }
    
    &.has-appointments {
      font-weight: 600;
      color: var(--primary);
    }
  }
  
  .booking-form {
    margin-top: var(--space-2);
    
    .form-group {
      margin-bottom: var(--space-3);
      
      label {
        display: block;
        font-size: var(--font-sm);
        color: var(--neutral-700);
        margin-bottom: var(--space-1);
        font-weight: 500;
      }
      
      .selected-date {
        font-size: var(--font-md);
        color: var(--neutral-800);
        font-weight: 600;
        background-color: var(--neutral-100);
        padding: var(--space-2);
        border-radius: var(--radius-md);
      }
      
      .no-slots-message {
        margin-top: var(--space-2);
        color: var(--warning);
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-sm);
        
        i {
          font-size: 14px;
        }
      }
    }
  }
}
</style>