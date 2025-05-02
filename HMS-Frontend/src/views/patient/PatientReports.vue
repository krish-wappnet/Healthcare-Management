<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api';
import dayjs from 'dayjs';
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

// Interfaces for API response
interface MedicalReport {
  _id: string;
  patient: string;
  doctor: {
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
  };
  appointment: {
    _id: string;
    patient: string;
    doctor: string;
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
    meetingLink?: string;
  };
  title: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatmentPlan: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    instructions: string;
    _id: string;
  }[];
  testResults: {
    name: string;
    date: string;
    result: string;
    normalRange: string;
    units: string;
    notes: string;
    _id: string;
  }[];
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    oxygenSaturation: number;
    _id: string;
  };
  notes: string;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: MedicalReport[];
  total: number;
  page: number;
  limit: number;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref<string | null>(null);
const medicalReports = ref<MedicalReport[]>([]);
const totalRecords = ref(0);
const currentPage = ref(1);
const rowsPerPage = ref(10);
const patientId = '681322581b49edf3e895b47b'; // Hardcoded patient ID as per API
const selectedReport = ref<MedicalReport | null>(null);
const reportDialogVisible = ref(false);

// Fetch medical reports
const fetchMedicalReports = async (page: number = 1) => {
  try {
    loading.value = true;
    error.value = null;

    const url = `/medical-reports/patient/${patientId}?page=${page}&limit=${rowsPerPage.value}`;
    const response = await apiClient.get<ApiResponse>(url, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    medicalReports.value = response.data.data;
    totalRecords.value = response.data.total;
    currentPage.value = response.data.page;
  } catch (error: any) {
    console.error('Error fetching medical reports:', error);
    error.value = error.response?.data?.message || 'Failed to fetch medical reports';
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
  fetchMedicalReports(currentPage.value);
};

// Format date
const formatDate = (date: string) => {
  return dayjs(date).format('MMMM D, YYYY');
};

const formatTime = (time: string) => {
  return dayjs(`2000-01-01T${time}`).format('h:mm A');
};

// Show report details
const showReportDetails = (report: MedicalReport) => {
  selectedReport.value = report;
  reportDialogVisible.value = true;
};

// Initialize
onMounted(async () => {
  if (!(await authStore.checkAuth())) {
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'You must be logged in to view this page.',
      life: 3000,
    });
    router.push('/login');
    return;
  }
  await fetchMedicalReports();
});
</script>

