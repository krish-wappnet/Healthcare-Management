<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dropdown from 'primevue/dropdown';
import Paginator from 'primevue/paginator';
import Chip from 'primevue/chip';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';

// Interface for appointment data
interface Doctor {
  _id: string;
  user: string;
  specialization: string;
  qualifications: string[];
  licenseNumber: string;
  experience: number;
  bio: string;
  officeAddress: string;
  officePhone: string;
  consultationFee: number;
  isAvailableForAppointments: boolean;
  workingHours: { _id: string };
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  _id: string;
  patient: string;
  doctor: Doctor;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  reasonForVisit: string;
  notes: string;
  symptoms: string[];
  isPaid: boolean;
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const appointments = ref<Appointment[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const patientId = ref<string | null>(null);
const doctorsMap = ref(new Map<string, { firstName: string; lastName: string }>());
const totalRecords = ref(0);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const statusFilter = ref<string | null>(null);

// Filter options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// Fetch patient ID
const fetchPatientId = async () => {
  try {
    const response = await apiClient.get('/patients/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (response.data && response.data._id) {
      patientId.value = response.data._id;
      console.log('Fetched patient ID:', patientId.value);
    } else {
      throw new Error('Invalid patient profile response');
    }
  } catch (error) {
    console.error('Error fetching patient ID:', error);
    error.value = error.response?.data?.message || 'Failed to fetch patient ID';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000,
    });
  }
};

// Fetch doctor details
const fetchDoctorDetails = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    if (response.data && response.data.firstName && response.data.lastName) {
      doctorsMap.value.set(userId, {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
      });
    }
  } catch (error) {
    console.error('Error fetching doctor details:', error);
  }
};

