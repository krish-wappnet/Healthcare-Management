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

      <div class="profile-details">
        <Fieldset legend="Professional Details">
          <div class="detail-row">
            <span class="label">License Number:</span>
            <span>{{ profile.licenseNumber || 'Not specified' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Qualifications:</span>
            <span>{{ profile.qualifications?.join(', ') || 'Not specified' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Experience:</span>
            <span>{{ profile.experience ? `${profile.experience} years` : 'Not specified' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Consultation Fee:</span>
            <span>{{ profile.consultationFee ? `$${profile.consultationFee}` : 'Not specified' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Availability:</span>
            <span>{{ profile.isAvailableForAppointments ? 'Available' : 'Not available' }}</span>
          </div>
        </Fieldset>

        <Fieldset legend="Contact Information">
          <div class="detail-row">
            <span class="label">Office Address:</span>
            <span>{{ profile.officeAddress || 'Not specified' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Office Phone:</span>
            <span>{{ profile.officePhone || 'Not specified' }}</span>
          </div>
        </Fieldset>

        <Fieldset legend="About">
          <p>{{ profile.bio || 'No bio provided' }}</p>
        </Fieldset>

        <Fieldset legend="Ratings">
          <div class="detail-row">
            <span class="label">Average Rating:</span>
            <span>{{ profile.averageRating.toFixed(1) }} / 5 ({{ profile.totalRatings }} reviews)</span>
          </div>
        </Fieldset>

        <Fieldset legend="Account Information">
          <div class="detail-row">
            <span class="label">Email Verified:</span>
            <span>{{ profile.user.emailVerified ? 'Yes' : 'No' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Created At:</span>
            <span>{{ formatDate(profile.user.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Last Updated:</span>
            <span>{{ formatDate(profile.user.updatedAt) }}</span>
          </div>
        </Fieldset>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="no-data">
      <i class="pi pi-exclamation-triangle"></i>
      <p>Unable to load profile data</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$primary: #9b87f5;
$primary-light: rgba(155, 135, 245, 0.1);
$primary-dark: #7e69ab;
$neutral-100: #f7fafc;
$neutral-500: #a0aec0;
$neutral-600: #718096;
$neutral-800: #2d3748;
$radius-md: 8px;
$radius-lg: 12px;
$space-1: 0.25rem;
$space-2: 0.5rem;
$space-3: 1rem;
$space-4: 1.5rem;
$space-6: 3rem;
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$transition-fast: 0.2s ease;
$transition-normal: 0.3s ease;
$font-sm: 0.875rem;
$font-md: 1rem;
$font-lg: 1.125rem;
$font-2xl: 1.5rem;

.doctor-profile {
  padding: $space-4;
  background-color: $neutral-100;

  .profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-4;

    .profile-title {
      font-size: $font-2xl;
      margin: 0;
      color: $neutral-800;
      font-weight: 600;
    }

    .edit-button {
      background-color: $primary;
      border-color: $primary;
      color: white;
      border-radius: $radius-md;
      padding: $space-2 $space-3;
      font-size: $font-md;
      transition: background-color $transition-fast;

      &:hover {
        background-color: $primary-dark;
      }
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-6;
    gap: $space-3;

    p {
      color: $neutral-600;
      font-size: $font-lg;
    }
  }

  .profile-content {
    display: flex;
    flex-direction: column;
    gap: $space-3;

    .profile-card {
      border-radius: $radius-lg;

      :deep(.p-card-content) {
        padding: $space-3;
      }

      .profile-overview {
        display: flex;
        align-items: center;
        gap: $space-3;

        .profile-avatar {
          width: 100px;
          height: 100px;
        }

        .profile-info {
          h2 {
            font-size: $font-2xl;
            margin: 0 0 $space-1;
            color: $neutral-800;
          }

          .specialization {
            font-size: $font-md;
            color: $primary;
            margin: 0 0 $space-1;
          }

          .email {
            font-size: $font-sm;
            color: $neutral-600;
            margin: 0 0 $space-1;
          }

          .status {
            font-size: $font-sm;
            padding: $space-1 $space-2;
            border-radius: $radius-md;
            display: inline-block;

            &.active {
              background-color: $primary-light;
              color: $primary;
            }
          }
        }
      }
    }

    .profile-details {
      display: flex;
      flex-direction: column;
      gap: $space-3;

      :deep(.p-fieldset) {
        border-radius: $radius-lg;
        padding: $space-3;

        .p-fieldset-legend {
          font-size: $font-lg;
          color: $neutral-800;
          padding: $space-2 $space-3;
          background-color: $neutral-100;
          border-radius: $radius-md;
        }

        .p-fieldset-content {
          padding: $space-2 0;
        }
      }

      .detail-row {
        display: flex;
        gap: $space-2;
        margin-bottom: $space-2;

        .label {
          font-weight: 600;
          color: $neutral-800;
          width: 150px;
        }

        span {
          color: $neutral-600;
        }
      }
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $space-6;
    color: $neutral-500;

    i {
      font-size: 32px;
      margin-bottom: $space-2;
    }

    p {
      font-size: $font-lg;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .doctor-profile {
    padding: $space-3;

    .profile-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $space-2;

      .edit-button {
        width: 100%;
        justify-content: center;
      }
    }

    .profile-content {
      .profile-card {
        .profile-overview {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .profile-details {
        .detail-row {
          flex-direction: column;
          gap: $space-1;

          .label {
            width: auto;
          }
        }
      }
    }
  }
}
</style>