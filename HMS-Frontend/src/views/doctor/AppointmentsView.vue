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
const sections = ref({
  personal: true,
  medical: true,
  emergency: true,
  address: true,
  insurance: true,
});

// Filter options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// Toggle section
const toggleSection = (section: string) => {
  sections.value[section] = !sections.value[section];
};

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
    sections.value = {
      personal: true,
      medical: true,
      emergency: true,
      address: true,
      insurance: true,
    };
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

    <!-- Modal Backdrop -->
    <div v-if="patientDialogVisible" class="modal-backdrop"></div>

    <!-- Patient Details Modal -->
    <div class="modal-wrapper" v-if="patientDialogVisible">
      <div class="modal details-modal" role="dialog" aria-labelledby="modal-title">
        <div class="modal-header">
          <h2 id="modal-title">Patient Details</h2>
          <button class="modal-close" @click="patientDialogVisible = false" aria-label="Close modal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <!-- Personal Information -->
          <div class="section">
            <div class="section-header" @click="toggleSection('personal')" role="button" tabindex="0" @keydown.enter="toggleSection('personal')" :aria-expanded="sections.personal">
              <h3><i class="pi pi-user section-icon personal-icon"></i> Personal Information</h3>
              <i :class="sections.personal ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            </div>
            <div v-if="sections.personal" class="section-content">
              <p><strong>Full Name:</strong> {{ selectedPatient?.user.firstName }} {{ selectedPatient?.user.lastName }}</p>
              <p><strong>Email:</strong> {{ selectedPatient?.user.email }}</p>
              <p><strong>Phone:</strong> {{ selectedPatient?.phone }}</p>
              <p><strong>Date of Birth:</strong> {{ selectedPatient?.dateOfBirth ? dayjs(selectedPatient?.dateOfBirth).format('MMMM D, YYYY') : 'N/A' }}</p>
              <p><strong>Gender:</strong> {{ selectedPatient?.gender }}</p>
              <p><strong>Blood Type:</strong> {{ selectedPatient?.bloodType }}</p>
            </div>
          </div>
          <!-- Medical Information -->
          <div class="section">
            <div class="section-header" @click="toggleSection('medical')" role="button" tabindex="0" @keydown.enter="toggleSection('medical')" :aria-expanded="sections.medical">
              <h3><i class="pi pi-heart section-icon medical-icon"></i> Medical Information</h3>
              <i :class="sections.medical ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            </div>
            <div v-if="sections.medical" class="section-content">
              <p><strong>Height:</strong> {{ selectedPatient?.height }} cm</p>
              <p><strong>Weight:</strong> {{ selectedPatient?.weight }} kg</p>
              <p><strong>Allergies:</strong> {{ selectedPatient?.allergies?.join(', ') || 'None' }}</p>
              <p><strong>Medications:</strong> {{ selectedPatient?.medications?.join(', ') || 'None' }}</p>
              <p><strong>Chronic Conditions:</strong> {{ selectedPatient?.chronicConditions?.join(', ') || 'None' }}</p>
            </div>
          </div>
          <!-- Emergency Contact -->
          <div class="section">
            <div class="section-header" @click="toggleSection('emergency')" role="button" tabindex="0" @keydown.enter="toggleSection('emergency')" :aria-expanded="sections.emergency">
              <h3><i class="pi pi-phone section-icon emergency-icon"></i> Emergency Contact</h3>
              <i :class="sections.emergency ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            </div>
            <div v-if="sections.emergency" class="section-content">
              <p><strong>Name:</strong> {{ selectedPatient?.emergencyContactName }}</p>
              <p><strong>Phone:</strong> {{ selectedPatient?.emergencyContactPhone }}</p>
              <p><strong>Relation:</strong> {{ selectedPatient?.emergencyContactRelation }}</p>
            </div>
          </div>
          <!-- Address -->
          <div class="section">
            <div class="section-header" @click="toggleSection('address')" role="button" tabindex="0" @keydown.enter="toggleSection('address')" :aria-expanded="sections.address">
              <h3><i class="pi pi-map-marker section-icon address-icon"></i> Address</h3>
              <i :class="sections.address ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            </div>
            <div v-if="sections.address" class="section-content">
              <p><strong>Address:</strong> {{ selectedPatient?.address }}</p>
              <p><strong>City:</strong> {{ selectedPatient?.city }}</p>
              <p><strong>State:</strong> {{ selectedPatient?.state }}</p>
              <p><strong>Zip Code:</strong> {{ selectedPatient?.zipCode }}</p>
              <p><strong>Country:</strong> {{ selectedPatient?.country }}</p>
            </div>
          </div>
          <!-- Insurance -->
          <div class="section">
            <div class="section-header" @click="toggleSection('insurance')" role="button" tabindex="0" @keydown.enter="toggleSection('insurance')" :aria-expanded="sections.insurance">
              <h3><i class="pi pi-shield section-icon insurance-icon"></i> Insurance Information</h3>
              <i :class="sections.insurance ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            </div>
            <div v-if="sections.insurance" class="section-content">
              <p><strong>Provider:</strong> {{ selectedPatient?.insuranceProvider }}</p>
              <p><strong>Policy Number:</strong> {{ selectedPatient?.insurancePolicyNumber }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button text-button" @click="patientDialogVisible = false" aria-label="Close modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #007bff;
  --primary-dark: #0056b3;
  --success: #28a745;
  --danger: #dc3545;
  --warning: #ffc107;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --background: #f4f4f9;
  --border-color: #dee2e6;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.appointments-view {
  padding: 2rem;
  background: var(--background);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  color: var(--text-primary);
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
  color: var(--text-primary);
}

