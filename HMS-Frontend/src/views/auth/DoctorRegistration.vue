<template>
    <div v-if="isAuthenticated && authStore.user" class="doctor-registration-container">
      <div class="doctor-registration-card">
        <div class="doctor-registration-header">
          <h1 class="app-name">HealthSync</h1>
          <h2 class="doctor-registration-title">Doctor Registration</h2>
          <p class="doctor-registration-subtitle">
            Provide your professional details
          </p>
        </div>
  
        <div class="doctor-registration-content">
          <form @submit.prevent="handleDoctorRegistration" class="doctor-registration-form">
            <div class="form-grid">
              <!-- Specialization -->
              <div class="form-group">
                <label for="specialization" class="form-label">Specialization</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <input
                    id="specialization"
                    v-model="form.specialization"
                    type="text"
                    placeholder="Enter your specialization (e.g., Cardiology)"
                    class="form-input"
                    :class="{ 'input-error': errors.specialization }"
                    @focus="clearError('specialization')"
                    required
                  />
                </div>
                <p v-if="errors.specialization" class="error-message">
                  {{ errors.specialization }}
                </p>
              </div>
  
              <!-- License Number -->
              <div class="form-group">
                <label for="licenseNumber" class="form-label">License Number</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                    <path d="M16 3v4"></path>
                    <path d="M8 3v4"></path>
                    <path d="M3 11h18"></path>
                    <path d="M7 15h6"></path>
                  </svg>
                  <input
                    id="licenseNumber"
                    v-model="form.licenseNumber"
                    type="text"
                    placeholder="Enter your medical license number"
                    class="form-input"
                    :class="{ 'input-error': errors.licenseNumber }"
                    @focus="clearError('licenseNumber')"
                  />
                </div>
                <p v-if="errors.licenseNumber" class="error-message">
                  {{ errors.licenseNumber }}
                </p>
              </div>
  
              <!-- Qualifications -->
              <div class="form-group full-width">
                <label for="qualifications" class="form-label">Qualifications</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M21 10H3"></path>
                    <path d="M11 6l-4 4 4 4"></path>
                    <path d="M16 6l4 4-4 4"></path>
                  </svg>
                  <input
                    id="qualifications"
                    v-model="qualificationInput"
                    type="text"
                    placeholder="Add qualification and press Enter (e.g., MD)"
                    class="form-input"
                    :class="{ 'input-error': errors.qualifications }"
                    @focus="clearError('qualifications')"
                    @keyup.enter.prevent="addQualification"
                  />
                </div>
                <div class="chips-container" v-if="form.qualifications.length">
                  <span
                    v-for="(qual, index) in form.qualifications"
                    :key="index"
                    class="chip"
                  >
                    {{ qual }}
                    <button
                      type="button"
                      class="chip-remove"
                      @click="removeQualification(index)"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <p v-if="errors.qualifications" class="error-message">
                  {{ errors.qualifications }}
                </p>
              </div>
  
              <!-- Years of Experience -->
              <div class="form-group">
                <label for="experience" class="form-label">Years of Experience</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  <input
                    id="experience"
                    v-model.number="form.experience"
                    type="number"
                    placeholder="Enter years of experience"
                    class="form-input"
                    :class="{ 'input-error': errors.experience }"
                    @focus="clearError('experience')"
                  />
                </div>
                <p v-if="errors.experience" class="error-message">
                  {{ errors.experience }}
                </p>
              </div>
  
              <!-- Consultation Fee -->
              <div class="form-group">
                <label for="consultationFee" class="form-label">Consultation Fee ($)</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9 8h6M9 12h6M9 16h6"></path>
                  </svg>
                  <input
                    id="consultationFee"
                    v-model.number="form.consultationFee"
                    type="number"
                    placeholder="Enter consultation fee"
                    class="form-input"
                    :class="{ 'input-error': errors.consultationFee }"
                    @focus="clearError('consultationFee')"
                  />
                </div>
                <p v-if="errors.consultationFee" class="error-message">
                  {{ errors.consultationFee }}
                </p>
              </div>
  
              <!-- Office Address -->
              <div class="form-group full-width">
                <label for="officeAddress" class="form-label">Office Address</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input
                    id="officeAddress"
                    v-model="form.officeAddress"
                    type="text"
                    placeholder="Enter office address"
                    class="form-input"
                    :class="{ 'input-error': errors.officeAddress }"
                    @focus="clearError('officeAddress')"
                  />
                </div>
                <p v-if="errors.officeAddress" class="error-message">
                  {{ errors.officeAddress }}
                </p>
              </div>
  
              <!-- Office Phone -->
              <div class="form-group">
                <label for="officePhone" class="form-label">Office Phone</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    id="officePhone"
                    v-model="form.officePhone"
                    type="tel"
                    placeholder="Enter office phone number"
                    class="form-input"
                    :class="{ 'input-error': errors.officePhone }"
                    @focus="clearError('officePhone')"
                  />
                </div>
                <p v-if="errors.officePhone" class="error-message">
                  {{ errors.officePhone }}
                </p>
              </div>
  
              <!-- Availability -->
              <div class="form-group">
                <label for="isAvailableForAppointments" class="form-label">Available for Appointments</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                    <path d="M16 3v4"></path>
                    <path d="M8 3v4"></path>
                    <path d="M3 11h18"></path>
                  </svg>
                  <select
                    id="isAvailableForAppointments"
                    v-model="form.isAvailableForAppointments"
                    class="form-input"
                    :class="{ 'input-error': errors.isAvailableForAppointments }"
                    @focus="clearError('isAvailableForAppointments')"
                  >
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
                <p v-if="errors.isAvailableForAppointments" class="error-message">
                  {{ errors.isAvailableForAppointments }}
                </p>
              </div>
  
              <!-- Working Hours -->
              <div class="form-group full-width">
                <label class="form-label">Working Hours</label>
                <div class="working-hours-grid">
                  <div v-for="day in days" :key="day" class="working-hours-day">
                    <div class="working-hours-header">
                      <label class="form-label">{{ day }}</label>
                      <label class="switch">
                        <input
                          type="checkbox"
                          v-model="form.workingHours[day].isAvailable"
                          @change="clearError('workingHours')"
                        />
                        <span class="slider round"></span>
                      </label>
                    </div>
                    <div class="time-input-container" :class="{ 'disabled': !form.workingHours[day].isAvailable }">
                      <div class="input-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="input-icon"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v6l4 2"></path>
                        </svg>
                        <input
                          :id="`startTime-${day}`"
                          v-model="form.workingHours[day].start"
                          type="time"
                          class="form-input time-input"
                          :class="{ 'input-error': errors.workingHours && form.workingHours[day].isAvailable && !form.workingHours[day].start }"
                          @focus="clearError('workingHours')"
                          :disabled="!form.workingHours[day].isAvailable"
                        />
                      </div>
                      <span class="time-divider">to</span>
                      <div class="input-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="input-icon"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v6l4 2"></path>
                        </svg>
                        <input
                          :id="`endTime-${day}`"
                          v-model="form.workingHours[day].end"
                          type="time"
                          class="form-input time-input"
                          :class="{ 'input-error': errors.workingHours && form.workingHours[day].isAvailable && !form.workingHours[day].end }"
                          @focus="clearError('workingHours')"
                          :disabled="!form.workingHours[day].isAvailable"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p v-if="errors.workingHours" class="error-message">
                  {{ errors.workingHours }}
                </p>
              </div>
  
              <!-- Bio -->
              <div class="form-group full-width">
                <label for="bio" class="form-label">Bio</label>
                <div class="input-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="input-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <textarea
                    id="bio"
                    v-model="form.bio"
                    placeholder="Enter a short bio"
                    class="form-input"
                    :class="{ 'input-error': errors.bio }"
                    @focus="clearError('bio')"
                  ></textarea>
                </div>
                <p v-if="errors.bio" class="error-message">
                  {{ errors.bio }}
                </p>
              </div>
            </div>
  
            <div class="form-actions">
              <button type="submit" class="login-button" :disabled="isLoading">
                <span v-if="!isLoading">Complete Registration</span>
                <span v-else class="spinner"></span>
              </button>
              <p class="back-link">
                <router-link to="/role-selection">Back to Role Selection</router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-else class="loading-container">
      <p>Checking authentication...</p>
      <div class="spinner"></div>
    </div>
