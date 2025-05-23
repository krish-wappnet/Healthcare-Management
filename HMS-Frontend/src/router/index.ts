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
const ManageAppointments = () => import('../views/admin/ManageAppointment.vue')
const ManageReports = () => import('../views/admin/ManageReports.vue')
const ManageDevice = () => import('../views/admin/ManageDevice.vue')

// Doctor routes
const DoctorDashboard = () => import('../views/doctor/DashboardView.vue')
const DoctorProfile = () => import('../views/doctor/DoctorProfile.vue')
const DoctorPatients = () => import('../views/doctor/PatientsView.vue')
const DoctorAppointments = () => import('../views/doctor/AppointmentsView.vue')
const DoctorConsultations = () => import('../views/doctor/ConsultationsView.vue')
const DoctorMedicalReports = () => import('../views/doctor/MedicalReports.vue')
const DoctorDiagnose = () => import('../views/doctor/Diagnose.vue')
const RoleSelection = () => import('../views/auth/RoleSelection.vue')
const DoctorRegistration = () => import('../views/auth/DoctorRegistration.vue')

// Patient routes
const PatientDashboard = () => import('../views/patient/DashboardView.vue')
const PatientProfile = () => import('../views/patient/PatientProfile.vue')
const PatientAppointments = () => import('../views/patient/PatientAppointments.vue')
const PatientReports = () => import('../views/patient/PatientReports.vue')
const PatientRegistration = () => import('../views/auth/PatientRegistration.vue')
const PatientBookAppointment = () => import(/* webpackChunkName: "patient-book-appointment" */ '@/views/patient/BookAppointment.vue')
// Uncomment and use when views are available
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

  // Get user role
  const userRole = authStore.userRole;
  
  // Check if user has required role
  const requiredRole = to.meta.role as UserRole;
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    switch (userRole) {
      case 'admin':
        return { name: 'admin' };
      case 'doctor':
        return { name: 'doctor' };
      case 'patient':
        // Check if patient needs to complete registration
        if (!authStore.user?.id) {
          return { name: 'patient-registration' };
        }
        return { name: 'patient' };
      default:
        return { name: 'login' };
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
    {
      path: '/patient-registration',
      component: PatientRegistration,
      meta: { requiresAuth: false }
    },

    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsers,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/audit-logs',
      name: 'admin-audit-logs',
      component: AdminAuditLogs,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: AdminSettings,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/manage-appointments',
      name: 'admin-manage-appointments',
      component: ManageAppointments,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/manage-reports',
      name: 'admin-manage-reports',
      component: ManageReports,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },
    {
      path: '/admin/manage-device',
      name: 'admin-manage-device',
      component: ManageDevice,
      meta: { role: 'admin' },
      beforeEnter: authGuard
    },

    // Doctor routes
    {
      path: '/doctor',
      name: 'doctor',
      component: DoctorDashboard,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/profile',
      name: 'doctor-profile',
      component: DoctorProfile,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/patients',
      name: 'doctor-patients',
      component: DoctorPatients,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/appointments',
      name: 'doctor-appointments',
      component: DoctorAppointments,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/consultations',
      name: 'doctor-consultations',
      component: DoctorConsultations,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/medical-reports',
      name: 'doctor-medical-reports',
      component: DoctorMedicalReports,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },
    {
      path: '/doctor/diagnose',
      name: 'doctor-diagnose',
      component: DoctorDiagnose,
      meta: { role: 'doctor' },
      beforeEnter: authGuard
    },

    // Patient routes
    {
      path: '/patient',
      name: 'patient',
      component: PatientDashboard,
      meta: { role: 'patient' },
      beforeEnter: authGuard
    },
    {
      path: '/patient/profile',
      name: 'patient-profile',
      component: PatientProfile,
      meta: { role: 'patient' },
      beforeEnter: authGuard
    },
    {
      path: '/patient/book-appointment',
      name: 'patient-book-appointment',
      component: PatientBookAppointment,
      meta: { requiresAuth: true, role: 'patient' }
    },
    {
      path: '/patient/appointments',
      name: 'patient-appointments',
      component: PatientAppointments,
      meta: { requiresAuth: true, role: 'patient' }
    },
    {
      path: '/patient/reports',
      name: 'patient-reports',
      component: PatientReports,
      meta: { requiresAuth: true, role: 'patient' }
    },
    {
      path: '/patient/book-appointment',
      name: 'patient-book-appointment',
      component: PatientBookAppointment,
      meta: { requiresAuth: true, role: 'patient' }
    }
  ]
})

export default router
