<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const currentTime = ref(new Date())
const notificationsOpen = ref(false)

// Dummy notifications for demo
const notifications = ref([
  {
    id: 1,
    type: 'appointment',
    message: 'You have an appointment with Dr. Johnson tomorrow at 10:00 AM',
    time: '10 min ago',
    read: false
  },
  {
    id: 2,
    type: 'message',
    message: 'Dr. Smith sent you a message regarding your recent test results',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'system',
    message: 'System maintenance scheduled for tonight from 2AM to 4AM',
    time: '5 hours ago',
    read: true
  }
])

// Update current time
const updateTime = () => {
  currentTime.value = new Date()
}

// Toggle notifications panel
const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
}

// Mark notification as read
const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
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
        <span>{{ greeting }}, {{ authStore.user?.name?.split(' ')[0] || 'User' }}</span>
      </div>
    </div>
    
    <div class="header-right">
      <div class="current-time">
        {{ currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </div>
      
      <div class="notifications-dropdown">
        <button 
          class="notifications-toggle" 
          @click="toggleNotifications"
          :class="{ active: notificationsOpen }"
        >
          <i class="pi pi-bell"></i>
          <span class="notification-badge" v-if="notifications.filter(n => !n.read).length">
            {{ notifications.filter(n => !n.read).length }}
          </span>
        </button>
        
        <div class="notifications-panel" v-if="notificationsOpen">
          <div class="notifications-header">
            <h3>Notifications</h3>
            <button class="mark-all-read">Mark all as read</button>
          </div>
          
          <div class="notifications-list">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
              @click="markAsRead(notification.id)"
            >
              <div class="notification-icon">
                <i 
                  :class="{
                    'pi pi-calendar': notification.type === 'appointment',
                    'pi pi-envelope': notification.type === 'message',
                    'pi pi-info-circle': notification.type === 'system'
                  }"
                ></i>
              </div>
              <div class="notification-content">
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ notification.time }}</span>
              </div>
            </div>
            
            <div v-if="notifications.length === 0" class="no-notifications">
              <p>No notifications</p>
            </div>
          </div>
          
          <div class="notifications-footer">
            <button class="view-all">View all notifications</button>
          </div>
        </div>
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: transparent;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      
      &:hover {
        background-color: var(--neutral-100);
      }
      
      i {
        font-size: 18px;
        color: var(--neutral-700);
      }
    }
    
    .greeting {
      font-size: var(--font-md);
      font-weight: 500;
      color: var(--neutral-700);
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    
    .current-time {
      font-size: var(--font-sm);
      color: var(--neutral-600);
    }
    
    .notifications-dropdown {
      position: relative;
      
      .notifications-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background-color: transparent;
        cursor: pointer;
        transition: background-color var(--transition-fast);
        position: relative;
        
        &:hover {
          background-color: var(--neutral-100);
        }
        
        &.active {
          background-color: var(--primary-light);
          
          i {
            color: var(--primary);
          }
        }
        
        i {
          font-size: 18px;
          color: var(--neutral-700);
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background-color: var(--error);
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
        }
      }
      
      .notifications-panel {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 320px;
        background-color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        z-index: 10;
        
        .notifications-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          border-bottom: 1px solid var(--neutral-200);
          
          h3 {
            font-size: var(--font-md);
            font-weight: 600;
            margin: 0;
          }
          
          .mark-all-read {
            font-size: var(--font-sm);
            color: var(--primary);
            background: none;
            border: none;
            cursor: pointer;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
        
        .notifications-list {
          max-height: 320px;
          overflow-y: auto;
          
          .notification-item {
            display: flex;
            align-items: flex-start;
            gap: var(--space-2);
            padding: var(--space-2) var(--space-3);
            border-bottom: 1px solid var(--neutral-100);
            cursor: pointer;
            transition: background-color var(--transition-fast);
            
            &:hover {
              background-color: var(--neutral-100);
            }
            
            &.unread {
              background-color: var(--primary-light);
              
              .notification-icon i {
                color: var(--primary);
              }
              
              .notification-content .notification-message {
                font-weight: 600;
              }
            }
            
            .notification-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background-color: var(--neutral-100);
              border-radius: 50%;
              margin-top: 2px;
              
              i {
                font-size: 16px;
                color: var(--neutral-700);
              }
            }
            
            .notification-content {
              flex: 1;
              
              .notification-message {
                font-size: var(--font-sm);
                color: var(--neutral-800);
                margin: 0 0 var(--space-1);
              }
              
              .notification-time {
                font-size: var(--font-xs);
                color: var(--neutral-600);
              }
            }
          }
          
          .no-notifications {
            padding: var(--space-3);
            text-align: center;
            color: var(--neutral-600);
          }
        }
        
        .notifications-footer {
          padding: var(--space-2) var(--space-3);
          border-top: 1px solid var(--neutral-200);
          text-align: center;
          
          .view-all {
            width: 100%;
            padding: var(--space-1) var(--space-2);
            background-color: var(--neutral-100);
            border: none;
            border-radius: var(--radius-md);
            color: var(--primary);
            font-size: var(--font-sm);
            font-weight: 500;
            cursor: pointer;
            transition: background-color var(--transition-fast);
            
            &:hover {
              background-color: var(--primary-light);
            }
          }
        }
      }
    }
  }
}

// Mobile styles
@media (max-width: 576px) {
  .header {
    padding: 0 var(--space-2);
    
    .greeting {
      display: none;
    }
    
    .current-time {
      display: none;
    }
  }
}
</style>