</template>
  
<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const isAuthenticated = computed(() => authStore.isAuthenticated && !!authStore.token);

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const form = reactive({
  specialization: '',
  licenseNumber: '',
  qualifications: [] as string[],
  experience: 0,
  consultationFee: 0,
  officeAddress: '',
  officePhone: '',
  isAvailableForAppointments: true,
  workingHours: {
    monday: { start: '', end: '', isAvailable: false },
    tuesday: { start: '', end: '', isAvailable: false },
    wednesday: { start: '', end: '', isAvailable: false },
    thursday: { start: '', end: '', isAvailable: false },
    friday: { start: '', end: '', isAvailable: false },
    saturday: { start: '', end: '', isAvailable: false },
    sunday: { start: '', end: '', isAvailable: false },
  },
});

// Get user ID from auth store
const userId = computed(() => {
  if (!authStore.token) return null;
  try {
    const base64Url = authStore.token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decodedToken = JSON.parse(window.atob(base64));
    return decodedToken.sub; // sub typically contains the user ID in JWT
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
});

const errors: Record<string, string> = {
  specialization: '',
  licenseNumber: '',
  qualifications: '',
  experience: '',
  consultationFee: '',
  officeAddress: '',
  officePhone: '',
  workingHours: '',
};

const qualificationInput = ref('');
const isLoading = ref(false);

onMounted(async () => {
  console.log('onMounted: Checking authentication');
  console.log('authStore.isAuthenticated:', authStore.isAuthenticated);
  console.log('authStore.user:', authStore.user);
  console.log('authStore.token:', authStore.token);

  if (authStore.token && !authStore.user) {
    console.log('Attempting to refresh auth with checkAuth');
    const authSuccess = await authStore.checkAuth();
    console.log('checkAuth result:', authSuccess);
    console.log('authStore.user after checkAuth:', authStore.user);
  }

  if (!authStore.isAuthenticated || !authStore.token) {
    console.log('Redirecting to /login');
    router.push('/login');
  } else {
    try {
      const decoded = jwtDecode<JwtPayload>(authStore.token);
      console.log('Set form.user from token sub:', decoded.sub);
    } catch (error) {
      console.error('Failed to decode token:', error);
      toast.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'Invalid authentication token',
        life: 5000,
      });
      router.push('/login');
    }
  }
});

