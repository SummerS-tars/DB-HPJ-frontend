<template>
  <div class="candidate-answer-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>候选答案管理</h2>
          <el-button type="primary" @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            导入候选答案
          </el-button>
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
              <el-option label="待审核" value="PENDING" />
              <el-option label="已接受" value="ACCEPTED" />
              <el-option label="已拒绝" value="REJECTED" />
            </el-select>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="stdQuestionId" label="标准问题ID" width="120" />
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
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
              <el-button size="small" @click="viewAnswer(row)">查看详情</el-button>
              <el-button 
                v-if="row.status === 'PENDING'"
                size="small" 
                type="success"
                @click="acceptAnswer(row)"
              >
                接受
              </el-button>
              <el-button 
                v-if="row.status === 'PENDING'"
                size="small" 
                type="danger"
                @click="rejectAnswer(row)"
              >
                拒绝
              </el-button>
              <el-tag 
                v-else-if="row.status === 'ACCEPTED'"
                type="success" 
                size="small"
              >
                已接受
              </el-tag>
              <el-tag 
                v-else-if="row.status === 'REJECTED'"
                type="danger" 
                size="small"
              >
                已拒绝
              </el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Bulk Operations -->
      <div v-if="selectedRows.length > 0" class="bulk-operations">
        <el-alert 
          :title="`已选择 ${selectedRows.length} 个候选答案`"
          type="info"
          :closable="false"
          style="margin-bottom: 10px"
        >
          <template #default>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <el-button 
                size="small" 
                type="success"
                @click="bulkAccept"
                :disabled="!hasPendingSelected"
              >
                批量接受 ({{ pendingSelectedCount }})
              </el-button>
              <el-button 
                size="small" 
                type="danger"
                @click="bulkReject"
                :disabled="!hasPendingSelected"
              >
                批量拒绝 ({{ pendingSelectedCount }})
              </el-button>
              <el-button size="small" @click="clearSelection">清除选择</el-button>
            </div>
          </template>
        </el-alert>
      </div>

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

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入候选答案"
      width="600px"
    >
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="答案类型" required>
          <el-select v-model="importForm.type">
            <el-option label="客观题答案" value="OBJECTIVE" />
            <el-option label="主观题答案" value="SUBJECTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".csv"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择CSV文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持CSV格式文件，包含std_question_id和答案内容列
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="importing"
          @click="handleImport"
        >
          导入
        </el-button>
      </template>
    </el-dialog>

    <!-- Answer Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="候选答案详情"
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
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedAnswer.status)">
              {{ getStatusText(selectedAnswer.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(selectedAnswer.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ selectedAnswer.notes || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联问题内容" :span="2">
            <div style="padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
              <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0;">{{ selectedAnswer.questionContent || '无问题内容' }}</pre>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="答案内容" :span="2">
            <div style="padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
              <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0;">{{ getAnswerContent(selectedAnswer) }}</pre>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- Action buttons for PENDING answers -->
        <div v-if="selectedAnswer && selectedAnswer.status === 'PENDING'" style="margin-top: 20px; text-align: center;">
          <el-button 
            type="success" 
            @click="acceptAnswerFromDetail"
            :loading="updating"
          >
            接受答案
          </el-button>
          <el-button 
            type="danger" 
            @click="rejectAnswerFromDetail"
            :loading="updating"
          >
            拒绝答案
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- Accept Answer Dialog -->
    <el-dialog
      v-model="showAcceptDialog"
      title="接受候选答案"
      width="400px"
    >
      <el-form :model="acceptForm" label-width="100px">
        <el-form-item label="评分" required>
          <el-input-number 
            v-model="acceptForm.score" 
            :min="0" 
            :max="10"
            placeholder="0-10分"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAcceptDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="updating"
          @click="confirmAccept"
        >
          确认接受
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { candidateAnswerApi } from '@/services/answers'

const answers = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showImportDialog = ref(false)
const showDetailDialog = ref(false)
const showAcceptDialog = ref(false)
const importing = ref(false)
const accepting = ref(false)
const updating = ref(false)
const selectedAnswer = ref(null)
const selectedRows = ref([])

const filters = reactive({
  type: 'SUBJECTIVE', // Default to SUBJECTIVE to match your test case
  status: 'PENDING',  // Default to PENDING to match your test case
  stdQuestionId: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  sortBy: 'id',
  sortDirection: 'asc'
})

const importForm = reactive({
  file: null,
  type: 'OBJECTIVE'
})

const acceptForm = reactive({
  score: 8
})

// Computed properties for bulk operations
const hasPendingSelected = computed(() => {
  return selectedRows.value.some(row => row.status === 'PENDING')
})

const pendingSelectedCount = computed(() => {
  return selectedRows.value.filter(row => row.status === 'PENDING').length
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const clearSelection = () => {
  selectedRows.value = []
}

const bulkAccept = async () => {
  const pendingRows = selectedRows.value.filter(row => row.status === 'PENDING')
  
  if (pendingRows.length === 0) {
    ElMessage.warning('没有待处理的候选答案')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量接受 ${pendingRows.length} 个候选答案并创建标准答案吗？`,
      '确认批量接受',
      { type: 'warning' }
    )

    accepting.value = true
    const promises = pendingRows.map(row => 
      candidateAnswerApi.updateAnswer(row.id, { 
        status: 'ACCEPTED', 
        score: 8 // Default score for bulk operations
      })
    )

    await Promise.all(promises)
    ElMessage.success(`成功接受 ${pendingRows.length} 个候选答案`)
    clearSelection()
    fetchAnswers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Bulk accept failed:', error)
    }
  } finally {
    accepting.value = false
  }
}

const bulkReject = async () => {
  const pendingRows = selectedRows.value.filter(row => row.status === 'PENDING')
  
  if (pendingRows.length === 0) {
    ElMessage.warning('没有待处理的候选答案')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量拒绝 ${pendingRows.length} 个候选答案吗？`,
      '确认批量拒绝',
      { type: 'warning' }
    )

    const promises = pendingRows.map(row => 
      candidateAnswerApi.updateAnswer(row.id, { status: 'REJECTED' })
    )

    await Promise.all(promises)
    ElMessage.success(`成功拒绝 ${pendingRows.length} 个候选答案`)
    clearSelection()
    fetchAnswers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Bulk reject failed:', error)
    }
  }
}

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

    const response = await candidateAnswerApi.getAnswers(params)
    console.log('Candidate Answers API Response:', response.data) // Debug log
    
    // Fix data access path to match API response structure
    const responseData = response.data.data || response.data
    answers.value = responseData.content || []
    totalElements.value = responseData.totalElements || 0
  } catch (error) {
    console.error('Failed to fetch answers:', error)
    ElMessage.error('获取候选答案列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.type = 'SUBJECTIVE'
  filters.status = 'PENDING'
  filters.stdQuestionId = ''
  fetchAnswers()
}

const handleFileChange = (file) => {
  importForm.file = file.raw
}

const handleImport = async () => {
  if (!importForm.file) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importing.value = true
  try {
    const response = await candidateAnswerApi.importAnswers(
      importForm.file, 
      importForm.type
    )
    
    console.log('Import Response:', response.data) // Debug log
    
    // Fix data access path to match API response structure
    const responseData = response.data.data || response.data
    const importedCount = responseData.importedCount || 0
    
    ElMessage.success(`导入完成！成功导入 ${importedCount} 条记录`)
    showImportDialog.value = false
    
    // Reset import form
    importForm.file = null
    importForm.type = 'OBJECTIVE'
    
    fetchAnswers()
  } catch (error) {
    console.error('Import failed:', error)
    ElMessage.error('导入失败，请检查文件格式')
  } finally {
    importing.value = false
  }
}

const viewAnswer = (answer) => {
  selectedAnswer.value = answer
  showDetailDialog.value = true
}

const acceptAnswer = (answer) => {
  selectedAnswer.value = answer
  acceptForm.score = 8 // Reset to default
  showAcceptDialog.value = true
}

const confirmAccept = async () => {
  updating.value = true
  try {
    await candidateAnswerApi.updateAnswer(selectedAnswer.value.id, {
      status: 'ACCEPTED',
      score: acceptForm.score
    })
    
    ElMessage.success('候选答案已接受，已自动创建标准答案')
    showAcceptDialog.value = false
    fetchAnswers()
  } catch (error) {
    console.error('Failed to accept answer:', error)
  } finally {
    updating.value = false
  }
}

const rejectAnswer = async (answer) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这个候选答案吗？', '确认拒绝', {
      type: 'warning'
    })
    
    await candidateAnswerApi.updateAnswer(answer.id, { status: 'REJECTED' })
    ElMessage.success('候选答案已拒绝')
    fetchAnswers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to reject answer:', error)
    }
  }
}

// Accept answer from detail dialog
const acceptAnswerFromDetail = () => {
  acceptAnswer(selectedAnswer.value)
}

// Reject answer from detail dialog
const rejectAnswerFromDetail = async () => {
  try {
    await ElMessageBox.confirm('确定要拒绝这个候选答案吗？', '确认拒绝', {
      type: 'warning'
    })
    
    updating.value = true
    await candidateAnswerApi.updateAnswer(selectedAnswer.value.id, { status: 'REJECTED' })
    ElMessage.success('候选答案已拒绝')
    showDetailDialog.value = false
    fetchAnswers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to reject answer:', error)
      ElMessage.error('拒绝失败，请重试')
    }
  } finally {
    updating.value = false
  }
}

const getAnswerContent = (answer) => {
  return answer.type === 'OBJECTIVE' ? answer.objAnswer : answer.subAnswer
}

const getStatusType = (status) => {
  const types = {
    'PENDING': '',
    'ACCEPTED': 'success',
    'REJECTED': 'danger'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': '待审核',
    'ACCEPTED': '已接受',
    'REJECTED': '已拒绝'
  }
  return texts[status] || status
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
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
}

.filters {
  margin-bottom: 20px;
}
</style> 