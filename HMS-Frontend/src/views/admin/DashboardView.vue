<template>
  <div class="admin-dashboard">
    <Toast />
    <h1 class="dashboard-title">Admin Dashboard</h1>
    <div class="dashboard-content">
      <!-- Role Filter Tabs -->
      <div class="role-tabs">
        <button
          v-for="(tab, index) in ['All', 'Doctors', 'Patients']"
          :key="tab"
          :class="{ 'active-tab': activeTab === index }"
          @click="activeTab = index"
          class="tab-button"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Active</th>
              <th>Email Verified</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user._id">
              <td>{{ user.email }}</td>
              <td>{{ user.firstName }}</td>
              <td>{{ user.lastName }}</td>
              <td>
                <span :class="['role-badge', user.role]">{{ user.role }}</span>
              </td>
              <td>
                <i :class="user.isActive ? 'pi pi-check active' : 'pi pi-times inactive'"></i>
              </td>
              <td>
                <i :class="user.emailVerified ? 'pi pi-check active' : 'pi pi-times inactive'"></i>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-primary"
                  @click="openUpdateModal(user)"
                  aria-label="Edit user"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-danger"
                  @click="confirmDelete(user._id)"
                  aria-label="Delete user"
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
      <div v-if="showUpdateModal || showDeleteDialog" class="modal-backdrop"></div>

      <!-- Update User Modal -->
      <div class="modal-wrapper" v-if="showUpdateModal">
        <div class="modal update-modal">
          <div class="modal-header">
            <h2>Update User</h2>
            <button class="modal-close" @click="showUpdateModal = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <form @submit.prevent="updateUser">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  v-model="selectedUser.firstName"
                  class="input-field"
                  required
                >
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  v-model="selectedUser.lastName"
                  class="input-field"
                  required
                >
              </div>
              <div class="form-group">
                <label for="role">Role</label>
                <select
                  id="role"
                  v-model="selectedUser.role"
                  class="input-field select-field"
                  required
                >
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div class="form-group switch-group">
                <label for="isActive">Active</label>
                <div class="custom-switch">
                  <input
                    id="isActive"
                    v-model="selectedUser.isActive"
                    type="checkbox"
                  >
                  <span class="slider"></span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="button text-button" @click="showUpdateModal = false">
              Cancel
            </button>
            <button class="button primary-button" @click="updateUser">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div class="modal-wrapper" v-if="showDeleteDialog">
        <div class="modal delete-dialog">
          <div class="modal-header">
            <h2>Delete User</h2>
            <button class="modal-close" @click="showDeleteDialog = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="confirmation-content">
              <i class="pi pi-exclamation-triangle warning-icon"></i>
              <span class="confirmation-text">
                Are you sure you want to delete this user? This action cannot be undone.
              </span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="button text-button" @click="showDeleteDialog = false">
              Cancel
            </button>
            <button class="button danger-button" @click="deleteUser">
              Delete User
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import InputSwitch from 'primevue/inputswitch'

const toast = useToast()
const authStore = useAuthStore()
const users = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const activeTab = ref(0)
const showUpdateModal = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref<any>({})
const userIdToDelete = ref<string | null>(null)

// Computed
const totalPages = computed(() => Math.ceil(total.value / limit.value))

const filteredUsers = computed(() => {
  if (activeTab.value === 1) return users.value.filter(user => user.role === 'doctor')
  if (activeTab.value === 2) return users.value.filter(user => user.role === 'patient')
  return users.value
})

// Fetch users
const fetchUsers = async (page: number) => {
  loading.value = true
  try {
    if (!authStore.token) {
      throw new Error('No auth token found')
    }

    const response = await apiClient.get(`/users?page=${page}&limit=${limit.value}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    const { data: userData, total: totalUsers, page: currentPageNum, limit: limitNum } = response.data
    users.value = userData
    total.value = totalUsers
    currentPage.value = currentPageNum
    limit.value = limitNum
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users. Please try again.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Change page
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchUsers(page)
  }
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Open update modal
const openUpdateModal = (user: any) => {
  selectedUser.value = {
    ...user,
    id: user._id // Ensure we use _id as the ID property
  }
  showUpdateModal.value = true
}

// Update user
const updateUser = async () => {
  try {
    if (!authStore.token || !selectedUser.value._id) {
      throw new Error('No auth token or user ID found')
    }

    // Create a clean object with only the fields we want to update
    const updateData = {
      firstName: selectedUser.value.firstName,
      lastName: selectedUser.value.lastName,
      email: selectedUser.value.email,
      role: selectedUser.value.role,
      isActive: selectedUser.value.isActive,
      emailVerified: selectedUser.value.emailVerified
    }

    console.log('Updating user with ID:', selectedUser.value._id);
    console.log('Update data:', updateData);

    const response = await apiClient.patch(`/users/${selectedUser.value._id}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    console.log('Update response:', response);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User updated successfully.',
      life: 3000,
    })

    showUpdateModal.value = false
    fetchUsers(currentPage.value)
  } catch (error) {
    console.error('Full error details:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to update user. Please try again.',
      life: 3000,
    })
  }
}

// Confirm delete
const confirmDelete = (id: string) => {
  console.log('Attempting to delete user with data:', { id });
  userIdToDelete.value = id;
  showDeleteDialog.value = true;
  console.log('User ID set for deletion:', userIdToDelete.value);
}

