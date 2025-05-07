<template>
  <div class="medical-reports-dashboard">
    <Toast />
    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Status Filter Tabs -->
      <div class="status-tabs">
        <button
          v-for="(tab, index) in ['All', 'Completed', 'Scheduled']"
          :key="tab"
          :class="{ 'active-tab': activeTab === index }"
          @click="activeTab = index"
          class="tab-button"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Medical Reports Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Doctor Name</th>
              <th>Report Title</th>
              <th>Diagnosis</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in filteredReports" :key="report._id">
              <td>{{ report.patient.emergencyContactName }}</td>
              <td>{{ report.doctor.bio.split(' ').slice(1, 3).join(' ') || 'Dr. Unknown' }}</td>
              <td>{{ report.title }}</td>
              <td>{{ report.diagnosis }}</td>
              <td>{{ formatDate(report.date) }}</td>
              <td>
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-primary"
                  @click="openDetailsModal(report)"
                  aria-label="View report details"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-danger"
                  @click="confirmDelete(report._id)"
                  aria-label="Delete report"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" v-if="total > limit">
          <Button
            icon="pi pi-angle-left"
            class="p-button-text"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
            aria-label="Previous page"
          />
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <Button
            icon="pi pi-angle-right"
            class="p-button-text"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
            aria-label="Next page"
          />
        </div>
      </div>

      <!-- Modals Backdrop -->
      <div v-if="showDetailsModal || showDeleteDialog" class="modal-backdrop"></div>

      <!-- View Details Modal -->
      <div class="modal-wrapper" v-if="showDetailsModal">
        <div class="modal details-modal" role="dialog" aria-labelledby="modal-title">
          <div class="modal-header">
            <h2 id="modal-title">Medical Report Details</h2>
            <button class="modal-close" @click="showDetailsModal = false" aria-label="Close modal">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="tabs">
              <button
                v-for="(tab, index) in tabs"
                :key="tab"
                :class="{ 'tab-active': activeModalTab === index }"
                @click="activeModalTab = index"
                class="tab"
                :aria-selected="activeModalTab === index"
                :aria-controls="`tab-panel-${index}`"
              >
                {{ tab }}
              </button>
            </div>
            <div class="tab-content" v-for="(tab, index) in tabs" :key="tab" :id="`tab-panel-${index}`" v-show="activeModalTab === index" role="tabpanel">
              <!-- Patient Information -->
              <div v-if="index === 0" class="section">
                <div class="section-header" @click="toggleSection('patient')" role="button" tabindex="0" @keydown.enter="toggleSection('patient')" aria-expanded="sections.patient">
                  <h3><i class="pi pi-user section-icon patient-icon"></i> Patient Information</h3>
                  <i :class="sections.patient ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.patient" class="section-content">
                  <p><strong>Name:</strong> {{ selectedReport.patient.emergencyContactName }}</p>
                  <p><strong>Date of Birth:</strong> {{ formatDate(selectedReport.patient.dateOfBirth) }}</p>
                  <p><strong>Gender:</strong> {{ selectedReport.patient.gender }}</p>
                  <p><strong>Blood Type:</strong> {{ selectedReport.patient.bloodType }}</p>
                  <p><strong>Allergies:</strong> {{ selectedReport.patient.allergies.join(', ') || 'None' }}</p>
                  <p><strong>Chronic Conditions:</strong> {{ selectedReport.patient.chronicConditions.join(', ') || 'None' }}</p>
                </div>
              </div>
              <!-- Doctor Information -->
              <div v-if="index === 1" class="section">
                <div class="section-header" @click="toggleSection('doctor')" role="button" tabindex="0" @keydown.enter="toggleSection('doctor')" aria-expanded="sections.doctor">
                  <h3><i class="pi pi-id-card section-icon doctor-icon"></i> Doctor Information</h3>
                  <i :class="sections.doctor ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.doctor" class="section-content">
                  <p><strong>Name:</strong> {{ selectedReport.doctor.bio.split(' ').slice(1, 3).join(' ') || 'Dr. Unknown' }}</p>
                  <p><strong>Specialization:</strong> {{ selectedReport.doctor.specialization }}</p>
                  <p><strong>Qualifications:</strong> {{ selectedReport.doctor.qualifications.join(', ') }}</p>
                  <p><strong>Office Address:</strong> {{ selectedReport.doctor.officeAddress }}</p>
                </div>
              </div>
              <!-- Appointment Information -->
              <div v-if="index === 2" class="section">
                <div class="section-header" @click="toggleSection('appointment')" role="button" tabindex="0" @keydown.enter="toggleSection('appointment')" aria-expanded="sections.appointment">
                  <h3><i class="pi pi-calendar section-icon appointment-icon"></i> Appointment Information</h3>
                  <i :class="sections.appointment ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.appointment" class="section-content">
                  <p><strong>Date:</strong> {{ formatDate(selectedReport.appointment.date) }}</p>
                  <p><strong>Type:</strong> {{ selectedReport.appointment.type }}</p>
                  <p><strong>Status:</strong> <span :class="['status-badge', selectedReport.appointment.status]">{{ selectedReport.appointment.status }}</span></p>
                  <p><strong>Reason for Visit:</strong> {{ selectedReport.appointment.reasonForVisit }}</p>
                </div>
              </div>
              <!-- Report Details -->
              <div v-if="index === 3" class="section">
                <div class="section-header" @click="toggleSection('report')" role="button" tabindex="0" @keydown.enter="toggleSection('report')" aria-expanded="sections.report">
                  <h3><i class="pi pi-file section-icon report-icon"></i> Report Details</h3>
                  <i :class="sections.report ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.report" class="section-content">
                  <p><strong>Title:</strong> {{ selectedReport.title }}</p>
                  <p><strong>Diagnosis:</strong> {{ selectedReport.diagnosis }}</p>
                  <p><strong>Symptoms:</strong> {{ selectedReport.symptoms.join(', ') }}</p>
                  <p><strong>Treatment Plan:</strong> {{ selectedReport.treatmentPlan }}</p>
                  <p><strong>Notes:</strong> {{ selectedReport.notes }}</p>
                  <p><strong>Follow-Up Date:</strong> {{ formatDate(selectedReport.followUpDate) }}</p>
                </div>
              </div>
              <!-- Medications -->
              <div v-if="index === 4" class="section">
                <div class="section-header" @click="toggleSection('medications')" role="button" tabindex="0" @keydown.enter="toggleSection('medications')" aria-expanded="sections.medications">
                  <h3><i class="pi pi-tablets section-icon medications-icon"></i> Medications</h3>
                  <i :class="sections.medications ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.medications" class="section-content">
                  <ul>
                    <li v-for="med in selectedReport.medications" :key="med._id">
                      {{ med.name }} ({{ med.dosage || `${med.dosageValue} ${med.dosageUnit}` }}), {{ med.frequency || med.timing }}, {{ med.instructions }}
                    </li>
                  </ul>
                </div>
              </div>
              <!-- Test Results -->
              <div v-if="index === 5" class="section">
                <div class="section-header" @click="toggleSection('testResults')" role="button" tabindex="0" @keydown.enter="toggleSection('testResults')" aria-expanded="sections.testResults">
                  <h3><i class="pi pi-chart-line section-icon test-results-icon"></i> Test Results</h3>
                  <i :class="sections.testResults ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.testResults" class="section-content">
                  <ul>
                    <li v-for="test in selectedReport.testResults" :key="test._id">
                      {{ test.name }}: {{ test.result }} {{ test.units }} (Normal: {{ test.normalRange }}), {{ test.notes }}
                    </li>
                  </ul>
                </div>
              </div>
              <!-- Vital Signs -->
              <div v-if="index === 6" class="section">
                <div class="section-header" @click="toggleSection('vitalSigns')" role="button" tabindex="0" @keydown.enter="toggleSection('vitalSigns')" aria-expanded="sections.vitalSigns">
                  <h3><i class="pi pi-heart section-icon vital-signs-icon"></i> Vital Signs</h3>
                  <i :class="sections.vitalSigns ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                </div>
                <div v-if="sections.vitalSigns" class="section-content">
                  <p><strong>Blood Pressure:</strong> {{ formatBloodPressure(selectedReport.vitalSigns) }}</p>
                  <p><strong>Heart Rate:</strong> {{ selectedReport.vitalSigns.heartRate }} bpm</p>
                  <p><strong>Respiratory Rate:</strong> {{ selectedReport.vitalSigns.respiratoryRate }} breaths/min</p>
                  <p><strong>Temperature:</strong> {{ selectedReport.vitalSigns.temperature }} °F</p>
                  <p><strong>Oxygen Saturation:</strong> {{ selectedReport.vitalSigns.oxygenSaturation }}%</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="button text-button" @click="showDetailsModal = false" aria-label="Close modal">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div class="modal-wrapper" v-if="showDeleteDialog">
        <div class="modal delete-dialog">
          <div class="modal-header">
            <h2>Delete Medical Report</h2>
            <button class="modal-close" @click="showDeleteDialog = false" aria-label="Close modal">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="confirmation-content">
              <i class="pi pi-exclamation-triangle warning-icon"></i>
              <span class="confirmation-text">
                Are you sure you want to delete this medical report? This action cannot be undone.
              </span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="button text-button" @click="showDeleteDialog = false" aria-label="Cancel deletion">
              Cancel
            </button>
            <button class="button danger-button" @click="deleteReport" aria-label="Confirm delete">
              Delete Report
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '../../stores/auth'
import { apiClient } from '../../services/api'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const toast = useToast()
const authStore = useAuthStore()
const reports = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const activeTab = ref(0)
const showDetailsModal = ref(false)
const showDeleteDialog = ref(false)
const selectedReport = ref<any>({})
const reportIdToDelete = ref<string | null>(null)
const activeModalTab = ref(0)
const tabs = ['Patient', 'Doctor', 'Appointment', 'Report', 'Medications', 'Test Results', 'Vital Signs']
const sections = ref({
  patient: true,
  doctor: true,
  appointment: true,
  report: true,
  medications: true,
  testResults: true,
  vitalSigns: true,
})

