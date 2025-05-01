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

// Format date
const formatDate = (date: string) => {
  return dayjs(date).format('MMM D, YYYY');
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
    <!-- Profile Header -->
    <div class="profile-header">
      <h1 class="profile-title">Doctor Profile</h1>
      <Button
        label="Edit Profile"
        icon="pi pi-user-edit"
        class="edit-button"
        v-tooltip.bottom="'Edit your profile'"
        @click="editProfile"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading profile...</p>
    </div>

    <!-- Profile content -->
    <div v-else-if="profile" class="profile-content">
      <Card class="profile-card">
        <template #content>
          <div class="profile-overview">
            <Avatar
              :image="profile.user.profilePicture || 'https://via.placeholder.com/100'"
              size="xlarge"
              shape="circle"
              class="profile-avatar"
            />
            <div class="profile-info">
              <h2>{{ profile.user.firstName }} {{ profile.user.lastName }}</h2>
              <p class="specialization">{{ profile.specialization || 'Not specified' }}</p>
              <p class="email">{{ profile.user.email }}</p>
              <p class="status" :class="{ active: profile.user.isActive }">
                {{ profile.user.isActive ? 'Active' : 'Inactive' }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Professional Details -->
      <div class="profile-section">
        <Fieldset legend="Professional Details" class="profile-fieldset">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">License Number:</span>
              <span class="value">{{ profile.licenseNumber || 'Not specified' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Qualifications:</span>
              <span class="value">{{ profile.qualifications?.join(', ') || 'Not specified' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Experience:</span>
              <span class="value">{{ profile.experience ? `${profile.experience} years` : 'Not specified' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Consultation Fee:</span>
              <span class="value">{{ profile.consultationFee ? `$${profile.consultationFee}` : 'Not specified' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Availability:</span>
              <span class="value">{{ profile.isAvailableForAppointments ? 'Available' : 'Not available' }}</span>
            </div>
          </div>
        </Fieldset>
      </div>

      <!-- Contact Information -->
      <div class="profile-section">
        <Fieldset legend="Contact Information" class="profile-fieldset">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Office Address:</span>
              <span class="value">{{ profile.officeAddress || 'Not specified' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Office Phone:</span>
              <span class="value">{{ profile.officePhone || 'Not specified' }}</span>
            </div>
          </div>
        </Fieldset>
      </div>

      <!-- About -->
      <div class="profile-section">
        <Fieldset legend="About" class="profile-fieldset">
          <p class="bio-text">{{ profile.bio || 'No bio provided' }}</p>
        </Fieldset>
      </div>

      <!-- Ratings -->
      <div class="profile-section">
        <Fieldset legend="Ratings" class="profile-fieldset">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Average Rating:</span>
              <span class="value">{{ profile.averageRating.toFixed(1) }} / 5 ({{ profile.totalRatings }} reviews)</span>
            </div>
          </div>
        </Fieldset>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="error-container">
      <p>Error loading profile</p>
    </div>
  </div>
</template>

<style scoped>
.doctor-profile {
  padding: 2rem;
  background: var(--surface-ground);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-title {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
}

.edit-button {
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.2);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.profile-card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.profile-overview {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border: 2px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(155, 135, 245, 0.1);
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
  font-weight: 700;
}

.specialization {
  font-size: 1.1rem;
  color: var(--primary-color);
  font-weight: 500;
  margin: 0.5rem 0;
}

.email {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin: 0.5rem 0;
}

.status {
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
  margin: 0;
}

.status.active {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status:not(.active) {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-fieldset {
  background: var(--surface-card);
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.value {
  font-size: 1rem;
  color: var(--text-color);
}

.bio-text {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.6;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-color-secondary);
}
</style>