const clearError = (field: keyof typeof errors) => {
  errors[field] = '';
};

const addQualification = (event: KeyboardEvent) => {
  if (qualificationInput.value && !form.qualifications.includes(qualificationInput.value)) {
    form.qualifications.push(qualificationInput.value);
    qualificationInput.value = '';
  }
  event.preventDefault();
};

const removeQualification = (index: number) => {
  form.qualifications.splice(index, 1);
  clearError('qualifications');
};

const validateForm = () => {
  console.log('Validating form');
  let isValid = true;

  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  // Validate specialization
  if (!form.specialization) {
    errors.specialization = 'Specialization is required';
    isValid = false;
  }

  // Validate license number
  if (!form.licenseNumber) {
    errors.licenseNumber = 'License number is required';
    isValid = false;
  }

  // Validate experience
  if (!form.experience || form.experience < 0) {
    errors.experience = 'Experience must be a positive number';
    isValid = false;
  }

  // Validate consultation fee
  if (!form.consultationFee || form.consultationFee < 0) {
    errors.consultationFee = 'Consultation fee must be a positive number';
    isValid = false;
  }

  // Validate office address
  if (!form.officeAddress) {
    errors.officeAddress = 'Office address is required';
    isValid = false;
  }

  // Validate office phone
  if (!form.officePhone) {
    errors.officePhone = 'Office phone number is required';
    isValid = false;
  }

  // Validate working hours
  let hasAvailableHours = false;
  Object.values(form.workingHours).forEach(day => {
    if (day.isAvailable && day.start && day.end) {
      hasAvailableHours = true;
    }
  });

  if (!hasAvailableHours) {
    errors.workingHours = 'At least one day must have available working hours';
    isValid = false;
  }

  console.log('Validation errors:', errors);
  console.log('isValid:', isValid);
  return isValid;
};