// Computed
const totalPages = computed(() => Math.ceil(total.value / limit.value))

const filteredReports = computed(() => {
  if (activeTab.value === 1) return reports.value.filter(report => report.appointment.status === 'completed')
  if (activeTab.value === 2) return reports.value.filter(report => report.appointment.status === 'scheduled')
  return reports.value
})

// Fetch medical reports
const fetchReports = async (page: number) => {
  loading.value = true
  try {
    if (!authStore.token) {
      throw new Error('No auth token found')
    }

    const response = await apiClient.get(`/medical-reports?page=${page}&limit=${limit.value}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    const { data: reportData, total: totalReports, page: currentPageNum, limit: limitNum } = response.data
    reports.value = reportData
    total.value = totalReports
    currentPage.value = currentPageNum
    limit.value = limitNum
  } catch (error) {
    console.error('Error fetching medical reports:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load medical reports. Please try again.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Change page
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchReports(page)
  }
}

// Format date
const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format blood pressure
const formatBloodPressure = (vitalSigns: any) => {
  if (vitalSigns.bloodPressure?.systolic) {
    return `${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`
  }
  return vitalSigns.bloodPressure || 'N/A'
}

// Open details modal
const openDetailsModal = (report: any) => {
  selectedReport.value = { ...report }
  showDetailsModal.value = true
  activeModalTab.value = 0
  sections.value = {
    patient: true,
    doctor: true,
    appointment: true,
    report: true,
    medications: true,
    testResults: true,
    vitalSigns: true,
  }
}

// Toggle section
const toggleSection = (section: string) => {
  sections.value[section] = !sections.value[section]
}

// Confirm delete
const confirmDelete = (id: string) => {
  reportIdToDelete.value = id
  showDeleteDialog.value = true
}

// Delete report
const deleteReport = async () => {
  try {
    if (!authStore.token || !reportIdToDelete.value) {
      throw new Error('No auth token or report ID found')
    }

    await apiClient.delete(`/medical-reports/${reportIdToDelete.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Medical report deleted successfully.',
      life: 3000,
    })

    showDeleteDialog.value = false
    fetchReports(currentPage.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to delete medical report. Please try again.',
      life: 3000,
    })
  }
}

