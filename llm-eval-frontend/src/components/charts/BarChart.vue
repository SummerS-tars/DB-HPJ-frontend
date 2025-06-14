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
  yLabel: {
    type: String,
    default: '数值'
  },
  color: {
    type: String,
    default: '#409EFF'
  }
})

const chartId = ref(`bar-chart-${Math.random().toString(36).substr(2, 9)}`)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }

  const chartDom = document.getElementById(chartId.value)
  if (!chartDom) return

  chartInstance = echarts.init(chartDom)
  
  const xData = Object.keys(props.data)
  const yData = Object.values(props.data)

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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        rotate: xData.length > 5 ? 45 : 0,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: props.yLabel,
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: props.yLabel,
        type: 'bar',
        data: yData,
        itemStyle: {
          color: props.color
        },
        emphasis: {
          itemStyle: {
            color: echarts.color.lift(props.color, 0.2)
          }
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