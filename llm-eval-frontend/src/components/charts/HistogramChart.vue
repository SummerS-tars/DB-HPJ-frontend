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
  xLabel: {
    type: String,
    default: '分数'
  },
  yLabel: {
    type: String,
    default: '数量'
  },
  color: {
    type: String,
    default: '#67C23A'
  }
})

const chartId = ref(`histogram-chart-${Math.random().toString(36).substr(2, 9)}`)
let chartInstance = null

const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }

  const chartDom = document.getElementById(chartId.value)
  if (!chartDom) return

  chartInstance = echarts.init(chartDom)
  
  // Sort data by score for proper histogram display
  const sortedEntries = Object.entries(props.data)
    .map(([score, count]) => [parseInt(score), count])
    .sort((a, b) => a[0] - b[0])
  
  const xData = sortedEntries.map(([score]) => score.toString())
  const yData = sortedEntries.map(([, count]) => count)

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
      },
      formatter: function(params) {
        const param = params[0]
        return `${props.xLabel}: ${param.name}<br/>${props.yLabel}: ${param.value}`
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
      name: props.xLabel,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
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
        },
        barWidth: '60%'
      }
    ]
  }

  chartInstance.setOption(option)
  
  // Make chart responsive
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
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