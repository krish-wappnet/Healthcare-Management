// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { apiClient } from '../services/api';
import { useRouter } from 'vue-router';

export type UserRole = 'admin' | 'doctor' | 'patient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
}

interface CreateDoctorDto {
  user: string; // Add user field for the user ID
  specialization: string;
  licenseNumber?: string;
  qualifications?: string[];
  experience?: number;
  bio?: string;
  officeAddress?: string;
  officePhone?: string;
  consultationFee?: number;
  isAvailableForAppointments?: boolean;
  workingHours?: Record<string, any>;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  
  // Load from localStorage on store initialization
  const token = ref<string | null>(localStorage.getItem('token') || null);
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken') || null);
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

  // Watch for token changes and persist to localStorage
  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  });

  watch(refreshToken, (newRefreshToken) => {
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  });

  // Actions
  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;

      // Set auth state
      token.value = accessToken;
      refreshToken.value = newRefreshToken;
      user.value = userData;

      // Persist to localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Invalid email or password';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function getRedirectPath() {
    const role = user.value?.role;
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      default:
        return '/login';
    }
  }

  async function register({
    firstName,
    lastName,
    email,
    password,
    profilePicture,
    role,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
    role: 'patient' | 'doctor';
  }) {
    loading.value = true;
    error.value = null;

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        role,
        ...(profilePicture && { profilePicture }),
      };

      const response = await apiClient.post('/auth/register', payload);
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;

      token.value = accessToken;
      refreshToken.value = newRefreshToken;
      user.value = userData;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to register';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function upgradeToDoctor(doctorData: CreateDoctorDto) {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post('/auth/upgrade-to-doctor', doctorData, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      const { user: userData } = response.data;

      user.value = userData; // Update user with new role ('doctor')
      localStorage.setItem('token', token.value!); // Ensure token persists

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to register as doctor';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      return false;
    }

    try {
      // Try to get user profile to validate token
      const response = await apiClient.get('/auth/profile');
      user.value = response.data;
      return true;
    } catch (error) {
      // Clear auth state on error
      token.value = null;
      refreshToken.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return false;
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear auth state
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    router.push('/login');
  }

  async function updateProfile(userData: Partial<User>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.put('/users/profile', userData, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      user.value = response.data;
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update profile';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    token,
    refreshToken,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    register,
    upgradeToDoctor,
    logout,
    checkAuth,
    updateProfile,
    getRedirectPath,
  };
});