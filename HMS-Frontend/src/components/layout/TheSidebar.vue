<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

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

// Navigation items based on user role
const navItems = computed(() => {
  switch (authStore.userRole) {
    case 'admin':
      return [
        { icon: 'pi pi-home', label: 'Dashboard', route: '/admin' },
        { icon: 'pi pi-users', label: 'Users', route: '/admin/users' },
        { icon: 'pi pi-list', label: 'Audit Logs', route: '/admin/audit-logs' },
        { icon: 'pi pi-cog', label: 'Settings', route: '/admin/settings' }
      ]
    case 'doctor':
      return [
        { icon: 'pi pi-home', label: 'Dashboard', route: '/doctor' },
        { icon: 'pi pi-users', label: 'Patients', route: '/doctor/patients' },
        { icon: 'pi pi-calendar', label: 'Appointments', route: '/doctor/appointments' },
        { icon: 'pi pi-video', label: 'Consultations', route: '/doctor/consultations' },
        { icon: 'pi pi-file', label: 'Medical Reports', route: '/doctor/medical-reports' }
      ]
    case 'patient':
      return [
        { icon: 'pi pi-home', label: 'Dashboard', route: '/patient' },
        { icon: 'pi pi-calendar', label: 'Appointments', route: '/patient/appointments' },
        { icon: 'pi pi-file', label: 'Medical Reports', route: '/patient/reports' },
        { icon: 'pi pi-heart', label: 'My Health', route: '/patient/health' },
        { icon: 'pi pi-comments', label: 'Symptom Checker', route: '/patient/chatbot' }
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
        <img :src="authStore.user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" alt="User Avatar">
      </div>
      <div class="user-info">
        <h3 class="user-name">{{ authStore.user?.name || 'User' }}</h3>
        <span class="user-role">{{ authStore.user?.role || 'Guest' }}</span>
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
  transition: transform var(--transition-normal);
  
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
        
        i {
          font-size: 16px;
          color: white;
        }
      }
      
      .logo-text {
        font-size: var(--font-lg);
        font-weight: 700;
        color: var(--primary);
        margin: 0;
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
      
      &:hover {
        background-color: var(--neutral-200);
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
          transition: all var(--transition-fast);
          border-left: 3px solid transparent;
          
          i {
            font-size: 18px;
            min-width: 24px;
            text-align: center;
          }
          
          &:hover {
            background-color: var(--neutral-100);
            color: var(--primary);
          }
          
          &.active {
            background-color: var(--primary-light);
            color: var(--primary-dark);
            border-left-color: var(--primary);
            font-weight: 600;
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
      transition: all var(--transition-fast);
      
      &:hover {
        background-color: var(--error);
        color: white;
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
</style>