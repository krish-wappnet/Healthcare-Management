<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <div class="logo-circle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
            </svg>
          </div>
        </div>
        <h1 class="app-name">HealthSync</h1>
      </div>
      
      <div class="login-content">
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-subtitle">Sign in to your account to continue</p>
        
        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
                placeholder="Enter your email"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                @focus="clearError('email')"
                @blur="validateField('email')"
                :aria-invalid="errors.email ? 'true' : 'false'"
                :aria-describedby="errors.email ? 'email-error' : undefined"
                required
              />
            </div>
            <p v-if="errors.email" id="email-error" class="error-message">{{ errors.email }}</p>
          </div>
          
          <div class="form-group">
            <div class="label-container">
              <label for="password" class="form-label">Password</label>
              <router-link to="/forgot-password" class="forgot-password">Forgot password?</router-link>
            </div>
            <div class="input-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                v-model.trim="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                @focus="clearError('password')"
                @blur="validateField('password')"
                :aria-invalid="errors.password ? 'true' : 'false'"
                :aria-describedby="errors.password ? 'password-error' : undefined"
                required
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                tabindex="-1"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" id="password-error" class="error-message">{{ errors.password }}</p>
          </div>
          
          <div class="form-actions">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                v-model="form.rememberMe" 
                aria-label="Remember me on this device"
              />
              <span class="checkmark"></span>
              <span class="label-text">Remember me</span>
            </label>
            <button 
              type="submit" 
              class="login-button" 
              :disabled="isLoading || hasErrors"
              :aria-busy="isLoading"
            >
              <span v-if="!isLoading">Sign In</span>
              <span v-else class="spinner" aria-hidden="true"></span>
            </button>
          </div>
          
          <div class="register-link">
            <span>Don't have an account?</span>
            <router-link to="/register">Sign Up</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToast } from 'primevue/usetoast';
import {jwtDecode} from 'jwt-decode';

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

// Form state
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const errors = reactive({
  email: '',
  password: ''
});

const showPassword = ref(false);
const isLoading = ref(false);
const loginAttempts = ref(0);
const lastAttemptTime = ref<number | null>(null);

// Computed properties
const hasErrors = computed(() => {
  return Object.values(errors).some(error => error !== '');
});

const isRateLimited = computed(() => {
  const now = Date.now();
  return lastAttemptTime.value && 
         now - lastAttemptTime.value < 5000 && 
         loginAttempts.value >= 3;
});

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const clearError = (field: keyof typeof errors) => {
  errors[field] = '';
};

const validateField = (field: keyof typeof form) => {
  if (field === 'email') {
    validateEmail();
  } else if (field === 'password') {
    validatePassword();
  }
};

const validateEmail = (): boolean => {
  if (!form.email) {
    errors.email = 'Email is required';
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address';
    return false;
  }

  errors.email = '';
  return true;
};

const validatePassword = (): boolean => {
  if (!form.password) {
    errors.password = 'Password is required';
    return false;
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    return false;
  }

  if (!/[0-9]/.test(form.password)) {
    errors.password = 'Password must contain at least one number';
    return false;
  }

  errors.password = '';
  return true;
};

const validateForm = (): boolean => {
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  return isEmailValid && isPasswordValid;
};

const handleLogin = async () => {
  if (isRateLimited.value) {
    showRateLimitError();
    return;
  }

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  loginAttempts.value += 1;
  lastAttemptTime.value = Date.now();

  try {
    const success = await authStore.login(form.email, form.password);
    
    if (success) {
      // Log the auth token
      console.log('Auth token:', authStore.token);
      // Decode and log token contents
      if (authStore.token) {
        try {
          const decoded = jwtDecode<JwtPayload>(authStore.token);
          console.log('Decoded token:', decoded);
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
        }
      } else {
        console.error('No token available after login');
      }

      showSuccessToast();
      return;
    }
  } catch (error: any) {
    handleLoginError(error);
  } finally {
    isLoading.value = false;
  }
};

const showRateLimitError = () => {
  toast.add({
    severity: 'error',
    summary: 'Too Many Attempts',
    detail: 'Please wait 5 seconds before trying again',
    life: 5000,
    group: 'top-right',
  });
};

const showSuccessToast = () => {
  toast.add({
    severity: 'success',
    summary: 'Login Successful',
    detail: 'Welcome back! You\'ve successfully logged in.',
    life: 5000,
    group: 'top-right',
  });
};

const handleLoginError = (error: any) => {
  console.error('Login error:', error);
  let errorMessage = 'An error occurred during login';
  
  if (error.response) {
    if (error.response.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.response.status === 429) {
      errorMessage = 'Too many attempts. Please try again later.';
    } else {
      errorMessage = error.response.data?.message || errorMessage;
    }
  } else if (error.request) {
    errorMessage = 'Network error. Please check your connection.';
  }

  toast.add({
    severity: 'error',
    summary: 'Login Failed',
    detail: errorMessage,
    life: 5000,
    group: 'top-right',
  });
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%);
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
  color: #1A1F2C;
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
  color: #1A1F2C;
  margin: 0;
  text-align: center;
}

.login-subtitle {
  font-size: 0.9rem;
  color: #8E9196;
  margin: 0.5rem 0;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1A1F2C;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 0.75rem;
  color: #9b87f5;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
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
  color: #8E9196;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: #f9fafb;
  color: #1A1F2C;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #9b87f5;
  box-shadow: 0 0 0 3px rgba(155, 135, 245, 0.15);
}

.input-error {
  border-color: #ea384c !important;
  background-color: #fff8f8;
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
  color: #8E9196;
  cursor: pointer;
}

.toggle-icon {
  width: 16px;
  height: 16px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 16px;
  width: 16px;
  background-color: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-right: 8px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #f0f4f8;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #9b87f5;
  border-color: #9b87f5;
}

.checkbox-container input:checked ~ .checkmark:after {
  content: "";
  position: absolute;
  display: block;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  font-size: 0.85rem;
  color: #1A1F2C;
}

.login-button {
  background: linear-gradient(to right, #9b87f5, #7E69AB);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(to right, #8B5CF6, #7E69AB);
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
  border: 2px solid rgba(255,255,255,0.3);
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
  color: #8E9196;
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

/* Responsive styles */
@media (min-width: 768px) {
  .login-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .form-group:nth-child(1) {
    grid-column: 1;
  }
  
  .form-group:nth-child(2) {
    grid-column: 2;
  }
  
  .form-actions {
    grid-column: 1 / -1;
  }
  
  .register-link {
    grid-column: 1 / -1;
  }
}

@media (max-width: 576px) {
  .login-card {
    max-width: 100%;
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .login-button {
    width: 100%;
    margin-top: 1rem;
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
}
</style>