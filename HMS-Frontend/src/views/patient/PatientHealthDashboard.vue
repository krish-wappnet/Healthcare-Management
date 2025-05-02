<template>
  <div class="health-dashboard">
    <h1>Health Dashboard</h1>
    
    <div class="health-metrics">
      <div v-if="loading">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading your health data...</p>
        </div>
      </div>
      <div v-else-if="error">
        <div class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchHealthData">Retry</button>
        </div>
      </div>
      <HealthDataCard
        v-else
        v-for="metric in latestMetrics"
        :key="metric.deviceType"
        :deviceType="metric.deviceType"
        :value="metric.data.value"
        :unit="metric.unit"
        :timestamp="metric.timestamp"
        :isAbnormal="metric.isAbnormal"
      />
    </div>

    <div class="abnormal-readings" v-if="abnormalReadings.length > 0">
      <h2>Abnormal Readings</h2>
      <div class="abnormal-list">
        <div v-for="reading in abnormalReadings" :key="reading.id" class="abnormal-item">
          <HealthDataCard
            :deviceType="reading.deviceType"
            :value="reading.data.value"
            :unit="reading.unit"
            :timestamp="reading.timestamp"
            :isAbnormal="reading.isAbnormal"
          />
          <p class="reason">{{ reading.abnormalityReason }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { healthDataService } from '@/services/api';
import HealthDataCard from '@/components/health/HealthDataCard.vue';

interface Metric {
  deviceType: string;
  data: {
    value: any;
    unit: string;
  };
  timestamp: string;
  isAbnormal: boolean;
  abnormalityReason?: string;
}

const latestMetrics = ref<Metric[]>([]);
const abnormalReadings = ref<Metric[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchHealthData = async () => {
  try {
    // Get patient ID from localStorage or Vuex store
    const patientId = localStorage.getItem('patientId');
    if (!patientId) throw new Error('Patient ID not found');

    // Get latest health data
    const latestData = await healthDataService.getLatestHealthData();
    latestMetrics.value = latestData.data.map(item => ({
      deviceType: item.deviceType,
      data: {
        value: item.data.value,
        unit: item.data.unit || ''
      },
      timestamp: item.timestamp,
      isAbnormal: item.isAbnormal,
      abnormalityReason: item.abnormalityReason
    }));

    // Get abnormal readings
    const abnormalData = await healthDataService.getAbnormalReadings(patientId, { page: 1, limit: 10 });
    abnormalReadings.value = abnormalData.data.map(item => ({
      deviceType: item.deviceType,
      data: {
        value: item.data.value,
        unit: item.data.unit || ''
      },
      timestamp: item.timestamp,
      isAbnormal: item.isAbnormal,
      abnormalityReason: item.abnormalityReason
    }));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchHealthData);
</script>

<style scoped>
.health-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.health-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state button {
  margin-top: 20px;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-state button:hover {
  background: #c82333;
}

.abnormal-readings {
  background: #fff8f8;
  padding: 20px;
  border-radius: 8px;
}

.abnormal-list {
  margin-top: 16px;
}

.abnormal-item {
  margin-bottom: 16px;
}

.reason {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
}
</style>