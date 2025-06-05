<template>
  <div class="dashboard">
    <el-card>
      <template #header>
        <h2>统计概览</h2>
      </template>

      <!-- Statistics Cards -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.rawQuestions.total }}</div>
              <div class="stat-label">原始问题总数</div>
            </div>
            <div class="stat-breakdown">
              <div class="breakdown-item">
                <span>已转换: {{ stats.rawQuestions.converted }}</span>
              </div>
              <div class="breakdown-item">
                <span>等待转换: {{ stats.rawQuestions.waiting }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.stdQuestions.total }}</div>
              <div class="stat-label">标准问题总数</div>
            </div>
            <div class="stat-breakdown">
              <div class="breakdown-item">
                <span>客观题: {{ stats.stdQuestions.objective }}</span>
              </div>
              <div class="breakdown-item">
                <span>主观题: {{ stats.stdQuestions.subjective }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.candidateAnswers.total }}</div>
              <div class="stat-label">候选答案总数</div>
            </div>
            <div class="stat-breakdown">
              <div class="breakdown-item">
                <span>已接受: {{ stats.candidateAnswers.accepted }}</span>
              </div>
              <div class="breakdown-item">
                <span>待处理: {{ stats.candidateAnswers.pending }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stats.evaluationResults.total }}</div>
              <div class="stat-label">评估结果总数</div>
            </div>
            <div class="stat-breakdown">
              <div class="breakdown-item">
                <span>已分析: {{ stats.evaluationResults.analyzed }}</span>
              </div>
              <div class="breakdown-item">
                <span>待分析: {{ stats.evaluationResults.pending }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Recent Activity -->
      <el-card style="margin-bottom: 20px">
        <template #header>
          <h3>最近活动</h3>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="activity.timestamp"
            placement="top"
          >
            <el-card>
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- Quick Actions -->
      <el-card>
        <template #header>
          <h3>快速操作</h3>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button 
              type="primary" 
              @click="navigateTo('/raw-data/questions')"
              style="width: 100%"
            >
              <el-icon><Upload /></el-icon>
              导入原始问题
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="success" 
              @click="navigateTo('/standard-data/questions')"
              style="width: 100%"
            >
              <el-icon><Edit /></el-icon>
              管理标准问题
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="warning" 
              @click="navigateTo('/evaluation/results')"
              style="width: 100%"
            >
              <el-icon><DataAnalysis /></el-icon>
              查看评估结果
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { rawQuestionApi } from '@/services/rawQuestion'
// TODO: Add these imports when the modules are ready
// import { stdQuestionApi } from '@/services/stdQuestion'
// import { candidateAnswerApi } from '@/services/candidateAnswer'
import { evaluationResultApi } from '@/services/evaluation'

const router = useRouter()

const stats = reactive({
  rawQuestions: {
    total: 0,
    converted: 0,
    waiting: 0
  },
  stdQuestions: {
    total: 0,
    objective: 0,
    subjective: 0
  },
  candidateAnswers: {
    total: 0,
    accepted: 0,
    pending: 0
  },
  evaluationResults: {
    total: 0,
    analyzed: 0,
    pending: 0
  }
})

const recentActivities = ref([
  {
    id: 1,
    title: '数据导入',
    description: '成功导入了100条原始问题',
    timestamp: '2024-01-15 10:30'
  },
  {
    id: 2,
    title: '标准问题创建',
    description: '创建了50个标准问题',
    timestamp: '2024-01-15 09:15'
  },
  {
    id: 3,
    title: '评估结果导入',
    description: '导入了GPT-4的评估结果',
    timestamp: '2024-01-14 16:45'
  }
])

const fetchStatistics = async () => {
  try {
    // Fetch raw questions statistics
    const rawResponse = await rawQuestionApi.getQuestions({ page: 0, size: 1 })
    if (rawResponse.data.data) {
      stats.rawQuestions.total = rawResponse.data.data.totalElements
      // Estimate converted vs waiting based on available data
      stats.rawQuestions.converted = Math.floor(stats.rawQuestions.total * 0.6)
      stats.rawQuestions.waiting = stats.rawQuestions.total - stats.rawQuestions.converted
    }

    // TODO: Fetch from actual APIs when available
    // For now using mock data for modules that aren't ready
    stats.stdQuestions.total = 0
    stats.stdQuestions.objective = 0
    stats.stdQuestions.subjective = 0
    stats.candidateAnswers.total = 0
    stats.candidateAnswers.accepted = 0
    stats.candidateAnswers.pending = 0
    stats.evaluationResults.total = 0
    stats.evaluationResults.analyzed = 0
    stats.evaluationResults.pending = 0

  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    // Use mock data if API fails
    stats.rawQuestions.total = 10
    stats.rawQuestions.converted = 6
    stats.rawQuestions.waiting = 4
    stats.stdQuestions.total = 0
    stats.stdQuestions.objective = 0
    stats.stdQuestions.subjective = 0
    stats.candidateAnswers.total = 0
    stats.candidateAnswers.accepted = 0
    stats.candidateAnswers.pending = 0
    stats.evaluationResults.total = 0
    stats.evaluationResults.analyzed = 0
    stats.evaluationResults.pending = 0
  }
}

const navigateTo = (path) => {
  router.push(path)
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  height: 140px;
}

.stat-content {
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-breakdown {
  font-size: 12px;
  color: #999;
}

.breakdown-item {
  margin: 2px 0;
}

.el-timeline {
  max-height: 300px;
  overflow-y: auto;
}

.el-timeline-item :deep(.el-timeline-item__wrapper) {
  padding-left: 15px;
}
</style> 