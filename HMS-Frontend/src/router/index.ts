import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes
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
    { path: '/role-selection', component: RoleSelection },

  { path: '/doctor-registration', component: DoctorRegistration },
    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsers,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/audit-logs',
      name: 'admin-audit-logs',
      component: AdminAuditLogs,
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: AdminSettings,
      meta: { requiresAuth: true, role: 'admin' }
    },

    // Doctor routes
    {
      path: '/doctor',
      name: 'doctor',
      component: DoctorDashboard,
      meta: { requiresAuth: true, role: 'doctor' }
    },
    {
      path: '/doctor/patients',
      name: 'doctor-patients',
      component: DoctorPatients,
      meta: { requiresAuth: true, role: 'doctor' }
    },
    {
      path: '/doctor/appointments',
      name: 'doctor-appointments',
      component: DoctorAppointments,
      meta: { requiresAuth: true, role: 'doctor' }
    },
    {
      path: '/doctor/consultations',
      name: 'doctor-consultations',
      component: DoctorConsultations,
      meta: { requiresAuth: true, role: 'doctor' }
    },
    // {
    //   path: '/doctor/patients/:id',
    //   name: 'patient-detail',
    //   component: PatientDetail,
    //   meta: { requiresAuth: true, role: 'doctor' }
    // },

    // Patient routes
    {
      path: '/patient',
      name: 'patient',
      component: PatientDashboard,
      meta: { requiresAuth: true, role: 'patient' }
    },

    // Uncomment these when views are implemented
    // {
    //   path: '/patient/appointments',
    //   name: 'patient-appointments',
    //   component: PatientAppointments,
    //   meta: { requiresAuth: true, role: 'patient' }
    // },
    // {
    //   path: '/patient/consultations',
    //   name: 'patient-consultations',
    //   component: PatientConsultations,
    //   meta: { requiresAuth: true, role: 'patient' }
    // },
    // {
    //   path: '/patient/health',
    //   name: 'patient-health',
    //   component: PatientHealth,
    //   meta: { requiresAuth: true, role: 'patient' }
    // },
    // {
    //   path: '/patient/chatbot',
    //   name: 'patient-chatbot',
    //   component: PatientChatbot,
    //   meta: { requiresAuth: true, role: 'patient' }
    // },

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
      redirect: '/'
    }
  ]
})

// Navigation Guard
router.beforeEach(async (to: RouteLocationNormalized, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'login' })
    }

    if (to.meta.role && to.meta.role !== authStore.userRole) {
      switch (authStore.userRole) {
        case 'admin': return next({ name: 'admin' })
        case 'doctor': return next({ name: 'doctor' })
        case 'patient': return next({ name: 'patient' })
        default: return next({ name: 'login' })
      }
    }
  }

  next()
})

export default router
