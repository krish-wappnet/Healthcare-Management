<template>
  <div class="health-devices-dashboard">
    <Toast />
    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Device Type Filter Tabs -->
      <div class="status-tabs">
        <button
          v-for="(tab, index) in ['All', 'Fitness Tracker', 'Glucose Monitor', 'Smartwatch', 'Pulse Oximeter']"
          :key="tab"
          :class="{ 'active-tab': activeTab === index }"
          @click="activeTab = index"
          class="tab-button"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Health Devices Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Device ID</th>
              <th>Device Type</th>
              <th>Timestamp</th>
              <th>Data Summary</th>
              <th>Abnormality</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in filteredDevices" :key="device._id">
              <td>{{ device.patient.emergencyContactName }}</td>
              <td>{{ device.deviceId }}</td>
              <td>{{ formatDeviceType(device.deviceType) }}</td>
              <td>{{ formatDate(device.timestamp) }}</td>
              <td>{{ getDataSummary(device) }}</td>
              <td>
                <span :class="['status-badge', device.isAbnormal ? 'abnormal' : 'normal']">
                  {{ device.isAbnormal ? 'Abnormal' : 'Normal' }}
                </span>
              </td>
              <td>
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-primary"
                  @click="openDetailsModal(device)"
                  aria-label="View device details"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-danger"
                  @click="confirmDelete(device._id)"
                  aria-label="Delete device record"
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
            <h2 id="modal-title">Health Device Details</h2>
            <button class="modal-close" @click="showDetailsModal = false" aria-label="Close modal">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="section">
              <div class="section-header" @click="toggleSection('patient')" role="button" tabindex="0" @keydown.enter="toggleSection('patient')" aria-expanded="sections.patient">
                <h3><i class="pi pi-user section-icon patient-icon"></i> Patient Information</h3>
                <i :class="sections.patient ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
              </div>
              <div v-if="sections.patient" class="section-content">
                <p><strong>Name:</strong> {{ selectedDevice.patient.emergencyContactName }}</p>
                <p><strong>Date of Birth:</strong> {{ formatDate(selectedDevice.patient.dateOfBirth) }}</p>
                <p><strong>Gender:</strong> {{ selectedDevice.patient.gender }}</p>
                <p><strong>Blood Type:</strong> {{ selectedDevice.patient.bloodType }}</p>
                <p><strong>Allergies:</strong> {{ selectedDevice.patient.allergies.join(', ') || 'None' }}</p>
                <p><strong>Chronic Conditions:</strong> {{ selectedDevice.patient.chronicConditions.join(', ') || 'None' }}</p>
              </div>
            </div>
            <div class="section">
              <div class="section-header" @click="toggleSection('device')" role="button" tabindex="0" @keydown.enter="toggleSection('device')" aria-expanded="sections.device">
                <h3><i class="pi pi-cog section-icon device-icon"></i> Device Information</h3>
                <i :class="sections.device ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
              </div>
              <div v-if="sections.device" class="section-content">
                <p><strong>Device ID:</strong> {{ selectedDevice.deviceId }}</p>
                <p><strong>Device Type:</strong> {{ formatDeviceType(selectedDevice.deviceType) }}</p>
                <p><strong>Timestamp:</strong> {{ formatDate(selectedDevice.timestamp) }}</p>
                <p><strong>Abnormality Status:</strong> 
                  <span :class="['status-badge', selectedDevice.isAbnormal ? 'abnormal' : 'normal']">
                    {{ selectedDevice.isAbnormal ? 'Abnormal' : 'Normal' }}
                  </span>
                </p>
                <p v-if="selectedDevice.isAbnormal"><strong>Abnormality Reason:</strong> {{ selectedDevice.abnormalityReason || 'Not specified' }}</p>
                <p><strong>Notification Sent:</strong> {{ selectedDevice.notificationSent ? 'Yes' : 'No' }}</p>
              </div>
            </div>
            <div class="section">
              <div class="section-header" @click="toggleSection('data')" role="button" tabindex="0" @keydown.enter="toggleSection('data')" aria-expanded="sections.data">
                <h3><i class="pi pi-chart-line section-icon data-icon"></i> Device Data</h3>
                <i :class="sections.data ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
              </div>
              <div v-if="sections.data" class="section-content">
                <p v-for="(value, key) in selectedDevice.data" :key="key">
                  <strong>{{ formatDataKey(key) }}:</strong> {{ formatDataValue(key, value) }}
                </p>
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
            <h2>Delete Device Record</h2>
            <button class="modal-close" @click="showDeleteDialog = false" aria-label="Close modal">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="confirmation-content">
              <i class="pi pi-exclamation-triangle warning-icon"></i>
              <span class="confirmation-text">
                Are you sure you want to delete this device record? This action cannot be undone.
              </span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="button text-button" @click="showDeleteDialog = false" aria-label="Cancel deletion">
              Cancel
            </button>
            <button class="button danger-button" @click="deleteDevice" aria-label="Confirm delete">
              Delete Record
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
const devices = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const activeTab = ref(0)
const showDetailsModal = ref(false)
const showDeleteDialog = ref(false)
const selectedDevice = ref<any>({})
const deviceIdToDelete = ref<string | null>(null)
const sections = ref({
  patient: true,
  device: true,
  data: true,
})

