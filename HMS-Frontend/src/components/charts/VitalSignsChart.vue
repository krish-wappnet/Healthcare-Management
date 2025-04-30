<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ApexCharts from 'vue3-apexcharts'
import dayjs from 'dayjs'

interface VitalSignData {
  timestamp: string
  value: number
}

interface Props {
  data: VitalSignData[]
  title: string
  type: 'heart-rate' | 'blood-pressure' | 'temperature' | 'oxygen'
  height?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  loading: false
})

// Chart options and series
const chartOptions = ref({
  chart: {
    type: 'line',
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    },
    background: 'transparent',
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  grid: {
    borderColor: '#f1f1f1',
    padding: {
      top: 10,
      right: 0,
      bottom: 0,
      left: 5
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      format: 'HH:mm'
    },
    tooltip: {
      enabled: false
    }
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    decimalsInFloat: 0,
    labels: {
      formatter: (value: number) => {
        return Math.round(value).toString()
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    x: {
      format: 'HH:mm'
    },
    y: {
      formatter: (value: number) => {
        return getTooltipFormat(value)
      }
    }
  },
  colors: ['#0D6EFD'],
  noData: {
    text: 'No data available',
    align: 'center',
    verticalAlign: 'middle',
    offsetX: 0,
    offsetY: 0,
    style: {
      color: '#6c757d',
      fontSize: '14px',
      fontFamily: 'inherit'
    }
  }
})

const series = ref([{
  name: props.title,
  data: []
}])

// Format tooltip value based on vital sign type
const getTooltipFormat = (value: number) => {
  switch (props.type) {
    case 'heart-rate':
      return `${value} bpm`
    case 'blood-pressure':
      return `${value} mmHg`
    case 'temperature':
      return `${value}°C`
    case 'oxygen':
      return `${value}%`
    default:
      return `${value}`
  }
}

// Set color and y-axis range based on vital sign type
const setChartSettings = () => {
  switch (props.type) {
    case 'heart-rate':
      chartOptions.value.colors = ['#0D6EFD'] // Primary blue
      chartOptions.value.yaxis = {
        ...chartOptions.value.yaxis,
        min: 40,
        max: 180,
        title: {
          text: 'BPM'
        }
      }
      break
    case 'blood-pressure':
      chartOptions.value.colors = ['#D63384'] // Accent pink
      chartOptions.value.yaxis = {
        ...chartOptions.value.yaxis,
        min: 60,
        max: 200,
        title: {
          text: 'mmHg'
        }
      }
      break
    case 'temperature':
      chartOptions.value.colors = ['#DC3545'] // Error red
      chartOptions.value.yaxis = {
        ...chartOptions.value.yaxis,
        min: 35,
        max: 42,
        decimalsInFloat: 1,
        title: {
          text: '°C'
        }
      }
      break
    case 'oxygen':
      chartOptions.value.colors = ['#20C997'] // Secondary teal
      chartOptions.value.yaxis = {
        ...chartOptions.value.yaxis,
        min: 80,
        max: 100,
        title: {
          text: 'SpO2 %'
        }
      }
      break
  }
}

// Format data for chart
const formatChartData = () => {
  if (!props.data || props.data.length === 0) {
    series.value = [{ name: props.title, data: [] }]
    return
  }
  
  const formattedData = props.data.map(item => ({
    x: new Date(item.timestamp).getTime(),
    y: item.value
  }))
  
  series.value = [
    {
      name: props.title,
      data: formattedData
    }
  ]
}

// Watchers and lifecycle hooks
onMounted(() => {
  setChartSettings()
  formatChartData()
})

watch(() => props.data, () => {
  formatChartData()
}, { deep: true })

watch(() => props.type, () => {
  setChartSettings()
})
</script>

<template>
  <div class="vital-signs-chart" :class="{ loading: loading }">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="chart-body">
      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
      
      <!-- No data message -->
      <div v-else-if="!data || data.length === 0" class="no-data">
        <i class="pi pi-chart-line"></i>
        <p>No data available</p>
      </div>
      
      <!-- Chart -->
      <ApexCharts
        v-else
        :options="chartOptions"
        :series="series"
        :height="height"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vital-signs-chart {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-3);
  position: relative;
  overflow: hidden;
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
    
    .chart-title {
      font-size: var(--font-lg);
      font-weight: 600;
      margin: 0;
      color: var(--neutral-800);
    }
    
    .chart-actions {
      display: flex;
      gap: var(--space-1);
    }
  }
  
  .chart-body {
    position: relative;
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(13, 110, 253, 0.2);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
    
    .no-data {
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--neutral-500);
      
      i {
        font-size: 32px;
        margin-bottom: var(--space-2);
      }
      
      p {
        font-size: var(--font-md);
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>