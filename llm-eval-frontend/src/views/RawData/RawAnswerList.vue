<template>
  <div class="raw-answer-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>原始答案管理</h2>
          <el-button type="primary" @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            导入答案
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.sourcePlatform" placeholder="来源平台" clearable>
              <el-option label="StackOverflow" value="stackoverflow" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input 
              v-model="filters.rawQuestionId" 
              placeholder="原始问题ID" 
              clearable 
              type="number"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="pagination.sortBy" placeholder="排序字段">
              <el-option label="ID" value="id" />
              <el-option label="评分" value="score" />
              <el-option label="问题ID" value="rawQuestionId" />
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
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="rawQuestionId" label="原始问题ID" width="120">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewRawQuestion(row.rawQuestionId)"
            >
              {{ row.rawQuestionId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="答案内容" min-width="400" show-overflow-tooltip />
        <el-table-column prop="sourcePlatform" label="来源平台" width="120" />
        <el-table-column prop="score" label="评分" width="80" />
        <el-table-column prop="postId" label="平台ID" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewAnswer(row)">查看</el-button>
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

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入原始答案"
      width="600px"
    >
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="来源平台">
          <el-select v-model="importForm.sourcePlatform">
            <el-option label="StackOverflow" value="stackoverflow" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xml,.csv"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持CSV格式文件，需要包含ParentId字段关联原始问题
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
      title="答案详情"
      width="800px"
    >
      <div v-if="selectedAnswer">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedAnswer.id }}</el-descriptions-item>
          <el-descriptions-item label="原始问题ID">{{ selectedAnswer.rawQuestionId }}</el-descriptions-item>
          <el-descriptions-item label="来源平台">{{ selectedAnswer.sourcePlatform }}</el-descriptions-item>
          <el-descriptions-item label="平台ID">{{ selectedAnswer.postId }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ selectedAnswer.score }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedAnswer.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="答案内容" :span="2">
            <div style="max-height: 300px; overflow-y: auto; white-space: pre-wrap;">
              {{ selectedAnswer.content }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { rawAnswerApi } from '@/services/rawQuestion'

const answers = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showImportDialog = ref(false)
const showDetailDialog = ref(false)
const importing = ref(false)
const selectedAnswer = ref(null)

const filters = reactive({
  sourcePlatform: '',
  rawQuestionId: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  sortBy: 'id',
  sortDirection: 'asc'
})

const importForm = reactive({
  sourcePlatform: 'stackoverflow',
  file: null
})

const fetchAnswers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.size,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      ...filters
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '') delete params[key]
    })

    const response = await rawAnswerApi.getAnswers(params)
    // Fix data access path to match API response structure: { success: true, data: { content: [...], totalElements: N } }
    const responseData = response.data.data || response.data
    answers.value = responseData.content || []
    totalElements.value = responseData.totalElements || 0
  } catch (error) {
    console.error('Failed to fetch answers:', error)
    ElMessage.error('获取原始答案列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
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
    const response = await rawAnswerApi.importAnswers(
      importForm.file, 
      importForm.sourcePlatform
    )
    
    // Fix data access path for import response
    const importResult = response.data.data || response.data
    const importedCount = importResult.importedCount || importResult.count || '未知数量'
    ElMessage.success(`导入完成！成功导入 ${importedCount} 条记录`)
    showImportDialog.value = false
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

const viewRawQuestion = (rawQuestionId) => {
  // Navigate to raw question detail or open in new tab
  window.open(`/raw-questions/${rawQuestionId}`, '_blank')
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