<template>
  <div class="medical-reports-view">
    <!-- Header -->
    <div class="header">
      <h1>Patient Medical Reports</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading medical reports...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Medical Reports Table -->
    <div v-else-if="medicalReports.length" class="table-container">
      <div class="table-wrapper">
        <table class="reports-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Diagnosis</th>
              <th>Doctor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in medicalReports" :key="report._id">
              <td>{{ report.title }}</td>
              <td>{{ formatDate(report.date) }}</td>
              <td>{{ report.diagnosis }}</td>
              <td>{{ report.doctor.specialization }}</td>
              <td>
                <Button
                  label="View Details"
                  icon="pi pi-eye"
                  text
                  @click="showReportDetails(report)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Paginator
        :rows="rowsPerPage"
        :totalRecords="totalRecords"
        :page="currentPage - 1"
        @page="onPageChange"
        class="paginator"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="no-reports">
      <i class="pi pi-file"></i>
      <p>No medical reports found</p>
    </div>

    <!-- Report Details Dialog -->
    <Dialog
      v-model:visible="reportDialogVisible"
      header="Medical Report Details"
      :style="{ width: '70vw' }"
      :modal="true"
    >
      <div class="report-details-container" v-if="selectedReport">
        <!-- General Information -->
        <div class="details-section">
          <h3>General Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Title:</span>
              <span class="value">{{ selectedReport.title }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedReport.date) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Diagnosis:</span>
              <span class="value">{{ selectedReport.diagnosis }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Follow-Up Date:</span>
              <span class="value">{{ selectedReport.followUpDate ? formatDate(selectedReport.followUpDate) : 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Doctor Information -->
        <div class="details-section">
          <h3>Doctor Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Specialization:</span>
              <span class="value">{{ selectedReport.doctor.specialization }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Office Address:</span>
              <span class="value">{{ selectedReport.doctor.officeAddress }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Office Phone:</span>
              <span class="value">{{ selectedReport.doctor.officePhone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Consultation Fee:</span>
              <span class="value">${{ selectedReport.doctor.consultationFee }}</span>
            </div>
          </div>
        </div>

        <!-- Appointment Information -->
        <div class="details-section">
          <h3>Appointment Information</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedReport.appointment.date) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Time:</span>
              <span class="value">{{ formatTime(selectedReport.appointment.startTime) }} - {{ formatTime(selectedReport.appointment.endTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Type:</span>
              <span class="value">{{ selectedReport.appointment.type }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Reason for Visit:</span>
              <span class="value">{{ selectedReport.appointment.reasonForVisit }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Payment Status:</span>
              <span class="value">{{ selectedReport.appointment.isPaid ? `Paid: $${selectedReport.appointment.paymentAmount}` : 'Not Paid' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Meeting Link:</span>
              <span class="value">
                <a v-if="selectedReport.appointment.meetingLink" :href="selectedReport.appointment.meetingLink" target="_blank">
                  {{ selectedReport.appointment.meetingLink }}
                </a>
                <span v-else>N/A</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Symptoms -->
        <div class="details-section">
          <h3>Symptoms</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="value">{{ selectedReport.symptoms.join(', ') || 'None' }}</span>
            </div>
          </div>
        </div>

        <!-- Medications -->
        <div class="details-section">
          <h3>Medications</h3>
          <div v-if="selectedReport.medications.length" class="details-grid">
            <div v-for="medication in selectedReport.medications" :key="medication._id" class="detail-item">
              <span class="label">{{ medication.name }}:</span>
              <span class="value">
                {{ medication.dosage }}, {{ medication.frequency }} ({{ formatDate(medication.startDate) }} - {{ formatDate(medication.endDate) }})<br />
                Instructions: {{ medication.instructions }}
              </span>
            </div>
          </div>
          <div v-else class="details-grid">
            <div class="detail-item">
              <span class="value">None</span>
            </div>
          </div>
        </div>

        <!-- Test Results -->
        <div class="details-section">
          <h3>Test Results</h3>
          <div v-if="selectedReport.testResults.length" class="details-grid">
            <div v-for="test in selectedReport.testResults" :key="test._id" class="detail-item">
              <span class="label">{{ test.name }}:</span>
              <span class="value">
                {{ test.result }} {{ test.units }} (Normal: {{ test.normalRange }})<br />
                Date: {{ formatDate(test.date) }}<br />
                Notes: {{ test.notes }}
              </span>
            </div>
          </div>
          <div v-else class="details-grid">
            <div class="detail-item">
              <span class="value">None</span>
            </div>
          </div>
        </div>

        <!-- Vital Signs -->
        <div class="details-section">
          <h3>Vital Signs</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Blood Pressure:</span>
              <span class="value">{{ selectedReport.vitalSigns.bloodPressure }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Heart Rate:</span>
              <span class="value">{{ selectedReport.vitalSigns.heartRate }} bpm</span>
            </div>
            <div class="detail-item">
              <span class="label">Respiratory Rate:</span>
              <span class="value">{{ selectedReport.vitalSigns.respiratoryRate }} breaths/min</span>
            </div>
            <div class="detail-item">
              <span class="label">Temperature:</span>
              <span class="value">{{ selectedReport.vitalSigns.temperature }} °F</span>
            </div>
            <div class="detail-item">
              <span class="label">Oxygen Saturation:</span>
              <span class="value">{{ selectedReport.vitalSigns.oxygenSaturation }} %</span>
            </div>
          </div>
        </div>

        <!-- Treatment Plan and Notes -->
        <div class="details-section">
          <h3>Treatment Plan</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="value">{{ selectedReport.treatmentPlan || 'None' }}</span>
            </div>
          </div>
        </div>
        <div class="details-section">
          <h3>Notes</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="value">{{ selectedReport.notes || 'None' }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.medical-reports-view {
  padding: 2rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

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

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: #ef4444;
}

.error-container i {
  font-size: 3rem;
}

.error-container p {
  font-size: 1.125rem;
  margin: 0;
}

.no-reports {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.no-reports i {
  font-size: 3rem;
}

.no-reports p {
  font-size: 1.125rem;
  margin: 0;
}

.table-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
}

.reports-table th {
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  background-color: #f9fafb;
}

.reports-table td {
  color: var(--text-color);
}

.reports-table tr {
  transition: background-color 0.2s ease;
}

.reports-table tr:hover {
  background-color: #f9fafb;
}

:deep(.p-button-text) {
  color: var(--primary-color);
  padding: 0.5rem 1rem;
}

:deep(.p-button-text:hover) {
  background: rgba(155, 135, 245, 0.1);
}

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

.report-details-container {
  padding: 1.5rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item .label {
  font-weight: 500;
  color: var(--text-color-secondary);
}

.detail-item .value {
  color: var(--text-color);
}

.detail-item .value a {
  color: var(--primary-color);
  text-decoration: none;
}

.detail-item .value a:hover {
  text-decoration: underline;
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

/* Responsive Design */
@media (max-width: 768px) {
  .medical-reports-view {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .reports-table th,
  .reports-table td {
    padding: 0.75rem;
    font-size: 0.75rem;
  }

  .report-details-container .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>