import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const token = ref<string | null>(localStorage.getItem('token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

  // Actions
  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;

      token.value = accessToken;
      refreshToken.value = newRefreshToken;
      user.value = userData;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Invalid email or password';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function redirectBasedOnRole() {
    if (!user.value) return '/login';
    
    const role = user.value.role.toLowerCase();
    const routes: Record<UserRole, string> = {
      admin: '/admin',
      doctor: '/doctor',
      patient: '/patient'
    };
    
    return routes[role] || '/';
  }

  async function register({
    firstName,
    lastName,
    email,
    password,
    profilePicture,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
  }) {
    loading.value = true;
    error.value = null;

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
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
      throw err; // rethrow for handleRegister to catch
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await apiClient.post('/auth/logout');
      }
    } catch (err) {
      console.error('Logout API error:', err);
    }

    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  }

  async function checkAuth() {
    if (!token.value) return false;

    loading.value = true;

    try {
      const response = await apiClient.get('/auth/me');
      user.value = response.data;
      return true;
    } catch (err: any) {
      console.error('Auth check error:', err);

      if (err.response?.status === 401) {
        token.value = null;
        refreshToken.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }

      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(userData: Partial<User>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.put('/users/profile', userData);
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
    logout,
    checkAuth,
    updateProfile,
    redirectBasedOnRole,
  };
});