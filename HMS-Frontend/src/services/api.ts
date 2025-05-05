import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define interfaces for type safety
interface PatientParams {
  [key: string]: string | number | boolean | undefined;
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  // Add other fields as needed
}

interface PatientData {
  firstName?: string;
  lastName?: string;
  email?: string;
  // Add other fields as needed
}

interface AppointmentData {
  patientId?: string;
  doctorId?: string;
  date?: string;
  startTime?: string;
  status?: string;
  // Add other fields as needed
}

interface ConsultationData {
  appointmentId?: string;
  notes?: string;
  // Add other fields as needed
}

interface DashboardParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  limit?: number;
  sort?: string;
}

// Define interfaces for health device data
interface DeviceData {
  id: string;
  patient: string;
  deviceType: string;
  data: any;
  timestamp: string;
  isAbnormal: boolean;
  abnormalityReason?: string;
  notificationSent?: boolean;
}

interface DeviceDataResponse {
  data: DeviceData[];
  total: number;
  page: number;
  limit: number;
}

// API service modules
export const authService = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  register: (userData: UserData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/profile'),
};

export const userService = {
  getAll: (params?: PatientParams) => apiClient.get('/users', { params }),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (userData: UserData) => apiClient.post('/users', userData),
  update: (id: string, userData: UserData) => apiClient.put(`/users/${id}`, userData),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export const patientService = {
  getAll: (params?: PatientParams) => apiClient.get('/patients', { params }),
  getCurrentProfile: () => apiClient.get('/patients/profile'),
  getById: (id: string) => apiClient.get(`/patients/${id}`),
  create: (patientData: PatientData) => apiClient.post('/patients', patientData),
  update: (id: string, patientData: PatientData) => apiClient.patch(`/patients/${id}`, patientData),
  delete: (id: string) => apiClient.delete(`/patients/${id}`),
  getHealth: (id: string) => apiClient.get(`/patients/${id}/health`),
};

export const appointmentService = {
  getAll: (params?: PatientParams) => apiClient.get('/appointments', { params }),
  getById: (id: string) => apiClient.get(`/appointments/${id}`),
  create: (appointmentData: AppointmentData) => apiClient.post('/appointments', appointmentData),
  update: (id: string, appointmentData: AppointmentData) => apiClient.put(`/appointments/${id}`, appointmentData),
  delete: (id: string) => apiClient.delete(`/appointments/${id}`),
  getTimeSlots: (doctorId: string, date: string) => apiClient.get(`/appointments/${doctorId}/time-slots`, { params: { date } })
};

export const consultationService = {
  getAll: (params?: PatientParams) => apiClient.get('/consultations', { params }),
  getById: (id: string) => apiClient.get(`/consultations/${id}`),
  create: (consultationData: ConsultationData) => apiClient.post('/consultations', consultationData),
  update: (id: string, consultationData: ConsultationData) => apiClient.put(`/consultations/${id}`, consultationData),
  delete: (id: string) => apiClient.delete(`/consultations/${id}`),
  joinRoom: (id: string) => apiClient.post(`/consultations/${id}/join`),
};

export const chatbotService = {
  sendMessage: (message: string) => apiClient.post('/chatbot/message', { message }),
  getHistory: () => apiClient.get('/chatbot/history'),
};

export const dashboardService = {
  getAdminStats: () => apiClient.get('/dashboard/admin'),
  getDoctorStats: () => apiClient.get('/dashboard/doctor'),
  getPatientStats: (params?: DashboardParams) => apiClient.get('/patients/profile', { params }),
};

export const healthDataService = {
  // Get all device data for patient
  getPatientData: (patientId: string, pagination: { page: number; limit: number }) => 
    apiClient.get<DeviceDataResponse>(`/health-devices/patient/${patientId}`, { params: pagination }),

  // Get device data by type for patient
  getDeviceTypeData: (patientId: string, type: string, pagination: { page: number; limit: number }) => 
    apiClient.get<DeviceDataResponse>(`/health-devices/patient/${patientId}/device/${type}`, { params: pagination }),

  // Get abnormal readings for patient
  getAbnormalReadings: (patientId: string, pagination: { page: number; limit: number }) => 
    apiClient.get<DeviceDataResponse>(`/health-devices/patient/${patientId}/abnormal`, { params: pagination }),

  // Get latest health data
  getLatestHealthData: () => {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      throw new Error('Patient ID not found');
    }
    return apiClient.get<DeviceDataResponse>(`/health-devices/patient/${patientId}`, { params: { page: 1, limit: 1 } });
  },

  // Create new device data entry
  createDeviceData: (deviceData: DeviceData) => 
    apiClient.post<DeviceData>('/health-devices', deviceData),
};
