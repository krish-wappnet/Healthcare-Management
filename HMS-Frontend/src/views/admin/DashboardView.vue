<template>
  <div class="admin-dashboard">
    <Toast />
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
import Button from 'primevue/button'
import Toast from 'primevue/toast'

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
const isSidebarCollapsed = ref(false)

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
    id: user._id
  }
  showUpdateModal.value = true
}

// Update user
const updateUser = async () => {
  try {
    if (!authStore.token || !selectedUser.value._id) {
      throw new Error('No auth token or user ID found')
    }

    const updateData = {
      firstName: selectedUser.value.firstName,
      lastName: selectedUser.value.lastName,
      email: selectedUser.value.email,
      role: selectedUser.value.role,
      isActive: selectedUser.value.isActive,
      emailVerified: selectedUser.value.emailVerified
    }

    const response = await apiClient.patch(`/users/${selectedUser.value._id}`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User updated successfully.',
      life: 3000,
    })

    showUpdateModal.value = false
    fetchUsers(currentPage.value)
  } catch (error) {
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
  userIdToDelete.value = id
  showDeleteDialog.value = true
}

// Delete user
const deleteUser = async () => {
  try {
    if (!authStore.token || !userIdToDelete.value) {
      throw new Error('No auth token or user ID found')
    }

    await apiClient.delete(`/users/${userIdToDelete.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully.',
      life: 3000,
    })

    showDeleteDialog.value = false
    fetchUsers(currentPage.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to delete user. Please try again.',
      life: 3000,
    })
  }
}

// Initial fetch
onMounted(() => {
  fetchUsers(currentPage.value)
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
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 60px;
}

.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--background);
  font-family: 'Arial', sans-serif;
}

.sidebar {
  width: var(--sidebar-width);
  background: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  position: fixed;
  height: 100%;
  overflow-y: auto;
  z-index: 1000;

  &.sidebar-collapsed {
    width: var(--sidebar-collapsed-width);

    .sidebar-header h2,
    .nav-item span {
      display: none;
    }

    .sidebar-toggle i {
      transform: rotate(180deg);
    }
  }

  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--primary);
    }

    .sidebar-toggle {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: color 0.2s ease;
    }
  }

  .sidebar-nav {
    padding: 1rem 0;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: background 0.2s ease;

      &.active {
        background: var(--primary);
        color: #ffffff;
      }

      &:hover {
        background: var(--background);
        color: var(--primary);
      }

      i {
        margin-right: 1rem;
        font-size: 1.25rem;
      }

      span {
        font-size: 1rem;
        font-weight: 500;
      }
    }
  }
}

.dashboard-content {
  margin-left: var(--sidebar-width);
  padding: 2rem;
  flex-grow: 1;
  transition: margin-left 0.3s ease;

  .sidebar-collapsed ~ & {
    margin-left: var(--sidebar-collapsed-width);
  }

  .role-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: #ffffff;
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .tab-button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: transparent;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;

      &.active-tab {
        background: var(--primary);
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      &:hover:not(.active-tab) {
        background: var(--background);
        color: var(--primary);
      }
    }
  }

  .table-container {
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        border-bottom: 1px solid var(--border-color);
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        vertical-align: middle;
      }

      .role-badge {
        padding: 0.5rem 1rem;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: capitalize;

        &.doctor {
          background: #e7f1ff;
          color: var(--primary);
        }

        &.patient {
          background: #f8f9fa;
          color: var(--text-secondary);
        }
      }

      .active {
        color: var(--success);
      }

      .inactive {
        color: var(--danger);
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
        border-radius: 6px;
        color: var(--primary);
        transition: background 0.2s ease;

        &:hover {
          background: var(--background);
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
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 500px;
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

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: var(--primary);
      }
    }
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;

    .p-button {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &.p-button-danger {
        background: var(--danger);
        color: #000000 !important;

        &:hover {
          background: #c82333;
          color: #000000 !important;
        }
      }
    }
  }

  .form-group {
    margin-bottom: 1.25rem;

    label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .input-field {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
      }
    }

    .select-field {
      background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12  CRAIG15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.75rem center;
      background-size: 12px;
      cursor: pointer;
    }
  }

  .switch-group {
    display: flex;
    align-items: center;
    gap: 1rem;

    .custom-switch {
      position: relative;
      width: 40px;
      height: 20px;

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
        background: var(--border-color);
        transition: all 0.2s ease;
        border-radius: 20px;

        &:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background: #ffffff;
          transition: all 0.2s ease;
          border-radius: 50%;
        }
      }

      input:checked + .slider {
        background: var(--success);
      }

      input:checked + .slider:before {
        transform: translateX(20px);
      }
    }
  }

  .button {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &.text-button {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);

      &:hover {
        background: var(--background);
        color: var(--primary);
      }
    }

    &.primary-button {
      background: var(--primary);
      color: #ffffff;

      &:hover {
        background: var(--primary-dark);
      }
    }

    &.danger-button {
      background: var(--danger);
      color: #ffffff;

      &:hover {
        background: #c82333;
      }
    }
  }

  .delete-dialog {
    max-width: 400px;

    .modal-header h2 {
      color: var(--danger);
    }

    .confirmation-content {
      display: flex;
      align-items: center;
      gap: 1rem;

      .warning-icon {
        font-size: 1.5rem;
        color: var(--danger);
      }

      .confirmation-text {
        font-size: 0.95rem;
        line-height: 1.5;
        color: var(--text-primary);
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

  @media (max-width: 768px) {
    .sidebar {
      width: var(--sidebar-collapsed-width);
      &.sidebar-collapsed {
        width: 0;
        overflow: hidden;
      }

      .sidebar-header h2,
      .nav-item span {
        display: none;
      }

      &.sidebar-collapsed ~ .dashboard-content {
        margin-left: 0;
      }
    }

    .dashboard-content {
      margin-left: var(--sidebar-collapsed-width);
      padding: 1rem;

      .role-tabs {
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

      .modal {
        margin: 1rem;
        max-width: calc(100% - 2rem);
      }
    }
  }
}
</style>