.filter-dropdown {
  width: 200px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-dropdown:hover {
  border-color: var(--primary);
}

:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.75rem !important;
  font-size: 0.875rem;
}

:deep(.filter-dropdown .p-dropdown-panel) {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
}

:deep(.filter-dropdown .p-dropdown-item) {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.875rem;
}

:deep(.filter-dropdown .p-dropdown-item.p-highlight) {
  background: var(--primary);
  color: white;
}

:deep(.filter-dropdown .p-dropdown-item:hover:not(.p-highlight)) {
  background: var(--background);
}

.dropdown-value,
.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-value i,
.dropdown-option i {
  color: var(--primary);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: var(--text-secondary);
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
  color: var(--danger);
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
  box-shadow: var(--card-shadow);
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
  color: var(--text-primary);
  margin: 0;
}

.patient-id {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.status-scheduled {
  background: #e7f1ff;
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.status-scheduled:hover {
  transform: scale(1.05);
}

.status-completed {
  background: #d4edda;
  color: var(--success);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.status-completed:hover {
  transform: scale(1.05);
}

.status-cancelled {
  background: #f8d7da;
  color: var(--danger);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.status-cancelled:hover {
  transform: scale(1.05);
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
  color: var(--text-primary);
}

.detail-row i {
  color: var(--primary);
  font-size: 1rem;
}

.symptoms .symptom-chip {
  background: var(--primary);
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
  color: var(--primary);
  padding: 0.5rem 1rem;
}

:deep(.p-button-text:hover) {
  background: var(--background);
}

/* Empty State */
.no-appointments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-secondary);
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
  background: var(--background);
  border: none;
}

:deep(.p-paginator .p-paginator-page) {
  border-radius: 8px;
  color: var(--text-primary);
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background: var(--primary);
  color: white;
}

:deep(.p-paginator .p-paginator-page:hover) {
  background: var(--background);
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

/* Modal Wrapper */
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal */
.modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease-out;
  padding: 1rem;
}

/* Modal Header */
.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
      color: var(--primary);
      transform: scale(1.1);
    }
  }
}

/* Modal Content */
.modal-content {
  padding: 2rem;

  .section {
    margin-bottom: 1.5rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: #ffffff;
    box-shadow: var(--card-shadow);
    overflow: hidden;
    transition: all 0.3s ease;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--background);
      }

      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .section-icon {
        font-size: 1.25rem;

        &.personal-icon {
          color: #17a2b8;
        }

        &.medical-icon {
          color: #dc3545;
        }

        &.emergency-icon {
          color: #28a745;
        }

        &.address-icon {
          color: #6f42c1;
        }

        &.insurance-icon {
          color: #fd7e14;
        }
      }

      i:not(.section-icon) {
        font-size: 1.25rem;
        color: var(--text-secondary);
        transition: transform 0.3s ease;
      }

      &[aria-expanded="true"] i.pi-chevron-right {
        transform: rotate(90deg);
      }
    }

    .section-content {
      padding: 1.5rem;
      background: #ffffff;
      animation: slideDown 0.3s ease;

      p {
        font-size: 0.95rem;
        color: var(--text-primary);
        margin: 0.75rem 0;
        line-height: 1.6;

        strong {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }
      }
    }
  }
}

/* Modal Footer */
.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8f9fa;
}

/* Button */
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  position: relative;
  overflow: hidden;

  &.text-button {
    background: transparent;
    color: var(--text-secondary);
    border: 1px prochains solid var(--border-color);

    &:hover {
      background: var(--background);
      color: var(--primary);
      transform: scale(1.05);
    }
  }

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  &:active:after {
    width: 200px;
    height: 200px;
  }
}

/* Animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

  .modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
    max-height: 90vh;

    .modal-header {
      padding: 1rem;

      h2 {
        font-size: 1.25rem;
      }

      .modal-close {
        font-size: 1.25rem;
      }
    }

    .modal-content {
      padding: 1rem;

      .section {
        .section-header {
          padding: 0.75rem 1rem;

          h3 {
            font-size: 1rem;
          }

          i {
            font-size: 1rem;
          }
        }

        .section-content {
          padding: 1rem;

          p {
            font-size: 0.85rem;
          }
        }
      }
    }

    .modal-footer {
      padding: 0.75rem 1rem;
    }
  }
}
</style>