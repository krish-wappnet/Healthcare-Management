<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { apiClient } from '../../services/api'

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const currentTime = ref(new Date())
const user = ref(null)

// Get user ID from token
const userId = computed(() => {
  if (!authStore.token) return null
  try {
    const base64Url = authStore.token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const decodedToken = JSON.parse(window.atob(base64))
    return decodedToken.sub
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
})

// Fetch user details
const fetchUserDetails = async () => {
  if (!userId.value) return
  
  try {
    const response = await apiClient.get(`/users/${userId.value}`)
    user.value = response.data
    console.log('Fetched user details:', user.value)
  } catch (error) {
    console.error('Error fetching user details:', error)
  }
}

// Fetch user details when component mounts and token changes
onMounted(() => {
  fetchUserDetails()
})

watch(() => authStore.token, () => {
  fetchUserDetails()
})

// Update current time
const updateTime = () => {
  currentTime.value = new Date()
}

// Setup time interval
let timeInterval: number

onMounted(() => {
  timeInterval = window.setInterval(updateTime, 60000) // Update every minute
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

// Format greeting based on time of day
const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-toggle" @click="$emit('toggle-sidebar')">
        <i class="pi pi-bars"></i>
      </button>
      
      <div class="greeting">
        <span>{{ greeting }}, {{ user?.lastName || authStore.user?.lastName || 'User' }}</span>
      </div>
    </div>
    
    <div class="header-right">
      <div class="current-time">
        {{ currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 var(--space-4);
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 5;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    
    .menu-toggle {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      transition: color 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
      }
    }
    
    .greeting {
      font-size: 1rem;
      color: var(--text-primary);
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    
    .current-time {
      font-size: 1rem;
      color: var(--text-secondary);
    }
  }
}

// Mobile styles
@media (max-width: 576px) {
  .header {
    padding: 0 var(--space-3);
    
    .greeting {
      display: none;
    }
  }
}
</style>