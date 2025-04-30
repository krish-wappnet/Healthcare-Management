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
                <label for="qualifications" class="form-label">Qualifications (comma-separated)</label>
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
                    v-model="qualificationsInput"
                    type="text"
                    placeholder="e.g., MD, PhD, Board Certified"
                    class="form-input"
                    :class="{ 'input-error': errors.qualifications }"
                    @focus="clearError('qualifications')"
                  />
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
  import { useAuthStore } from '../../stores/auth';
  import { useToast } from 'primevue/usetoast';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const toast = useToast();
  
  const isAuthenticated = computed(() => authStore.isAuthenticated && !!authStore.user);
  
  const form = reactive({
    user: '',
    specialization: '',
    licenseNumber: '' as string | undefined,
    qualifications: [] as string[],
    experience: undefined as number | undefined,
    bio: '' as string | undefined,
    officeAddress: '' as string | undefined,
    officePhone: '' as string | undefined,
    consultationFee: undefined as number | undefined,
    isAvailableForAppointments: true,
    workingHours: {} as Record<string, any>,
  });
  
  const errors = reactive({
    user: '',
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    experience: '',
    bio: '',
    officeAddress: '',
    officePhone: '',
    consultationFee: '',
    isAvailableForAppointments: '',
    workingHours: '',
  });
  
  const qualificationsInput = ref('');
  const isLoading = ref(false);
  
  // Check authentication and populate user ID
  onMounted(async () => {
    console.log('onMounted: Checking authentication');
    console.log('authStore.isAuthenticated:', authStore.isAuthenticated);
    console.log('authStore.user:', authStore.user);
    console.log('authStore.token:', authStore.token);
  
    // Attempt to refresh auth if token exists but user is null
    if (authStore.token && !authStore.user) {
      console.log('Attempting to refresh auth with checkAuth');
      const authSuccess = await authStore.checkAuth();
      console.log('checkAuth result:', authSuccess);
      console.log('authStore.user after checkAuth:', authStore.user);
    }
  
    if (!authStore.isAuthenticated || !authStore.user) {
      console.log('Redirecting to /login');
      router.push('/login');
    } else {
      form.user = authStore.user.id;
      console.log('Set form.user:', form.user);
    }
  });
  
  const clearError = (field: keyof typeof errors) => {
    errors[field] = '';
  };
  
  const validateForm = () => {
    console.log('Validating form');
    let isValid = true;
  
    if (!form.user) {
      errors.user = 'User ID is required';
      isValid = false;
    }
  
    if (!form.specialization.trim()) {
      errors.specialization = 'Specialization is required';
      isValid = false;
    }
  
    if (form.experience && form.experience < 0) {
      errors.experience = 'Experience cannot be negative';
      isValid = false;
    }
  
    if (form.consultationFee && form.consultationFee < 0) {
      errors.consultationFee = 'Consultation fee cannot be negative';
      isValid = false;
    }
  
    if (form.officeAddress && !form.officeAddress.trim()) {
      errors.officeAddress = 'Office address cannot be empty';
      isValid = false;
    }
  
    if (form.officePhone && !/^\+?[1-9]\d{1,14}$/.test(form.officePhone)) {
      errors.officePhone = 'Invalid phone number format';
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
  
    if (!validateForm()) {
      console.log('Validation failed, exiting');
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill out all required fields correctly',
        life: 5000,
      });
      return;
    }
  
    isLoading.value = true;
    console.log('Set isLoading to true');
  
    try {
      // Convert qualifications input to array
      form.qualifications = qualificationsInput.value
        .split(',')
        .map((q) => q.trim())
        .filter((q) => q);
      console.log('Processed qualifications:', form.qualifications);
  
      const payload = {
        user: form.user,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber || undefined,
        qualifications: form.qualifications.length ? form.qualifications : undefined,
        experience: form.experience,
        bio: form.bio || undefined,
        officeAddress: form.officeAddress || undefined,
        officePhone: form.officePhone || undefined,
        consultationFee: form.consultationFee,
        isAvailableForAppointments: form.isAvailableForAppointments,
        workingHours: form.workingHours,
      };
      console.log('Calling authStore.upgradeToDoctor with payload:', payload);
  
      await authStore.upgradeToDoctor(payload);
  
      console.log('API call successful');
      toast.add({
        severity: 'success',
        summary: 'Doctor Registration Successful',
        detail: 'Your doctor profile has been created successfully!',
        life: 5000,
      });
  
      const redirectPath = await authStore.redirectBasedOnRole();
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
    } catch (error: any) {
      console.error('API call failed:', error);
      toast.add({
        severity: 'error',
        summary: 'Doctor Registration Failed',
        detail: error.response?.data?.message || 'An error occurred during doctor registration',
        life: 5000,
      });
    } finally {
      isLoading.value = false;
      console.log('Set isLoading to false');
    }
  };
  </script>
  
  <style scoped>
  .doctor-registration-container {
    background: linear-gradient(135deg, #9b87f5 0%, #7e69ab 100%);
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
  
  .form-input:focus {
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
  
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #9b87f5 0%, #7e69ab 100%);
    color: white;
  }
  
  .loading-container .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    width: 40px;
    height: 40px;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .back-link {
    font-size: 0.85rem;
    color: #8e9196;
    text-align: center;
  }
  
  .back-link a {
    color: #9b87f5;
    text-decoration: none;
  }
  
  .back-link a:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  
    .form-group.full-width {
      grid-column: auto;
    }
  }
  
  @media (max-width: 576px) {
    .doctor-registration-card {
      max-width: 100%;
      padding: 1.5rem;
    }
  
    .app-name {
      font-size: 1.25rem;
    }
  
    .doctor-registration-title {
      font-size: 1.1rem;
    }
  
    .form-grid {
      gap: 1rem;
    }
  }
  </style>