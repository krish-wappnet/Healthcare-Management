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

// Close sidebar
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

// Navigate to profile based on role (excluding admin)
const goToProfile = () => {
  const role = authStore.userRole
  const profileRoutes = {
    patient: '/patient/profile',
    doctor: '/doctor/profile'
  }
  const route = profileRoutes[role] || '/profile'
  router.push(route)
  closeSidebar()
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
        { icon: 'pi pi-calendar-plus', label: 'Manage Appointments', route: '/admin/manage-appointments' },
        { icon: 'pi pi-file', label: 'Manage Reports', route: '/admin/manage-reports' },
        { icon: 'pi pi-desktop', label: 'Manage Devices', route: '/admin/manage-device' },
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
  closeSidebar()
}
</script>

<template>
  <aside class="sidebar" :class="{ active: visible }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="pi pi-heart-fill"></i>
        </div>
        <h1 class="logo-text">HealthCare</h1>
      </div>
      <div class="header-buttons">
        <button class="collapse-button" @click="closeSidebar" aria-label="Collapse sidebar">
          <i class="pi pi-angle-left"></i>
        </button>
        <button class="close-button" @click="closeSidebar" aria-label="Close sidebar">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
    
    <div class="sidebar-user">
      <div class="user-avatar">
        <img 
          :src="user?.avatar || authStore.user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
          alt="User Avatar"
        >
      </div>
      <div class="user-info">
        <h3 class="user-name">
          {{ user?.firstName || authStore.user?.firstName || 'User' }} 
          {{ user?.lastName || '' }}
        </h3>
        <span class="user-role">
          {{ user?.role || authStore.user?.role || 'Guest' }}
        </span>
        <button 
          v-if="authStore.userRole !== 'admin'" 
          class="profile-button" 
          @click="goToProfile" 
          aria-label="View profile"
        >
          <i class="pi pi-user"></i>
          View Profile
        </button>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="(item, index) in navItems" :key="item.route" class="nav-item" :style="{ animationDelay: `${index * 0.1}s` }">
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
      <button class="logout-button" @click="handleLogout" aria-label="Sign out">
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
  --primary: #4f46e5; /* Aligned with Doctor Dashboard */
  --primary-dark: #3730a3;
  --primary-light: #a5b4fc;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --error: #ef4444;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --font-sm: 0.875rem;
  --font-md: 1rem;
  --font-lg: 1.25rem;
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
  width: 260px;
  background-color: white;
  height: 100vh;
  box-shadow: var(--shadow-md);
  z-index: 20;
  transition: transform var(--transition-normal), box-shadow var(--transition-fast);

  &:hover {
    box-shadow: var(--shadow-lg);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3);
    background: white;
    border-bottom: 1px solid var(--neutral-200);

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--primary);
        border-radius: 50%;
        transition: transform var(--transition-fast), background var(--transition-fast);

        i {
          font-size: 18px;
          color: white;
        }

        &:hover {
          transform: rotate(15deg) scale(1.15);
          background: var(--primary-dark);
        }
      }

      .logo-text {
        font-size: var(--font-lg);
        font-weight: 700;
        color: var(--primary-dark);
        margin: 0;
        transition: all var(--transition-fast);
        position: relative;
        overflow: hidden;

        &:hover {
          color: var(--primary);
          transform: scale(1.05);
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            animation: glow 1.5s infinite;
          }
        }
      }
      }
    }

    .header-buttons {
      display: flex;
      gap: var(--space-1);
    }

    .collapse-button,
    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background-color: var(--neutral-100);
      cursor: pointer;
      transition: transform var(--transition-fast), background-color var(--transition-fast);

      i {
        font-size: 14px;
        color: var(--neutral-700);
      }
    }

    .collapse-button:hover {
      background-color: var(--neutral-200);
      transform: scale(1.1) rotate(-15deg);
    }

    .close-button:hover {
      background-color: var(--neutral-200);
      transform: scale(1.1) rotate(90deg);
    }

    .close-button {
      display: none; /* Only shown on mobile */
    }
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border-bottom: 1px solid var(--neutral-200);
    background: white;

    .user-avatar {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      transition: transform var(--transition-fast);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

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
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);

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

      .profile-button {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-1) var(--space-2);
        border: none;
        border-radius: var(--radius-md);
        background: var(--neutral-100);
        color: var(--primary);
        font-size: var(--font-sm);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast), transform var(--transition-fast);
        width: fit-content;

        i {
          font-size: 14px;
        }

        &:hover {
          background: var(--primary-light);
          color: var(--primary-dark);
          transform: scale(1.05);
        }

        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
        }
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
        animation: fadeInUp 0.3s ease-out forwards;

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          color: var(--neutral-700);
          text-decoration: none;
          transition: all var(--transition-fast), transform var(--transition-fast);
          border-left: 4px solid transparent;
          position: relative;
          overflow: hidden;

          i {
            font-size: 20px;
            min-width: 24px;
            text-align: center;
            transition: transform var(--transition-fast);
          }

          span {
            font-size: var(--font-md);
            transition: color var(--transition-fast);
          }

          &:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: var(--primary-light);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width var(--transition-fast), height var(--transition-fast);
            opacity: 0;
          }

          &:hover {
            background-color: var(--neutral-100);
            color: var(--primary-dark);
            transform: scale(1.02);
            border-left-color: var(--primary);

            i {
              transform: rotate(5deg) scale(1.1);
            }
          }

          &.active {
            background: linear-gradient(90deg, var(--primary-light) 0%, var(--primary) 100%);
            color: white;
            border-left-color: var(--primary-dark);
            font-weight: 700;
            padding-left: calc(var(--space-3) + 4px);
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

            i, span {
              color: white;
            }
          }

          &:active:before {
            width: 200px;
            height: 200px;
            opacity: 0.3;
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
      background: var(--neutral-100);
      color: var(--neutral-700);
      font-size: var(--font-md);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast), transform var(--transition-fast);
      position: relative;
      overflow: hidden;

      i {
        font-size: 16px;
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
        background: transparent;
        color: white;
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);

        &:before {
          opacity: 1;
        }

        i {
          transform: scale(1.2);
        }
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
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

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile styles */
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    width: 280px;

    &.active {
      transform: translateX(0);
      animation: slideIn 0.3s ease-out;
    }

    .sidebar-header {
      .close-button {
        display: flex;
      }

      .collapse-button {
        width: 24px;
        height: 24px;

        i {
          font-size: 12px;
        }
      }
    }

    .sidebar-user {
      padding: var(--space-2);

      .user-avatar {
        width: 40px;
        height: 40px;
      }

      .user-info {
        .profile-button {
          padding: var(--space-1) var(--space-2);
          font-size: 0.75rem;
        }
      }
    }

    .sidebar-nav {
      .nav-list {
        .nav-item {
          .nav-link {
            padding: var(--space-2) var(--space-2);
            font-size: var(--font-sm);

            &.active {
              padding-left: calc(var(--space-2) + 4px);
            }
          }
        }
      }
    }
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Focus states for accessibility */
.nav-link:focus,
.logout-button:focus,
.close-button:focus,
.collapse-button:focus,
.profile-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}
</style>