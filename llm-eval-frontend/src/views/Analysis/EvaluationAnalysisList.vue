<template>
  <div class="evaluation-analysis-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>评估分析管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="showImportDialog = true">
              <el-icon><Upload /></el-icon>
              导入分析结果
            </el-button>
            <el-button type="success" @click="showStatisticsDialog = true">
              <el-icon><TrendCharts /></el-icon>
              查看统计
            </el-button>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.analysisTagId" placeholder="分析标签筛选" clearable>
              <el-option 
                v-for="tag in analysisTags" 
                :key="tag.analysisTagId" 
                :label="`${tag.model || '未知模型'} (ID: ${tag.analysisTagId})`" 
                :value="tag.analysisTagId" 
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-input-number 
              v-model="filters.minScore" 
              placeholder="最低分数" 
              :min="0" 
              :max="10" 
              style="width: 100%"
            />
          </el-col>
          <el-col :span="4">
            <el-input-number 
              v-model="filters.maxScore" 
              placeholder="最高分数" 
              :min="0" 
              :max="10" 
              style="width: 100%"
            />
          </el-col>
          <el-col :span="6">
            <el-button @click="fetchAnalysisResults">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table 
        :data="analysisResults" 
        :loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="score" label="分析评分" width="100">
          <template #default="{ row }">
            <el-tag :type="getScoreType(row.score)" size="small">
              {{ row.score }} 分
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="analysisModel" label="分析模型" width="150" />
        <el-table-column prop="evaluationModel" label="评估模型" width="150" />
        <el-table-column prop="standardQuestionId" label="标准问题ID" width="120">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewStandardQuestion(row.standardQuestionId)"
            >
              {{ row.standardQuestionId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="standardQuestionTitle" label="问题标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="evaluationResultId" label="评估结果ID" width="120">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewEvaluationResult(row.evaluationResultId)"
            >
              {{ row.evaluationResultId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewAnalysisResult(row)">详情</el-button>
            <el-button size="small" type="danger" @click="deleteAnalysisResult(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="totalElements"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @current-change="fetchAnalysisResults"
        @size-change="fetchAnalysisResults"
      />
    </el-card>

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入分析结果"
      width="600px"
    >
      <el-alert
        title="导入说明"
        type="info"
        style="margin-bottom: 20px"
        :closable="false"
      >
        <p>请选择要导入的分析标签，然后输入分析结果数据。每个结果包含评估结果ID和对应的分析评分（0-10分）。</p>
      </el-alert>

      <el-form :model="importForm" label-width="120px">
        <el-form-item label="分析标签" required>
          <el-select v-model="importForm.analysisTagId" placeholder="选择分析标签" style="width: 100%">
            <el-option 
              v-for="tag in analysisTags" 
              :key="tag.analysisTagId" 
              :label="`${tag.model || '未知模型'} (ID: ${tag.analysisTagId})`" 
              :value="tag.analysisTagId" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="导入方式">
          <el-radio-group v-model="importForm.importType">
            <el-radio label="manual">手动输入</el-radio>
            <el-radio label="json">JSON格式</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="importForm.importType === 'manual'" label="分析结果">
          <div style="max-height: 300px; overflow-y: auto;">
            <div v-for="(result, index) in importForm.results" :key="index" style="margin-bottom: 10px;">
              <el-row :gutter="10">
                <el-col :span="10">
                  <el-input-number 
                    v-model="result.evaluationResultId" 
                    placeholder="评估结果ID" 
                    :min="1"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="10">
                  <el-input-number 
                    v-model="result.score" 
                    placeholder="评分 (0-10)" 
                    :min="0" 
                    :max="10"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="4">
                  <el-button size="small" type="danger" @click="removeResult(index)">删除</el-button>
                </el-col>
              </el-row>
            </div>
            <el-button @click="addResult" size="small">添加结果</el-button>
          </div>
        </el-form-item>

        <el-form-item v-if="importForm.importType === 'json'" label="JSON数据">
          <el-input 
            v-model="importForm.jsonData" 
            type="textarea" 
            :rows="10" 
            placeholder='请输入JSON格式数据，例如：
{
  "analysisTagId": 1,
  "results": [
    {"evaluationResultId": 1, "score": 8},
    {"evaluationResultId": 2, "score": 7}
  ]
}'
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="importing"
          @click="handleImport"
        >
          导入 ({{ getImportCount() }} 条)
        </el-button>
      </template>
    </el-dialog>

    <!-- Statistics Dialog -->
    <el-dialog
      v-model="showStatisticsDialog"
      title="分析统计信息"
      width="900px"
    >
      <div v-if="statistics">
        <!-- Overall Statistics -->
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="6">
            <el-statistic title="总分析结果数" :value="statistics.totalAnalysisResults" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="总分析标签数" :value="statistics.totalAnalysisTags" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="平均分数" :value="statistics.averageScore" :precision="2" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="分数范围" :value="`${statistics.minScore} - ${statistics.maxScore}`" />
          </el-col>
        </el-row>

        <!-- Score Distribution Chart -->
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <h4>分数分布</h4>
          </template>
          <div ref="scoreChartRef" style="height: 300px;"></div>
        </el-card>

        <!-- Model Comparison -->
        <el-card style="margin-bottom: 20px;">
          <template #header>
            <h4>模型平均分数对比</h4>
          </template>
          <el-table :data="getModelComparisonData()" style="width: 100%">
            <el-table-column prop="model" label="模型" />
            <el-table-column prop="averageScore" label="平均分数" width="120">
              <template #default="{ row }">
                {{ row.averageScore.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="分数分布" width="200">
              <template #default="{ row }">
                <el-progress :percentage="row.averageScore * 10" :color="getProgressColor(row.averageScore)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- Tag Analysis -->
        <el-card>
          <template #header>
            <h4>分析标签统计</h4>
          </template>
          <el-table :data="statistics.tagAnalysisCounts" style="width: 100%">
            <el-table-column prop="analysisTagId" label="分析标签ID" width="120" />
            <el-table-column prop="model" label="模型" />
            <el-table-column prop="count" label="分析数量" width="120" />
            <el-table-column prop="averageScore" label="平均分数" width="120">
              <template #default="{ row }">
                {{ row.averageScore.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>

    <!-- Analysis Result Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="分析结果详情"
      width="800px"
    >
      <div v-if="selectedAnalysisResult">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析结果ID">{{ selectedAnalysisResult.id }}</el-descriptions-item>
          <el-descriptions-item label="评估结果ID">{{ selectedAnalysisResult.evaluationResultId }}</el-descriptions-item>
          <el-descriptions-item label="分析标签ID">{{ selectedAnalysisResult.analysisTagId }}</el-descriptions-item>
          <el-descriptions-item label="分析评分">
            <el-tag :type="getScoreType(selectedAnalysisResult.score)" size="large">
              {{ selectedAnalysisResult.score }} 分
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分析模型">{{ selectedAnalysisResult.analysisModel }}</el-descriptions-item>
          <el-descriptions-item label="评估模型">{{ selectedAnalysisResult.evaluationModel }}</el-descriptions-item>
          <el-descriptions-item label="标准问题ID">{{ selectedAnalysisResult.standardQuestionId }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedAnalysisResult.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="问题标题" :span="2">
            {{ selectedAnalysisResult.standardQuestionTitle }}
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px; text-align: center;">
          <el-button 
            type="primary" 
            @click="viewStandardQuestion(selectedAnalysisResult.standardQuestionId)"
          >
            查看标准问题
          </el-button>
          <el-button 
            type="success" 
            @click="viewEvaluationResult(selectedAnalysisResult.evaluationResultId)"
          >
            查看评估结果
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { evaluationAnalysisApi, analysisTagApi } from '@/services/evaluation'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()

const analysisResults = ref([])
const analysisTags = ref([])
const statistics = ref(null)
const loading = ref(false)
const importing = ref(false)
const totalElements = ref(0)
const showImportDialog = ref(false)
const showStatisticsDialog = ref(false)
const showDetailDialog = ref(false)
const selectedAnalysisResult = ref(null)
const scoreChartRef = ref()

const filters = reactive({
  analysisTagId: '',
  minScore: null,
  maxScore: null
})

const pagination = reactive({
  page: 1,
  size: 20,
  sortBy: 'id',
  sortDir: 'desc'
})

const importForm = reactive({
  analysisTagId: '',
  importType: 'manual',
  results: [{ evaluationResultId: '', score: '' }],
  jsonData: ''
})

const fetchAnalysisResults = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.size,
      sortBy: pagination.sortBy,
      sortDir: pagination.sortDir,
      ...filters
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) delete params[key]
    })

    const response = await evaluationAnalysisApi.getAnalysis(params)
    console.log('Analysis Results API Response:', response.data)
    
    const data = response.data.data || response.data
    
    if (data.content) {
      analysisResults.value = data.content
      totalElements.value = data.totalElements
    } else if (Array.isArray(data)) {
      analysisResults.value = data
      totalElements.value = data.length
    } else {
      analysisResults.value = []
      totalElements.value = 0
    }
  } catch (error) {
    console.error('Failed to fetch analysis results:', error)
    ElMessage.error('获取分析结果失败')
  } finally {
    loading.value = false
  }
}

const fetchAnalysisTags = async () => {
  try {
    const response = await analysisTagApi.getTags()
    const data = response.data.data || response.data
    
    if (data.content) {
      analysisTags.value = data.content
    } else if (Array.isArray(data)) {
      analysisTags.value = data
    } else {
      analysisTags.value = []
    }
  } catch (error) {
    console.error('Failed to fetch analysis tags:', error)
    ElMessage.error('获取分析标签失败')
  }
}

const fetchStatistics = async () => {
  try {
    const response = await evaluationAnalysisApi.getStatistics()
    statistics.value = response.data.data || response.data
    
    // Render chart after statistics are loaded
    await nextTick()
    renderScoreChart()
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    ElMessage.error('获取统计信息失败')
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = key.includes('Score') ? null : ''
  })
  pagination.page = 1
  fetchAnalysisResults()
}

const handleImport = async () => {
  if (!importForm.analysisTagId) {
    ElMessage.warning('请选择分析标签')
    return
  }

  let importData = null

  if (importForm.importType === 'manual') {
    const validResults = importForm.results.filter(r => 
      r.evaluationResultId && r.score !== '' && r.score !== null
    )
    
    if (validResults.length === 0) {
      ElMessage.warning('请至少添加一条有效的分析结果')
      return
    }

    importData = {
      analysisTagId: importForm.analysisTagId,
      results: validResults
    }
  } else {
    try {
      importData = JSON.parse(importForm.jsonData)
      if (!importData.analysisTagId) {
        importData.analysisTagId = importForm.analysisTagId
      }
    } catch (error) {
      ElMessage.error('JSON格式错误，请检查数据格式')
      return
    }
  }

  importing.value = true
  try {
    const response = await evaluationAnalysisApi.importAnalysis(importData)
    const result = response.data.data || response.data
    
    ElMessage.success(result.message || `导入完成！成功导入 ${result.importedCount || 0} 条记录`)
    showImportDialog.value = false
    resetImportForm()
    fetchAnalysisResults()
  } catch (error) {
    console.error('Import failed:', error)
    ElMessage.error('导入失败：' + (error.response?.data?.message || '未知错误'))
  } finally {
    importing.value = false
  }
}

const resetImportForm = () => {
  importForm.analysisTagId = ''
  importForm.importType = 'manual'
  importForm.results = [{ evaluationResultId: '', score: '' }]
  importForm.jsonData = ''
}

const addResult = () => {
  importForm.results.push({ evaluationResultId: '', score: '' })
}

const removeResult = (index) => {
  if (importForm.results.length > 1) {
    importForm.results.splice(index, 1)
  }
}

const getImportCount = () => {
  if (importForm.importType === 'manual') {
    return importForm.results.filter(r => 
      r.evaluationResultId && r.score !== '' && r.score !== null
    ).length
  } else if (importForm.jsonData) {
    try {
      const data = JSON.parse(importForm.jsonData)
      return data.results ? data.results.length : 0
    } catch {
      return 0
    }
  }
  return 0
}

const viewAnalysisResult = (result) => {
  selectedAnalysisResult.value = result
  showDetailDialog.value = true
}

const deleteAnalysisResult = async (result) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个分析结果吗？', 
      '确认删除', 
      { type: 'warning' }
    )
    
    await evaluationAnalysisApi.deleteAnalysisResult(result.id)
    ElMessage.success('分析结果删除成功')
    fetchAnalysisResults()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete analysis result:', error)
      ElMessage.error('删除失败')
    }
  }
}

