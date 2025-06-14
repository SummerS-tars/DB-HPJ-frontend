<template>
  <div class="health-metric" :class="statusClass">
    <div class="metric-header">
      <span class="metric-label">{{ label }}</span>
      <span class="metric-value">{{ formattedValue }}</span>
    </div>
    <div class="metric-bar">
      <div 
        class="metric-fill" 
        :style="{ width: `${Math.min(percentage, 100)}%` }"
      ></div>
    </div>
    <div class="metric-status">
      <el-icon v-if="status === 'good'" class="status-icon good">
        <Check />
      </el-icon>
      <el-icon v-else-if="status === 'warning'" class="status-icon warning">
        <Warning />
      </el-icon>
      <el-icon v-else class="status-icon danger">
        <Close />
      </el-icon>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check, Warning, Close } from '@element-plus/icons-vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    default: 0.7
  },
  warningThreshold: {
    type: Number,
    default: null
  },
  format: {
    type: String,
    default: 'percentage', // 'percentage' | 'number' | 'decimal'
    validator: (value) => ['percentage', 'number', 'decimal'].includes(value)
  },
  unit: {
    type: String,
    default: ''
  }
})

const percentage = computed(() => {
  if (props.format === 'percentage') {
    return props.value * 100
  }
  return props.value
})

const formattedValue = computed(() => {
  switch (props.format) {
    case 'percentage':
      return `${(props.value * 100).toFixed(1)}%`
    case 'decimal':
      return props.value.toFixed(2) + props.unit
    case 'number':
    default:
      return props.value.toLocaleString() + props.unit
  }
})

const status = computed(() => {
  const warningThreshold = props.warningThreshold || props.threshold * 0.8
  
  if (props.value >= props.threshold) {
    return 'good'
  } else if (props.value >= warningThreshold) {
    return 'warning'
  } else {
    return 'danger'
  }
})

const statusClass = computed(() => {
  return `status-${status.value}`
})

const statusText = computed(() => {
  switch (status.value) {
    case 'good':
      return '良好'
    case 'warning':
      return '警告'
    case 'danger':
      return '危险'
    default:
      return '未知'
  }
})
</script>

<style scoped>
.health-metric {
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.health-metric:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.metric-bar {
  height: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.status-good .metric-fill {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.status-warning .metric-fill {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
}

.status-danger .metric-fill {
  background: linear-gradient(90deg, #f56c6c, #f78989);
}

.metric-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  font-size: 14px;
}

.status-icon.good {
  color: #67c23a;
}

.status-icon.warning {
  color: #e6a23c;
}

.status-icon.danger {
  color: #f56c6c;
}

.status-text {
  font-size: 12px;
  color: #909399;
}

.status-good {
  border-color: #67c23a;
}

.status-warning {
  border-color: #e6a23c;
}

.status-danger {
  border-color: #f56c6c;
}
</style> 