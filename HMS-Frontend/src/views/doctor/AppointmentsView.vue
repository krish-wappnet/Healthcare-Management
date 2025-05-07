<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api';
import dayjs from 'dayjs';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dropdown from 'primevue/dropdown';
import Paginator from 'primevue/paginator';
import Chip from 'primevue/chip';
import Dialog from 'primevue/dialog';

// Interface for API response
interface ApiResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
}

interface Appointment {
  _id: string;
  patient: { _id: string };
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

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  _id: string;
  user: User;
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
  createdAt: string;
  updatedAt: string;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref<string | null>(null);
const doctorId = ref<string | null>(null);
const appointments = ref<Appointment[]>([]);
const totalRecords = ref(0);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const statusFilter = ref<string | null>(null);
const patientsMap = ref(new Map<string, { user: { firstName: string; lastName: string } }>());
const selectedPatient = ref<Patient | null>(null);
const patientDialogVisible = ref(false);

// Filter options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];


const openMeetingLink = (link: string) => {
  if (link) window.open(link, '_blank');
};

// Fetch doctor ID
const fetchDoctorId = async () => {
  try {
    const response = await apiClient.get('/doctors/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (response.data && response.data._id) {
      doctorId.value = response.data._id;
    } else {
      throw new Error('Invalid doctor profile response');
    }
  } catch (error: any) {
    console.error('Error fetching doctor ID:', error);
    error.value = error.response?.data?.message || 'Failed to fetch doctor ID';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000,
    });
  }
};

// Fetch patient details
const fetchPatientDetails = async (patientId: string) => {
  try {
    const response = await apiClient.get(`/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (response.data && response.data.user) {
      patientsMap.value.set(patientId, {
        user: {
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching patient details:', error);
  }
};

// Fetch appointments
const fetchAppointments = async (page: number = 1) => {
  if (!doctorId.value) {
    error.value = 'Doctor ID not found';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000,
    });
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const url = `/appointments/doctor/${doctorId.value}?page=${page}&limit=${rowsPerPage.value}`;
    const statusParam = statusFilter.value ? `&status=${statusFilter.value}` : '';

    const response = await apiClient.get<ApiResponse>(url + statusParam, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    // Fetch patient details for each appointment
    for (const appointment of response.data.data) {
      if (appointment.patient && appointment.patient._id) {
        await fetchPatientDetails(appointment.patient._id);
      }
    }

    appointments.value = response.data.data;
    totalRecords.value = response.data.total;
    currentPage.value = response.data.page;
  } catch (error: any) {
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

// Fetch patient details for dialog
const fetchPatientDetailsForDialog = async (patientId: string) => {
  try {
    const response = await apiClient.get<Patient>(`/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    selectedPatient.value = response.data;
    patientDialogVisible.value = true;
  } catch (error: any) {
    console.error('Error fetching patient details:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to fetch patient details',
      life: 3000,
    });
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

// Format date and time
const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY');
};

const formatTime = (time: string) => {
  return dayjs(`2000-01-01T${time}`).format('h:mm A');
};

// Handlers
const showAppointmentDetails = (appointment: Appointment) => {
  if (appointment.patient && appointment.patient._id) {
    fetchPatientDetailsForDialog(appointment.patient._id);
  }
};

// Generate meeting link
const generateMeetingLink = async (appointmentId: string) => {
  try {
    const response = await apiClient.post(`/appointments/${appointmentId}/meeting`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    
    // Update the specific appointment in the list
    const appointmentIndex = appointments.value.findIndex(a => a._id === appointmentId);
    if (appointmentIndex !== -1) {
      appointments.value[appointmentIndex] = response.data;
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Meeting link generated successfully',
        life: 3000
      });
    }
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || 'Failed to generate meeting link',
      life: 3000
    });
  }
};

// Initialize
onMounted(async () => {
  if (!(await authStore.checkAuth()) || authStore.userRole !== 'doctor') {
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'You must be logged in as a doctor to view this page.',
      life: 3000,
    });
    router.push('/login');
    return;
  }
  await fetchDoctorId();
  if (doctorId.value) {
    await fetchAppointments();
  }
});
</script>

