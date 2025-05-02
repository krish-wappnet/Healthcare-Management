<template>
  <div class="admin-dashboard">
    <Toast />
    <h1 class="dashboard-title">Admin Dashboard</h1>
    <div class="dashboard-content">
      <!-- Role Filter Tabs -->
      <TabView v-model:activeIndex="activeTab" class="role-tabs">
        <TabPanel header="All"></TabPanel>
        <TabPanel header="Doctors"></TabPanel>
        <TabPanel header="Patients"></TabPanel>
      </TabView>

      <!-- Users Table -->
      <div class="table-container">
        <DataTable
          :value="filteredUsers"
          :loading="loading"
          class="users-table"
          responsiveLayout="scroll"
          :rowHover="true"
          :rows="limit"
        >
          <Column field="email" header="Email" sortable style="width: 20%;">
            <template #body="{ data }">
              <span>{{ data.email }}</span>
            </template>
          </Column>
          <Column field="firstName" header="First Name" sortable style="width: 15%;">
            <template #body="{ data }">
              <span>{{ data.firstName }}</span>
            </template>
          </Column>
          <Column field="lastName" header="Last Name" sortable style="width: 15%;">
            <template #body="{ data }">
              <span>{{ data.lastName }}</span>
            </template>
          </Column>
          <Column field="role" header="Role" sortable style="width: 10%;">
            <template #body="{ data }">
              <span class="role-badge" :class="data.role">{{ data.role }}</span>
            </template>
          </Column>
          <Column field="isActive" header="Active" sortable style="width: 10%;">
            <template #body="{ data }">
              <i :class="data.isActive ? 'pi pi-check active' : 'pi pi-times inactive'"></i>
            </template>
          </Column>
          <Column field="emailVerified" header="Email Verified" sortable style="width: 10%;">
            <template #body="{ data }">
              <i :class="data.emailVerified ? 'pi pi-check active' : 'pi pi-times inactive'"></i>
            </template>
          </Column>
          <Column field="createdAt" header="Created At" sortable style="width: 10%;">
            <template #body="{ data }">
              <span>{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>
          <Column header="Actions" style="width: 10%;">
            <template #body="{ data }">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text p-button-primary"
                @click="openUpdateModal(data)"
                aria-label="Edit user"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                @click="confirmDelete(data._id)"
                aria-label="Delete user"
              />
            </template>
          </Column>
        </DataTable>

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

      <!-- Update User Modal -->
      <Dialog
        v-model:visible="showUpdateModal"
        header="Update User"
        :modal="true"
        :style="{ width: '450px' }"
        class="update-modal"
      >
        <div class="modal-content">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <InputText
              id="firstName"
              v-model="selectedUser.firstName"
              class="p-inputtext w-full input-field"
              placeholder="Enter first name"
            />
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <InputText
              id="lastName"
              v-model="selectedUser.lastName"
              class="p-inputtext w-full input-field"
              placeholder="Enter last name"
            />
          </div>
          <div class="form-group">
            <label for="role">Role</label>
            <Dropdown
              id="role"
              v-model="selectedUser.role"
              :options="['doctor', 'patient']"
              class="w-full input-field"
              placeholder="Select role"
            />
          </div>
          <div class="form-group switch-group">
            <label for="isActive">Active</label>
            <InputSwitch v-model="selectedUser.isActive" class="custom-switch" />
          </div>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            class="p-button-text cancel-btn"
            @click="showUpdateModal = false"
          />
          <Button
            label="Save"
            class="p-button-primary save-btn"
            @click="updateUser"
          />
        </template>
      </Dialog>

      <!-- Delete Confirmation Dialog -->
      <Dialog
        v-model:visible="showDeleteDialog"
        header="Confirm Deletion"
        :modal="true"
        :style="{ width: '400px' }"
        class="delete-dialog"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle warning-icon" />
          <span class="confirmation-text">
            Are you sure you want to delete this user? This action cannot be undone.
          </span>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            class="p-button-text cancel-btn"
            @click="showDeleteDialog = false"
          />
          <Button
            label="Delete"
            class="p-button-danger delete-btn"
            @click="deleteUser"
          />
        </template>
      </Dialog>
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
  selectedUser.value = { ...user }
  showUpdateModal.value = true
}

