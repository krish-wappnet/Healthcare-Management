import { defineStore } from 'pinia';
import { apiClient } from '../services/api';

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patient: null,
    appointments: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchProfile() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await apiClient.get('/patients/profile');
        this.patient = response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch patient profile';
        console.error('Error fetching patient profile:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchAppointments() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await apiClient.get('/appointments');
        this.appointments = response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch appointments';
        console.error('Error fetching appointments:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
