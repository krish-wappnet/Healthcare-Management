<template>
    <div class="role-selection-container">
      <div class="role-selection-card">
        <div class="role-selection-header">
          <h1 class="app-name">HealthSync</h1>
          <h2 class="role-selection-title">Choose Your Role</h2>
          <p class="role-selection-subtitle">
            Select how you want to use HealthSync
          </p>
        </div>
  
        <div class="role-selection-content">
          <div class="role-options">
            <button class="role-button" @click="continueAsPatient">
              Continue as Patient
            </button>
            <button class="role-button primary" @click="upgradeToDoctor">
              Register as Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  import { useToast } from 'primevue/usetoast';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const toast = useToast();
  
  const continueAsPatient = async () => {
    try {
      const redirectPath = await authStore.getRedirectPath();
      router.push(redirectPath);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to proceed as patient',
        life: 5000,
      });
    }
  };
  
  const upgradeToDoctor = () => {
    router.push('/doctor-registration');
  };
  </script>
  
  <style scoped>
  .role-selection-container {
    background: linear-gradient(135deg, #9b87f5 0%, #7e69ab 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }
  
  .role-selection-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 500px;
    padding: 2rem;
  }
  
  .role-selection-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .app-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1f2c;
    margin: 0;
  }
  
  .role-selection-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1f2c;
    margin: 0.5rem 0;
  }
  
  .role-selection-subtitle {
    font-size: 0.9rem;
    color: #8e9196;
    margin: 0;
  }
  
  .role-selection-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .role-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .role-button {
    background: #f9fafb;
    color: #1a1f2c;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .role-button.primary {
    background: linear-gradient(to right, #9b87f5, #7e69ab);
    color: white;
    border: none;
  }
  
  .role-button:hover:not(.primary) {
    background: #e2e8f0;
  }
  
  .role-button.primary:hover {
    background: linear-gradient(to right, #8b5cf6, #7e69ab);
    box-shadow: 0 4px 12px rgba(155, 135, 245, 0.3);
    transform: translateY(-1px);
  }
  
  @media (max-width: 576px) {
    .role-selection-card {
      max-width: 100%;
      padding: 1.5rem;
    }
  
    .app-name {
      font-size: 1.25rem;
    }
  
    .role-selection-title {
      font-size: 1.1rem;
    }
  }
  </style>