// Update user
const updateUser = async () => {
  try {
    if (!authStore.token) {
      throw new Error('No auth token found')
    }

    await apiClient.patch(`/users/${selectedUser.value.id}`, selectedUser.value, {
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
    console.error('Error updating user:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update user. Please try again.',
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

<style lang="scss" scoped>
:root {
  --primary: #3b82f6;
  --primary-dark: #1e40af;
  --primary-light: #93c5fd;
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-700: #374151;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
}

.admin-dashboard {
  padding: 2rem;
  background: var(--neutral-50);
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
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      :deep(.p-tabview-nav) {
        background: transparent;
        border: none;
        display: flex;
        justify-content: center;
      }

      :deep(.p-tabview-nav-link) {
        padding: 1rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-secondary);
        transition: all 0.2s ease;
        border-radius: 8px;
        margin: 0 0.5rem;

        &.p-highlight {
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &:hover {
          background: var(--primary-light);
          color: var(--primary-dark);
        }
      }

      :deep(.p-tabview-panels) {
        display: none;
      }
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      padding: 2rem;
      overflow-x: auto;

      .users-table {
        :deep(.p-datatable-table) {
          font-size: 1rem;
          color: var(--text-primary);
        }

        :deep(.p-datatable-header) {
          background: var(--neutral-50);
          border-bottom: 1px solid var(--border-color);
          padding: 1.5rem;
          font-weight: 600;
          color: var(--neutral-700);
          text-align: left;
        }

        :deep(.p-datatable-tbody) {
          tr {
            transition: background 0.2s ease;

            &:hover {
              background: var(--neutral-100);
            }
          }

          td {
            padding: 1.25rem;
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
          }
        }

        .role-badge {
          padding: 0.5rem 1rem;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
          display: inline-block;

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

        .p-button {
          color: var(--primary);
          font-size: 1.25rem;
          transition: all 0.2s ease;

          &:hover {
            background: var(--neutral-100);
            color: var(--primary-dark);
          }

          &:disabled {
            color: var(--neutral-200);
            cursor: not-allowed;
          }
        }
      }
    }

    /* Enhanced Update Modal Styling */
    :deep(.update-modal) {
      .p-dialog {
        border-radius: 16px !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
        background: white !important;
        animation: modalFadeIn 0.3s ease-out !important;
        transform: translateY(0) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        
        &:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2) !important;
        }

        .p-dialog-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
          color: white !important;
          padding: 1.5rem 2rem !important;
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          border-top-left-radius: 16px !important;
          border-top-right-radius: 16px !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          border-bottom: none !important;

          .p-dialog-title {
            flex-grow: 1 !important;
          }

          .p-dialog-header-icon {
            color: white !important;
            font-size: 1.25rem !important;
            background: rgba(255, 255, 255, 0.15) !important;
            border-radius: 50% !important;
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 0.2s ease !important;
            border: none !important;

            &:hover {
              background: rgba(255, 255, 255, 0.25) !important;
            }
          }
        }

        .p-dialog-content {
          padding: 2rem !important;
          background: white !important;

          .modal-content {
            .form-group {
              margin-bottom: 1.5rem !important;

              label {
                display: block !important;
                font-size: 0.9rem !important;
                font-weight: 600 !important;
                color: var(--text-primary) !important;
                margin-bottom: 0.5rem !important;
                transition: color 0.2s ease !important;
              }

              .input-field {
                border: 1px solid var(--neutral-200) !important;
                border-radius: 8px !important;
                padding: 0.75rem 1rem !important;
                font-size: 0.95rem !important;
                transition: all 0.2s ease !important;
                width: 100% !important;
                box-sizing: border-box !important;
                background: var(--neutral-50) !important;
                border: none !important;

                &:focus {
                  border-color: var(--primary) !important;
                  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
                  background: white !important;
                }

                &:hover {
                  border-color: var(--primary-light) !important;
                }

                /* Dropdown specific */
                &.p-dropdown {
                  background: var(--neutral-50) !important;
                  border: 1px solid var(--neutral-200) !important;

                  &:hover {
                    border-color: var(--primary-light) !important;
                  }

                  &.p-focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
                  }

                  .p-dropdown-label {
                    font-size: 0.95rem !important;
                    color: var(--text-primary) !important;
                  }

                  .p-dropdown-trigger {
                    color: var(--text-secondary) !important;
                  }
                }
              }
            }

            .switch-group {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              margin-bottom: 1.5rem !important;

              label {
                font-size: 0.9rem !important;
                font-weight: 600 !important;
                color: var(--text-primary) !important;
              }

              .custom-switch {
                :deep(.p-inputswitch) {
                  width: 48px !important;
                  height: 24px !important;
                  border: none !important;

                  .p-inputswitch-slider {
                    background: var(--neutral-200) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                    border: none !important;

                    &:before {
                      width: 20px !important;
                      height: 20px !important;
                      margin-top: 2px !important;
                      margin-left: 2px !important;
                      background: white !important;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                      transition: transform 0.3s ease !important;
                      border: none !important;
                    }
                  }

                  &.p-inputswitch-checked {
                    .p-inputswitch-slider {
                      background: var(--primary) !important;

                      &:before {
                        transform: translateX(24px) !important;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        .p-dialog-footer {
          padding: 1.5rem 2rem !important;
          background: white !important;
          border-top: 1px solid var(--neutral-200) !important;
          border-bottom-left-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
          display: flex !important;
          justify-content: flex-end !important;
          gap: 1rem !important;
          border-bottom: none !important;
        }

        .cancel-btn,
        .save-btn {
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          min-width: 100px !important;
          border: none !important;

          &:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          }

          &:active {
            transform: translateY(0) !important;
          }
        }

        .cancel-btn {
          color: var(--text-secondary) !important;
          background: transparent !important;
          border: 1px solid var(--neutral-200) !important;

          &:hover {
            background: var(--neutral-100) !important;
            color: var(--text-primary) !important;
          }
        }

        .save-btn {
          background: var(--primary) !important;
          color: white !important;

          &:hover {
            background: var(--primary-dark) !important;
          }
        }
      }
    }

    /* Enhanced Delete Confirmation Dialog Styling */
    :deep(.delete-dialog) {
      .p-dialog {
        border-radius: 16px !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
        background: white !important;
        animation: modalFadeIn 0.3s ease-out !important;
        transform: translateY(0) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        
        &:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2) !important;
        }

        .p-dialog-header {
          background: linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%) !important;
          color: white !important;
          padding: 1.5rem 2rem !important;
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          border-top-left-radius: 16px !important;
          border-top-right-radius: 16px !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.75rem !important;
          border-bottom: none !important;

          .p-dialog-title {
            flex-grow: 1 !important;
          }

          .p-dialog-header-icon {
            color: white !important;
            font-size: 1.25rem !important;
            background: rgba(255, 255, 255, 0.15) !important;
            border-radius: 50% !important;
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 0.2s ease !important;
            border: none !important;

            &:hover {
              background: rgba(255, 255, 255, 0.25) !important;
            }
          }
        }

        .p-dialog-content {
          padding: 2rem !important;
          background: white !important;

          .confirmation-content {
            display: flex !important;
            align-items: center !important;
            gap: 1.5rem !important;
            color: var(--text-primary) !important;

            .warning-icon {
              font-size: 2rem !important;
              color: var(--danger) !important;
              animation: pulse 1.5s infinite !important;
            }

            .confirmation-text {
              font-size: 1rem !important;
              line-height: 1.5 !important;
              color: var(--text-primary) !important;
              font-weight: 500 !important;
            }
          }
        }

        .p-dialog-footer {
          padding: 1.5rem 2rem !important;
          background: white !important;
          border-top: 1px solid var(--neutral-200) !important;
          border-bottom-left-radius: 16px !important;
          border-bottom-right-radius: 16px !important;
          display: flex !important;
          justify-content: flex-end !important;
          gap: 1rem !important;
          border-bottom: none !important;
        }

        .cancel-btn,
        .delete-btn {
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          min-width: 100px !important;
          border: none !important;

          &:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          }

          &:active {
            transform: translateY(0) !important;
          }
        }

        .cancel-btn {
          color: var(--text-secondary) !important;
          background: transparent !important;
          border: 1px solid var(--neutral-200) !important;

          &:hover {
            background: var(--neutral-100) !important;
            color: var(--text-primary) !important;
          }
        }

        .delete-btn {
          background: var(--danger) !important;
          color: white !important;

          &:hover {
            background: #b91c1c !important;
          }
        }
      }
    }
  }

  /* Animation for modal fade-in */
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Animation for pulse effect */
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
    .admin-dashboard {
      padding: 1rem;

      .dashboard-title {
        font-size: 1.75rem;
      }

      .dashboard-content {
        .role-tabs {
          :deep(.p-tabview-nav-link) {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            margin: 0 0.25rem;
          }
        }

        .table-container {
          padding: 1rem;

          .users-table {
            :deep(.p-datatable-tbody) {
              tr {
                td {
                  padding: 0.75rem;
                  font-size: 0.9rem;
                }
              }
            }
          }
        }

        .update-modal,
        .delete-dialog {
          :deep(.p-dialog) {
            width: 90% !important;
            max-width: 400px;
          }

          .p-dialog-header {
            padding: 1.25rem 1.5rem;
            font-size: 1.1rem;
          }

          .p-dialog-content {
            padding: 1.5rem;
          }

          .p-dialog-footer {
            padding: 1.25rem 1.5rem;
          }

          .cancel-btn,
          .save-btn,
          .delete-btn {
            padding: 0.65rem 1.25rem;
            font-size: 0.9rem;
            min-width: 90px;
          }

          .modal-content {
            .form-group {
              margin-bottom: 1.25rem;

              label {
                font-size: 0.85rem;
              }

              .input-field {
                padding: 0.65rem 0.9rem;
                font-size: 0.9rem;
              }
            }

            .switch-group {
              margin-bottom: 1.25rem;

              .custom-switch {
                :deep(.p-inputswitch) {
                  width: 44px;
                  height: 22px;

                  .p-inputswitch-slider {
                    &:before {
                      width: 18px;
                      height: 18px;
                      margin-top: 2px;
                      margin-left: 2px;
                    }
                  }

                  &.p-inputswitch-checked {
                    .p-inputswitch-slider {
                      &:before {
                        transform: translateX(22px);
                      }
                    }
                  }
                }
              }
            }
          }

          .confirmation-content {
            gap: 1rem;

            .warning-icon {
              font-size: 1.75rem;
            }

            .confirmation-text {
              font-size: 0.95rem;
            }
          }
        }
      }
    }
  }
}
</style>