const viewStandardQuestion = (questionId) => {
  router.push(`/std-questions?highlight=${questionId}`)
}

const viewEvaluationResult = (resultId) => {
  router.push(`/evaluation-results?highlight=${resultId}`)
}

const getScoreType = (score) => {
  if (score >= 8) return 'success'
  if (score >= 6) return 'warning'
  return 'danger'
}

const getModelComparisonData = () => {
  if (!statistics.value?.averageScoresByModel) return []
  
  return Object.entries(statistics.value.averageScoresByModel).map(([model, score]) => ({
    model,
    averageScore: score
  }))
}

const getProgressColor = (score) => {
  if (score >= 8) return '#67c23a'
  if (score >= 6) return '#e6a23c'
  return '#f56c6c'
}

const renderScoreChart = () => {
  if (!scoreChartRef.value || !statistics.value?.scoreDistribution) return

  const chart = echarts.init(scoreChartRef.value)
  
  const data = Object.entries(statistics.value.scoreDistribution)
    .map(([score, count]) => ({ name: `${score}分`, value: count, score: parseInt(score) }))
    .sort((a, b) => a.score - b.score)

  const option = {
    title: {
      text: '分数分布统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 条结果'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '分析结果数量',
      type: 'bar',
      data: data.map(item => ({
        value: item.value,
        itemStyle: {
          color: item.score >= 8 ? '#67c23a' : item.score >= 6 ? '#e6a23c' : '#f56c6c'
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }

  chart.setOption(option)
  
  // Handle resize
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  // Check if analysisTagId is provided in query params
  if (route.query.analysisTagId) {
    filters.analysisTagId = parseInt(route.query.analysisTagId)
  }
  
  fetchAnalysisTags()
  fetchAnalysisResults()
  
  // Load statistics when statistics dialog is opened
  const originalShowStatistics = () => {
    showStatisticsDialog.value = true
    if (!statistics.value) {
      fetchStatistics()
    }
  }
  
  // Override the show statistics function
  window.showAnalysisStatistics = originalShowStatistics
})
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filters {
  margin-bottom: 20px;
}
</style> 