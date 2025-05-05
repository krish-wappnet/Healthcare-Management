<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { healthDataService, appointmentService } from '../../services/api';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import HealthDataCard from '../../components/patient/HealthDataCard.vue';
import VitalSignsChart from '../../components/charts/VitalSignsChart.vue';
import AppointmentCalendar from '../../components/calendar/AppointmentCalendar.vue';
import dayjs from 'dayjs';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import Textarea from "primevue/textarea";
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import MultiSelect from 'primevue/multiselect';

// Define interfaces for type safety
interface HealthData {
  heartRate?: { value: number; change: number; time: string; history?: any[] };
  bloodPressure?: { value: string; change: number; time: string };
  temperature?: { value: number; change: number; time: string };
  oxygen?: { value: number; change: number; time: string };
}

interface Appointment {
  id: string;
  doctor: { name: string };
  date: string;
  startTime: string;
}

interface PatientStats {
  totalAppointments: number;
  completedConsultations: number;
  upcomingAppointments: number;
  lastCheckup: string | null;
}

// State
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref<string | null>(null);
const patientId = ref<string | null>(null);
const appointments = ref<any[]>([]); // Initialize appointments as empty array
const healthData = ref<HealthData | null>(null);
const upcomingAppointment = ref<Appointment | null>(null);
const stats = ref<PatientStats>({
  totalAppointments: 0,
  completedConsultations: 0,
  upcomingAppointments: 0,
  lastCheckup: null,
});
const displayAppointmentModal = ref(false);
const selectedDoctor = ref(null);
const doctors = ref([]);
const appointmentForm = ref({
  patient: patientId.value,
  doctor: null,
  date: '',
  startTime: '',
  endTime: '',
  status: 'scheduled',
  type: 'Video Consultation',
  reasonForVisit: '',
  notes: '',
  symptoms: [],
  isPaid: false,
  paymentAmount: 150
});

const displayHealthDeviceModal = ref(false);
const healthDeviceForm = ref({
  deviceId: '',
  deviceType: 'smartwatch',
  timestamp: dayjs().toISOString(),
  data: {
    heartRate: 75,
    bloodPressure: "120/80",
    oxygenSaturation: 98,
    temperature: 98.6,
    steps: 8500
  },
  isAbnormal: false,
  abnormalityReason: "",
  notificationSent: false
});

const healthDeviceData = ref([]); // Initialize as empty array

const selectedDoctorFee = computed(() => {
  if (!selectedDoctor.value) return null;
  const doctor = doctors.value.find(d => d.value === selectedDoctor.value);
  return doctor ? doctor.doctor.consultationFee : null;
});

// Device types enum
const DeviceType = {
  SMARTWATCH: 'smartwatch',
  BLOOD_PRESSURE: 'blood_pressure',
  GLUCOSE_MONITOR: 'glucose_monitor',
  PULSE_OXIMETER: 'pulse_oximeter',
  THERMOMETER: 'thermometer',
  WEIGHT_SCALE: 'weight_scale'
} as const;

type DeviceType = typeof DeviceType[keyof typeof DeviceType];

const deviceTypeOptions = computed(() => {
  return Object.entries(DeviceType).map(([key, value]) => ({
    label: key.replace('_', ' '),
    value: value
  }));
});

const deviceFields = computed(() => {
  switch (healthDeviceForm.value.deviceType) {
    case DeviceType.SMARTWATCH:
      return [
        { label: 'Heart Rate', field: 'heartRate', unit: 'bpm' },
        { label: 'Blood Pressure', field: 'bloodPressure', unit: 'mmHg' },
        { label: 'Oxygen Saturation', field: 'oxygenSaturation', unit: '%' },
        { label: 'Temperature', field: 'temperature', unit: '°F' },
        { label: 'Steps', field: 'steps', unit: '' }
      ];
    case DeviceType.BLOOD_PRESSURE:
      return [
        { label: 'Blood Pressure', field: 'bloodPressure', unit: 'mmHg' },
        { label: 'Pulse Rate', field: 'pulseRate', unit: 'bpm' }
      ];
    case DeviceType.GLUCOSE_MONITOR:
      return [
        { label: 'Glucose Level', field: 'glucoseLevel', unit: 'mg/dL' },
        { label: 'Is Fasting', field: 'isFasting', type: 'boolean' }
      ];
    case DeviceType.PULSE_OXIMETER:
      return [
        { label: 'Oxygen Saturation', field: 'oxygenSaturation', unit: '%' },
        { label: 'Pulse Rate', field: 'pulseRate', unit: 'bpm' }
      ];
    case DeviceType.THERMOMETER:
      return [
        { label: 'Temperature', field: 'temperature', unit: '°F' },
        { label: 'Location', field: 'measurementLocation', type: 'text' }
      ];
    case DeviceType.WEIGHT_SCALE:
      return [
        { label: 'Weight', field: 'weight', unit: 'lbs' },
        { label: 'BMI', field: 'bmi', unit: '' },
        { label: 'Body Fat', field: 'bodyFatPercentage', unit: '%' }
      ];
    default:
      return [];
  }
});

