
<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import ProgressSpinner from 'primevue/progressspinner';
import Tooltip from 'primevue/tooltip';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

// Interface for patient profile data
interface PatientProfile {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'patient';
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    profilePicture?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medications?: string[];
  chronicConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for API response
interface UploadResponse {
  profilePicture?: string;
  message?: string;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const profile = ref<PatientProfile | null>(null);
const loading = ref(true);
const isUploading = ref(false);
const fileInput = ref();
const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Computed properties
const fullName = computed(() => {
  return profile.value
    ? `${profile.value.user.firstName} ${profile.value.user.lastName}`
    : 'N/A';
});

const avatarUrl = computed(() => {
  return imagePreview.value || profile.value?.user.profilePicture || 'https://via.placeholder.com/100';
});

const isProfileComplete = computed(() => {
  return !!(
    profile.value?.dateOfBirth &&
    profile.value?.gender &&
    profile.value?.bloodType &&
    profile.value?.phone &&
    profile.value?.address &&
    profile.value?.emergencyContactName &&
    profile.value?.emergencyContactPhone &&
    profile.value?.emergencyContactRelation
  );
});

// Fetch patient profile
const fetchProfile = async () => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'patient') {
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'You must be logged in as a patient to view this page.',
      life: 3000,
    });
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    const response = await apiClient.get('/patients/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    profile.value = response.data;
  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to load profile',
      life: 3000,
    });
    if (error.response?.status === 401 || error.response?.status === 403) {
      await authStore.logout();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

// Navigate to edit profile
const editProfile = () => {
  router.push('/patient-registration');
};

// Handle file selection
const handleFileSelect = debounce((event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    selectedFile.value = null;
    imagePreview.value = null;
    return;
  }

  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File',
      detail: 'Please select an image file (e.g., JPG, PNG).',
      life: 3000,
    });
    selectedFile.value = null;
    imagePreview.value = null;
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: 'Image must be smaller than 5MB.',
      life: 3000,
    });
    selectedFile.value = null;
    imagePreview.value = null;
    return;
  }

  selectedFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  toast.add({
    severity: 'info',
    summary: 'File Selected',
    detail: `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
    life: 3000,
  });
}, 300);

// Upload profile picture
const uploadProfilePicture = async () => {
  if (!selectedFile.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please select an image file first.',
      life: 3000,
    });
    return;
  }

  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('profilePicture', selectedFile.value);

    if (!profile.value?.user?._id) {
      throw new Error('User ID not found');
    }
    const response = await apiClient.patch<UploadResponse>(`http://localhost:3000/users/${profile.value.user._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: response.data.message || 'Profile picture updated successfully',
      life: 3000,
    });

    // Update profile with the response data
    profile.value = response.data;
    imagePreview.value = null;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to upload profile picture',
      life: 3000,
    });
  } finally {
    isUploading.value = false;
    selectedFile.value = null;
    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value);
      imagePreview.value = null;
    }
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

// Format date
const formatDate = (date?: string) => {
  return date ? dayjs(date).format('MMM D, YYYY') : 'N/A';
};

// Initial load
onMounted(async () => {
  // No need to check ref here since we're using template refs
  if (!(await authStore.checkAuth())) {
    toast.add({
      severity: 'error',
      summary: 'Session Expired',
      detail: 'Please log in again.',
      life: 3000,
    });
    router.push('/login');
    return;
  }
  await fetchProfile();
});
</script>