// Computed
const totalPages = computed(() => Math.ceil(total.value / limit.value))

const filteredDevices = computed(() => {
  if (activeTab.value === 1) return devices.value.filter(device => device.deviceType === 'fitness-tracker')
  if (activeTab.value === 2) return devices.value.filter(device => device.deviceType === 'glucose_monitor')
  if (activeTab.value === 3) return devices.value.filter(device => device.deviceType === 'smartwatch')
  if (activeTab.value === 4) return devices.value.filter(device => device.deviceType === 'pulse_oximeter')
  return devices.value
})

// Fetch health devices
const fetchDevices = async (page: number) => {
  loading.value = true
  try {
    if (!authStore.token) {
      throw new Error('No auth token found')
    }

    const response = await apiClient.get(`/health-devices?page=${page}&limit=${limit.value}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    const { data: deviceData, total: totalDevices, page: currentPageNum, limit: limitNum } = response.data
    devices.value = deviceData
    total.value = totalDevices
    currentPage.value = currentPageNum
    limit.value = limitNum
  } catch (error) {
    console.error('Error fetching health devices:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load health devices. Please try again.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Change page
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchDevices(page)
  }
}

// Format date
const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format device type
const formatDeviceType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get data summary
const getDataSummary = (device: any) => {
  const data = device.data
  if (device.deviceType === 'glucose_monitor') {
    return `Glucose: ${data.glucoseLevel} mg/dL (${data.isFasting ? 'Fasting' : 'Non-Fasting'})`
  } else if (device.deviceType === 'pulse_oximeter') {
    return `SpO2: ${data.oxygenSaturation}%, Pulse: ${data.pulseRate} bpm`
  } else {
    return `HR: ${data.heartRate} bpm, BP: ${data.bloodPressure}, Steps: ${data.steps || 'N/A'}`
  }
}

// Format data key
const formatDataKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Format data value
const formatDataValue = (key: string, value: any) => {
  if (key === 'measurementTime') return formatDate(value)
  if (key === 'isFasting') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (key === 'glucoseLevel') return `${value} mg/dL`
    if (key === 'oxygenSaturation') return `${value}%`
    if (key === 'heartRate' || key === 'pulseRate') return `${value} bpm`
    if (key === 'temperature') return `${value} °F`
    if (key === 'sleepHours') return `${value} hours`
    return value
  }
  return value
}

// Open details modal
const openDetailsModal = (device: any) => {
  selectedDevice.value = { ...device }
  showDetailsModal.value = true
  sections.value = {
    patient: true,
    device: true,
    data: true,
  }
}

// Toggle section
const toggleSection = (section: string) => {
  sections.value[section] = !sections.value[section]
}

// Confirm delete
const confirmDelete = (id: string) => {
  deviceIdToDelete.value = id
  showDeleteDialog.value = true
}

// Delete device
const deleteDevice = async () => {
  try {
    if (!authStore.token || !deviceIdToDelete.value) {
      throw new Error('No auth token or device ID found')
    }

    await apiClient.delete(`/health-devices/${deviceIdToDelete.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Device record deleted successfully.',
      life: 3000,
    })

    showDeleteDialog.value = false
    fetchDevices(currentPage.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to delete device record. Please try again.',
      life: 3000,
    })
  }
}

// Initial fetch
onMounted(() => {
  fetchDevices(currentPage.value)
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

.health-devices-dashboard {
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

      .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: capitalize;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;

        &.normal {
          background: #d4edda;
          color: var(--success);
        }

        &.abnormal {
          background: #f8d7da;
          color: var(--danger);
        }

        &:hover {
          transform: scale(1.05);
        }
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
    max-width: 600px;
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

          &.device-icon {
            color: #6f42c1;
          }

          &.data-icon {
            color: #e83e8c;
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

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;

          &.normal {
            background: #d4edda;
            color: var(--success);
          }

          &.abnormal {
            background: #f8d7da;
            color: var(--danger);
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
}
</style>