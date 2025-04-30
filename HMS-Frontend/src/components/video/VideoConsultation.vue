<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

interface Props {
  consultationId: string
  doctorName?: string
  patientName?: string
  role: 'doctor' | 'patient'
}

const props = defineProps<Props>()
const emit = defineEmits(['end-call'])

// State
const localStream = ref<MediaStream | null>(null)
const remoteStream = ref<MediaStream | null>(null)
const isConnecting = ref(false)
const isConnected = ref(false)
const isCameraOn = ref(true)
const isMicOn = ref(true)
const isScreenSharing = ref(false)
const errorMessage = ref('')
const connectionTimer = ref(0)
const waitingDialogVisible = ref(false)

// UI elements refs
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)

// Toast for notifications
const toast = useToast()

// Mock RTCPeerConnection for demo purposes
// In a real app, you would use WebRTC properly
let peerConnection: any = null

// Setup media streams
const setupLocalStream = async () => {
  try {
    isConnecting.value = true
    
    // Get user media (camera and microphone)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    
    localStream.value = stream
    
    // Set local video element
    if (localVideo.value) {
      localVideo.value.srcObject = stream
    }
    
    isConnecting.value = false
    
    // For demo: show waiting dialog for the doctor
    if (props.role === 'doctor') {
      waitingDialogVisible.value = true
      // Simulate patient joining after 3 seconds
      setTimeout(() => {
        waitingDialogVisible.value = false
        connectWithPeer()
      }, 3000)
    } else {
      // For patient, connect immediately
      connectWithPeer()
    }
  } catch (error: any) {
    console.error('Error accessing media devices:', error)
    errorMessage.value = error.message || 'Could not access camera or microphone'
    isConnecting.value = false
    
    toast.add({
      severity: 'error',
      summary: 'Media Error',
      detail: errorMessage.value,
      life: 5000
    })
  }
}

// Mock connection to peer
const connectWithPeer = () => {
  // In a real app, you would establish WebRTC connection here
  // For demo, we'll simulate the remote stream
  
  isConnecting.value = true
  
  // Simulate connection delay
  setTimeout(() => {
    try {
      // Clone the local stream to simulate remote stream for demo
      if (localStream.value) {
        // In real app, this would be the stream from the other peer
        remoteStream.value = localStream.value.clone()
        
        // Set remote video
        if (remoteVideo.value) {
          remoteVideo.value.srcObject = remoteStream.value
        }
        
        isConnected.value = true
        startTimer()
        
        toast.add({
          severity: 'success',
          summary: 'Connected',
          detail: `You are now in a call with ${props.role === 'doctor' ? props.patientName : props.doctorName}`,
          life: 3000
        })
      }
    } catch (error) {
      console.error('Error connecting to peer:', error)
      errorMessage.value = 'Failed to connect to the other participant'
      
      toast.add({
        severity: 'error',
        summary: 'Connection Error',
        detail: errorMessage.value,
        life: 5000
      })
    } finally {
      isConnecting.value = false
    }
  }, 1500)
}

// Timer for call duration
let timerInterval: number | null = null