// Delete user
const deleteUser = async () => {
  try {
    console.log('Attempting to delete user with ID:', userIdToDelete.value);
    console.log('Auth token:', authStore.token ? 'Present' : 'Missing');

    if (!authStore.token || !userIdToDelete.value) {
      throw new Error('No auth token or user ID found');
    }

    console.log('Making API call to delete user:', userIdToDelete.value);
    const response = await apiClient.delete(`/users/${userIdToDelete.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    console.log('Delete response:', response);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully.',
      life: 3000,
    });

    showDeleteDialog.value = false;
    fetchUsers(currentPage.value);
  } catch (error) {
    console.error('Full error details:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to delete user. Please try again.',
      life: 3000,
    });
  }
}

// Initial fetch
onMounted(() => {
  fetchUsers(currentPage.value)
})
</script>

<style scoped>
:root {
  --primary: #3b82f6;
  --primary-dark: #1e40af;
  --primary-light: #93c5fd;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background: #f9fafb;
  --border-color: #e5e7eb;
}

.admin-dashboard {
  padding: 2rem;
  background: var(--background);
  min-height: 100vh;

  .dashboard-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 2rem;
    text-align: center;
    letter-spacing: -0.025em;
  }

  .dashboard-content {
    max-width: 1280px;
    margin: 0 auto;

    .role-tabs {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      gap: 1rem;

      .tab-button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        background: white;
        border: 1px solid var(--border-color);
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &.active-tab {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &:hover:not(.active-tab) {
          background: var(--primary-light);
          color: var(--primary-dark);
        }
      }
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      padding: 2rem;

      table {
        width: 100%;
        border-collapse: collapse;

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--background);
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;

          &:last-child {
            text-align: right;
          }
        }

        .role-badge {
          padding: 0.5rem 1rem;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          text-transform: capitalize;

          &.doctor {
            background: var(--primary-light);
            color: var(--primary-dark);
          }

          &.patient {
            background: var(--neutral-100);
            color: var(--neutral-700);
          }
        }

        .active {
          color: var(--success);
        }

        .inactive {
          color: var(--danger);
        }

        .button {
          margin-left: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;

          &.primary-button {
            background: var(--primary);
            color: white;

            &:hover {
              background: var(--primary-dark);
            }
          }

          &.danger-button {
            background: var(--danger);
            color: var(--text-primary);
            border: 1px solid var(--danger);

            &:hover {
              background: #be123c;
              color: white;
            }

            &:active {
              background: #9f1239;
              color: white;
            }
          }
        }
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 2rem;

        .page-info {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          transition: all 0.2s ease;

          &:hover {
            background: var(--primary-light);
            color: var(--primary-dark);
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
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
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
      background: white;
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 450px;
      animation: modalFadeIn 0.3s ease-out;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.2s ease;

      &:hover {
        color: var(--text-primary);
      }
    }

    .modal-content {
      padding: 2rem;
    }

    .modal-footer {
      padding: 1rem 2rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .input-field {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        background: var(--background);
        color: var(--text-primary);

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }

      .select-field {
        padding-right: 2rem;
        cursor: pointer;
        appearance: none;
        background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 1rem center;
        background-size: 12px;

        &:focus {
          background-color: var(--background);
        }
      }
    }

    .button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.2s ease;
      min-width: 100px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.text-button {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border-color);

        &:hover {
          background: var(--background);
          color: var(--text-primary);
        }

        &:active {
          transform: scale(0.98);
        }
      }

      &.primary-button {
        background: var(--primary);
        color: white;

        &:hover {
          background: var(--primary-dark);
        }

        &:active {
          background: var(--primary-darker);
        }
      }

      &.danger-button {
        background: var(--danger);
        color: var(--text-primary);
        border: 1px solid var(--danger);

        &:hover {
          background: #be123c;
          color: white;
        }

        &:active {
          background: #9f1239;
          color: white;
        }
      }
    }

    .switch-group {
      display: flex;
      align-items: center;
      gap: 1rem;

      .custom-switch {
        position: relative;
        width: 48px;
        height: 24px;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: all 0.2s ease;
          border-radius: 34px;
          border: 1px solid var(--border-color);

          &:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: all 0.2s ease;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        }

        input:checked + .slider {
          background-color: var(--success);
          border-color: var(--success);

          &:before {
            transform: translateX(24px);
          }
        }

        input:focus + .slider {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
      }
    }

    /* Delete dialog specific styles */
    .delete-dialog {
      max-width: 400px;

      .modal-header h2 {
        color: var(--danger);
      }

      .confirmation-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        color: var(--text-primary);

        .warning-icon {
          font-size: 2rem;
          color: var(--danger);
          animation: pulse 1.5s infinite;
        }

        .confirmation-text {
          font-size: 1rem;
          line-height: 1.5;
          font-weight: 500;
        }
      }
    }

    /* Modal animations */
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

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.85;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .modal {
        margin: 1rem;
        width: calc(100% - 2rem);
      }

      .modal-header {
        padding: 1rem;
      }

      .modal-content {
        padding: 1rem;
      }

      .modal-footer {
        padding: 0.75rem;
      }
    }
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;

    .dashboard-title {
      font-size: 1.75rem;
    }

    .dashboard-content {
      .role-tabs {
        flex-wrap: wrap;

        .tab-button {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
      }

      .table-container {
        padding: 1rem;

        table {
          th {
            padding: 0.75rem;
            font-size: 0.9rem;
          }

          td {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
        }
      }
    }
  }
}
</style>