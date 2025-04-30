<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <div class="logo-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="logo-icon"
            >
              <path
                d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"
              ></path>
            </svg>
          </div>
        </div>
        <h1 class="app-name">HealthSync</h1>
      </div>

      <div class="login-content">
        <h2 class="login-title">Create Your Account</h2>
        <p class="login-subtitle">Join our healthcare community</p>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  autocomplete="given-name"
                  placeholder="Enter your first name"
                  class="form-input"
                  :class="{ 'input-error': errors.firstName }"
                  @focus="clearError('firstName')"
                  required
                />
              </div>
              <p v-if="errors.firstName" class="error-message">
                {{ errors.firstName }}
              </p>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Enter your last name"
                  class="form-input"
                  :class="{ 'input-error': errors.lastName }"
                  @focus="clearError('lastName')"
                  required
                />
              </div>
              <p v-if="errors.lastName" class="error-message">
                {{ errors.lastName }}
              </p>
            </div>

            <div class="form-group full-width">
              <label for="email" class="form-label">Email</label>
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
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  ></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="Enter your email"
                  class="form-input"
                  :class="{ 'input-error': errors.email }"
                  @focus="clearError('email')"
                  required
                />
              </div>
              <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
            </div>

            <div class="form-group full-width">
              <label for="password" class="form-label">Password</label>
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Enter your password"
                  class="form-input"
                  :class="{ 'input-error': errors.password }"
                  @focus="clearError('password')"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <svg
                    v-if="showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="toggle-icon"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    ></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="toggle-icon"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="error-message">
                {{ errors.password }}
              </p>
            </div>

            <div class="form-group">
              <label for="profilePicture" class="form-label"
                >Profile Picture (Optional)</label
              >
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
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                  ></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <input
                  id="profilePicture"
                  v-model="form.profilePicture"
                  type="url"
                  autocomplete="photo"
                  placeholder="Enter image URL"
                  class="form-input"
                  :class="{ 'input-error': errors.profilePicture }"
                  @focus="clearError('profilePicture')"
                />
              </div>
              <p v-if="errors.profilePicture" class="error-message">
                {{ errors.profilePicture }}
              </p>
            </div>

            <div class="form-group">
              <label for="role" class="form-label">Role</label>
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
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  ></path>
                </svg>
                <select
                  id="role"
                  v-model="form.role"
                  class="form-input"
                  :class="{ 'input-error': errors.role }"
                  @focus="clearError('role')"
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <p v-if="errors.role" class="error-message">{{ errors.role }}</p>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="login-button"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Create Account</span>
              <span v-else class="spinner"></span>
            </button>
          </div>

          <div class="register-link">
            <span>Already have an account?</span>
            <router-link to="/login">Sign In</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  profilePicture: '',
  role: '',
});

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  profilePicture: '',
  role: '',
});

const showPassword = ref(false);
const isLoading = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const clearError = (field: keyof typeof errors) => {
  errors[field] = '';
};

const validateForm = () => {
  let isValid = true;

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required';
    isValid = false;
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required';
    isValid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  if (!form.role) {
    errors.role = 'Please select a role';
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  isLoading.value = true;

  try {
    await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      profilePicture: form.profilePicture || undefined,
    });

    toast.add({
      severity: 'success',
      summary: 'Registration Successful',
      detail: 'Your account has been created successfully!',
      life: 5000,
    });

    router.push('/');
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail:
        error.response?.data?.message ||
        'An error occurred during registration',
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #9b87f5 0%, #7e69ab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.logo-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0ebff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #9b87f5;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1f2c;
  margin: 0;
}

.login-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1f2c;
  margin: 0;
  text-align: center;
}

.login-subtitle {
  font-size: 0.9rem;
  color: #8e9196;
  margin: 0.5rem 0;
  text-align: center;
}

.login-form {
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

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  color: #8e9196;
  cursor: pointer;
}

.toggle-icon {
  width: 16px;
  height: 16px;
}

.form-actions {
  margin-top: 1.5rem;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-link {
  text-align: center;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.register-link span {
  color: #8e9196;
}

.register-link a {
  color: #9b87f5;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
}

.register-link a:hover {
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
  .login-card {
    max-width: 100%;
    padding: 1.5rem;
  }

  .logo-circle {
    width: 50px;
    height: 50px;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
  }

  .app-name {
    font-size: 1.25rem;
  }

  .login-title {
    font-size: 1.1rem;
  }

  .form-grid {
    gap: 1rem;
  }
}
</style>