const startTimer = () => {
  connectionTimer.value = 0
  timerInterval = window.setInterval(() => {
    connectionTimer.value += 1
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Format timer display
const formattedTimer = computed(() => {
  const minutes = Math.floor(connectionTimer.value / 60)
  const seconds = connectionTimer.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Toggle camera
const toggleCamera = () => {
  if (localStream.value) {
    localStream.value.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    isCameraOn.value = !isCameraOn.value
    
    toast.add({
      severity: 'info',
      summary: isCameraOn.value ? 'Camera On' : 'Camera Off',
      detail: isCameraOn.value ? 'Your camera is now on' : 'Your camera is now off',
      life: 2000
    })
  }
}

// Toggle microphone
const toggleMicrophone = () => {
  if (localStream.value) {
    localStream.value.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    isMicOn.value = !isMicOn.value
    
    toast.add({
      severity: 'info',
      summary: isMicOn.value ? 'Microphone On' : 'Microphone Off',
      detail: isMicOn.value ? 'Your microphone is now on' : 'Your microphone is now off',
      life: 2000
    })
  }
}

// Toggle screen sharing
const toggleScreenSharing = async () => {
  try {
    if (isScreenSharing.value) {
      // Stop screen sharing
      if (localStream.value) {
        // Get back to camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        localStream.value = stream
        
        if (localVideo.value) {
          localVideo.value.srcObject = stream
        }
      }
    } else {
      // Start screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      })
      
      // Save current camera stream
      const previousStream = localStream.value
      
      // Set screen sharing stream
      localStream.value = screenStream
      
      if (localVideo.value) {
        localVideo.value.srcObject = screenStream
      }
      
      // Listen for when user stops screen sharing
      screenStream.getVideoTracks()[0].addEventListener('ended', async () => {
        // Revert to camera when screen sharing is stopped
        isScreenSharing.value = false
        
        // Get back to camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        localStream.value = stream
        
        if (localVideo.value) {
          localVideo.value.srcObject = stream
        }
        
        toast.add({
          severity: 'info',
          summary: 'Screen Sharing Ended',
          detail: 'You are back to your camera',
          life: 2000
        })
      })
    }
    
    isScreenSharing.value = !isScreenSharing.value
    
    toast.add({
      severity: 'info',
      summary: isScreenSharing.value ? 'Screen Sharing Started' : 'Screen Sharing Ended',
      detail: isScreenSharing.value ? 'You are now sharing your screen' : 'You are back to your camera',
      life: 2000
    })
  } catch (error) {
    console.error('Error toggling screen share:', error)
    
    toast.add({
      severity: 'error',
      summary: 'Screen Sharing Error',
      detail: 'Failed to start screen sharing',
      life: 3000
    })
  }
}

// End call
const endCall = () => {
  // Clean up streams
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
    localStream.value = null
  }
  
  if (remoteStream.value) {
    remoteStream.value.getTracks().forEach(track => track.stop())
    remoteStream.value = null
  }
  
  // Stop timer
  stopTimer()
  
  // Reset state
  isConnected.value = false
  isConnecting.value = false
  
  // Emit event to parent
  emit('end-call')
  
  toast.add({
    severity: 'info',
    summary: 'Call Ended',
    detail: 'The video consultation has ended',
    life: 3000
  })
}

// Lifecycle hooks
onMounted(() => {
  setupLocalStream()
})

onUnmounted(() => {
  // Clean up
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
  }
  
  stopTimer()
  
  if (peerConnection) {
    peerConnection.close()
  }
})
</script>

<template>
  <div class="video-consultation">
    <!-- Error message -->
    <div v-if="errorMessage" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="setupLocalStream" />
    </div>
    
    <!-- Loading state -->
    <div v-else-if="isConnecting" class="connecting-state">
      <ProgressSpinner />
      <p>Establishing connection...</p>
    </div>
    
    <!-- Connected state -->
    <div v-else-if="isConnected" class="connected-state">
      <!-- Video elements -->
      <div class="remote-video-container">
        <video ref="remoteVideo" autoplay playsinline class="remote-video"></video>
        
        <!-- Call timer -->
        <div class="call-timer">
          <i class="pi pi-clock"></i>
          <span>{{ formattedTimer }}</span>
        </div>
        
        <!-- Participant info -->
        <div class="participant-info">
          <span>{{ props.role === 'doctor' ? props.patientName : props.doctorName }}</span>
        </div>
      </div>
      
      <div class="local-video-container">
        <video ref="localVideo" autoplay playsinline muted class="local-video"></video>
        
        <!-- Sharing indicator -->
        <div v-if="isScreenSharing" class="sharing-indicator">
          <i class="pi pi-desktop"></i>
          <span>Sharing screen</span>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="video-controls">
        <Button 
          class="control-button" 
          :class="{ 'off': !isMicOn }"
          @click="toggleMicrophone"
          :icon="isMicOn ? 'pi pi-microphone' : 'pi pi-microphone-slash'"
          rounded
          aria-label="Toggle microphone"
        />
        
        <Button 
          class="control-button" 
          :class="{ 'off': !isCameraOn }"
          @click="toggleCamera"
          :icon="isCameraOn ? 'pi pi-video' : 'pi pi-video-off'"
          rounded
          aria-label="Toggle camera"
        />
        
        <Button 
          class="control-button end-call" 
          @click="endCall"
          icon="pi pi-phone"
          rounded
          aria-label="End call"
        />
        
        <Button 
          class="control-button" 
          :class="{ 'active': isScreenSharing }"
          @click="toggleScreenSharing"
          icon="pi pi-desktop"
          rounded
          aria-label="Share screen"
        />
      </div>
    </div>
    
    <!-- Waiting for doctor/patient dialog -->
    <Dialog
      v-model:visible="waitingDialogVisible"
      modal
      :closable="false"
      :style="{ width: '450px' }"
      :pt="{
        content: { class: 'waiting-dialog-content' }
      }"
    >
      <template #header>
        <div class="waiting-header">
          <i class="pi pi-spin pi-spinner"></i>
          <h3>Waiting for {{ props.role === 'doctor' ? 'patient' : 'doctor' }} to join...</h3>
        </div>
      </template>
      
      <p>
        {{ props.role === 'doctor' ? 'Your patient' : 'Doctor' }} 
        {{ props.role === 'doctor' ? props.patientName : props.doctorName }} 
        has been notified and should join soon.
      </p>
      
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="endCall" />
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.video-consultation {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--neutral-900);
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: 100%;
  
  .error-message {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-4);
    color: white;
    
    i {
      font-size: 40px;
      color: var(--error);
    }
    
    p {
      font-size: var(--font-lg);
      text-align: center;
      max-width: 400px;
    }
  }
  
  .connecting-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-4);
    color: white;
    
    p {
      font-size: var(--font-lg);
    }
  }
  
  .connected-state {
    position: relative;
    height: 100%;
    width: 100%;
    
    .remote-video-container {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #222;
      
      .remote-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .call-timer {
        position: absolute;
        top: var(--space-2);
        left: var(--space-2);
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-sm);
        
        i {
          font-size: 14px;
        }
      }
      
      .participant-info {
        position: absolute;
        top: var(--space-2);
        right: var(--space-2);
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-md);
        font-size: var(--font-sm);
      }
    }
    
    .local-video-container {
      position: absolute;
      bottom: 80px;
      right: var(--space-3);
      width: 200px;
      height: 120px;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 2px solid rgba(255, 255, 255, 0.3);
      z-index: 5;
      
      .local-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1); // Mirror local video
      }
      
      .sharing-indicator {
        position: absolute;
        bottom: var(--space-1);
        left: var(--space-1);
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 2px var(--space-1);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--font-xs);
        
        i {
          font-size: 10px;
        }
      }
    }
    
    .video-controls {
      position: absolute;
      bottom: var(--space-3);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      z-index: 10;
      
      .control-button {
        width: 50px;
        height: 50px;
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        transition: all var(--transition-fast);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        &.off {
          background-color: var(--neutral-600);
        }
        
        &.active {
          background-color: var(--primary);
        }
        
        &.end-call {
          background-color: var(--error);
          
          .pi-phone {
            transform: rotate(135deg);
          }
          
          &:hover {
            background-color: #c82333;
          }
        }
        
        i {
          font-size: 18px;
        }
      }
    }
  }
}

// Dialog styles
.waiting-dialog-content {
  padding: var(--space-3);
}

.waiting-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  
  i {
    font-size: 24px;
    color: var(--primary);
  }
  
  h3 {
    margin: 0;
    font-size: var(--font-lg);
  }
}

// Responsive styles
@media (max-width: 768px) {
  .video-consultation {
    .connected-state {
      .local-video-container {
        width: 120px;
        height: 90px;
        bottom: 90px;
      }
      
      .video-controls {
        .control-button {
          width: 40px;
          height: 40px;
          
          i {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>