// Fetch appointments
const fetchAppointments = async (page: number = 1) => {
  try {
    if (!patientId.value) {
      throw new Error('Patient ID not found');
    }

    loading.value = true;
    error.value = null;

    const response = await apiClient.get<ApiResponse>(
      `/appointments/patient/${patientId.value}?page=${page}&limit=${rowsPerPage.value}${
        statusFilter.value ? `&status=${statusFilter.value}` : ''
      }`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` },
      }
    );

    // Fetch doctor details for each appointment
    for (const appointment of response.data.data) {
      if (appointment.doctor && appointment.doctor.user) {
        await fetchDoctorDetails(appointment.doctor.user);
      }
    }

    appointments.value = response.data.data;
    totalRecords.value = response.data.total;
    currentPage.value = response.data.page;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    error.value = error.response?.data?.message || 'Failed to fetch appointments';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Handle pagination
const onPageChange = (event: any) => {
  currentPage.value = event.page + 1;
  fetchAppointments(currentPage.value);
};

// Handle status filter change
const onStatusFilterChange = () => {
  fetchAppointments(1);
};

// Navigate to book appointment
const bookNewAppointment = () => {
  router.push('/patient/dashboard'); // Assuming the dashboard has the booking modal
};

// Format date and time
const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY');
};

const formatTime = (time: string) => {
  return dayjs(`2000-01-01T${time}`).format('h:mm A');
};

// Cancel appointment (placeholder, assuming an API endpoint exists)
const cancelAppointment = async (appointmentId: string) => {
  try {
    await apiClient.patch(`/appointments/${appointmentId}`, { status: 'cancelled' }, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appointment cancelled successfully',
      life: 3000,
    });
    fetchAppointments(currentPage.value);
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to cancel appointment',
      life: 3000,
    });
  }
};

// Initialize
onMounted(async () => {
  await fetchPatientId();
  if (patientId.value) {
    await fetchAppointments();
  }
});

// Watch for auth changes
watch(() => authStore.isAuthenticated, async (newVal) => {
  if (newVal) {
    await fetchPatientId();
    if (patientId.value) {
      await fetchAppointments();
    }
  }
});
</script>

<template>
  <div class="patient-appointments">
    <!-- Header -->
    <div class="appointments-header">
      <h1 class="appointments-title">My Appointments</h1>
      <Button
        label="Book New Appointment"
        icon="pi pi-calendar-plus"
        class="book-button"
        @click="bookNewAppointment"
      />
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label for="status-filter" class="filter-label">Filter by Status</label>
        <Dropdown
          v-model="statusFilter"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select Status"
          class="filter-dropdown"
          @change="onStatusFilterChange"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value !== null" class="dropdown-value">
              <i class="pi pi-filter"></i>
              <span>{{ statusOptions.find((opt) => opt.value === slotProps.value)?.label }}</span>
            </div>
            <span v-else>All</span>
          </template>
          <template #option="slotProps">
            <div class="dropdown-option">
              <i class="pi pi-filter"></i>
              <span>{{ slotProps.option.label }}</span>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading appointments...</p>
    </div>

    <!-- Appointments List -->
    <div v-else-if="appointments.length" class="appointments-list">
      <Card v-for="appointment in appointments" :key="appointment._id" class="appointment-card">
        <template #content>
          <div class="appointment-content">
            <div class="appointment-header">
              <div class="doctor-info">
                <h3>Dr. {{ doctorsMap.get(appointment.doctor.user)?.firstName || 'Loading...' }} {{ doctorsMap.get(appointment.doctor.user)?.lastName || '' }}</h3>
                <p class="specialization">{{ appointment.doctor.specialization }}</p>
              </div>
              <Chip :label="appointment.status" :class="`status-${appointment.status}`" />
            </div>
            <div class="appointment-details">
              <div class="detail-row">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(appointment.date) }} at {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}</span>
              </div>
              <div class="detail-row">
                <i class="pi pi-video"></i>
                <span>{{ appointment.type }}</span>
              </div>
              <div class="detail-row">
                <i class="pi pi-info-circle"></i>
                <span>{{ appointment.reasonForVisit }}</span>
              </div>
              <div class="detail-row symptoms">
                <i class="pi pi-heart"></i>
                <span>
                  <Chip v-for="symptom in appointment.symptoms" :key="symptom" :label="symptom" class="symptom-chip" />
                </span>
              </div>
              <div class="detail-row">
                <i class="pi pi-money-bill"></i>
                <span>{{ appointment.isPaid ? `Paid: $${appointment.paymentAmount}` : 'Not Paid' }}</span>
              </div>
            </div>
            <div class="appointment-actions">
              <Button
                label="View Details"
                icon="pi pi-eye"
                text
                @click="router.push(`/patient/appointments/${appointment._id}`)"
              />
              <Button
                v-if="appointment.status === 'scheduled'"
                label="Cancel"
                icon="pi pi-times"
                severity="danger"
                text
                @click="cancelAppointment(appointment._id)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else class="no-appointments">
      <i class="pi pi-calendar-times"></i>
      <p>No appointments found</p>
      <Button
        label="Book an Appointment"
        icon="pi pi-calendar-plus"
        @click="bookNewAppointment"
      />
    </div>

    <!-- Pagination -->
    <Paginator
      v-if="appointments.length"
      :rows="rowsPerPage"
      :totalRecords="totalRecords"
      :page="currentPage - 1"
      @page="onPageChange"
      class="paginator"
    />
  </div>
</template>

<style scoped>
.patient-appointments {
  padding: 2rem;
  background: var(--surface-ground);
}

/* Header */
.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.appointments-title {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
  font-weight: 600;
}

.book-button {
  background: var(--primary-color);
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.book-button:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.2);
}

/* Filters */
.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.filter-dropdown {
  width: 200px;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-dropdown:hover {
  border-color: var(--primary-color);
}

:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.75rem !important;
  font-size: 0.875rem;
}

:deep(.filter-dropdown .p-dropdown-panel) {
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.filter-dropdown .p-dropdown-item) {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.875rem;
}

:deep(.filter-dropdown .p-dropdown-item.p-highlight) {
  background: var(--primary-color);
  color: white;
}

:deep(.filter-dropdown .p-dropdown-item:hover:not(.p-highlight)) {
  background: rgba(155, 135, 245, 0.1);
}

.dropdown-value,
.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-value i,
.dropdown-option i {
  color: var(--primary-color);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.loading-container p {
  font-size: 1.125rem;
}

/* Appointments List */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.appointment-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.appointment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.p-card-content) {
  padding: 1.5rem !important;
}

.appointment-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.doctor-info h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin: 0;
}

.specialization {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.status-scheduled {
  background: #10B981;
  color: white;
}

.status-completed {
  background: #3B82F6;
  color: white;
}

.status-cancelled {
  background: #EF4444;
  color: white;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.detail-row i {
  color: var(--primary-color);
  font-size: 1rem;
}

.symptoms .symptom-chip {
  background: var(--primary-color);
  color: white;
  border-radius: 16px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.appointment-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

:deep(.p-button-text) {
  color: var(--primary-color);
  padding: 0.5rem 1rem;
}

:deep(.p-button-text:hover) {
  background: rgba(155, 135, 245, 0.1);
}

:deep(.p-button-severity-danger) {
  color: #EF4444;
}

/* Empty State */
.no-appointments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.no-appointments i {
  font-size: 3rem;
}

.no-appointments p {
  font-size: 1.125rem;
  margin: 0;
}

/* Pagination */
.paginator {
  margin-top: 2rem;
}

:deep(.p-paginator) {
  background: var(--surface-ground);
  border: none;
}

:deep(.p-paginator .p-paginator-page) {
  border-radius: 8px;
  color: var(--text-color);
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: var(--primary-color);
  color: white;
}

:deep(.p-paginator .p-paginator-page:hover) {
  background: rgba(155, 135, 245, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .patient-appointments {
    padding: 1rem;
  }

  .appointments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .book-button {
    width: 100%;
    text-align: center;
  }

  .filters {
    flex-direction: column;
  }

  .filter-dropdown {
    width: 100%;
  }

  .appointment-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>