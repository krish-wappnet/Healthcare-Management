<template>
  <div class="admin-settings">
    <h1 class="settings-title">Admin Settings</h1>
    
    <div class="settings-container">
      <!-- General Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h2>General Settings</h2>
        </div>
        <div class="settings-content">
          <div class="form-group">
            <label>System Name</label>
            <input type="text" v-model="settings.systemName" class="input-field" disabled>
          </div>
          <div class="form-group">
            <label>System Version</label>
            <input type="text" v-model="settings.systemVersion" class="input-field" disabled>
          </div>
          <div class="form-group">
            <label>Time Zone</label>
            <select v-model="settings.timeZone" class="input-field select-field">
              <option value="UTC">UTC</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h2>Security Settings</h2>
        </div>
        <div class="settings-content">
          <div class="form-group">
            <label>Minimum Password Length</label>
            <input type="number" v-model="settings.minPasswordLength" class="input-field" min="8" max="32">
          </div>
          <div class="form-group">
            <label>Password Expiry (days)</label>
            <input type="number" v-model="settings.passwordExpiryDays" class="input-field" min="0">
          </div>
          <div class="form-group switch-group">
            <label>Two-Factor Authentication</label>
            <div class="custom-switch">
              <input type="checkbox" v-model="settings.twoFactorAuth" id="twoFactorAuth">
              <span class="slider"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h2>Email Settings</h2>
        </div>
        <div class="settings-content">
          <div class="form-group">
            <label>SMTP Host</label>
            <input type="text" v-model="settings.smtpHost" class="input-field">
          </div>
          <div class="form-group">
            <label>SMTP Port</label>
            <input type="number" v-model="settings.smtpPort" class="input-field">
          </div>
          <div class="form-group">
            <label>SMTP Username</label>
            <input type="text" v-model="settings.smtpUsername" class="input-field">
          </div>
          <div class="form-group">
            <label>SMTP Password</label>
            <input type="password" v-model="settings.smtpPassword" class="input-field">
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="settings-footer">
        <button class="button primary-button" @click="saveSettings">
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  systemName: 'Healthcare Management System',
  systemVersion: '1.0.0',
  timeZone: 'Asia/Kolkata',
  minPasswordLength: 8,
  passwordExpiryDays: 90,
  twoFactorAuth: true,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: ''
})

const saveSettings = () => {
  // TODO: Implement settings save functionality
  console.log('Saving settings:', settings.value)
}
</script>

<style scoped>
.admin-settings {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.settings-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.settings-content {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: var(--background);
  color: var(--text-primary);
}

.select-field {
  padding-right: 2rem;
  cursor: pointer;
  appearance: none;
  background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 1rem center;
  background-size: 12px;
}

.settings-footer {
  margin-top: 2rem;
  text-align: right;
}

/* Switch Component */
.switch-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.custom-switch {
  position: relative;
  width: 48px;
  height: 24px;
}

.custom-switch input {
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
  background-color: var(--border-color);
  transition: all 0.2s ease;
  border-radius: 34px;
  border: 1px solid var(--border-color);
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: all 0.2s ease;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--success);
  border-color: var(--success);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-settings {
    padding: 1rem;
  }

  .settings-container {
    padding: 1.5rem;
  }

  .settings-content {
    grid-template-columns: 1fr;
  }
}
</style>