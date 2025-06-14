<template>
  <div :id="chartId" :style="{ width: '100%', height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '300px'
  },
  colors: {
    type: Array,
    default: () => ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#C0C4CC']
  }
})

const chartId = ref(`pie-chart-${Math.random().toString(36).substr(2, 9)}`)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }

  const chartDom = document.getElementById(chartId.value)
  if (!chartDom) return

  chartInstance = echarts.init(chartDom)
  
  const chartData = Object.entries(props.data).map(([name, value]) => ({
    name,
    value
  }))

  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        fontSize: 12
      }
    },
    color: props.colors,
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: '50%',
        center: ['60%', '50%'],
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        }
      }
    ]
  }

  chartInstance.setOption(option)
  
  // Make chart responsive
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }
  
  window.addEventListener('resize', handleResize)
}

watch(() => props.data, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})
</script>

<style scoped>
/* Chart container styles handled by ECharts */
</style> 