<template>
  <div class="profile-container">
    <Card v-if="!loading" class="profile-card">
      <template #header>
        <div class="profile-header">
          <div class="avatar-container">
            <Avatar
              :image="profile?.user?.profilePicture || 'https://via.placeholder.com/100'"
              shape="circle"
              size="xlarge"
              class="profile-avatar"
            />
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
              aria-label="Select profile picture"
            />
            <div class="profile-picture-actions">
              <button
                class="change-avatar-button"
                @click="() => {
                  // Use the template ref directly
                  const input = $refs.fileInput;
                  if (input) {
                    input.click();
                  } else {
                    console.error('File input ref not found');
                  }
                }"
                aria-label="Add or change profile picture"
                v-tooltip="'Add/Change Profile Picture'"
              >
                <i class="pi pi-camera"></i>
              </button>
              <button
                v-if="selectedFile"
                class="upload-avatar-button"
                @click="uploadProfilePicture"
                :disabled="isUploading"
                aria-label="Upload profile picture"
                v-tooltip="'Upload Profile Picture'"
              >
                <ProgressSpinner
                  v-if="isUploading"
                  class="upload-spinner"
                  style="width: 20px; height: 20px"
                />
                <i v-else class="pi pi-upload"></i>
              </button>
            </div>
          </div>
          <div class="profile-info">
            <h2>{{ fullName }}</h2>
            <p>{{ profile?.user.email }}</p>
          </div>
          <div v-if="!isProfileComplete" class="profile-incomplete">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Profile Incomplete</span>
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-warning p-button-text"
              @click="editProfile"
              aria-label="Edit profile to complete information"
            />
          </div>
        </div>
      </template>

      <template #content>
        <div class="profile-content">
          <!-- Personal Information -->
          <Fieldset legend="Personal Information" class="mb-4" :style="{ animationDelay: '0s' }">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Date of Birth</span>
                <span class="field-value">{{ formatDate(profile?.dateOfBirth) }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Gender</span>
                <span class="field-value">{{ profile?.gender || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Blood Type</span>
                <span class="field-value">{{ profile?.bloodType || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Height (cm)</span>
                <span class="field-value">{{ profile?.height || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Weight (kg)</span>
                <span class="field-value">{{ profile?.weight || 'N/A' }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Medical Information -->
          <Fieldset legend="Medical Information" class="mb-4" :style="{ animationDelay: '0.1s' }">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Allergies</span>
                <span class="field-value">{{ profile?.allergies?.join(', ') || 'None' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Medications</span>
                <span class="field-value">{{ profile?.medications?.join(', ') || 'None' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Chronic Conditions</span>
                <span class="field-value">{{ profile?.chronicConditions?.join(', ') || 'None' }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Contact Information -->
          <Fieldset legend="Contact Information" class="mb-4" :style="{ animationDelay: '0.2s' }">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Phone</span>
                <span class="field-value">{{ profile?.phone || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Email</span>
                <span class="field-value">{{ profile?.user.email }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Emergency Contact</span>
                <span class="field-value">{{ profile?.emergencyContactName || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Emergency Phone</span>
                <span class="field-value">{{ profile?.emergencyContactPhone || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Emergency Relation</span>
                <span class="field-value">{{ profile?.emergencyContactRelation || 'N/A' }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Address Information -->
          <Fieldset legend="Address Information" class="mb-4" :style="{ animationDelay: '0.3s' }">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Address</span>
                <span class="field-value">{{ profile?.address || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">City</span>
                <span class="field-value">{{ profile?.city || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">State</span>
                <span class="field-value">{{ profile?.state || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Zip Code</span>
                <span class="field-value">{{ profile?.zipCode || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Country</span>
                <span class="field-value">{{ profile?.country || 'N/A' }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Insurance Information -->
          <Fieldset legend="Insurance Information" class="mb-4" :style="{ animationDelay: '0.4s' }">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Provider</span>
                <span class="field-value">{{ profile?.insuranceProvider || 'N/A' }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Policy Number</span>
                <span class="field-value">{{ profile?.insurancePolicyNumber || 'N/A' }}</span>
              </div>
            </div>
          </Fieldset>
        </div>
      </template>

      <template #footer>
        <div class="profile-actions">
          <Button
            label="Edit Profile"
            icon="pi pi-pencil"
            class="p-button-raised edit-profile-button"
            @click="editProfile"
            aria-label="Edit profile information"
          />
        </div>
      </template>
    </Card>

    <div v-else class="loading-container">
      <ProgressSpinner class="loading-spinner" />
      <p>Loading profile...</p>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #4f46e5;
  --primary-dark: #3730a3;
  --primary-light: #a5b4fc;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --font-sm: 0.875rem;
  --font-md: 1rem;
  --font-lg: 1.25rem;
  --radius-md: 0.375rem;
  --transition-fast: 0.2s ease-out;
  --transition-normal: 0.3s ease-out;
}

.profile-container {
  padding: var(--space-3);
  background: var(--neutral-100);
  min-height: 100vh;
}

:deep(.p-card) {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-fast);
}

:deep(.p-card):hover {
  box-shadow: var(--shadow-lg);
}

:deep(.p-fieldset) {
  background: white;
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-3);
  animation: fadeInUp 0.4s ease-out forwards;
}

:deep(.p-fieldset-legend) {
  background: linear-gradient(90deg, var(--primary-light) 0%, white 100%);
  color: var(--primary-dark);
  font-weight: 600;
  font-size: var(--font-md);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  margin-left: var(--space-2);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--neutral-100);
  border-bottom: 3px solid var(--primary);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  transition: transform var(--transition-fast);
}

.avatar-container:hover {
  transform: scale(1.05);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border: 2px solid var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: border var(--transition-fast);
}

.avatar-container:hover .profile-avatar {
  border: 3px solid var(--primary-dark);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden {
  display: none;
}

.profile-picture-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translate(-25%, 25%);
  display: flex;
  gap: var(--space-2);
}

.change-avatar-button,
.upload-avatar-button {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
}

.change-avatar-button:hover,
.upload-avatar-button:not(:disabled):hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.change-avatar-button i,
.upload-avatar-button i {
  font-size: 18px;
  color: white;
}

.upload-spinner {
  width: 20px;
  height: 20px;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--neutral-800);
  font-weight: 700;
}

.profile-info p {
  margin: 0.5rem 0 0;
  font-size: var(--font-md);
  color: var(--neutral-600);
}

.profile-incomplete {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: #f59e0b;
  font-size: var(--font-sm);
  font-weight: 500;
}

.profile-incomplete i {
  font-size: 18px;
}

.profile-content {
  padding: var(--space-3);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--neutral-100);
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.profile-field:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.field-label {
  font-weight: 500;
  color: var(--neutral-600);
  font-size: var(--font-sm);
}

.field-value {
  font-size: var(--font-md);
  color: var(--neutral-800);
  font-weight: 500;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-3);
  border-top: 1px solid var(--neutral-200);
  background: linear-gradient(135deg, var(--primary-light) 0%, white 100%);
}

.edit-profile-button {
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-weight: 500;
  transition: all var(--transition-fast), transform var(--transition-fast);
}

.edit-profile-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.edit-profile-button:active {
  transform: translateY(0);
}

:deep(.p-button.p-button-text) {
  color: var(--primary);
  background: transparent;
  border: none;
  padding: var(--space-1);
}

:deep(.p-button.p-button-text:hover) {
  background: var(--primary-light);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-md);
}

.loading-spinner {
  width: 48px;
  height: 48px;
}

.loading-container p {
  margin-top: var(--space-2);
  font-size: var(--font-md);
  color: var(--neutral-600);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .profile-container {
    padding: var(--space-2);
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .avatar-container {
    width: 80px;
    height: 80px;
  }

  .profile-picture-actions {
    bottom: 0;
    left: 0;
    transform: translate(-25%, 25%);
    gap: var(--space-1);
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius-md);
    padding: 4px;
  }

  .change-avatar-button,
  .upload-avatar-button {
    width: 28px;
    height: 28px;
  }

  .change-avatar-button i,
  .upload-avatar-button i {
    font-size: 14px;
  }

  .upload-spinner {
    width: 16px;
    height: 16px;
  }

  .profile-info h2 {
    font-size: 1.5rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .profile-field {
    padding: var(--space-1);
  }

  .edit-profile-button {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-sm);
  }
}
</style>