const handleDoctorRegistration = async () => {
  console.log('handleDoctorRegistration: Form submitted');
  console.log('Form data:', form);
  console.log('isLoading:', isLoading.value);

  // Prevent submission if form is invalid
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Form Validation Failed',
      detail: 'Please fix the highlighted errors and try again',
      life: 5000,
    });
    return;
  }

  isLoading.value = true;
  try {
    // Format working hours
    const formattedWorkingHours = days.reduce((acc, day) => ({
      ...acc,
      [day]: {
        start: form.workingHours[day].start || '',
        end: form.workingHours[day].end || '',
        isAvailable: form.workingHours[day].isAvailable,
      }
    }), {} as Record<string, { start: string; end: string; isAvailable: boolean }>);

    // Prepare the payload
    const payload = {
      user: userId.value,
      specialization: form.specialization,
      licenseNumber: form.licenseNumber,
      qualifications: form.qualifications,
      experience: form.experience,
      consultationFee: form.consultationFee,
      officeAddress: form.officeAddress,
      officePhone: form.officePhone,
      isAvailableForAppointments: form.isAvailableForAppointments,
      workingHours: formattedWorkingHours,
    };

    console.log('Sending payload:', payload);

    // Send the API request with authentication
    const response = await apiClient.post('/doctors', payload);
    console.log('Response:', response.data);

    // Reset the form
    form.user = '';
    form.specialization = '';
    form.licenseNumber = '';
    form.qualifications = [];
    form.experience = 0;
    form.consultationFee = 0;
    form.officeAddress = '';
    form.officePhone = '';
    form.isAvailableForAppointments = true;
    days.forEach(day => {
      form.workingHours[day].start = '';
      form.workingHours[day].end = '';
      form.workingHours[day].isAvailable = false;
    });

    // Clear the errors
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });

    // Reset the qualification input
    qualificationInput.value = '';

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Doctor registration completed successfully',
      life: 5000,
    });

    // Redirect to the doctor profile
    router.push('/doctor/profile');
  } catch (error: any) {
    // Handle the error
    console.error('API call failed:', error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'An error occurred during doctor registration';

    // Show error message
    toast.add({
      severity: 'error',
      summary: 'Doctor Registration Failed',
      detail: errorMessage,
      life: 5000,
    });
  } finally {
    // Reset loading state
    isLoading.value = false;
    console.log('Set isLoading to false');
  }

};
</script>
  
<style scoped>
.doctor-registration-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.doctor-registration-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}

.doctor-registration-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1f2c;
  margin: 0;
}

.doctor-registration-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1f2c;
  margin: 0.5rem 0;
}

.doctor-registration-subtitle {
  font-size: 0.9rem;
  color: #8e9196;
  margin: 0;
}

.doctor-registration-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doctor-registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1f2c;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #8e9196;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: #f9fafb;
  color: #1a1f2c;
  transition: border-color 0.2s ease;
}

.form networking-input:focus {
  outline: none;
  border-color: #9b87f5;
  box-shadow: 0 0 0 3px rgba(155, 135, 245, 0.15);
}

.form-input[type="textarea"] {
  min-height: 100px;
  resize: vertical;
}

.input-error {
  border-color: #ea384c !important;
}

.error-message {
  font-size: 0.75rem;
  color: #ea384c;
  margin-top: 0.25rem;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.chip {
  display: flex;
  align-items: center;
  background: #e2e8f0;
  color: #1a1f2c;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.chip-remove {
  background: none;
  border: none;
  color: #8e9196;
  font-size: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
  line-height: 1;
}

.chip-remove:hover {
  color: #ea384c;
}

.working-hours-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.working-hours-day {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.working-hours-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-input-container.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.time-input {
  padding: 0.5rem 0.75rem 0.5rem 2rem;
}

.time-divider {
  font-size: 0.85rem;
  color: #8e9196;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
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
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #9b87f5;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.login-button {
  background: linear-gradient(to right, #9b87f5, #7e69ab);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(to right, #8b5cf6, #7e69ab);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.3);
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>