const deviceStats = computed(() => {
  const latestHealthData = healthData.value;
  if (!latestHealthData) return [];

  switch (healthDeviceForm.value.deviceType) {
    case DeviceType.SMARTWATCH:
      return [
        {
          label: 'Heart Rate',
          value: latestHealthData.heartRate?.value,
          unit: 'bpm',
          change: latestHealthData.heartRate?.change,
          color: latestHealthData.heartRate?.value > 100 || latestHealthData.heartRate?.value < 50 ? 'red' : 'green'
        },
        {
          label: 'Blood Pressure',
          value: latestHealthData.bloodPressure?.value,
          unit: 'mmHg',
          change: latestHealthData.bloodPressure?.change,
          color: latestHealthData.bloodPressure?.value ? (
            parseInt(latestHealthData.bloodPressure.value.split('/')[0]) > 140 || 
            parseInt(latestHealthData.bloodPressure.value.split('/')[1]) > 90 ? 'red' : 'green'
          ) : 'green'
        },
        {
          label: 'Oxygen Saturation',
          value: latestHealthData.oxygen?.value,
          unit: '%',
          change: latestHealthData.oxygen?.change,
          color: latestHealthData.oxygen?.value < 90 ? 'red' : 'green'
        },
        {
          label: 'Temperature',
          value: latestHealthData.temperature?.value,
          unit: '°F',
          change: latestHealthData.temperature?.change,
          color: latestHealthData.temperature?.value > 100.4 ? 'red' : 'green'
        },
        {
          label: 'Steps',
          value: latestHealthData.steps?.value,
          unit: '',
          change: latestHealthData.steps?.change,
          color: 'green'
        }
      ];

    case DeviceType.BLOOD_PRESSURE:
      return [
        {
          label: 'Blood Pressure',
          value: latestHealthData.bloodPressure?.value,
          unit: 'mmHg',
          change: latestHealthData.bloodPressure?.change,
          color: latestHealthData.bloodPressure?.value ? (
            parseInt(latestHealthData.bloodPressure.value.split('/')[0]) > 140 || 
            parseInt(latestHealthData.bloodPressure.value.split('/')[1]) > 90 ? 'red' : 'green'
          ) : 'green'
        },
        {
          label: 'Pulse Rate',
          value: latestHealthData.pulseRate?.value,
          unit: 'bpm',
          change: latestHealthData.pulseRate?.change,
          color: latestHealthData.pulseRate?.value > 100 ? 'red' : 'green'
        }
      ];

    case DeviceType.GLUCOSE_MONITOR:
      return [
        {
          label: 'Glucose Level',
          value: latestHealthData.glucoseLevel?.value,
          unit: 'mg/dL',
          change: latestHealthData.glucoseLevel?.change,
          color: latestHealthData.glucoseLevel?.value > 180 || latestHealthData.glucoseLevel?.value < 70 ? 'red' : 'green'
        }
      ];

    case DeviceType.PULSE_OXIMETER:
      return [
        {
          label: 'Oxygen Saturation',
          value: latestHealthData.oxygenSaturation?.value,
          unit: '%',
          change: latestHealthData.oxygenSaturation?.change,
          color: latestHealthData.oxygenSaturation?.value < 90 ? 'red' : 'green'
        },
        {
          label: 'Pulse Rate',
          value: latestHealthData.pulseRate?.value,
          unit: 'bpm',
          change: latestHealthData.pulseRate?.change,
          color: latestHealthData.pulseRate?.value > 100 ? 'red' : 'green'
        }
      ];

    case DeviceType.THERMOMETER:
      return [
        {
          label: 'Temperature',
          value: latestHealthData.temperature?.value,
          unit: '°F',
          change: latestHealthData.temperature?.change,
          color: latestHealthData.temperature?.value > 100.4 ? 'red' : 'green'
        }
      ];

    case DeviceType.WEIGHT_SCALE:
      return [
        {
          label: 'Weight',
          value: latestHealthData.weight?.value,
          unit: 'lbs',
          change: latestHealthData.weight?.change,
          color: 'green'
        },
        {
          label: 'BMI',
          value: latestHealthData.bmi?.value,
          unit: '',
          change: latestHealthData.bmi?.change,
          color: latestHealthData.bmi?.value > 30 ? 'red' : 'green'
        },
        {
          label: 'Body Fat',
          value: latestHealthData.bodyFatPercentage?.value,
          unit: '%',
          change: latestHealthData.bodyFatPercentage?.change,
          color: latestHealthData.bodyFatPercentage?.value > 35 ? 'red' : 'green'
        }
      ];

    default:
      return [];
  }
});