// Initial fetch
onMounted(() => {
  fetchReports(currentPage.value)
})
</script>

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

.medical-reports-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--background);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-content {
  padding: 2rem;
  flex-grow: 1;

  .status-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: #ffffff;
    padding: 0.5rem;
    border-radius: 10px;
    box-shadow: var(--card-shadow);

    .tab-button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: transparent;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;

      &.active-tab {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }

      &:hover:not(.active-tab) {
        background: var(--background);
        color: var(--primary);
        transform: scale(1.05);
      }
    }
  }

  .table-container {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: var(--card-shadow);
    padding: 1.5rem;
    overflow-x: auto;

    table {
      width: 100%;
      border-collapse: collapse;

      th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: var(--text-primary);
        background: var(--background);
        border-bottom: 2px solid var(--border-color);
      }

      tr {
        transition: background 0.2s ease;

        &:nth-child(even) {
          background: #fafafa;
        }

        &:hover {
          background: #f1f5f9;
        }
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
      }
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;

      .page-info {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .p-button-text {
        border-radius: 8px;
        color: var(--primary);
        transition: all 0.2s ease;

        &:hover {
          background: var(--background);
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

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

  .modal {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
    animation: modalFadeIn 0.3s ease-out;

    &.details-modal {
      padding: 1rem;
    }
  }

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

  .modal-content {
    padding: 2rem;

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);

      .tab {
        padding: 0.75rem 1.25rem;
        border: none;
        background: transparent;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 8px 8px 0 0;
        transition: all 0.3s ease;

        &:hover {
          background: var(--background);
          color: var(--primary);
          transform: scale(1.05);
        }

        &.tab-active {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: #ffffff;
          box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.15);
        }
      }
    }

    .tab-content {
      animation: slideDown 0.3s ease;
    }

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

          &.patient-icon {
            color: #17a2b8;
          }

          &.doctor-icon {
            color: #6f42c1;
          }

          &.appointment-icon {
            color: #28a745;
          }

          &.report-icon {
            color: #dc3545;
          }

          &.medications-icon {
            color: #fd7e14;
          }

          &.test-results-icon {
            color: #e83e8c;
          }

          &.vital-signs-icon {
            color: #007bff;
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
        }

        ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.75rem 0;

          li {
            font-size: 0.95rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            line-height: 1.6;
          }
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;

          &.scheduled {
            background: #e7f1ff;
            color: var(--primary);
          }

          &.completed {
            background: #d4edda;
            color: var(--success);
          }

          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }

  .modal-footer {
    padding: 1rem 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    background: #f8f9fa;
  }

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
      border: 1px solid var(--border-color);

      &:hover {
        background: var(--background);
        color: var(--primary);
        transform: scale(1.05);
      }
    }

    &.danger-button {
      background: transparent;
      border: 1px solid var(--danger-color);
      color: var(--danger-color);
      transition: all 0.3s ease;
      opacity: 1;
    }

    &.danger-button:hover {
      background: var(--danger-color);
      color: white;
      opacity: 1;
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

  .delete-dialog {
    max-width: 400px;
    border-radius: 10px;
    transition: background 0.2s ease;

    &:hover {
      background: #fdfdfd;
    }

    .modal-header {
      padding: 1rem 1.5rem;

      h2 {
        color: var(--danger);
        font-size: 1.25rem;
      }
    }

    .modal-content {
      padding: 1.5rem;

      .confirmation-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .warning-icon {
          font-size: 1.5rem;
          color: var(--danger);
          animation: pulse 2s infinite;
        }

        .confirmation-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-primary);
        }
      }
    }

    .modal-footer {
      padding: 1rem 1.5rem;

      .danger-button {
        color: var(--text-secondary);
        background: var(--danger);
        transition: all 0.3s ease;
        opacity: 1;
        border: none;
      }

      .danger-button:hover {
        color: #ffffff;
        background: #c82333;
        transform: scale(1.05);
      }
    }
  }

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

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (max-width: 768px) {
    .dashboard-content {
      padding: 1rem;

      .status-tabs {
        flex-wrap: wrap;
        gap: 0.25rem;

        .tab-button {
          flex: none;
          width: calc(33.33% - 0.25rem);
          font-size: 0.9rem;
          padding: 0.5rem;
        }
      }

      .table-container {
        padding: 1rem;

        table {
          th, td {
            padding: 0.5rem;
            font-size: 0.85rem;
          }
        }
      }
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

        .tabs {
          gap: 0.25rem;

          .tab {
            font-size: 0.85rem;
            padding: 0.5rem 1rem;
          }
        }

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

            p, li {
              font-size: 0.85rem;
            }
          }
        }
      }

      .modal-footer {
        padding: 0.75rem 1rem;
      }
    }

    .delete-dialog {
      max-width: 90%;

      .modal-header {
        padding: 0.75rem 1rem;

        h2 {
          font-size: 1.1rem;
        }
      }

      .modal-content {
        padding: 1rem;
      }

      .modal-footer {
        padding: 0.75rem 1rem;
      }
    }
  }

</style>