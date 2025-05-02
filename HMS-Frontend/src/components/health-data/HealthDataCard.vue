<template>
  <div class="health-data-card">
    <div class="card-header">
      <h3>{{ deviceType }}</h3>
      <span v-if="isAbnormal" class="abnormal-badge">⚠️ Abnormal</span>
    </div>
    <div class="data-display">
      <div class="value">{{ value }}</div>
      <div class="unit">{{ unit }}</div>
    </div>
    <div class="timestamp">
      Last Updated: {{ formattedTimestamp }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

interface Props {
  deviceType: string;
  value: any;
  unit: string;
  timestamp: string;
  isAbnormal: boolean;
}

const props = defineProps<Props>();

const formattedTimestamp = computed(() => {
  return dayjs(props.timestamp).format('MMM D, YYYY HH:mm');
});
</script>

<style scoped>
.health-data-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.abnormal-badge {
  color: #dc3545;
  font-weight: bold;
}

.data-display {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.unit {
  color: #6c757d;
  font-size: 14px;
}

.timestamp {
  color: #6c757d;
  font-size: 12px;
}
</style>