<template>
    <div v-if="isAuthenticated && authStore.user" class="patient-registration-container">
      <div class="patient-registration-card">
        <div class="patient-registration-header">
          <h1 class="app-name">HealthSync</h1>
          <h2 class="patient-registration-title">Patient Registration</h2>
          <p class="patient-registration-subtitle">
            Provide your personal and medical details
          </p>
        </div>
  
        <div class="patient-registration-content">
          <form @submit.prevent="handlePatientRegistration" class="patient-registration-form">
            <div class="form-grid">
              <!-- Date of Birth -->
              <div class="form-group">
                <label for="dateOfBirth" class="form-label">Date of Birth</label>
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
                  <input
                    id="dateOfBirth"
                    v-model="form.dateOfBirth"
                    type="date"
                    class="form-input"
                    :class="{ 'input-error': errors.dateOfBirth }"
                    @focus="clearError('dateOfBirth')"
                    required
                  />
                </div>
                <p v-if="errors.dateOfBirth" class="error-message">
                  {{ errors.dateOfBirth }}
                </p>
              </div>
  
              <!-- Gender -->
              <div class="form-group">
                <label for="gender" class="form-label">Gender</label>
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
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M12 12v8"></path>
                    <path d="M8 16h8"></path>
                  </svg>
                  <select
                    id="gender"
                    v-model="form.gender"
                    class="form-input"
                    :class="{ 'input-error': errors.gender }"
                    @focus="clearError('gender')"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <p v-if="errors.gender" class="error-message">
                  {{ errors.gender }}
                </p>
              </div>
  
              <!-- Blood Type -->
              <div class="form-group">
                <label for="bloodType" class="form-label">Blood Type</label>
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
                    <path d="M12 2a10 10 0 0 0-7 17.3L12 22l7-2.7A10 10 0 0 0 12 2z"></path>
                  </svg>
                  <select
                    id="bloodType"
                    v-model="form.bloodType"
                    class="form-input"
                    :class="{ 'input-error': errors.bloodType }"
                    @focus="clearError('bloodType')"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <p v-if="errors.bloodType" class="error-message">
                  {{ errors.bloodType }}
                </p>
              </div>
  
              <!-- Height -->
              <div class="form-group">
                <label for="height" class="form-label">Height (cm)</label>
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
                    <path d="M12 2v20"></path>
                    <path d="M8 4h8"></path>
                    <path d="M8 20h8"></path>
                  </svg>
                  <input
                    id="height"
                    v-model.number="form.height"
                    type="number"
                    placeholder="Enter height in cm"
                    class="form-input"
                    :class="{ 'input-error': errors.height }"
                    @focus="clearError('height')"
                  />
                </div>
                <p v-if="errors.height" class="error-message">
                  {{ errors.height }}
                </p>
              </div>
  
              <!-- Weight -->
              <div class="form-group">
                <label for="weight" class="form-label">Weight (kg)</label>
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
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  <input
                    id="weight"
                    v-model.number="form.weight"
                    type="number"
                    placeholder="Enter weight in kg"
                    class="form-input"
                    :class="{ 'input-error': errors.weight }"
                    @focus="clearError('weight')"
                  />
                </div>
                <p v-if="errors.weight" class="error-message">
                  {{ errors.weight }}
                </p>
              </div>
  
              <!-- Allergies -->
              <div class="form-group full-width">
                <label for="allergies" class="form-label">Allergies (comma-separated)</label>
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
                    <path d="M12 2v20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                  <input
                    id="allergies"
                    v-model="allergiesInput"
                    type="text"
                    placeholder="e.g., Peanuts, Penicillin"
                    class="form-input"
                    :class="{ 'input-error': errors.allergies }"
                    @focus="clearError('allergies')"
                  />
                </div>
                <p v-if="errors.allergies" class="error-message">
                  {{ errors.allergies }}
                </p>
              </div>
  
              <!-- Medications -->
              <div class="form-group full-width">
                <label for="medications" class="form-label">Medications (comma-separated)</label>
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
                    <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z"></path>
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  <input
                    id="medications"
                    v-model="medicationsInput"
                    type="text"
                    placeholder="e.g., Aspirin, Insulin"
                    class="form-input"
                    :class="{ 'input-error': errors.medications }"
                    @focus="clearError('medications')"
                  />
                </div>
                <p v-if="errors.medications" class="error-message">
                  {{ errors.medications }}
                </p>
              </div>
  
              <!-- Chronic Conditions -->
              <div class="form-group full-width">
                <label for="chronicConditions" class="form-label">Chronic Conditions (comma-separated)</label>
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
                    <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  <input
                    id="chronicConditions"
                    v-model="chronicConditionsInput"
                    type="text"
                    placeholder="e.g., Diabetes, Hypertension"
                    class="form-input"
                    :class="{ 'input-error': errors.chronicConditions }"
                    @focus="clearError('chronicConditions')"
                  />
                </div>
                <p v-if="errors.chronicConditions" class="error-message">
                  {{ errors.chronicConditions }}
                </p>
              </div>
  
              <!-- Emergency Contact Name -->
              <div class="form-group">
                <label for="emergencyContactName" class="form-label">Emergency Contact Name</label>
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
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>
                  </svg>
                  <input
                    id="emergencyContactName"
                    v-model="form.emergencyContactName"
                    type="text"
                    placeholder="Enter contact name"
                    class="form-input"
                    :class="{ 'input-error': errors.emergencyContactName }"
                    @focus="clearError('emergencyContactName')"
                  />
                </div>
                <p v-if="errors.emergencyContactName" class="error-message">
                  {{ errors.emergencyContactName }}
                </p>
              </div>
  
              <!-- Emergency Contact Phone -->
              <div class="form-group">
                <label for="emergencyContactPhone" class="form-label">Emergency Contact Phone</label>
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
                    id="emergencyContactPhone"
                    v-model="form.emergencyContactPhone"
                    type="tel"
                    placeholder="Enter contact phone"
                    class="form-input"
                    :class="{ 'input-error': errors.emergencyContactPhone }"
                    @focus="clearError('emergencyContactPhone')"
                  />
                </div>
                <p v-if="errors.emergencyContactPhone" class="error-message">
                  {{ errors.emergencyContactPhone }}
                </p>
              </div>
  
              <!-- Emergency Contact Relation -->
              <div class="form-group">
                <label for="emergencyContactRelation" class="form-label">Emergency Contact Relation</label>
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
                    <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z"></path>
                    <path d="M12 8v4l3 3"></path>
                  </svg>
                  <input
                    id="emergencyContactRelation"
                    v-model="form.emergencyContactRelation"
                    type="text"
                    placeholder="Enter relation"
                    class="form-input"
                    :class="{ 'input-error': errors.emergencyContactRelation }"
                    @focus="clearError('emergencyContactRelation')"
                  />
                </div>
                <p v-if="errors.emergencyContactRelation" class="error-message">
                  {{ errors.emergencyContactRelation }}
                </p>
              </div>
  
              <!-- Address -->
              <div class="form-group full-width">
                <label for="address" class="form-label">Address</label>
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
                    id="address"
                    v-model="form.address"
                    type="text"
                    placeholder="Enter address"
                    class="form-input"
                    :class="{ 'input-error': errors.address }"
                    @focus="clearError('address')"
                  />
                </div>
                <p v-if="errors.address" class="error-message">
                  {{ errors.address }}
                </p>
              </div>
  
              <!-- City -->
              <div class="form-group">
                <label for="city" class="form-label">City</label>
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
                  </svg>
                  <input
                    id="city"
                    v-model="form.city"
                    type="text"
                    placeholder="Enter city"
                    class="form-input"
                    :class="{ 'input-error': errors.city }"
                    @focus="clearError('city')"
                  />
                </div>
                <p v-if="errors.city" class="error-message">
                  {{ errors.city }}
                </p>
              </div>
  
              <!-- State -->
              <div class="form-group">
                <label for="state" class="form-label">State</label>
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
                  </svg>
                  <input
                    id="state"
                    v-model="form.state"
                    type="text"
                    placeholder="Enter state"
                    class="form-input"
                    :class="{ 'input-error': errors.state }"
                    @focus="clearError('state')"
                  />
                </div>
                <p v-if="errors.state" class="error-message">
                  {{ errors.state }}
                </p>
              </div>
  
              <!-- Zip Code -->
              <div class="form-group">
                <label for="zipCode" class="form-label">Zip Code</label>
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
                  </svg>
                  <input
                    id="zipCode"
                    v-model="form.zipCode"
                    type="text"
                    placeholder="Enter zip code"
                    class="form-input"
                    :class="{ 'input-error': errors.zipCode }"
                    @focus="clearError('zipCode')"
                  />
                </div>
                <p v-if="errors.zipCode" class="error-message">
                  {{ errors.zipCode }}
                </p>
              </div>
  
              <!-- Country -->
              <div class="form-group">
                <label for="country" class="form-label">Country</label>
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
                    <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z"></path>
                  </svg>
                  <input
                    id="country"
                    v-model="form.country"
                    type="text"
                    placeholder="Enter country"
                    class="form-input"
                    :class="{ 'input-error': errors.country }"
                    @focus="clearError('country')"
                  />
                </div>
                <p v-if="errors.country" class="error-message">
                  {{ errors.country }}
                </p>
              </div>
  
              <!-- Phone -->
              <div class="form-group">
                <label for="phone" class="form-label">Phone</label>
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
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    placeholder="Enter phone number"
                    class="form-input"
                    :class="{ 'input-error': errors.phone }"
                    @focus="clearError('phone')"
                  />
                </div>
                <p v-if="errors.phone" class="error-message">
                  {{ errors.phone }}
                </p>
              </div>
  
              <!-- Insurance Provider -->
              <div class="form-group">
                <label for="insuranceProvider" class="form-label">Insurance Provider</label>
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
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"></path>
                  </svg>
                  <input
                    id="insuranceProvider"
                    v-model="form.insuranceProvider"
                    type="text"
                    placeholder="Enter insurance provider"
                    class="form-input"
                    :class="{ 'input-error': errors.insuranceProvider }"
                    @focus="clearError('insuranceProvider')"
                  />
                </div>
                <p v-if="errors.insuranceProvider" class="error-message">
                  {{ errors.insuranceProvider }}
                </p>
              </div>
  
              <!-- Insurance Policy Number -->
              <div class="form-group">
                <label for="insurancePolicyNumber" class="form-label">Insurance Policy Number</label>
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
                    <path d="M3 11h18"></path>
                  </svg>
                  <input
                    id="insurancePolicyNumber"
                    v-model="form.insurancePolicyNumber"
                    type="text"
                    placeholder="Enter policy number"
                    class="form-input"
                    :class="{ 'input-error': errors.insurancePolicyNumber }"
                    @focus="clearError('insurancePolicyNumber')"
                  />
                </div>
                <p v-if="errors.insurancePolicyNumber" class="error-message">
                  {{ errors.insurancePolicyNumber }}
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
  
  const form = reactive({
    user: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: undefined as number | undefined,
    weight: undefined as number | undefined,
    allergies: [] as string[],
    medications: [] as string[],
    chronicConditions: [] as string[],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  });
  
  const errors = reactive({
    user: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    allergies: '',
    medications: '',
    chronicConditions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  });
  
  const allergiesInput = ref('');
  const medicationsInput = ref('');
  const chronicConditionsInput = ref('');
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
        form.user = decoded.sub;
        console.log('Set form.user from token sub:', form.user);
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
  
  const validateForm = () => {
    console.log('Validating form');
    let isValid = true;
  
    if (!form.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
      isValid = false;
    } else {
      const today = new Date();
      const dob = new Date(form.dateOfBirth);
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
        isValid = false;
      }
    }
  
    if (!form.gender) {
      errors.gender = 'Gender is required';
      isValid = false;
    }
  
    if (form.address && !form.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }
  
    if (form.city && !form.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }
  
    if (form.state && !form.state.trim()) {
      errors.state = 'State is required';
      isValid = false;
    }
  
    if (form.zipCode && (!form.zipCode.trim() || !/^\d{5}(-\d{4})?$/.test(form.zipCode))) {
      errors.zipCode = 'Valid zip code is required';
      isValid = false;
    }
  
    if (form.country && !form.country.trim()) {
      errors.country = 'Country is required';
      isValid = false;
    }
  
    if (form.phone && (!form.phone.trim() || !/^\+?[1-9]\d{1,14}$/.test(form.phone))) {
      errors.phone = 'Valid phone number is required';
      isValid = false;
    }
  
    if (form.height !== undefined && form.height <= 0) {
      errors.height = 'Height must be a positive number';
      isValid = false;
    }
  
    if (form.weight !== undefined && form.weight <= 0) {
      errors.weight = 'Weight must be a positive number';
      isValid = false;
    }
  
    if (form.emergencyContactPhone && !/^\+?[1-9]\d{1,14}$/.test(form.emergencyContactPhone)) {
      errors.emergencyContactPhone = 'Valid emergency contact phone is required';
      isValid = false;
    }
  
    console.log('Validation errors:', errors);
    console.log('isValid:', isValid);
    return isValid;
  };
  
  const handlePatientRegistration = async () => {
    console.log('handlePatientRegistration: Form submitted');
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
      form.allergies = allergiesInput.value
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);
      form.medications = medicationsInput.value
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m);
      form.chronicConditions = chronicConditionsInput.value
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c);
  
      console.log('Processed arrays:', {
        allergies: form.allergies,
        medications: form.medications,
        chronicConditions: form.chronicConditions,
      });
  
      const payload = {
        user: form.user,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodType: form.bloodType || '',
        height: form.height,
        weight: form.weight,
        allergies: form.allergies,
        medications: form.medications,
        chronicConditions: form.chronicConditions,
        emergencyContactName: form.emergencyContactName || '',
        emergencyContactPhone: form.emergencyContactPhone || '',
        emergencyContactRelation: form.emergencyContactRelation || '',
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
        phone: form.phone,
        insuranceProvider: form.insuranceProvider || '',
        insurancePolicyNumber: form.insurancePolicyNumber || '',
      };
      console.log('Sending payload to API:', payload);
  
      const response = await axios.post('http://localhost:3000/patients', payload, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('API response:', response.data);
      toast.add({
        severity: 'success',
        summary: 'Patient Registration Successful',
        detail: 'Your patient profile has been created successfully!',
        life: 5000,
      });
  
      await authStore.checkAuth();
      const redirectPath = authStore.getRedirectPath();
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
    } catch (error: any) {
      console.error('API call failed:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'An error occurred during patient registration';
      toast.add({
        severity: 'error',
        summary: 'Patient Registration Failed',
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      isLoading.value = false;
      console.log('Set isLoading to false');
    }
  };
  </script>
  
  <style scoped>
  .patient-registration-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }
  
  .patient-registration-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 800px;
    padding: 2rem;
  }
  
  .patient-registration-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .app-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1f2c;
    margin: 0;
  }
  
  .patient-registration-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1f2c;
    margin: 0.5rem 0;
  }
  
  .patient-registration-subtitle {
    font-size: 0.9rem;
    color: #8e9196;
    margin: 0;
  }
  
  .patient-registration-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .patient-registration-form {
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
    .patient-registration-card {
      max-width: 100%;
      padding: 1.5rem;
    }
  
    .app-name {
      font-size: 1.25rem;
    }
  
    .patient-registration-title {
      font-size: 1.1rem;
    }
  
    .form-grid {
      gap: 1rem;
    }
  }
  </style>