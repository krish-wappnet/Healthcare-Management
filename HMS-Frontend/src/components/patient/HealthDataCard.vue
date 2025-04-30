<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'

interface Props {
  title: string
  value: number | string
  type: 'heart-rate' | 'blood-pressure' | 'temperature' | 'oxygen'
  change?: number
  unit?: string
  time?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  change: 0,
  time: 'a few moments ago',
  loading: false
})

const router = useRouter()

// Icon and color for each type
const typeConfig = computed(() => {
  switch (props.type) {
    case 'heart-rate':
      return {
        icon: 'pi pi-heart-fill',
        color: 'var(--primary)',
        bgColor: 'var(--primary-light)',
        progressColor: getProgressColor(props.value as number, 'heart-rate')
      }
    case 'blood-pressure':
      return {
        icon: 'pi pi-heart',
        color: 'var(--accent)',
        bgColor: 'var(--accent-light)',
        progressColor: getProgressColor(props.value as number, 'blood-pressure')
      }
    case 'temperature':
      return {
        icon: 'pi pi-sun',
        color: 'var(--error)',
        bgColor: 'rgba(220, 53, 69, 0.2)',
        progressColor: getProgressColor(props.value as number, 'temperature')
      }
    case 'oxygen':
      return {
        icon: 'pi pi-percentage',
        color: 'var(--secondary)',
        bgColor: 'var(--secondary-light)',
        progressColor: getProgressColor(props.value as number, 'oxygen')
      }
    default:
      return {
        icon: 'pi pi-chart-line',
        color: 'var(--primary)',
        bgColor: 'var(--primary-light)',
        progressColor: 'var(--neutral-500)'
      }
  }
})

// Get progress color based on value and type
function getProgressColor(value: number, type: string): string {
  if (typeof value !== 'number') return 'var(--neutral-500)'
  
  switch (type) {
    case 'heart-rate':
      if (value < 60) return 'var(--warning)'
      if (value > 100) return 'var(--error)'
      return 'var(--success)'
    
    case 'blood-pressure':
      if (value < 90) return 'var(--warning)'
      if (value > 140) return 'var(--error)'
      return 'var(--success)'
    
    case 'temperature':
      if (value < 36) return 'var(--warning)'
      if (value > 38) return 'var(--error)'
      return 'var(--success)'
    
    case 'oxygen':
      if (value < 90) return 'var(--error)'
      if (value < 95) return 'var(--warning)'
      return 'var(--success)'
    
    default:
      return 'var(--neutral-500)'
  }
}

// View details action
const viewDetails = () => {
  router.push({
    path: '/patient/health',
    query: { type: props.type }
  })
}

// Get formatted value with unit
const formattedValue = computed(() => {
  if (props.loading) return '-'
  
  const unit = props.unit || getDefaultUnit(props.type)
  return `${props.value}${unit}`
})

// Get default unit based on type
function getDefaultUnit(type: string): string {
  switch (type) {
    case 'heart-rate': return ' bpm'
    case 'blood-pressure': return ' mmHg'
    case 'temperature': return '°C'
    case 'oxygen': return '%'
    default: return ''
  }
}

// Get progress percentage for visual representation
const progressPercent = computed(() => {
  if (typeof props.value !== 'number') return 50
  
  switch (props.type) {
    case 'heart-rate':
      // Scale 40-180 bpm to 0-100%
      return Math.min(100, Math.max(0, ((props.value - 40) / 140) * 100))
    
    case 'blood-pressure':
      // Scale 60-200 mmHg to 0-100%
      return Math.min(100, Math.max(0, ((props.value - 60) / 140) * 100))
    
    case 'temperature':
      // Scale 35-42°C to 0-100%
      return Math.min(100, Math.max(0, ((props.value - 35) / 7) * 100))
    
    case 'oxygen':
      // Scale 80-100% to 0-100%
      return Math.min(100, Math.max(0, ((props.value - 80) / 20) * 100))
    
    default:
      return 50
  }
})

// Pulse animation for live data
const isLive = ref(false)

setTimeout(() => {
  isLive.value = props.type === 'heart-rate' || props.type === 'oxygen'
}, 1000)
</script>

<template>
  <Card class="health-data-card">
    <template #header>
      <div class="card-header">
        <div class="icon-container" :style="{ backgroundColor: typeConfig.bgColor }">
          <i :class="typeConfig.icon" :style="{ color: typeConfig.color }"></i>
        </div>
        <h3 class="card-title">{{ title }}</h3>
      </div>
    </template>
    
    <template #content>
      <div class="card-content">
        <div class="value-section">
          <div class="value" :class="{ 'pulse': isLive && !loading }">
            <span v-if="loading">
              <i class="pi pi-spin pi-spinner"></i>
            </span>
            <span v-else>{{ formattedValue }}</span>
          </div>
          
          <div v-if="change !== 0 && !loading" class="change" :class="{ 
            'positive': change > 0, 
            'negative': change < 0 
          }">
            <i :class="change > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
            <span>{{ Math.abs(change) }}{{ props.unit || getDefaultUnit(props.type) }}</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress" 
            :style="{ 
              width: `${progressPercent}%`,
              backgroundColor: typeConfig.progressColor 
            }"
          ></div>
        </div>
        
        <div class="time-section">
          <i class="pi pi-clock"></i>
          <span>{{ time }}</span>
        </div>
      </div>
    </template>
    
    <template #footer>
      <Button 
        label="View Details" 
        icon="pi pi-chart-line" 
        text
        @click="viewDetails"
      />
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.health-data-card {
  height: 100%;
  border-radius: var(--radius-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }
  
  :deep(.p-card-header) {
    padding: var(--space-3);
    padding-bottom: 0;
  }
  
  :deep(.p-card-content) {
    padding: var(--space-3);
  }
  
  :deep(.p-card-footer) {
    padding: var(--space-2) var(--space-3);
    text-align: right;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    
    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      
      i {
        font-size: 16px;
      }
    }
    
    .card-title {
      font-size: var(--font-md);
      font-weight: 600;
      margin: 0;
      color: var(--neutral-700);
    }
  }
  
  .card-content {
    .value-section {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: var(--space-2);
      
      .value {
        font-size: var(--font-3xl);
        font-weight: 700;
        color: var(--neutral-900);
        
        &.pulse {
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: -20px;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--success);
            animation: pulse 2s infinite;
          }
        }
        
        i {
          font-size: var(--font-xl);
          color: var(--neutral-500);
        }
      }
      
      .change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--font-sm);
        font-weight: 500;
        
        &.positive {
          color: var(--success);
        }
        
        &.negative {
          color: var(--error);
        }
        
        i {
          font-size: 14px;
        }
      }
    }
    
    .progress-bar {
      height: 6px;
      background-color: var(--neutral-200);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-2);
      overflow: hidden;
      
      .progress {
        height: 100%;
        border-radius: var(--radius-sm);
        transition: width 0.5s ease-in-out;
      }
    }
    
    .time-section {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-xs);
      color: var(--neutral-600);
      
      i {
        font-size: 12px;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}
</style>