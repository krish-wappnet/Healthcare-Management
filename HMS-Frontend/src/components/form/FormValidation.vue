<template>
  <div class="form-validation">
    <p v-if="error" :id="errorId" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  error?: string | null;
  field?: string;
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  field: '',
});

const errorId = computed(() => {
  return props.field ? `${props.field}-error` : '';
});
</script>

<style scoped>
.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
