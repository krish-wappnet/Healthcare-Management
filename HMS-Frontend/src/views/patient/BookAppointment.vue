<template>
  <div class="doctors-page">
    <div class="header">
      <h1>Find a Doctor</h1>
      <p class="subtitle">Book an appointment with our expert doctors</p>
      
      <!-- Search and Filter -->
      <div class="search-filter">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search doctors..."
            class="search-input"
          />
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="selectedSpecialization"
          class="filter-select"
        >
          <option value="">All Specializations</option>
          <option v-for="spec in uniqueSpecializations" :key="spec" :value="spec">
            {{ spec }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading doctors...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="fetchDoctors" class="retry-button">Retry</button>
    </div>

    <!-- Doctors List -->
    <div v-else-if="filteredDoctors.length" class="doctors-list">
      <div v-for="doctor in filteredDoctors" :key="doctor._id" class="doctor-card">
        <div class="doctor-info">
          <div class="doctor-header">
            <img 
              :src="doctor.user?.profilePicture || 'https://via.placeholder.com/80'" 
              alt="Doctor's profile"
              class="doctor-avatar"
              onerror="this.src='/default-avatar.png'"
            />
            <h2>
            Dr. {{ doctor.user?.firstName }} {{ doctor.user?.lastName }}
            <span class="rating" v-if="doctor.averageRating > 0">
              {{ doctor.averageRating }}★ ({{ doctor.totalRatings }})
            </span>
          </h2>
          </div>

          <!-- Specialization -->
          <p class="specialization">{{ doctor.specialization }}</p>

          <!-- Experience -->
          <p class="experience">{{ doctor.experience }} years experience</p>

          <!-- Qualifications -->
          <div class="qualifications" v-if="doctor.qualifications.length > 0">
            <span class="qualification-badge" v-for="qualification in doctor.qualifications" :key="qualification">
              {{ qualification }}
            </span>
          </div>

          <!-- Office Details -->
          <div class="office-details">
            <p class="office-address"> {{ doctor.officeAddress }}</p>
            <p class="office-phone"> {{ doctor.officePhone }}</p>
          </div>

          <!-- Consultation Fee -->
          <p class="consultation-fee">Consultation Fee: ₹{{ doctor.consultationFee }}</p>

          <!-- Book Appointment Button -->
          <button 
            @click="openBookingModal(doctor)" 
            class="book-appointment-btn"
            :disabled="!doctor.isAvailableForAppointments"
          >
            {{ doctor.isAvailableForAppointments ? 'Book Appointment' : 'Not Available' }}
          </button>
        </div>
      </div>
    </div>

    <!-- No Doctors -->
    <div v-else class="no-doctors">
      <p>No doctors found matching your criteria.</p>
      <button @click="resetFilters" class="link-button">Reset Filters</button>
    </div>

    <!-- Pagination -->
    <div v-if="doctors.length && totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="page-button"
      >
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="page-button"
      >
        Next
      </button>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal && selectedDoctor" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Book Appointment with Dr. {{ selectedDoctor.user?.firstName || 'Unknown' }} {{ selectedDoctor.user?.lastName || '' }}</h2>
          <button @click="closeBookingModal" class="close-button">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitAppointment" class="form">
          <div class="form-header">
            <div class="consultation-fee">
              <span class="fee-label">Consultation Fee:</span>
              <span class="fee-amount">₹{{ selectedDoctor.consultationFee || 'N/A' }}</span>
            </div>
          </div>
          <div class="form-grid">
            <!-- Doctor Selection -->
            <div class="form-group">
              <label>Doctor</label>
              <select v-model="form.doctor" :class="{ 'error': validationErrors.doctor?.hasError }">
                <option value="">Select Doctor</option>
                <option v-for="doc in doctors" :key="doc._id" :value="doc._id">
                  Dr. {{ doc.user?.firstName }} {{ doc.user?.lastName }}
                </option>
              </select>
              <p v-if="validationErrors.doctor?.hasError" class="error-text">
                {{ validationErrors.doctor?.message }}
              </p>
            </div>
            <!-- Appointment Date -->
            <div class="form-group">
              <label>Appointment Date</label>
              <div class="calendar-container">
                <Calendar
                  v-model="form.date"
                  :minDate="new Date(minDate)"
                  :showIcon="true"
                  :showButtonBar="true"
                  :class="{ 'p-invalid': validationErrors.date?.hasError }"
                  :style="{ width: '100%' }"
                  :inline="false"
                />
              </div>
              <p v-if="validationErrors.date?.hasError" class="error-text">
                {{ validationErrors.date?.message }}
              </p>
            </div>
            <!-- Start Time -->
            <div class="form-group">
              <label>Start Time</label>
              <input
                v-model="form.startTime"
                type="time"
                :class="{ 'error': validationErrors.startTime?.hasError }"
              />
              <p v-if="validationErrors.startTime?.hasError" class="error-text">
                {{ validationErrors.startTime?.message }}
              </p>
            </div>
            <!-- End Time -->
            <div class="form-group">
              <label>End Time</label>
              <input
                v-model="form.endTime"
                type="time"
                :class="{ 'error': validationErrors.endTime?.hasError }"
              />
              <p v-if="validationErrors.endTime?.hasError" class="error-text">
                {{ validationErrors.endTime?.message }}
              </p>
            </div>
            <!-- Appointment Type -->
            <div class="form-group">
              <label>Appointment Type</label>
              <select
                v-model="form.type"
                :class="{ 'error': validationErrors.type?.hasError }"
              >
                <option value="" disabled>Select appointment type</option>
                <option value="Video Consultation">Video Consultation</option>
                <option value="In-Person">In-Person</option>
              </select>
              <p v-if="validationErrors.type?.hasError" class="error-text">
                {{ validationErrors.type?.message }}
              </p>
            </div>
            <!-- Reason for Visit -->
            <div class="form-group full-width">
              <label>Reason for Visit</label>
              <textarea
                v-model="form.reasonForVisit"
                :class="{ 'error': validationErrors.reasonForVisit?.hasError }"
                placeholder="Briefly describe your reason for visit"
                class="full-width"
              ></textarea>
              <p v-if="validationErrors.reasonForVisit?.hasError" class="error-text">
                {{ validationErrors.reasonForVisit?.message }}
              </p>
            </div>
            <!-- Symptoms -->
            <div class="form-group full-width">
              <label>Symptoms</label>
              <div class="chips-input">
                <input
                  v-model="newSymptom"
                  type="text"
                  @keyup.enter="addSymptom"
                  :class="{ 'error': validationErrors.symptoms?.hasError }"
                  placeholder="Enter symptoms and press Enter"
                  class="full-width"
                />
                <div class="symptoms-list">
                  <span
                    v-for="(symptom, index) in form.symptoms"
                    :key="index"
                    class="symptom-chip"
                  >
                    {{ symptom }}
                    <button @click="removeSymptom(index)" class="remove-symptom">
                      ×
                    </button>
                  </span>
                </div>
              </div>
              <p v-if="validationErrors.symptoms?.hasError" class="error-text">
                {{ validationErrors.symptoms?.message }}
              </p>
            </div>
            <!-- Additional Notes -->
            <div class="form-group full-width">
              <label>Additional Notes</label>
              <textarea
                v-model="form.notes"
                placeholder="Any additional information for the doctor"
              ></textarea>
            </div>
            <!-- Payment -->
            <div class="form-group">
              <label>Payment Amount (₹)</label>
              <input
                v-model="form.paymentAmount"
                type="number"
                min="0"
                :class="{ 'error': validationErrors.paymentAmount?.hasError }"
              />
              <p v-if="validationErrors.paymentAmount?.hasError" class="error-text">
                {{ validationErrors.paymentAmount?.message }}
              </p>
            </div>
            <!-- Payment -->
            <div class="form-group">
              <div class="payment-section">
                <label class="payment-checkbox">
                  <input type="checkbox" v-model="form.isPaid" />
                  <span>Pay Now</span>
                </label>
                <div v-if="form.isPaid" class="payment-amount">
                  Amount: ₹{{ form.paymentAmount || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="resetForm" class="reset-button">Reset</button>
            <button type="button" @click="closeBookingModal" class="cancel-button">Cancel</button>
            <button type="submit" class="submit-button">Book Appointment</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, helpers } from '@vuelidate/validators';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { usePatientStore } from '../../stores/patient';
import Calendar from 'primevue/calendar';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { apiClient } from '../../services/api';

// Initialize dayjs with the custom parse format plugin
dayjs.extend(customParseFormat);

// State
const doctors = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;
const showBookingModal = ref(false);

// Store setup
const patientStore = usePatientStore();

// Fetch patient profile on mount
onMounted(async () => {
  await patientStore.fetchProfile();
  fetchDoctors();
});
const selectedDoctor = ref(null);
const newSymptom = ref('');
const searchQuery = ref('');
const selectedSpecialization = ref('');

// Form state
const form = reactive({
  doctor: '',
  date: '',
  startTime: '',
  endTime: '',
  type: 'Video Consultation',
  reasonForVisit: '',
  notes: '',
  symptoms: [],
  paymentAmount: 0
});

// Validation rules
const futureDate = helpers.withMessage(
  'Date must be today or in the future',
  (value) => {
    if (!value) return true; // Allow empty value
    const selectedDate = dayjs(value);
    const today = dayjs();
    // Allow same day but after current time
    if (selectedDate.isSame(today, 'day')) {
      return selectedDate.isAfter(today);
    }
    // For future dates, allow any time
    return selectedDate.isAfter(today);
  }
);

const minValue = (min) => {
  return helpers.withMessage(`Payment amount must be at least ${min}`, (value) => value >= min);
};

const rules = {
  doctor: { required },
  date: { required, futureDate },
  startTime: { required },
  endTime: { required },
  type: { required },
  reasonForVisit: { required },
  notes: {},
  symptoms: {
    required: helpers.withMessage('At least one symptom is required', (value) => value.length > 0),
  },
  paymentAmount: { required, min: minValue(0) }
};

const v$ = useVuelidate(rules, form);

// Computed validation errors
const validationErrors = computed(() => {
  return {
    doctor: v$.value.doctor.$errors.length
      ? { hasError: true, message: v$.value.doctor.$errors[0].$message }
      : null,
    date: v$.value.date.$errors.length
      ? { hasError: true, message: v$.value.date.$errors[0].$message }
      : null,
    startTime: v$.value.startTime.$errors.length
      ? { hasError: true, message: v$.value.startTime.$errors[0].$message }
      : null,
    endTime: v$.value.endTime.$errors.length
      ? { hasError: true, message: v$.value.endTime.$errors[0].$message }
      : null,
    type: v$.value.type.$errors.length
      ? { hasError: true, message: v$.value.type.$errors[0].$message }
      : null,
    reasonForVisit: v$.value.reasonForVisit.$errors.length
      ? { hasError: true, message: v$.value.reasonForVisit.$errors[0].$message }
      : null,
    symptoms: v$.value.symptoms.$errors.length
      ? { hasError: true, message: v$.value.symptoms.$errors[0].$message }
      : null,
    paymentAmount: v$.value.paymentAmount.$errors.length
      ? { hasError: true, message: v$.value.paymentAmount.$errors[0].$message }
      : null,
  };
});

// Computed properties
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const filteredDoctors = computed(() => {
  return doctors.value.filter((doctor) => {
    const matchesSearch =
      (doctor.user?.firstName?.toLowerCase() || '').includes(searchQuery.value.toLowerCase()) ||
      (doctor.user?.lastName?.toLowerCase() || '').includes(searchQuery.value.toLowerCase()) ||
      (doctor.specialization?.toLowerCase() || '').includes(searchQuery.value.toLowerCase());
    const matchesSpecialization =
      !selectedSpecialization.value || doctor.specialization === selectedSpecialization.value;
    return matchesSearch && matchesSpecialization;
  });
});

const uniqueSpecializations = computed(() => {
  const specializations = new Set(doctors.value.map((d) => d.specialization).filter(Boolean));
  return Array.from(specializations).sort();
});

// Methods
const fetchDoctors = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`http://localhost:3000/doctors?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch doctors');
    const data = await response.json();
    doctors.value = data.data || data.doctors || [];
    totalPages.value = data.totalPages || Math.ceil((data.total || doctors.value.length) / limit);
    currentPage.value = page;
  } catch (err) {
    error.value = 'Failed to fetch doctors. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchDoctors(page);
  }
};

const openBookingModal = (doctor) => {
  selectedDoctor.value = doctor;
  showBookingModal.value = true;
  
  // Set the selected doctor in the form
  form.doctor = doctor._id;
  
  // Set the payment amount to the doctor's consultation fee
  form.paymentAmount = doctor.consultationFee || 0;
};

const closeBookingModal = () => {
  showBookingModal.value = false;
  selectedDoctor.value = null;
  resetForm();
};

const addSymptom = () => {
  if (newSymptom.value.trim()) {
    // Add symptom only if it doesn't already exist
    const trimmedSymptom = newSymptom.value.trim();
    if (!form.symptoms.includes(trimmedSymptom)) {
      form.symptoms.push(trimmedSymptom);
    }
    newSymptom.value = '';
    v$.value.form.symptoms.$touch();
  }
};

const removeSymptom = (index) => {
  form.symptoms.splice(index, 1);
  v$.value.form.symptoms.$touch();
};

const resetForm = () => {
  Object.assign(form, {
    doctor: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'Video Consultation',
    reasonForVisit: '',
    symptoms: [],
    notes: '',
    paymentAmount: selectedDoctor.value?.consultationFee || 0,
  });
  newSymptom.value = '';
  v$.value.$reset();
  selectedDoctor.value = null;
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedSpecialization.value = '';
  fetchDoctors(1);
};

const submitAppointment = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    // Get patient ID from store
    const patientId = patientStore.patient?._id;
    if (!patientId) {
      throw new Error('Patient ID not found');
    }

    // Format symptoms as an array of strings
    const formattedSymptoms = form.symptoms.map(symptom => symptom.trim());
    
    const response = await apiClient.post('/appointments', {
      patient: patientId,
      doctor: form.doctor,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      status: 'scheduled',
      type: form.type,
      reasonForVisit: form.reasonForVisit,
      notes: form.notes,
      symptoms: formattedSymptoms,
      isPaid: false,
      paymentAmount: form.paymentAmount
    });

    // Send email to doctor
    try {
      // Find the selected doctor's email
      const doctor = doctors.value.find(d => d._id === form.doctor);
      if (doctor?.user?.email) {
        await apiClient.post('/mail/send-appointment-notification', {
          doctorEmail: doctor.user.email,
          appointmentDetails: {
            patientName: `${patientStore.patient?.user?.firstName} ${patientStore.patient?.user?.lastName}`,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            notes: form.notes
          }
        });
      }
    } catch (emailError) {
      console.error('Error sending appointment email:', emailError);
      // Don't fail the entire appointment booking if email fails
    }

    // Show success message
    alert('Appointment booked successfully!');
    closeBookingModal();
    resetForm();
  } catch (error) {
    console.error('Error booking appointment:', error);
    
    // Show more specific error message if available
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error booking appointment. Please try again.';
    
    alert(errorMessage);
  }
};

// Fetch doctors on mount
onMounted(() => {
  fetchDoctors();
});
</script>

<style lang="scss" scoped>
.doctor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.doctor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.doctor-card h2 {
  margin: 0;
  font-size: 1.5rem;
}

.doctors-page {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

.form-container {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.chips-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.symptoms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.symptom-chip {
  background: #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.remove-symptom {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.remove-symptom:hover {
  color: #c82333;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-button,
.cancel-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.submit-button {
  background: #42b983;
  color: white;
}

.submit-button:hover {
  background: #38a169;
}

.cancel-button {
  background: #e53e3e;
  color: white;
}

.cancel-button:hover {
  background: #c53030;
}

.calendar-container {
  width: 100%;
}

.calendar-container .p-calendar {
  width: 100%;
  min-height: 40px;
}

.calendar-container .p-calendar input {
  width: 100%;
  height: 40px;
  padding: 0 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.calendar-container .p-calendar.p-invalid input {
  border-color: #dc3545;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  }

  .subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .search-filter {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;

    .search-bar {
      position: relative;
      width: 300px;

      .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.25rem;
        height: 1.25rem;
        color: #6b7280;
      }
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #374151;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>')
        no-repeat right 0.75rem center;
      background-size: 1rem;
    }
  }

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: #6b7280;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #3b82f6;
    border-top: 4px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.error-container {
  text-align: center;
  padding: 3rem 0;
  color: #ef4444;

  .error-text {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  .retry-button {
    background: #3b82f6;
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: background 0.2s ease, transform 0.2s ease;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  }
}

.doctors-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.doctor-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  }

  .doctor-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2a44;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .rating {
        color: #f1c40f;
        font-size: 0.875rem;
        font-weight: 500;
      }
    }

    .specialization {
      color: #3b82f6;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .experience {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0.5rem 0;
    }

    .qualifications {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;

      .qualification-badge {
        background: #f9fafb;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .office-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;

      .office-address,
      .office-phone {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .office-address::before {
        content: "📍 ";
        color: #3b82f6;
      }

      .office-phone::before {
        content: "📞 ";
        color: #3b82f6;
      }
    }

    .consultation-fee {
      color: #10b981;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .book-appointment-btn {
      background: #10b981;
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
      width: fit-content;

      &:hover {
        background: #059669;
        transform: translateY(-1px);
      }

      &:disabled {
        background: #6b7280;
        cursor: not-allowed;
        opacity: 0.8;
      }
    }
  }
}

.no-data {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;

  p {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  .link-button {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.2s ease;

    &:hover {
      color: #2563eb;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  span {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .page-button {
    background: #3b82f6;
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: background 0.2s ease;

    &:hover {
      background: #2563eb;
    }

    &:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2a44;
  }

  .close-button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #3b82f6;
    }

    .icon {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .form-header {
    display: flex;
    justify-content: flex-end;

    .consultation-fee {
      display: inline-flex;
      gap: 0.5rem;
      align-items: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 8px;

      .fee-label {
        color: #4b5563;
      }
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &.full-width {
        grid-column: 1 / -1;
      }

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2a44;
      }

      input,
      select,
      textarea {
        padding: 0.875rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 0.875rem;
        background: #f9fafb;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        &:hover {
          border-color: #10b981;
        }

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        &.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
      }

      .error-text {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      .payment-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .payment-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;

          input {
            width: 1.25rem;
            height: 1.25rem;
            border: 2px solid #e5e7eb;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:checked {
              background: #10b981;
              border-color: #10b981;
            }
          }
        }

        .add-symptom {
          background: #10b981;
          color: #ffffff;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: background 0.2s ease;

          &:hover {
            background: #059669;
          }
        }
      }
    }
  }

  .symptoms-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;

    .symptom-chip {
      background: #f3f4f6;
      padding: 0.5rem 1rem;
      border-radius: 16px;
      font-size: 0.875rem;
      color: #4b5563;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .remove-button {
        background: none;
        border: none;
        color: #dc2626;
        cursor: pointer;
        padding: 0;
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 0;
        }

        span {
          font-size: 0.875rem;
          color: #1f2a44;
        }
      }

      .payment-amount {
        font-size: 0.875rem;
        color: #10b981;
        font-weight: 500;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;

    button {
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .submit-button {
      background: #10b981;
      color: #ffffff;

      &:hover {
        background: #059669;
      }
    }

    .cancel-button {
      background: #e5e7eb;
      color: #1f2a44;

      &:hover {
        background: #d1d5db;
      }
    }

    .reset-button {
      background: #f59e0b;
      color: #ffffff;

      &:hover {
        background: #d97706;
      }
    }
  }


@media (max-width: 768px) {
  .doctors-page {
    padding: 1rem;
  }

  .header .search-filter {
    flex-direction: column;
    align-items: center;

    .search-bar {
      width: 100%;
    }

    .filter-select {
      width: 100%;
    }
  }

  .doctors-list {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>