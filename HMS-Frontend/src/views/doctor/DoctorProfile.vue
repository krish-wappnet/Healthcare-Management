<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Fieldset from 'primevue/fieldset';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import ProgressSpinner from 'primevue/progressspinner';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import dayjs from 'dayjs';

// Interface for profile data
interface DoctorProfile {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'doctor';
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    profilePicture?: string;
  };
  specialization?: string;
  qualifications?: string[];
  licenseNumber?: string;
  experience?: number;
  bio?: string;
  officeAddress?: string;
  officePhone?: string;
  consultationFee?: number;
  isAvailableForAppointments?: boolean;
  workingHours?: { _id: string };
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const profile = ref<DoctorProfile | null>(null);
const loading = ref(true);

// Fetch doctor profile
const fetchProfile = async () => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'doctor') {
    toast.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'You must be logged in as a doctor to view this page.',
      life: 3000,
    });
    router.push('/login');
    return;
  }

  loading.value = true;

  try {
    const response = await apiClient.get('/doctors/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    profile.value = response.data;
  } catch (error: any) {
    console.error('Error fetching doctor profile:', error);
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
  router.push('/doctor-registration');
};

// Change profile picture (placeholder)
const changeProfilePicture = () => {
  toast.add({
    severity: 'info',
    summary: 'Feature Coming Soon',
    detail: 'Profile picture upload is under development.',
    life: 3000,
  });
};

// Format date
const formatDate = (date?: string) => {
  return date ? dayjs(date).format('MMM D, YYYY') : 'N/A';
};

// Initial load
onMounted(async () => {
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
  <div class="doctor-profile">
    <Card v-if="!loading" class="profile-card">
      <template #header>
        <div class="profile-header">
          <div class="avatar-container">
            <Avatar
              :image="profile?.user.profilePicture || 'https://via.placeholder.com/100'"
              size="xlarge"
              shape="circle"
              class="profile-avatar"
            />
            <button
              class="change-avatar-button"
              @click="changeProfilePicture"
              aria-label="Change profile picture"
            >
              <i class="pi pi-camera"></i>
            </button>
          </div>
          <div class="profile-info">
            <h2>{{ profile?.user.firstName }} {{ profile?.user.lastName }}</h2>
            <p class="specialization">{{ profile?.specialization || 'Not specified' }}</p>
            <p class="email">{{ profile?.user.email }}</p>
            <p class="status" :class="{ active: profile?.user.isActive }">
              {{ profile?.user.isActive ? 'Active' : 'Inactive' }}
            </p>
          </div>
        </div>
      </template>

      <template #content>
        <div class="profile-content">
          <!-- Professional Details -->
          <Fieldset legend="Professional Details" class="mb-4" :style="{ animationDelay: '0s' }">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">License Number</span>
                <span class="value">{{ profile?.licenseNumber || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Qualifications</span>
                <span class="value">{{ profile?.qualifications?.join(', ') || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Experience</span>
                <span class="value">{{ profile?.experience ? `${profile.experience} years` : 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Consultation Fee</span>
                <span class="value">{{ profile?.consultationFee ? `$${profile.consultationFee}` : 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Availability</span>
                <span class="value">{{ profile?.isAvailableForAppointments ? 'Available' : 'Not available' }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Contact Information -->
          <Fieldset legend="Contact Information" class="mb-4" :style="{ animationDelay: '0.1s' }">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Office Address</span>
                <span class="value">{{ profile?.officeAddress || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Office Phone</span>
                <span class="value">{{ profile?.officePhone || 'N/A' }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- About -->
          <Fieldset legend="About" class="mb-4" :style="{ animationDelay: '0.2s' }">
            <p class="bio-text">{{ profile?.bio || 'No bio provided' }}</p>
          </Fieldset>

          <!-- Ratings -->
          <Fieldset legend="Ratings" class="mb-4" :style="{ animationDelay: '0.3s' }">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Average Rating</span>
                <span class="value">{{ profile?.averageRating.toFixed(1) }} / 5 ({{ profile?.totalRatings }} reviews)</span>
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
            aria-label="Edit Profile"
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
  --primary: #4f46e5; /* Aligned with patient profile and sidebar */
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

.doctor-profile {
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
  animation: fadeInUp 0.3s ease-out forwards;
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
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border: 2px dashed var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: border var(--transition-fast);
}

.avatar-container:hover .profile-avatar {
  border: 3px dashed var(--primary-dark);
}

.change-avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast), transform var(--transition-fast);
}

.change-avatar-button:hover {
  background: var(--primary);
  transform: scale(1.1);
}

.change-avatar-button i {
  font-size: 16px;
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

.specialization {
  margin: 0.5rem 0;
  font-size: var(--font-md);
  color: var(--primary);
  font-weight: 500;
}

.email {
  margin: 0.5rem 0;
  font-size: var(--font-sm);
  color: var(--neutral-600);
}

.status {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: 500;
  transition: transform var(--transition-fast);
}

.status:hover {
  transform: scale(1.05);
}

.status.active {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status:not(.active) {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.profile-content {
  padding: var(--space-3);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--neutral-100);
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.label {
  font-weight: 500;
  color: var(--neutral-600);
  font-size: var(--font-sm);
}

.value {
  font-size: var(--font-md);
  color: var(--neutral-800);
  font-weight: 500;
}

.bio-text {
  margin: 0;
  font-size: var(--font-md);
  color: var(--neutral-800);
  line-height: 1.6;
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
  .doctor-profile {
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

  .change-avatar-button {
    width: 28px;
    height: 28px;
  }

  .change-avatar-button i {
    font-size: 14px;
  }

  .profile-info h2 {
    font-size: 1.5rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    padding: var(--space-1);
  }

  .edit-profile-button {
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-sm);
  }
}
</style>