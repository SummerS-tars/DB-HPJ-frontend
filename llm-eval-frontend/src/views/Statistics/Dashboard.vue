<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-alert
        title="数据加载失败"
        :description="error"
        type="error"
        show-icon
        :closable="false"
      />
      <el-button 
        type="primary" 
        @click="refetchData" 
        style="margin-top: 16px"
      >
        重新加载
      </el-button>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Header -->
      <el-card class="header-card">
        <template #header>
          <div class="header-content">
            <h2>统计概览</h2>
            <div class="header-actions">
              <el-button 
                type="primary" 
                :icon="Refresh" 
                @click="refetchData"
                :loading="refreshing"
              >
                刷新数据
              </el-button>
              <el-button 
                type="info" 
                :icon="Download" 
                @click="exportStatistics"
              >
                导出报告
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="last-update">
          最后更新时间: {{ formatTime(stats?.systemMetrics?.lastUpdateTime) }}
        </div>
      </el-card>

      <!-- Statistics Overview Cards -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#409EFF"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats?.rawQuestions?.total) }}</div>
                <div class="stat-label">原始问题总数</div>
                <div class="stat-subtitle">
                  转换率: {{ formatPercentage(stats?.rawQuestions?.conversionRate) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#67C23A"><Files /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats?.standardQuestions?.total) }}</div>
                <div class="stat-label">标准问题总数</div>
                <div class="stat-subtitle">
                  答案覆盖率: {{ formatPercentage(stats?.standardQuestions?.answerCoverage) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#E6A23C"><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats?.candidateAnswers?.total) }}</div>
                <div class="stat-label">候选答案总数</div>
                <div class="stat-subtitle">
                  通过率: {{ formatPercentage(stats?.candidateAnswers?.approvalRate) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#F56C6C"><DataAnalysis /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats?.evaluationResults?.total) }}</div>
                <div class="stat-label">评估结果总数</div>
                <div class="stat-subtitle">
                  平均分: {{ formatScore(stats?.evaluationResults?.averageScore) }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- System Health Metrics -->
      <el-card style="margin-bottom: 20px">
        <template #header>
          <h3>系统健康度</h3>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <HealthMetric
              label="数据完整性"
              :value="stats?.systemMetrics?.dataCompleteness || 0"
              :threshold="0.8"
              format="percentage"
            />
          </el-col>
          <el-col :span="6">
            <HealthMetric
              label="系统健康度"
              :value="stats?.systemMetrics?.systemHealth || 0"
              :threshold="0.7"
              format="percentage"
            />
          </el-col>
          <el-col :span="6">
            <HealthMetric
              label="转换效率"
              :value="stats?.rawQuestions?.conversionRate || 0"
              :threshold="0.5"
              format="percentage"
            />
          </el-col>
          <el-col :span="6">
            <HealthMetric
              label="审核通过率"
              :value="stats?.candidateAnswers?.approvalRate || 0"
              :threshold="0.6"
              format="percentage"
            />
          </el-col>
        </el-row>
      </el-card>

      <!-- Data Visualization Charts -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <h4>原始问题状态分布</h4>
            </template>
            <PieChart 
              :data="stats?.rawQuestions?.byStatus || {}"
              height="300px"
            />
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <h4>数据来源分布</h4>
            </template>
            <PieChart 
              :data="stats?.rawQuestions?.byPlatform || {}"
              height="300px"
              :colors="['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']"
            />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <h4>模型性能对比</h4>
            </template>
            <BarChart 
              :data="stats?.analysisResults?.averageScoresByModel || {}"
              height="300px"
              y-label="平均分"
              color="#67C23A"
            />
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <h4>评分分布</h4>
            </template>
            <HistogramChart 
              :data="stats?.analysisResults?.scoreDistribution || {}"
              height="300px"
              x-label="分数"
              y-label="数量"
              color="#E6A23C"
            />
          </el-card>
        </el-col>
      </el-row>

      <!-- Detailed Statistics -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-card class="detail-card">
            <template #header>
              <h4>标准问题详情</h4>
            </template>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">客观题:</span>
                <span class="detail-value">{{ formatNumber(stats?.standardQuestions?.byType?.OBJECTIVE) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">主观题:</span>
                <span class="detail-value">{{ formatNumber(stats?.standardQuestions?.byType?.SUBJECTIVE) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">已有答案:</span>
                <span class="detail-value">{{ formatNumber(stats?.standardQuestions?.withAnswers) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="detail-card">
            <template #header>
              <h4>候选答案详情</h4>
            </template>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">待处理:</span>
                <span class="detail-value">{{ formatNumber(stats?.candidateAnswers?.byStatus?.PENDING) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">已接受:</span>
                <span class="detail-value">{{ formatNumber(stats?.candidateAnswers?.byStatus?.ACCEPTED) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">已拒绝:</span>
                <span class="detail-value">{{ formatNumber(stats?.candidateAnswers?.byStatus?.REJECTED) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="detail-card">
            <template #header>
              <h4>评估结果详情</h4>
            </template>
            <div class="detail-content">
              <div class="detail-item">
                <span class="detail-label">已分析:</span>
                <span class="detail-value">{{ formatNumber(stats?.evaluationResults?.analyzedCount) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">待分析:</span>
                <span class="detail-value">{{ formatNumber(stats?.evaluationResults?.byStatus?.PENDING) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">平均分:</span>
                <span class="detail-value">{{ formatScore(stats?.analysisResults?.overallAverageScore) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Quick Actions -->
      <el-card>
        <template #header>
          <h3>快速操作</h3>
        </template>
        <el-row :gutter="20" style="margin-bottom: 15px">
          <el-col :span="6">
            <el-button 
              type="primary" 
              @click="navigateTo('/raw-questions')"
              style="width: 100%"
            >
              <el-icon><Upload /></el-icon>
              导入原始问题
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="success" 
              @click="navigateTo('/std-questions')"
              style="width: 100%"
            >
              <el-icon><Edit /></el-icon>
              管理标准问题
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="warning" 
              @click="navigateTo('/evaluation-results')"
              style="width: 100%"
            >
              <el-icon><DataAnalysis /></el-icon>
              查看评估结果
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button 
              type="info" 
              @click="navigateTo('/evaluation-analysis')"
              style="width: 100%"
            >
              <el-icon><TrendCharts /></el-icon>
              分析管理
            </el-button>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-button 
              type="primary" 
              @click="navigateTo('/analysis-tags')"
              style="width: 100%"
            >
              <el-icon><Stamp /></el-icon>
              分析标签管理
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button 
              type="success" 
              @click="navigateTo('/candidate-answers')"
              style="width: 100%"
            >
              <el-icon><ChatDotRound /></el-icon>
              候选答案管理
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Document, Files, ChatDotRound, DataAnalysis, TrendCharts, 
  Upload, Edit, Stamp, Refresh, Download 
} from '@element-plus/icons-vue'

// Import components
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import HistogramChart from '@/components/charts/HistogramChart.vue'
import HealthMetric from '@/components/HealthMetric.vue'

// Import API
import { statisticsApi } from '@/services/statistics'

const router = useRouter()

// Reactive data
const stats = ref(null)
const loading = ref(true)
const refreshing = ref(false)
const error = ref(null)

// Auto-refresh interval
let refreshInterval = null

// Fetch statistics data
const fetchStatistics = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true
    } else {
      refreshing.value = true
    }
    
    error.value = null
    
    const response = await statisticsApi.getOverallStatisticsWithCache()
    console.log('Statistics API Response:', response.data)
    
    if (response.data.success) {
      stats.value = response.data.data
    } else {
      throw new Error(response.data.message || '获取统计数据失败')
    }
  } catch (err) {
    console.error('Failed to fetch statistics:', err)
    error.value = err.message || '网络错误，请检查连接'
    ElMessage.error('获取统计数据失败: ' + error.value)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// Refresh data
const refetchData = () => {
  statisticsApi.clearCache()
  fetchStatistics(true)
}

// Export statistics
const exportStatistics = () => {
  if (!stats.value) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  // Create export data
  const exportData = {
    exportTime: new Date().toISOString(),
    statistics: stats.value
  }
  
  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `statistics-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('统计报告已导出')
}

// Navigation
const navigateTo = (path) => {
  router.push(path)
}

// Utility functions
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const formatPercentage = (num) => {
  if (num === null || num === undefined) return '0%'
  return `${(num * 100).toFixed(1)}%`
}

const formatScore = (num) => {
  if (num === null || num === undefined) return '0.0'
  return num.toFixed(1)
}

const formatTime = (timeStr) => {
  if (!timeStr) return '未知'
  return new Date(timeStr).toLocaleString('zh-CN')
}

// Lifecycle
onMounted(() => {
  fetchStatistics()
  
  // Set up auto-refresh every 5 minutes
  refreshInterval = setInterval(() => {
    fetchStatistics(false)
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container, .error-container {
  padding: 40px;
  text-align: center;
}

.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.last-update {
  color: #909399;
  font-size: 12px;
}

.stat-card {
  height: 120px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 16px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 12px;
  color: #909399;
}

.chart-card {
  height: 380px;
}

.chart-card .el-card__header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.chart-card .el-card__body {
  padding: 20px;
  height: calc(100% - 57px);
}

.detail-card {
  height: 200px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #606266;
}

.detail-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* Responsive design */
@media (max-width: 1200px) {
  .dashboard {
    padding: 10px;
  }
  
  .stat-card {
    margin-bottom: 10px;
  }
  
  .chart-card {
    height: 350px;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style> 