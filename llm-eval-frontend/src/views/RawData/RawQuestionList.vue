<template>
  <div class="raw-question-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>原始问题管理</h2>
          <el-button type="primary" @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            导入问题
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="状态筛选" clearable>
              <el-option label="等待转换" value="WAITING_CONVERTED" />
              <el-option label="已转换" value="CONVERTED" />
              <el-option label="已忽略" value="OMITTED" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.sourcePlatform" placeholder="来源平台" clearable>
              <el-option label="StackOverflow" value="stackoverflow" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="pagination.sortBy" placeholder="排序字段">
              <el-option label="ID" value="id" />
              <el-option label="评分" value="score" />
              <el-option label="标题" value="title" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="fetchQuestions">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table 
        :data="questions" 
        :loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sourcePlatform" label="来源平台" width="120" />
        <el-table-column prop="tags" label="标签" min-width="150" show-overflow-tooltip />
        <el-table-column prop="score" label="评分" width="80" />
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
        <el-table-column prop="stdQuestionCount" label="标准问题数" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestion(row)">查看</el-button>
            <el-dropdown @command="handleStatusUpdate">
              <el-button size="small" type="primary">
                更新状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ id: row.id, status: 'CONVERTED' }">
                    标记为已转换
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ id: row.id, status: 'OMITTED' }">
                    标记为已忽略
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
        @current-change="fetchQuestions"
        @size-change="fetchQuestions"
      />
    </el-card>

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入原始问题"
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
                支持XML格式文件，文件大小不超过50MB
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

    <!-- Question Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="问题详情"
      width="800px"
    >
      <div v-if="selectedQuestion">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedQuestion.id }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ selectedQuestion.title }}</el-descriptions-item>
          <el-descriptions-item label="来源平台">{{ selectedQuestion.sourcePlatform }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ selectedQuestion.score }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedQuestion.status)">
              {{ getStatusText(selectedQuestion.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标签">{{ selectedQuestion.tags }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div style="max-height: 200px; overflow-y: auto;">
              {{ selectedQuestion.content }}
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
import { rawQuestionApi } from '@/services/rawQuestion'

const questions = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showImportDialog = ref(false)
const showDetailDialog = ref(false)
const importing = ref(false)
const selectedQuestion = ref(null)

const filters = reactive({
  status: '',
  sourcePlatform: ''
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

const fetchQuestions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page - 1, // Backend uses 0-based pagination
      size: pagination.size,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      ...filters
    }

    const response = await rawQuestionApi.getQuestions(params)
    questions.value = response.data.content
    totalElements.value = response.data.totalElements
  } catch (error) {
    console.error('Failed to fetch questions:', error)
  } finally {
    loading.value = false
  }
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
    const response = await rawQuestionApi.importQuestions(
      importForm.file, 
      importForm.sourcePlatform
    )
    
    ElMessage.success(`导入完成！成功导入 ${response.data.importedCount} 条记录`)
    showImportDialog.value = false
    fetchQuestions()
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    importing.value = false
  }
}

const handleStatusUpdate = async ({ id, status }) => {
  try {
    await rawQuestionApi.updateStatus(id, status)
    ElMessage.success('状态更新成功')
    fetchQuestions()
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}

const viewQuestion = (question) => {
  selectedQuestion.value = question
  showDetailDialog.value = true
}

const getStatusType = (status) => {
  const types = {
    'WAITING_CONVERTED': '',
    'CONVERTED': 'success',
    'OMITTED': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'WAITING_CONVERTED': '等待转换',
    'CONVERTED': '已转换',
    'OMITTED': '已忽略'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchQuestions()
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