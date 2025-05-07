  <script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from './stores/auth'
  import TheHeader from './components/layout/TheHeader.vue'
  import TheSidebar from './components/layout/TheSidebar.vue'
  import Toast from 'primevue/toast'
  import ConfirmDialog from 'primevue/confirmdialog'
  import ChatInterface from './components/chatbot/ChatInterface.vue'

  const route = useRoute()
  const authStore = useAuthStore()
  const sidebarVisible = ref(window.innerWidth >= 992)
  const loading = ref(true)

  // Check authentication status on app load
  onMounted(async () => {
    try {
      await authStore.checkAuth()
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      loading.value = false
    }
  })

  // Toggle sidebar
  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
  }

  // Close sidebar on mobile when route changes
  watch(() => route.path, () => {
    if (window.innerWidth < 992) {
      sidebarVisible.value = false
    }
  })

  // Check if we're on the login page
  const isAuthPage = computed(() => {
    return route.path === '/login' || route.path === '/register'
  })
  </script>

  <template>
    <div class="app-container">
      <!-- Global components -->
      <Toast position="top-right" />
      <ConfirmDialog />
      
      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay flex items-center justify-center">
        <div class="loading-spinner"></div>
      </div>
      
      <!-- Auth pages (login/register) -->
      <div v-if="isAuthPage" class="auth-container">
        <router-view />
      </div>
      
      <!-- Dashboard layout -->
      <div v-else class="dashboard-container">
        <TheSidebar :visible="sidebarVisible" @close="sidebarVisible = false" />
        
        <div class="dashboard-main">
          <TheHeader @toggle-sidebar="toggleSidebar" />
          
          <main class="dashboard-content">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
        </div>
      </div>

      <!-- Chat Interface - Moved outside dashboard to ensure visibility -->
      <ChatInterface />
    </div>
  </template>

  <style lang="scss" scoped>
  .app-container {
    min-height: 100vh;
    position: relative;
  }

  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .dashboard-container {
    display: flex;
    min-height: 100vh;
    margin-left: 250px; // Push content to the right of sidebar
  }

  .dashboard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow: hidden;
  }

  .dashboard-content {
    flex: 1;
    padding: var(--space-4);
    overflow-y: auto;
    background-color: var(--neutral-100);
  }

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9998; // Below chat (10000)
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--primary-light);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>