// Methods
const bookNewAppointment = () => {
  displayAppointmentModal.value = true;
  fetchDoctors();
};

const handleAppointmentSelected = (appointment: Appointment) => {
  router.push(`/patient/appointments/${appointment.id}`);
};

const fetchDashboardData = async () => {
  try {
    // Fetch patient data
    const health = await healthDataService.getLatestHealthData();
    
    healthData.value = health;
    
    // Update stats based on current appointments
    stats.value = {
      totalAppointments: appointments.value.length,
      completedConsultations: appointments.value.filter(app => app.status === 'completed').length,
      upcomingAppointments: appointments.value.filter(app => new Date(app.date) >= new Date()).length,
      lastCheckup: appointments.value.length > 0 ? 
        appointments.value.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load patient dashboard data',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMMM D, YYYY');
};

const formatTime = (timeString: string) => {
  return dayjs(`2000-01-01T${timeString}`).format('h:mm A');
};

const fetchDoctors = async () => {
  try {
    const response = await fetch('http://localhost:3000/doctors?page=1&limit=100');
    const data = await response.json();
    doctors.value = data.data.map(doctor => ({
      id: doctor._id,
      label: `${doctor.user.firstName} ${doctor.user.lastName} - ${doctor.specialization}`,
      value: doctor._id,
      doctor
    }));
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load doctors list',
      life: 3000
    });
  }
};

const initializePatient = async () => {
  try {
    // First check if we have a patient ID in auth store
    if (authStore.user?.id) {
      patientId.value = authStore.user.id;
      return;
    }

    // If not in auth store, fetch from profile endpoint
    await fetchPatientId();
    
    if (!patientId.value) {
      throw new Error('Failed to initialize patient ID');
    }

    // Update auth store with patient ID
    if (authStore.user) {
      authStore.user.id = patientId.value;
    }
  } catch (error) {
    console.error('Error initializing patient:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to initialize patient data. Please try logging in again.',
      life: 3000
    });
    throw error;
  }
};

const fetchPatientId = async () => {
  try {
    const response = await apiClient.get('/patients/profile');
    if (response.data && response.data._id) {
      patientId.value = response.data._id;  
      appointmentForm.value.patient = patientId.value;
      console.log('Fetched patient ID:', patientId.value);
    } else {
      throw new Error('Invalid patient profile response');
    }
  } catch (error) {
    console.error('Error fetching patient ID:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to fetch patient ID',
      life: 3000
    });
  }
};

const fetchHealthDeviceData = async () => {
  try {
    if (!patientId.value) {
      throw new Error('Patient ID not found');
    }

    const response = await apiClient.get(`/health-devices/patient/${patientId.value}?page=1&limit=10`);
    healthDeviceData.value = response.data.data || [];
    
    // Log the data to debug
    console.log('Fetched health device data:', healthDeviceData.value);
  } catch (error) {
    console.error('Error fetching health device data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to fetch health device data',
      life: 3000
    });
  }
};

const submitAppointment = async () => {
  try {
    if (!patientId.value) {
      throw new Error('Patient ID not found');
    }

    // Create appointment data using the patient ID from profile
    const appointmentData = {
      patient: patientId.value,  
      doctor: selectedDoctor.value,
      date: appointmentForm.value.date,
      startTime: appointmentForm.value.startTime,
      endTime: appointmentForm.value.endTime,
      status: 'scheduled',
      type: appointmentForm.value.type,
      reasonForVisit: appointmentForm.value.reasonForVisit,
      notes: appointmentForm.value.notes,
      symptoms: appointmentForm.value.symptoms,
      isPaid: appointmentForm.value.isPaid,
      paymentAmount: appointmentForm.value.paymentAmount
    };

    console.log('Submitting appointment with patient ID:', patientId.value);
    
    const response = await apiClient.post('/appointments', appointmentData);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appointment booked successfully',
      life: 3000
    });
    displayAppointmentModal.value = false;
    await fetchDashboardData();
  } catch (error) {
    console.error('Error submitting appointment:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to book appointment',
      life: 3000
    });
  }
};

const resetForm = () => {
  appointmentForm.value = {
    patient: patientId.value,
    doctor: null,
    date: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    type: 'Video Consultation',
    reasonForVisit: '',
    notes: '',
    symptoms: [],
    isPaid: false,
    paymentAmount: 150
  };
  selectedDoctor.value = null;
};

const clearDoctor = () => {
  selectedDoctor.value = null;
  appointmentForm.value.doctor = null;
  appointmentForm.value.paymentAmount = 150; // Reset payment amount
};