<template>
  <div class="appointments-view">
    <!-- Header -->
    <div class="appointments-header">
      <h1 class="appointments-title">My Appointments</h1>
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

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Appointments List -->
    <div v-else-if="appointments.length" class="appointments-list">
      <Card v-for="appointment in appointments" :key="appointment._id" class="appointment-card">
        <template #content>
          <div class="appointment-content">
            <div class="appointment-header">
              <div class="patient-info">
                <h3>
                  {{ patientsMap.get(appointment.patient._id)?.user.firstName || 'Loading...' }}
                  {{ patientsMap.get(appointment.patient._id)?.user.lastName || '' }}
                </h3>
                <p class="patient-id">Patient ID: {{ appointment.patient._id }}</p>
              </div>
              <Chip :label="appointment.status" :class="`status-${appointment.status.toLowerCase()}`" />
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
                <span>{{ appointment.reasonForVisit || 'No reason provided' }}</span>
              </div>
              <div v-if="appointment.symptoms?.length" class="detail-row symptoms">
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
                @click="showAppointmentDetails(appointment)"
              />
              <Button
                label="Generate Meeting"
                icon="pi pi-video"
                text
                @click="generateMeetingLink(appointment._id)"
                :disabled="!Boolean(appointment.meetingLink)"
              />
              <Button
                v-if="appointment.meetingLink"
                label="Join Meeting"
                icon="pi pi-external-link"
                text
                @click="openMeetingLink(appointment.meetingLink)"
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

    <!-- Patient Details Dialog -->
    <Dialog
      v-model:visible="patientDialogVisible"
      header="Patient Details"
      :style="{ width: '70vw' }"
      :modal="true"
    >
      <div class="patient-details-container">
        <!-- Personal Information -->
        <div class="details-section">
          <h3>Personal Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Full Name:</span>
              <span class="value">{{ selectedPatient?.user.firstName }} {{ selectedPatient?.user.lastName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Email:</span>
              <span class="value">{{ selectedPatient?.user.email }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Phone:</span>
              <span class="value">{{ selectedPatient?.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Date of Birth:</span>
              <span class="value">{{ selectedPatient?.dateOfBirth ? dayjs(selectedPatient?.dateOfBirth).format('MMMM D, YYYY') : 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Gender:</span>
              <span class="value">{{ selectedPatient?.gender }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Blood Type:</span>
              <span class="value">{{ selectedPatient?.bloodType }}</span>
            </div>
          </div>
        </div>

        <!-- Medical Information -->
        <div class="details-section">
          <h3>Medical Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Height:</span>
              <span class="value">{{ selectedPatient?.height }} cm</span>
            </div>
            <div class="detail-item">
              <span class="label">Weight:</span>
              <span class="value">{{ selectedPatient?.weight }} kg</span>
            </div>
            <div class="detail-item">
              <span class="label">Allergies:</span>
              <span class="value">{{ selectedPatient?.allergies?.join(', ') || 'None' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Medications:</span>
              <span class="value">{{ selectedPatient?.medications?.join(', ') || 'None' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Chronic Conditions:</span>
              <span class="value">{{ selectedPatient?.chronicConditions?.join(', ') || 'None' }}</span>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="details-section">
          <h3>Emergency Contact</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Name:</span>
              <span class="value">{{ selectedPatient?.emergencyContactName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Phone:</span>
              <span class="value">{{ selectedPatient?.emergencyContactPhone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Relation:</span>
              <span class="value">{{ selectedPatient?.emergencyContactRelation }}</span>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="details-section">
          <h3>Address</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Address:</span>
              <span class="value">{{ selectedPatient?.address }}</span>
            </div>
            <div class="detail-item">
              <span class="label">City:</span>
              <span class="value">{{ selectedPatient?.city }}</span>
            </div>
            <div class="detail-item">
              <span class="label">State:</span>
              <span class="value">{{ selectedPatient?.state }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Zip Code:</span>
              <span class="value">{{ selectedPatient?.zipCode }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Country:</span>
              <span class="value">{{ selectedPatient?.country }}</span>
            </div>
          </div>
        </div>

        <!-- Insurance -->
        <div class="details-section">
          <h3>Insurance Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Provider:</span>
              <span class="value">{{ selectedPatient?.insuranceProvider }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Policy Number:</span>
              <span class="value">{{ selectedPatient?.insurancePolicyNumber }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.appointments-view {
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

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: #EF4444;
}

.error-container i {
  font-size: 3rem;
}

.error-container p {
  font-size: 1.125rem;
  margin: 0;
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

.patient-info h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin: 0;
}

.patient-id {
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
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: flex-end;
}

:deep(.p-button-text) {
  color: var(--primary-color);
  padding: 0.5rem 1rem;
}

:deep(.p-button-text:hover) {
  background: rgba(155, 135, 245, 0.1);
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

/* Patient Details Dialog */
.patient-details-container {
  padding: 1.5rem;
  
  .details-section {
    margin-bottom: 2rem;
    
    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      color: var(--text-color);
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .label {
          font-weight: 500;
          color: var(--text-color-secondary);
        }
        
        .value {
          color: var(--text-color);
        }
      }
    }
  }
}

:deep(.p-dialog-header) {
  background: var(--primary-color);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

:deep(.p-dialog-content) {
  padding: 0;
}

:deep(.p-dialog-footer) {
  padding: 1.5rem;
  text-align: right;
}

/* Responsive Design */
@media (max-width: 768px) {
  .appointments-view {
    padding: 1rem;
  }

  .appointments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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