<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { apiClient } from '../../services/api'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['close'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Close sidebar on mobile
const closeSidebar = () => {
  emit('close')
}

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
const user = ref(null)
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

// Navigation items based on user role
const navItems = computed(() => {
  switch (authStore.userRole) {
    case 'admin':
      return [
        { icon: 'pi pi-home', label: 'Dashboard', route: '/admin' },
        { icon: 'pi pi-calendar', label: 'Appointments', route: '/admin/appointments' },
        { icon: 'pi pi-file', label: 'Medical Reports', route: '/admin/medical-reports' },
        { icon: 'pi pi-cog', label: 'Settings', route: '/admin/settings' }
      ]
    case 'doctor':
      return [
        { icon: 'pi pi-home', label: 'Dashboard', route: '/doctor' },
        { icon: 'pi pi-calendar', label: 'Appointments', route: '/doctor/appointments' },
        { icon: 'pi pi-video', label: 'Consultations', route: '/doctor/consultations' },
        { icon: 'pi pi-file', label: 'Medical Reports', route: '/doctor/medical-reports' },
        { icon: 'pi pi-search', label: 'Diagnose', route: '/doctor/diagnose' }
      ]
    case 'patient':
      return [
        { icon: 'pi pi-home', label: 'Dashboard', route: '/patient' },
        { icon: 'pi pi-calendar-plus', label: 'Book Appointment', route: '/patient/book-appointment' },
        { icon: 'pi pi-calendar', label: 'Appointments', route: '/patient/appointments' },
        { icon: 'pi pi-file', label: 'Medical Reports', route: '/patient/reports' }
      ]
    default:
      return []
  }
})

// Check if route is active
const isActive = (route: string) => {
  return router.currentRoute.value.path === route
}

// Handle logout
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar" :class="{ active: visible }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="pi pi-heart-fill text-primary"></i>
        </div>
        <h1 class="logo-text">HealthCare</h1>
      </div>
      <button class="close-button" @click="closeSidebar">
        <i class="pi pi-times"></i>
      </button>
    </div>
    
    <div class="sidebar-user">
      <div class="user-avatar">
        <img :src="user?.avatar || authStore.user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" alt="User Avatar">
      </div>
      <div class="user-info">
        <h3 class="user-name">
          {{ user?.firstName }} {{ user?.lastName }}
          <!-- Fallback to authStore if user data not available -->
          {{ user ? '' : (authStore.user?.firstName || 'User') }}
        </h3>
        <span class="user-role">
          {{ user?.role || authStore.user?.role || 'Guest' }}
        </span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.route" class="nav-item">
          <router-link 
            :to="item.route" 
            class="nav-link" 
            :class="{ active: isActive(item.route) }"
            @click="closeSidebar"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <button class="logout-button" @click="handleLogout">
        <i class="pi pi-sign-out"></i>
        <span>Sign Out</span>
      </button>
    </div>
  </aside>
  
  <!-- Backdrop for mobile -->
  <div 
    v-if="visible" 
    class="sidebar-backdrop" 
    @click="closeSidebar"
  ></div>
</template>

<style lang="scss" scoped>
:root {
  --primary: #3b82f6;
  --primary-dark: #1e40af;
  --primary-light: #93c5fd;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --error: #ef4444;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --font-sm: 0.875rem;
  --font-md: 1rem;
  --font-lg: 1.125rem;
  --radius-md: 0.375rem;
  --transition-fast: 0.2s ease-out;
  --transition-normal: 0.3s ease-out;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 250px;
  background-color: white;
  height: 100vh;
  box-shadow: var(--shadow-md);
  z-index: 20;
  transition: transform var(--transition-normal), box-shadow var(--transition-fast);

  &:hover {
    box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15), 0 3px 6px -2px rgba(0, 0, 0, 0.1);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3);
    border-bottom: 1px solid var(--neutral-200);

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: var(--primary-light);
        border-radius: 50%;
        transition: transform var(--transition-fast), background-color var(--transition-fast);

        i {
          font-size: 16px;
          color: white;
        }

        &:hover {
          transform: scale(1.1);
          background-color: var(--primary);
        }
      }

      .logo-text {
        font-size: var(--font-lg);
        font-weight: 700;
        color: var(--primary);
        margin: 0;
        transition: color var(--transition-fast);

        &:hover {
          color: var(--primary-dark);
        }
      }
    }

    .close-button {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background-color: var(--neutral-100);
      cursor: pointer;
      transition: transform var(--transition-fast), background-color var(--transition-fast);

      &:hover {
        background-color: var(--neutral-200);
        transform: scale(1.1) rotate(90deg);
      }

      i {
        font-size: 16px;
        color: var(--neutral-700);
      }
    }
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border-bottom: 1px solid var(--neutral-200);

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      transition: transform var(--transition-fast);

      &:hover {
        transform: scale(1.05);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-info {
      .user-name {
        font-size: var(--font-md);
        font-weight: 600;
        margin: 0;
        color: var(--neutral-800);
        transition: color var(--transition-fast);

        &:hover {
          color: var(--primary);
        }
      }

      .user-role {
        font-size: var(--font-sm);
        color: var(--neutral-600);
        text-transform: capitalize;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: var(--space-3) 0;
    overflow-y: auto;

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .nav-item {
        margin-bottom: var(--space-1);

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          color: var(--neutral-700);
          text-decoration: none;
          transition: all var(--transition-fast), transform var(--transition-fast);
          border-left: 3px solid transparent;
          position: relative;
          overflow: hidden;

          i {
            font-size: 18px;
            min-width: 24px;
            text-align: center;
            transition: transform var(--transition-fast);
          }

          span {
            transition: color var(--transition-fast);
          }

          &:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, var(--primary-light) 0%, transparent 100%);
            opacity: 0;
            transition: opacity var(--transition-fast);
          }

          &:hover {
            background-color: transparent;
            color: var(--primary-dark);
            transform: scale(1.02);
            border-left-color: var(--primary);

            &:before {
              opacity: 0.3;
            }

            i {
              transform: rotate(5deg) scale(1.1);
            }
          }

          &.active {
            background-color: var(--primary-light);
            color: var(--primary-dark);
            border-left-color: var(--primary);
            font-weight: 600;

            &:before {
              opacity: 0;
            }
          }
        }
      }
    }
  }

  .sidebar-footer {
    padding: var(--space-3);
    border-top: 1px solid var(--neutral-200);

    .logout-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-2);
      border: none;
      border-radius: var(--radius-md);
      background-color: var(--neutral-100);
      color: var(--neutral-700);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast), transform var(--transition-fast);
      position: relative;
      overflow: hidden;

      i {
        transition: transform var(--transition-fast);
      }

      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, var(--error) 0%, #b91c1c 100%);
        opacity: 0;
        transition: opacity var(--transition-fast);
      }

      &:hover {
        background-color: transparent;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        &:before {
          opacity: 1;
        }

        i {
          transform: scale(1.2);
        }
      }
    }
  }
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 15;
  transition: opacity var(--transition-normal);

  &:hover {
    opacity: 0.6;
  }
}

// Mobile styles
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);

    &.active {
      transform: translateX(0);
    }

    .sidebar-header {
      .close-button {
        display: flex;
      }
    }
  }
}

// Focus states for accessibility
.nav-link:focus,
.logout-button:focus,
.close-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>