const simulateDeviceData = async () => {
  try {
    // Generate random data based on device type
    const random = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const generateAbnormal = Math.random() < 0.1;

    switch (healthDeviceForm.value.deviceType) {
      case DeviceType.SMARTWATCH:
        healthDeviceForm.value.data = {
          heartRate: generateAbnormal ? random(100, 140) : random(60, 90),
          bloodPressure: generateAbnormal 
            ? `${random(140, 180)}/${random(90, 110)}` 
            : `${random(100, 130)}/${random(65, 85)}`,
          oxygenSaturation: generateAbnormal ? random(85, 89) : random(95, 100),
          temperature: generateAbnormal 
            ? (random(1001, 1030) / 10) 
            : (random(970, 986) / 10),
          steps: random(1000, 15000),
          caloriesBurned: random(500, 3000),
          sleepHours: random(4, 9),
        };
        break;
      case DeviceType.BLOOD_PRESSURE:
        healthDeviceForm.value.data = {
          bloodPressure: generateAbnormal 
            ? `${random(140, 180)}/${random(90, 110)}` 
            : `${random(100, 130)}/${random(65, 85)}`,
          pulseRate: generateAbnormal ? random(100, 120) : random(60, 90),
          measurementTime: new Date().toISOString(),
        };
        break;
      case DeviceType.GLUCOSE_MONITOR:
        healthDeviceForm.value.data = {
          glucoseLevel: generateAbnormal ? random(180, 300) : random(70, 120),
          measurementType: 'Blood',
          measurementTime: new Date().toISOString(),
          isFasting: Math.random() > 0.5,
        };
        break;
      case DeviceType.PULSE_OXIMETER:
        healthDeviceForm.value.data = {
          oxygenSaturation: generateAbnormal ? random(85, 89) : random(95, 100),
          pulseRate: generateAbnormal ? random(100, 120) : random(60, 90),
          measurementTime: new Date().toISOString(),
        };
        break;
      case DeviceType.THERMOMETER:
        healthDeviceForm.value.data = {
          temperature: generateAbnormal 
            ? (random(1001, 1030) / 10) 
            : (random(970, 986) / 10),
          measurementLocation: 'Oral',
          measurementTime: new Date().toISOString(),
        };
        break;
      case DeviceType.WEIGHT_SCALE:
        healthDeviceForm.value.data = {
          weight: random(120, 250),
          bmi: (random(180, 350) / 10),
          bodyFatPercentage: random(10, 35),
          measurementTime: new Date().toISOString(),
        };
        break;
    }

    // Update timestamp
    healthDeviceForm.value.timestamp = dayjs().toISOString();

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Data simulated successfully',
      life: 3000
    });
  } catch (error) {
    console.error('Error simulating data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to simulate data',
      life: 3000
    });
  }
};

const submitHealthDevice = async () => {
  try {
    if (!patientId.value) {
      throw new Error('Patient ID not found');
    }

    const formData = {
      ...healthDeviceForm.value,
      patient: patientId.value
    };

    console.log('Submitting health device data:', formData);
    
    const response = await apiClient.post('/health-devices', formData);
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Health device data submitted successfully',
      life: 3000
    });

    // Close dialog and reset form
    displayHealthDeviceModal.value = false;
    healthDeviceForm.value = {
      deviceId: '',
      deviceType: 'smartwatch',
      timestamp: dayjs().toISOString(),
      data: {
        heartRate: 75,
        bloodPressure: "120/80",
        oxygenSaturation: 98,
        temperature: 98.6,
        steps: 8500
      },
      isAbnormal: false,
      abnormalityReason: "",
      notificationSent: false
    };

    // Refresh health device data
    await fetchHealthDeviceData();
  } catch (error) {
    console.error('Error submitting health device data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to submit health device data',
      life: 3000
    });
  }
};

const resetHealthDeviceForm = () => {
  healthDeviceForm.value = {
    deviceId: '',
    deviceType: 'smartwatch',
    timestamp: dayjs().toISOString(),
    data: {
      heartRate: 75,
      bloodPressure: "120/80",
      oxygenSaturation: 98,
      temperature: 98.6,
      steps: 8500
    },
    isAbnormal: false,
    abnormalityReason: "",
    notificationSent: false
  };
};

const simulateHealthDevice = async () => {
  try {
    if (!patientId.value || healthDeviceData.value.length === 0) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No health device data available', life: 3000 });
      return;
    }

    const deviceData = healthDeviceData.value[0];
    
    // Make the API call with the specific endpoint and data structure
    const response = await apiClient.post('/health-devices/simulate', {
      patient: patientId.value,
      deviceType: deviceData.deviceType.toLowerCase(), // Ensure it's lowercase to match backend
      deviceId: deviceData.deviceId
    });

    toast.add({ severity: 'success', summary: 'Success', detail: 'Health device simulation started', life: 3000 });
    
    // Refresh the health device data to show updated values
    await fetchHealthDeviceData();
  } catch (err) {
    console.error('Error simulating health device:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Failed to start simulation', life: 3000 });
  }
};

