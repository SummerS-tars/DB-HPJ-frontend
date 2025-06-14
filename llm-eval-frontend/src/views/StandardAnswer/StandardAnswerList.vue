<template>
  <div class="std-answer-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>标准答案管理</h2>
          <el-alert 
            type="info" 
            :closable="false"
            style="margin-left: 20px; flex: 1"
          >
            标准答案只能通过接受候选答案创建，不支持直接导入
          </el-alert>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.type" placeholder="答案类型" clearable>
              <el-option label="客观题答案" value="OBJECTIVE" />
              <el-option label="主观题答案" value="SUBJECTIVE" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="状态筛选" clearable>
              <el-option label="已接受" value="ACCEPTED" />
              <el-option label="已忽略" value="OMITTED" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input 
              v-model="filters.stdQuestionId" 
              placeholder="标准问题ID" 
              clearable 
              type="number"
            />
          </el-col>
          <el-col :span="6">
            <el-button @click="fetchAnswers">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table 
        :data="answers" 
        :loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="stdQuestionId" label="标准问题ID" width="120">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewStandardQuestion(row.stdQuestionId)"
            >
              {{ row.stdQuestionId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'OBJECTIVE' ? 'success' : 'warning'" size="small">
              {{ row.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="答案内容" min-width="300">
          <template #default="{ row }">
            <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
              {{ getAnswerContent(row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="80">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.score }}/10</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === 'ACCEPTED' ? 'success' : 'info'"
              size="small"
            >
              {{ row.status === 'ACCEPTED' ? '已接受' : '已忽略' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="selectedFromCandidateId" label="来源候选答案" width="150">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewCandidateAnswer(row.selectedFromCandidateId)"
            >
              候选答案 #{{ row.selectedFromCandidateId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="225" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewAnswer(row)">查看</el-button>
            <el-button 
              size="small" 
              type="warning" 
              @click="updateScore(row)"
            >
              修改评分
            </el-button>
            <el-button 
              v-if="row.status === 'ACCEPTED'"
              size="small" 
              type="danger" 
              @click="omitAnswer(row)"
            >
              忽略
            </el-button>
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
        @current-change="fetchAnswers"
        @size-change="fetchAnswers"
      />
    </el-card>

    <!-- Answer Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="标准答案详情"
      width="800px"
    >
      <div v-if="selectedAnswer">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedAnswer.id }}</el-descriptions-item>
          <el-descriptions-item label="标准问题ID">{{ selectedAnswer.stdQuestionId }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="selectedAnswer.type === 'OBJECTIVE' ? 'success' : 'warning'">
              {{ selectedAnswer.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评分">
            <el-tag type="success">{{ selectedAnswer.score }}/10</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedAnswer.status === 'ACCEPTED' ? 'success' : 'info'">
              {{ selectedAnswer.status === 'ACCEPTED' ? '已接受' : '已忽略' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="来源候选答案ID">{{ selectedAnswer.selectedFromCandidateId }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedAnswer.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="答案内容" :span="2">
            <div style="max-height: 200px; overflow-y: auto; white-space: pre-wrap;">
              {{ getAnswerContent(selectedAnswer) }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- Update Score Dialog -->
    <el-dialog
      v-model="showScoreDialog"
      title="修改评分"
      width="400px"
    >
      <el-form :model="scoreForm" label-width="100px">
        <el-form-item label="当前评分">
          <span>{{ selectedAnswer?.score }}/10</span>
        </el-form-item>
        <el-form-item label="新评分" required>
          <el-input-number 
            v-model="scoreForm.score" 
            :min="0" 
            :max="10"
            placeholder="0-10分"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showScoreDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="updating"
          @click="confirmUpdateScore"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { standardAnswerApi } from '@/services/answers'

const answers = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showDetailDialog = ref(false)
const showScoreDialog = ref(false)
const updating = ref(false)
const selectedAnswer = ref(null)

const filters = reactive({
  type: 'SUBJECTIVE', // Default to SUBJECTIVE to match your test case
  status: '',
  stdQuestionId: ''
})

const pagination = reactive({
  page: 1,
  size: 20
})

const scoreForm = reactive({
  score: 8
})

const fetchAnswers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.size,
      ...filters
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '') delete params[key]
    })

    const response = await standardAnswerApi.getAnswers(params)
    console.log('Standard Answers API Response:', response.data) // Debug log
    
    // Fix data access path to match API response structure
    const responseData = response.data.data || response.data
    answers.value = responseData.content || []
    totalElements.value = responseData.totalElements || 0
  } catch (error) {
    console.error('Failed to fetch answers:', error)
    ElMessage.error('获取标准答案列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.type = 'SUBJECTIVE'
  filters.status = ''
  filters.stdQuestionId = ''
  fetchAnswers()
}

const viewAnswer = (answer) => {
  selectedAnswer.value = answer
  showDetailDialog.value = true
}

const viewStandardQuestion = (questionId) => {
  // Navigate to standard question detail
  window.open(`/std-questions/${questionId}`, '_blank')
}

const viewCandidateAnswer = (candidateId) => {
  // Navigate to candidate answer detail
  window.open(`/candidate-answers/${candidateId}`, '_blank')
}

const updateScore = (answer) => {
  selectedAnswer.value = answer
  scoreForm.score = answer.score
  showScoreDialog.value = true
}

const confirmUpdateScore = async () => {
  updating.value = true
  try {
    await standardAnswerApi.updateAnswer(selectedAnswer.value.id, {
      score: scoreForm.score
    })
    
    ElMessage.success('评分修改成功')
    showScoreDialog.value = false
    fetchAnswers()
  } catch (error) {
    console.error('Failed to update score:', error)
  } finally {
    updating.value = false
  }
}

const omitAnswer = async (answer) => {
  try {
    await ElMessageBox.confirm('确定要忽略这个标准答案吗？', '确认忽略', {
      type: 'warning'
    })
    
    await standardAnswerApi.updateAnswer(answer.id, { status: 'OMITTED' })
    ElMessage.success('标准答案已忽略')
    fetchAnswers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to omit answer:', error)
    }
  }
}

const getAnswerContent = (answer) => {
  return answer.type === 'OBJECTIVE' ? answer.objAnswer : answer.subAnswer
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchAnswers()
})
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
}

.header-content h2 {
  margin: 0;
}

.filters {
  margin-bottom: 20px;
}
</style> 