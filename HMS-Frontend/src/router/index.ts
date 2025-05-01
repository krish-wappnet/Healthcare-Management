import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore, UserRole } from '../stores/auth'
import { useRouter } from 'vue-router'

// Lazy-loaded components
const Login = () => import('../views/auth/LoginView.vue')
const Register = () => import('../views/auth/RegisterView.vue')

// Admin routes
const AdminDashboard = () => import('../views/admin/DashboardView.vue')
const AdminUsers = () => import('../views/admin/UsersView.vue')
const AdminAuditLogs = () => import('../views/admin/AuditLogsView.vue')
const AdminSettings = () => import('../views/admin/SettingsView.vue')

// Doctor routes
const DoctorDashboard = () => import('../views/doctor/DashboardView.vue')
const DoctorProfile = () => import('../views/doctor/DoctorProfile.vue')
const DoctorPatients = () => import('../views/doctor/PatientsView.vue')
const DoctorAppointments = () => import('../views/doctor/AppointmentsView.vue')
const DoctorConsultations = () => import('../views/doctor/ConsultationsView.vue')
const RoleSelection = () => import('../views/auth/RoleSelection.vue')
const DoctorRegistration = () => import('../views/auth/DoctorRegistration.vue')

// Patient routes
const PatientDashboard = () => import('../views/patient/DashboardView.vue')
// Uncomment and use when views are available
// const PatientAppointments = () => import('../views/patient/AppointmentsView.vue')
// const PatientConsultations = () => import('../views/patient/ConsultationsView.vue')
// const PatientHealth = () => import('../views/patient/HealthView.vue')
// const PatientChatbot = () => import('../views/patient/ChatbotView.vue')

// Auth guard
const authGuard = async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  if (!await authStore.checkAuth()) {
    return { name: 'login' };
  }

  // Check if user has required role
  const requiredRole = to.meta.role as UserRole;
  if (requiredRole && authStore.userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    switch (authStore.userRole) {
      case 'admin': return { name: 'admin' };
      case 'doctor': return { name: 'doctor' };
      case 'patient': return { name: 'patient' };
      default: return { name: 'login' };
    }
  }

  return true;
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresAuth: false }
    },
    {
      path: '/role-selection',
      component: RoleSelection,
      meta: { requiresAuth: false }
    },
    {
      path: '/doctor-registration',
      component: DoctorRegistration,
      meta: { requiresAuth: false }
    },

    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsers,
      meta: { requiresAuth: true, role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/audit-logs',
      name: 'admin-audit-logs',
      component: AdminAuditLogs,
      meta: { requiresAuth: true, role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: AdminSettings,
      meta: { requiresAuth: true, role: 'admin' },
      beforeEnter: authGuard
    },

    // Doctor routes
    {
      path: '/doctor',
      name: 'doctor',
      component: DoctorDashboard,
      meta: { requiresAuth: true, role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/profile',
      name: 'doctor-profile',
      component: DoctorProfile,
      meta: { requiresAuth: true, role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/patients',
      name: 'doctor-patients',
      component: DoctorPatients,
      meta: { requiresAuth: true, role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/appointments',
      name: 'doctor-appointments',
      component: DoctorAppointments,
      meta: { requiresAuth: true, role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/consultations',
      name: 'doctor-consultations',
      component: DoctorConsultations,
      meta: { requiresAuth: true, role: 'doctor' },
      beforeEnter: authGuard
    },

    // Patient routes
    {
      path: '/patient',
      name: 'patient',
      component: PatientDashboard,
      meta: { requiresAuth: true, role: 'patient' },
      beforeEnter: authGuard
    },

    // Redirect root to appropriate dashboard based on role
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return { name: 'login' }

        switch (authStore.userRole) {
          case 'admin': return { name: 'admin' }
          case 'doctor': return { name: 'doctor' }
          case 'patient': return { name: 'patient' }
          default: return { name: 'login' }
        }
      }
    },

    // Catch-all route
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

export default router