const handleHealthDeviceAction = () => {
  if (healthDeviceData.value.length > 0) {
    simulateHealthDevice();
  } else {
    displayHealthDeviceModal.value = true;
  }
};

watch(appointments, (newAppointments) => {
  // Update stats when appointments change
  stats.value = {
    totalAppointments: newAppointments.length,
    completedConsultations: newAppointments.filter(app => app.status === 'completed').length,
    upcomingAppointments: newAppointments.filter(app => new Date(app.date) >= new Date()).length,
    lastCheckup: newAppointments.length > 0 ? 
      newAppointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null
  };
});

onMounted(async () => {
  try {
    // First initialize patient
    await initializePatient();
    
    // Then fetch dashboard data
    await fetchDashboardData();
    
    // Finally fetch health device data
    await fetchHealthDeviceData();
  } catch (error) {
    console.error('Error mounting dashboard:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dashboard. Please try refreshing the page.',
      life: 3000
    });
  }
});
</script>

<template>
  <div class="patient-dashboard">
    <!-- Header with Title and Profile Icon -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Patient Dashboard</h1>
      <div class="profile-icon-container">
        <Button
          icon="pi pi-user"
          class="p-button-rounded p-button-text profile-icon"
          @click="router.push('/patient/profile')"
          aria-label="View Profile"
        />
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content" v-if="!loading">
      <!-- Welcome message with upcoming appointment alert -->
      <div class="welcome-banner">
        <div class="welcome-content">
          <h2>Welcome back, {{ authStore.user?.firstName || 'Patient' }}</h2>
          <p>Here's a summary of your health data and upcoming appointments</p>
          <div class="button-group">
            <Button 
              v-if="healthDeviceData.length === 0"
              label="Add Device" 
              icon="pi pi-plus" 
              class="p-button-success"
              @click="displayHealthDeviceModal = true"
            />
            <Button 
              v-if="healthDeviceData.length > 0"
              label="Simulate"
              icon="pi pi-play"
              class="p-button-success"
              @click="simulateHealthDevice"
            />
          </div>
        </div>

        <div v-if="upcomingAppointment" class="appointment-alert">
          <i class="pi pi-calendar"></i>
          <div class="alert-content">
            <p>Your next appointment with Dr. {{ upcomingAppointment.doctor.name }} is on</p>
            <strong>{{ formatDate(upcomingAppointment.date) }} at {{ formatTime(upcomingAppointment.startTime) }}</strong>
          </div>
          <Button
            label="View Details"
            icon="pi pi-arrow-right"
            text
            @click="$router.push(`/patient/appointments?id=${upcomingAppointment.id}`)"
          />
        </div>

        <div v-else class="appointment-alert no-appointment">
          <i class="pi pi-calendar-plus"></i>
          <div class="alert-content">
            <p>You don't have any upcoming appointments</p>
            <strong>Schedule a check-up with your doctor</strong>
          </div>
          <Button
            label="Book Now"
            icon="pi pi-calendar-plus"
            @click="bookNewAppointment"
          />
        </div>
      </div>

      <!-- Health statistics -->
      <div class="health-stats" v-if="healthDeviceData.length > 0">
        <HealthDataCard
          title="Heart Rate"
          :value="healthDeviceData[0].data.heartRate"
          type="heart-rate"
          :time="formatDate(healthDeviceData[0].timestamp)"
          :loading="loading"
        />
        <HealthDataCard
          title="Blood Pressure"
          :value="healthDeviceData[0].data.bloodPressure"
          type="blood-pressure"
          :time="formatDate(healthDeviceData[0].timestamp)"
          :loading="loading"
        />
        <HealthDataCard
          title="Temperature"
          :value="healthDeviceData[0].data.temperature"
          type="temperature"
          :time="formatDate(healthDeviceData[0].timestamp)"
          :loading="loading"
        />
        <HealthDataCard
          title="Oxygen Saturation"
          :value="healthDeviceData[0].data.oxygenSaturation"
          type="oxygen"
          :time="formatDate(healthDeviceData[0].timestamp)"
          :loading="loading"
        />
        <HealthDataCard
          title="Steps"
          :value="healthDeviceData[0].data.steps"
          type="steps"
          :time="formatDate(healthDeviceData[0].timestamp)"
          :loading="loading"
        />
      </div>

      <!-- Device-specific stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div
          v-for="stat in deviceStats"
          :key="stat.label"
          class="stat-card"
        >
          <Card class="p-4">
            <div class="flex flex-col items-center">
              <div class="text-4xl font-bold" :class="stat.color">
                {{ stat.value }}
                <span class="text-lg ml-2">{{ stat.unit }}</span>
              </div>
              <div class="text-lg mt-2">{{ stat.label }}</div>
              <div 
                v-if="stat.change !== undefined"
                class="text-sm mt-2"
                :class="stat.change > 0 ? 'text-green-500' : 'text-red-500'"
              >
                {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Main dashboard content -->
      <div class="dashboard-grid">
        <!-- Left column: Charts -->
        <div class="dashboard-left">
          <Card class="health-chart-card">
            <template #header>
              <div class="card-header">
                <h2>Heart Rate Monitoring</h2>
                <Button
                  icon="pi pi-ellipsis-h"
                  rounded
                  text
                  aria-label="More options"
                  @click="$router.push('/patient/health?type=heart-rate')"
                />
              </div>
            </template>

            <template #content>
              <div v-if="healthData?.heartRate?.history?.length" class="chart-container">
                <VitalSignsChart
                  title="Heart Rate"
                  type="heart-rate"
                  :data="healthData.heartRate.history"
                  :height="300"
                />
              </div>

              <div v-else class="no-data">
                <i class="pi pi-chart-line"></i>
                <p>No heart rate data available</p>
                <Button
                  label="Connect Device"
                  icon="pi pi-link"
                  outlined
                  @click="$router.push('/patient/health')"
                />
              </div>
            </template>
          </Card>

          <Card class="health-tips-card">
            <template #header>
              <div class="card-header">
                <h2>Health Tips & Reminders</h2>
              </div>
            </template>

            <template #content>
              <div class="tips-list">
                <div class="tip-item">
                  <div class="tip-icon">
                    <i class="pi pi-heart"></i>
                  </div>
                  <div class="tip-content">
                    <h3>Stay Hydrated</h3>
                    <p>Remember to drink at least 8 glasses of water today</p>
                  </div>
                </div>

                <div class="tip-item">
                  <div class="tip-icon">
                    <i class="pi pi-heart-fill"></i>
                  </div>
                  <div class="tip-content">
                    <h3>Take Your Medication</h3>
                    <p>Don't forget to take your evening medication at 8:00 PM</p>
                  </div>
                </div>

                <div class="tip-item">
                  <div class="tip-icon">
                    <i class="pi pi-walking"></i>
                  </div>
                  <div class="tip-content">
                    <h3>Daily Exercise</h3>
                    <p>Try to get 30 minutes of moderate exercise today</p>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Right column: Calendar & Activity -->
        <div class="dashboard-right">
          <Card class="calendar-card">
            <template #header>
              <div class="card-header">
                <h2>Appointments Calendar</h2>
                <Button
                  icon="pi pi-plus"
                  rounded
                  text
                  aria-label="Book appointment"
                  tooltip="Book new appointment"
                  :tooltipOptions="{ position: 'bottom' as const }"
                  @click="$router.push('/patient/appointments')"
                />
              </div>
            </template>

            <template #content>
              <AppointmentCalendar
                :patient-id="patientId"
                :appointments="appointments"
                @appointment-selected="handleAppointmentSelected"
              />
            </template>
          </Card>

          <Card class="activity-card">
            <template #header>
              <div class="card-header">
                <h2>Recent Activity</h2>
              </div>
            </template>

            <template #content>
              <div class="activity-timeline">
                <div class="timeline-item">
                  <div class="timeline-icon">
                    <i class="pi pi-calendar-check"></i>
                  </div>
                  <div class="timeline-content">
                    <h3>Appointment Completed</h3>
                    <p>Checkup with Dr. Smith</p>
                    <span class="timeline-date">Yesterday at 10:30 AM</span>
                  </div>
                </div>

                <div class="timeline-item">
                  <div class="timeline-icon">
                    <i class="pi pi-file-pdf"></i>
                  </div>
                  <div class="timeline-content">
                    <h3>Test Results Available</h3>
                    <p>Blood work results uploaded by lab</p>
                    <span class="timeline-date">3 days ago</span>
                  </div>
                </div>

                <div class="timeline-item">
                  <div class="timeline-icon">
                    <i class="pi pi-heart"></i>
                  </div>
                  <div class="timeline-content">
                    <h3>Health Update</h3>
                    <p>Your blood pressure readings have improved</p>
                    <span class="timeline-date">1 week ago</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <div class="loading-container" v-else>
      <ProgressSpinner />
      <p>Loading your health data...</p>
    </div>

    <Dialog 
      v-model:visible="displayAppointmentModal" 
      header="Book Appointment" 
      :modal="true" 
      :style="{ width: '60vw' }"
      :closable="true"
    >
      <form class="appointment-form">
        <div class="form-header">
          <h3>Appointment Details</h3>
          <div v-if="selectedDoctorFee" class="consultation-fee">
            <span class="fee-label">Consultation Fee:</span>
            <span class="fee-amount">₹{{ selectedDoctorFee }}</span>
          </div>
        </div>

        <div class="form-grid">
          <!-- Doctor Selection -->
          <div class="form-group">
            <label for="doctor" class="form-label">Select Doctor</label>
            <Dropdown
              v-model="selectedDoctor"
              :options="doctors"
              optionLabel="label"
              optionValue="value"
              placeholder="Select a doctor"
              class="w-full"
              @change="appointmentForm.paymentAmount = selectedDoctorFee"
            />
            
            <!-- Doctor Info Display -->
            <div v-if="selectedDoctor" class="doctor-info mt-2">
              <div class="doctor-details">
                <div class="doctor-name">{{ doctors.find(d => d.value === selectedDoctor)?.doctor.user.firstName }} {{ doctors.find(d => d.value === selectedDoctor)?.doctor.user.lastName }}</div>
                <div class="doctor-specialty">{{ doctors.find(d => d.value === selectedDoctor)?.doctor.specialization }}</div>
                <div class="doctor-fee">Fee: ₹{{ selectedDoctorFee }}</div>
              </div>
            </div>
            <Button
              v-if="selectedDoctor"
              label="Clear Doctor"
              icon="pi pi-times"
              class="p-button-text p-button-danger mt-2"
              @click="clearDoctor"
            />
          </div>

          <!-- Date and Time -->
          <div class="form-group">
            <label for="date" class="form-label">Date</label>
            <Calendar
              v-model="appointmentForm.date"
              dateFormat="dd/mm/yy"
              :minDate="new Date()"
              class="w-full"
            />
          </div>

          <!-- Start Time Selection -->
          <div class="form-group">
            <label for="startTime" class="form-label">Start Time</label>
            <InputText
              v-model="appointmentForm.startTime"
              type="time"
              class="w-full"
              placeholder="HH:MM"
            />
          </div>

          <!-- End Time Selection -->
          <div class="form-group">
            <label for="endTime" class="form-label">End Time</label>
            <InputText
              v-model="appointmentForm.endTime"
              type="time"
              class="w-full"
              placeholder="HH:MM"
            />
          </div>

          <!-- Appointment Type -->
          <div class="form-group">
            <label for="type" class="form-label">Appointment Type</label>
            <Dropdown
              v-model="appointmentForm.type"
              :options="['Video Consultation', 'In-Person']"
              placeholder="Select appointment type"
              class="w-full"
            />
          </div>

          <!-- Reason for Visit -->
          <div class="form-group">
            <label for="reason" class="form-label">Reason for Visit</label>
            <Textarea
              v-model="appointmentForm.reasonForVisit"
              :rows="3"
              class="w-full"
              placeholder="Briefly describe your reason for visit"
            />
          </div>

          <!-- Additional Information -->
          <div class="form-group">
            <label for="notes" class="form-label">Additional Notes</label>
            <Textarea
              v-model="appointmentForm.notes"
              :rows="3"
              class="w-full"
              placeholder="Any additional information for the doctor"
            />
          </div>

          <!-- Symptoms -->
          <div class="form-group">
            <label class="form-label">Symptoms</label>
            <MultiSelect
              v-model="appointmentForm.symptoms"
              :options="['Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Other']"
              placeholder="Select symptoms"
              class="w-full"
            />
          </div>

          <!-- Payment Section -->
          <div class="form-group">
            <div class="payment-section">
              <div class="payment-checkbox">
                <Checkbox v-model="appointmentForm.isPaid" :binary="true" />
                <label class="ml-2">Pre-Payment</label>
              </div>
              <div class="payment-amount" v-if="appointmentForm.isPaid">
                Amount: ₹{{ appointmentForm.paymentAmount }}
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <Button
            label="Reset Form"
            icon="pi pi-refresh"
            class="p-button-text p-button-warning"
            @click="resetForm"
          />
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="displayAppointmentModal = false"
          />
          <Button
            label="Book Appointment"
            icon="pi pi-check"
            class="p-button-success"
            @click="submitAppointment"
          />
        </div>
      </form>
    </Dialog>

    <Dialog 
      v-model:visible="displayHealthDeviceModal" 
      header="Add Health Device Data" 
      :modal="true" 
      :style="{ width: '50vw' }"
    >
      <form class="health-device-form">
        <div class="field">
          <label for="deviceId">Device ID</label>
          <InputText 
            id="deviceId" 
            v-model="healthDeviceForm.deviceId" 
            placeholder="Enter device ID"
          />
        </div>

        <div class="field">
          <label for="deviceType">Device Type</label>
          <Dropdown 
            id="deviceType" 
            v-model="healthDeviceForm.deviceType" 
            :options="deviceTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select device type"
          />
        </div>

        <div class="field">
          <label for="timestamp">Timestamp</label>
          <Calendar 
            id="timestamp" 
            v-model="healthDeviceForm.timestamp" 
            :showTime="true"
            :showSeconds="true"
            placeholder="Select date and time"
          />
        </div>

        <div class="field">
          <label>Health Data</label>
          <div class="health-data-grid">
            <div 
              v-for="field in deviceFields" 
              :key="field.field" 
              class="data-field"
            >
              <label>{{ field.label }}</label>
              <div v-if="field.type === 'boolean'">
                <Checkbox 
                  v-model="healthDeviceForm.data[field.field]"
                  :binary="true"
                />
              </div>
              <div v-else>
                <InputText 
                  v-model="healthDeviceForm.data[field.field]"
                  :placeholder="`Enter ${field.label.toLowerCase()}`"
                  class="w-full"
                />
                <small v-if="field.unit" class="block text-gray-500 mt-1">{{ field.unit }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Abnormality</label>
          <div class="abnormality-group">
            <Checkbox 
              v-model="healthDeviceForm.isAbnormal"
              :binary="true"
            />
            <InputText 
              v-model="healthDeviceForm.abnormalityReason"
              placeholder="Enter abnormality reason"
              :disabled="!healthDeviceForm.isAbnormal"
            />
          </div>
        </div>

        <div class="form-actions">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            class="p-button-text"
            @click="displayHealthDeviceModal = false"
          />
          <Button 
            label="Simulate Data"
            icon="pi pi-refresh"
            class="p-button-outlined p-button-primary"
            @click="simulateDeviceData"
          />
          <Button 
            label="Submit" 
            icon="pi pi-check" 
            class="p-button-success"
            @click.prevent="submitHealthDevice"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
.patient-dashboard {
  padding: 2rem;
  background: var(--surface-ground);
}

/* Modal Styling */
.appointment-modal {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  background: var(--surface-ground);
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

:deep(.p-dialog-header) {
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
  padding: 2rem !important;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 1rem;
}

:deep(.p-dialog-content) {
  padding: 2.5rem !important;
  background: var(--surface-ground);
  border-radius: 0 0 16px 16px;
}

:deep(.p-dialog-header .p-dialog-header-close) {
  color: var(--text-color-secondary);
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

:deep(.p-dialog-header .p-dialog-header-close:hover) {
  color: var(--primary-color);
  background: rgba(155, 135, 245, 0.1);
}

/* Form Styling */
.appointment-form {
  padding: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: var(--text-color);
}

.consultation-fee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.doctor-info {
  background: var(--surface-card);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--surface-border);
}

.doctor-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.doctor-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.doctor-specialty {
  color: var(--text-color-secondary);
}

.doctor-fee {
  color: var(--primary-color);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.payment-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-amount {
  color: var(--primary-color);
  font-weight: 500;
}

.p-button-text {
  flex: 1;
  min-width: 120px;
}

.p-button-warning {
  background: var(--warning-color);
  color: white;
}

.p-button-warning:hover {
  background: var(--warning-color-dark);
}

.p-button-danger {
  background: var(--danger-color);
  color: white;
}

.p-button-danger:hover {
  background: var(--danger-color-dark);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Existing Dashboard Styles (Unchanged) */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
}

.profile-icon-container {
  display: flex;
  align-items: center;
}

.profile-icon {
  color: var(--primary-color);
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.profile-icon:hover {
  background: rgba(155, 135, 245, 0.1);
  transform: scale(1.1);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.welcome-banner {
  background: var(--surface-ground);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.welcome-content {
  margin-bottom: 1.5rem;
}

.appointment-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.appointment-alert i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.alert-content {
  flex: 1;
}

.no-appointment {
  background: var(--surface-card);
  color: var(--text-color-secondary);
}

.no-appointment i {
  color: var(--text-color-secondary);
}

.health-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.dashboard-left,
.dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.health-chart-card,
.health-tips-card,
.calendar-card,
.activity-card {
  height: 100%;
}

.chart-container {
  height: 300px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-data i {
  font-size: 3rem;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--surface-card);
}

.tip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
}

.tip-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--surface-card);
}

.timeline-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
}

.timeline-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

:deep(.p-button) {
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.p-button:hover) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 135, 245, 0.2);
}

:deep(.p-button.p-button-text) {
  color: var(--primary-color);
  background: transparent;
  border: none;
  padding: 0.5rem;
}

:deep(.p-button.p-button-text:hover) {
  background: rgba(155, 135, 245, 0.1);
}

.health-device-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.health-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.data-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.abnormality-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  background: var(--surface-card);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.stat-card .text-4xl {
  font-size: 2.25rem;
}

.stat-card .text-lg {
  font-size: 1.125rem;
}

.stat-card .text-sm {
  font-size: 0.875rem;
}
</style>