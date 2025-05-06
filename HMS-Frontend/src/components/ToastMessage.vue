<template>
  <div
    v-if="show"
    :class="[messageClass, 'toast-message']"
    @click="close"
  >
    <div class="toast-content">
      <span class="toast-icon">
        <i :class="iconClass"></i>
      </span>
      <span class="toast-text">{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const show = ref(true);

const messageClass = computed(() => {
  return `toast-${props.type}`;
});

const iconClass = computed(() => {
  return {
    success: 'pi pi-check-circle',
    error: 'pi pi-times-circle',
    info: 'pi pi-info-circle',
    warning: 'pi pi-exclamation-circle'
  }[props.type];
});

const close = () => {
  show.value = false;
};

// Auto close after duration
setTimeout(() => {
  close();
}, props.duration);
</script>

<style scoped>
.toast-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-text {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.toast-success {
  background-color: #d4edda;
  color: #155724;
}

.toast-error {
  background-color: #f8d7da;
  color: #721c24;
}

.toast-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.toast-warning {
  background-color: #fff3cd;
  color: #856404;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
