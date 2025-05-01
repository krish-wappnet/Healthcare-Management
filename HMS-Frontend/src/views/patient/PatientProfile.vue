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

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const profile = ref<PatientProfile | null>(null);
const loading = ref(true);

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
  <div class="profile-container">
    <Card class="profile-card">
      <template #header>
        <div class="profile-header">
          <Avatar :image="'https://via.placeholder.com/100'" class="profile-avatar" size="xlarge" shape="circle" />
          <div class="profile-info">
            <h2>{{ profile?.user.firstName }} {{ profile?.user.lastName }}</h2>
            <p class="role">Patient</p>
          </div>
        </div>
      </template>

      <template #content>
        <div class="profile-content">
          <!-- Personal Information -->
          <Fieldset legend="Personal Information" class="mb-4">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Date of Birth</span>
                <span class="field-value">{{ formatDate(profile?.dateOfBirth) }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Gender</span>
                <span class="field-value">{{ profile?.gender }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Blood Type</span>
                <span class="field-value">{{ profile?.bloodType }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Height (cm)</span>
                <span class="field-value">{{ profile?.height }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Weight (kg)</span>
                <span class="field-value">{{ profile?.weight }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Medical Information -->
          <Fieldset legend="Medical Information" class="mb-4">
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
          <Fieldset legend="Contact Information" class="mb-4">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Phone</span>
                <span class="field-value">{{ profile?.phone }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Email</span>
                <span class="field-value">{{ profile?.user.email }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Emergency Contact</span>
                <span class="field-value">{{ profile?.emergencyContactName }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Emergency Phone</span>
                <span class="field-value">{{ profile?.emergencyContactPhone }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Emergency Relation</span>
                <span class="field-value">{{ profile?.emergencyContactRelation }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Address Information -->
          <Fieldset legend="Address Information" class="mb-4">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Address</span>
                <span class="field-value">{{ profile?.address }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">City</span>
                <span class="field-value">{{ profile?.city }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">State</span>
                <span class="field-value">{{ profile?.state }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Zip Code</span>
                <span class="field-value">{{ profile?.zipCode }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Country</span>
                <span class="field-value">{{ profile?.country }}</span>
              </div>
            </div>
          </Fieldset>

          <!-- Insurance Information -->
          <Fieldset legend="Insurance Information" class="mb-4">
            <div class="profile-grid">
              <div class="profile-field">
                <span class="field-label">Provider</span>
                <span class="field-value">{{ profile?.insuranceProvider }}</span>
              </div>
              <div class="profile-field">
                <span class="field-label">Policy Number</span>
                <span class="field-value">{{ profile?.insurancePolicyNumber }}</span>
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
            class="p-button-raised"
            @click="editProfile"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-card) {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.p-fieldset) {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  margin-bottom: 2rem;
}

:deep(.p-fieldset-legend) {
  background: var(--surface-card);
  color: var(--text-color);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.profile-container {
  padding: 2rem;
  background: var(--surface-ground);
}

.profile-card {
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  border-bottom: 1px solid var(--surface-border);
  background: linear-gradient(135deg, rgba(155, 135, 245, 0.1) 0%, rgba(155, 135, 245, 0.05) 100%);
}

.profile-avatar {
  width: 8rem;
  height: 8rem;
  border: 3px solid var(--primary-color);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.1);
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-color);
  font-weight: 700;
}

.role {
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 500;
}

.profile-content {
  padding: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.field-label {
  font-weight: 500;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.field-value {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 500;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  padding: 2rem;
  border-top: 1px solid var(--surface-border);
  background: linear-gradient(135deg, rgba(155, 135, 245, 0.05) 0%, rgba(155, 135, 245, 0.02) 100%);
}

:deep(.p-button) {
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.p-button:hover) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.2);
}

:deep(.p-button:active) {
  transform: translateY(0);
}

:deep(.p-button.p-button-text) {
  color: var(--primary-color);
  background: transparent;
  border: none;
  padding: 0.5rem;
}

:deep(.p-button.p-button-text:hover) {
  background: rgba(155, 135, 245, 0.1);
}

:deep(.p-fieldset-content) {
  padding: 1rem 0;
}

:deep(.p-fieldset-content .p-fieldset-content) {
  padding: 0.5rem 0;
}
</style>