import { ref, computed } from 'vue';
import ToastMessage from '../components/ToastMessage.vue';

const toasts = ref([]);

const addToast = (message, type = 'info', duration = 3000) => {
  const id = Date.now();
  toasts.value.push({
    id,
    message,
    type,
    duration
  });

  // Remove toast after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter(toast => toast.id !== id);
};

const clearToasts = () => {
  toasts.value = [];
};

export const useToast = () => {
  return {
    success: (message, duration = 3000) => addToast(message, 'success', duration),
    error: (message, duration = 3000) => addToast(message, 'error', duration),
    info: (message, duration = 3000) => addToast(message, 'info', duration),
    warning: (message, duration = 3000) => addToast(message, 'warning', duration),
    clear: clearToasts,
    toasts: computed(() => toasts.value),
    ToastMessage
  };
};
