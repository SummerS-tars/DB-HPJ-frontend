<template>
  <div class="std-question-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>标准问题管理</h2>
          <div class="header-buttons">
            <el-button type="success" @click="showExportDialog = true">
              📤 导出标准问题
            </el-button>
            <el-button type="warning" @click="showExportQADialog = true">
              📤 导出问题和答案
            </el-button>
            <el-button type="primary" @click="showImportDialog = true">
              <el-icon><Plus /></el-icon>
              导入标准问题
            </el-button>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-select v-model="filters.type" placeholder="问题类型" clearable>
              <el-option label="客观题" value="OBJECTIVE" />
              <el-option label="主观题" value="SUBJECTIVE" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.status" placeholder="状态筛选" clearable>
              <el-option label="等待答案" value="WAITING_ANSWERS" />
              <el-option label="已回答" value="ANSWERED" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.version" placeholder="版本筛选" clearable>
              <el-option 
                v-for="version in commonStore.versions" 
                :key="version.version"
                :label="version.version" 
                :value="version.version" 
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input 
              v-model="filters.tags" 
              placeholder="标签筛选（逗号分隔）" 
              clearable 
            />
          </el-col>
          <el-col :span="6">
            <el-button @click="fetchQuestions">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
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
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'OBJECTIVE' ? 'success' : 'warning'" size="small">
              {{ row.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="问题内容" min-width="300">
          <template #default="{ row }">
            <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ row.content.substring(0, 100) }}{{ row.content.length > 100 ? '...' : '' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === 'ANSWERED' ? 'success' : ''"
              size="small"
            >
              {{ row.status === 'ANSWERED' ? '已回答' : '等待答案' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="版本" width="120">
          <template #default="{ row }">
            <el-tag 
              v-for="version in row.versions" 
              :key="version.version"
              size="small"
              style="margin-right: 5px"
            >
              {{ version.version }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="150">
          <template #default="{ row }">
            <el-tag 
              v-for="tag in row.tags" 
              :key="tag.tag"
              size="small"
              type="info"
              style="margin-right: 5px"
            >
              {{ tag.tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="原始问题ID" width="120">
          <template #default="{ row }">
            {{ row.originalRawQuestionId }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestion(row)">详情</el-button>
            <el-button size="small" type="primary" @click="manageTags(row)">
              标签
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
        @current-change="fetchQuestions"
        @size-change="fetchQuestions"
      />
    </el-card>

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入标准问题"
      width="700px"
    >
      <el-alert
        title="导入说明"
        type="info"
        style="margin-bottom: 20px"
        :closable="false"
      >
        <p>请上传JSON格式文件，文件应包含标准问题数组，每个问题对象包含以下字段：</p>
        <ul>
          <li><strong>originalRawQuestionId</strong>: 必需，关联的原始问题ID</li>
          <li><strong>type</strong>: 必需，"OBJECTIVE" 或 "SUBJECTIVE"</li>
          <li><strong>content</strong>: 必需，标准化后的问题内容</li>
          <li><strong>status</strong>: 可选，默认为 "WAITING_ANSWERS"</li>
          <li><strong>versionIds</strong>: 可选，版本ID数组</li>
          <li><strong>tagNames</strong>: 可选，标签名称数组</li>
        </ul>
      </el-alert>

      <el-form :model="importForm" label-width="150px">
        <el-form-item label="选择JSON文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".json"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">选择JSON文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                仅支持JSON格式文件，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="预览内容" v-if="previewData.length > 0">
          <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dcdfe6; padding: 10px; border-radius: 4px;">
            <div v-for="(item, index) in previewData.slice(0, 3)" :key="index" style="margin-bottom: 10px; padding: 10px; background: #f5f7fa; border-radius: 4px;">
              <div><strong>原始问题ID:</strong> {{ item.originalRawQuestionId }}</div>
              <div><strong>类型:</strong> {{ item.type }}</div>
              <div><strong>内容:</strong> {{ item.content.substring(0, 100) }}{{ item.content.length > 100 ? '...' : '' }}</div>
              <div v-if="item.versionIds && item.versionIds.length"><strong>版本:</strong> {{ item.versionIds.join(', ') }}</div>
              <div v-if="item.tagNames && item.tagNames.length"><strong>标签:</strong> {{ item.tagNames.join(', ') }}</div>
            </div>
            <div v-if="previewData.length > 3" style="text-align: center; color: #909399;">
              ... 共 {{ previewData.length }} 条记录，仅显示前3条
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="importing"
          :disabled="previewData.length === 0"
          @click="handleImport"
        >
          导入 ({{ previewData.length }} 条)
        </el-button>
      </template>
    </el-dialog>

    <!-- Export Dialog -->
    <el-dialog
      v-model="showExportDialog"
      title="导出标准问题"
      width="500px"
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="问题类型" required>
          <el-select v-model="exportForm.type" placeholder="选择问题类型" style="width: 100%">
            <el-option label="客观题" value="OBJECTIVE" />
            <el-option label="主观题" value="SUBJECTIVE" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="版本" required>
          <el-select v-model="exportForm.version" placeholder="选择版本" style="width: 100%">
            <el-option 
              v-for="version in commonStore.versions" 
              :key="version.version"
              :label="version.version" 
              :value="version.version" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签" label-suffix="(可选)">
          <el-select v-model="exportForm.tag" placeholder="选择标签（可选）" clearable style="width: 100%">
            <el-option 
              v-for="tag in commonStore.tags"
              :key="tag.tag"
              :label="tag.tag"
              :value="tag.tag"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预览文件名">
          <el-input 
            :value="generateFilename()" 
            readonly 
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="exporting"
          :disabled="!canExport"
          @click="handleExport"
        >
          导出
        </el-button>
      </template>
    </el-dialog>

    <!-- Export Questions & Answers Dialog -->
    <el-dialog
      v-model="showExportQADialog"
      title="导出标准问题和答案"
      width="500px"
    >
      <el-alert
        title="导出说明"
        type="info"
        style="margin-bottom: 20px"
        :closable="false"
      >
        <p>此功能将导出标准问题及其对应的已接受答案，格式为包含问题和答案的综合JSON文件。</p>
        <p><strong>注意：</strong>只有包含已接受答案的问题才会被导出。</p>
      </el-alert>

      <el-form :model="exportQAForm" label-width="100px">
        <el-form-item label="问题类型" required>
          <el-select v-model="exportQAForm.type" placeholder="选择问题类型" style="width: 100%">
            <el-option label="客观题" value="OBJECTIVE" />
            <el-option label="主观题" value="SUBJECTIVE" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="版本" required>
          <el-select v-model="exportQAForm.version" placeholder="选择版本" style="width: 100%">
            <el-option 
              v-for="version in commonStore.versions" 
              :key="version.version"
              :label="version.version" 
              :value="version.version" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签" label-suffix="(可选)">
          <el-select v-model="exportQAForm.tag" placeholder="选择标签（可选）" clearable style="width: 100%">
            <el-option 
              v-for="tag in commonStore.tags"
              :key="tag.tag"
              :label="tag.tag"
              :value="tag.tag"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预览文件名">
          <el-input 
            :value="generateQAFilename()" 
            readonly 
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showExportQADialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="exportingQA"
          :disabled="!canExportQA"
          @click="handleExportQA"
        >
          导出问题和答案
        </el-button>
      </template>
    </el-dialog>

    <!-- Question Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="标准问题详情"
      width="900px"
      max-height="80vh"
    >
      <div v-if="selectedQuestion">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedQuestion.id }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="selectedQuestion.type === 'OBJECTIVE' ? 'success' : 'warning'">
              {{ selectedQuestion.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedQuestion.status === 'ANSWERED' ? 'success' : ''">
              {{ selectedQuestion.status === 'ANSWERED' ? '已回答' : '等待答案' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(selectedQuestion.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="原始问题ID">
            <el-link 
              type="primary" 
              @click="viewRawQuestion(selectedQuestion.originalRawQuestionId)"
            >
              {{ selectedQuestion.originalRawQuestionId }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="版本信息">
            <el-tag 
              v-for="version in selectedQuestion.versions" 
              :key="version.version"
              size="small"
              style="margin-right: 5px"
            >
              {{ version.version }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标签" :span="2">
            <el-tag 
              v-for="tag in selectedQuestion.tags" 
              :key="tag.tag"
              size="small"
              type="info"
              style="margin-right: 5px"
            >
              {{ tag.tag }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="问题内容" :span="2">
            <div style="max-height: 300px; overflow-y: auto; padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
              <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0;">{{ selectedQuestion.content }}</pre>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Original Raw Question Details -->
        <el-divider content-position="left">原始问题详情</el-divider>
        <div v-if="selectedQuestion.originalRawQuestion">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="原始标题">
              {{ selectedQuestion.originalRawQuestion.title }}
            </el-descriptions-item>
            <el-descriptions-item label="来源平台">
              {{ selectedQuestion.originalRawQuestion.sourcePlatform }}
            </el-descriptions-item>
            <el-descriptions-item label="帖子ID">
              {{ selectedQuestion.originalRawQuestion.postId }}
            </el-descriptions-item>
            <el-descriptions-item label="评分">
              {{ selectedQuestion.originalRawQuestion.score }}
            </el-descriptions-item>
            <el-descriptions-item label="原始标签" :span="2">
              {{ selectedQuestion.originalRawQuestion.tags }}
            </el-descriptions-item>
            <el-descriptions-item label="原始内容" :span="2">
              <div style="max-height: 200px; overflow-y: auto; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
                <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0;">{{ selectedQuestion.originalRawQuestion.content }}</pre>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- Tag Management Dialog -->
    <el-dialog
      v-model="showTagDialog"
      title="标签管理"
      width="500px"
    >
      <div v-if="selectedQuestion">
        <div style="margin-bottom: 20px">
          <h4>当前标签：</h4>
          <el-tag 
            v-for="tag in selectedQuestion.tags"
            :key="tag.tag"
            closable
            @close="removeTag(tag.tag)"
            style="margin-right: 10px; margin-bottom: 10px"
          >
            {{ tag.tag }}
          </el-tag>
        </div>
        
        <div>
          <h4>添加标签：</h4>
          <el-row :gutter="10">
            <el-col :span="18">
              <el-select v-model="newTagName" placeholder="选择标签">
                <el-option 
                  v-for="tag in availableTags"
                  :key="tag.tag"
                  :label="tag.tag"
                  :value="tag.tag"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="addTag">添加</el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { standardQuestionApi } from '@/services/standardData'
import { useCommonStore } from '@/stores/common'

const commonStore = useCommonStore()

const questions = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showImportDialog = ref(false)
const showExportDialog = ref(false)
const showExportQADialog = ref(false)
const showDetailDialog = ref(false)
const showTagDialog = ref(false)
const importing = ref(false)
const exporting = ref(false)
const exportingQA = ref(false)
const selectedQuestion = ref(null)
const newTagName = ref('')
const previewData = ref([])

const filters = reactive({
  type: 'OBJECTIVE',
  status: '',
  version: '',
  tags: '',
  originalRawQuestionId: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  sortBy: 'id',
  sortDirection: 'asc'
})

const importForm = reactive({
  file: null
})

const exportForm = reactive({
  type: '',
  version: '',
  tag: ''
})

const exportQAForm = reactive({
  type: '',
  version: '',
  tag: ''
})

const availableTags = computed(() => {
  if (!selectedQuestion.value) return commonStore.tags
  const currentTags = selectedQuestion.value.tags.map(t => t.tag)
  return commonStore.tags.filter(tag => !currentTags.includes(tag.tag))
})

const canExport = computed(() => {
  return exportForm.type && exportForm.version
})

const canExportQA = computed(() => {
  return exportQAForm.type && exportQAForm.version
})

const generateFilename = () => {
  if (!canExport.value) return '请选择所有必需参数'
  const type = exportForm.type.toLowerCase()
  const version = exportForm.version
  const tag = exportForm.tag ? exportForm.tag.toLowerCase() : 'all'
  return `${version}_${type}_${tag}.json`
}

const generateQAFilename = () => {
  if (!canExportQA.value) return '请选择所有必需参数'
  const type = exportQAForm.type.toLowerCase()
  const version = exportQAForm.version
  const tag = exportQAForm.tag ? `_${exportQAForm.tag.toLowerCase()}` : ''
  return `${version}_${type}${tag}_std_q_a.json`
}

const fetchQuestions = async () => {
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

    const response = await standardQuestionApi.getQuestions(params)
    console.log('API Response:', response.data) // Debug log
    
    // Fix data access path to match API response structure
    const responseData = response.data.data || response.data
    questions.value = responseData.content || []
    totalElements.value = responseData.totalElements || 0
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    ElMessage.error('获取标准问题列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.type = 'OBJECTIVE' // Reset to default
  filters.status = ''
  filters.version = ''
  filters.tags = ''
  filters.originalRawQuestionId = ''
  fetchQuestions()
}

const handleFileChange = (file) => {
  importForm.file = file.raw
  parseJsonFile(file.raw)
}

const beforeUpload = (file) => {
  const isJSON = file.type === 'application/json' || file.name.endsWith('.json')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isJSON) {
    ElMessage.error('只能上传JSON格式文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return false // 阻止自动上传
}

const parseJsonFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result)
      
      if (!Array.isArray(jsonData)) {
        ElMessage.error('JSON文件格式错误：根元素必须是数组')
        previewData.value = []
        return
      }

      // 验证数据格式
      const validatedData = jsonData.map((item, index) => {
        if (!item.originalRawQuestionId) {
          throw new Error(`第${index + 1}条记录缺少必需字段: originalRawQuestionId`)
        }
        if (!item.type || !['OBJECTIVE', 'SUBJECTIVE'].includes(item.type)) {
          throw new Error(`第${index + 1}条记录type字段无效，必须是 OBJECTIVE 或 SUBJECTIVE`)
        }
        if (!item.content) {
          throw new Error(`第${index + 1}条记录缺少必需字段: content`)
        }

        return {
          originalRawQuestionId: item.originalRawQuestionId,
          type: item.type,
          content: item.content,
          status: item.status || 'WAITING_ANSWERS',
          versionIds: item.versionIds || [],
          tagNames: item.tagNames || []
        }
      })

      previewData.value = validatedData
      ElMessage.success(`成功解析 ${validatedData.length} 条标准问题`)
      
    } catch (error) {
      ElMessage.error(`JSON文件解析失败: ${error.message}`)
      previewData.value = []
    }
  }
  reader.readAsText(file)
}

const handleImport = async () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('请先选择并解析JSON文件')
    return
  }

  importing.value = true
  try {
    const response = await standardQuestionApi.importQuestions(previewData.value)
    ElMessage.success(`导入成功！共导入 ${previewData.value.length} 条记录`)
    showImportDialog.value = false
    previewData.value = []
    importForm.file = null
    fetchQuestions()
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    importing.value = false
  }
}

const handleExport = async () => {
  if (!canExport.value) {
    ElMessage.warning('请选择类型和版本参数')
    return
  }

  exporting.value = true
  try {
    const response = await standardQuestionApi.exportQuestions(
      exportForm.type,
      exportForm.version,
      exportForm.tag
    )

    // Get filename from Content-Disposition header or generate it
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = generateFilename()
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Create blob and trigger download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功！')
    showExportDialog.value = false
    
    // Reset export form
    exportForm.type = ''
    exportForm.version = ''
    exportForm.tag = ''
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败：' + (error.message || '未知错误'))
  } finally {
    exporting.value = false
  }
}

const handleExportQA = async () => {
  if (!canExportQA.value) {
    ElMessage.warning('请选择类型和版本参数')
    return
  }

  exportingQA.value = true
  try {
    const response = await standardQuestionApi.exportQuestionsWithAnswers(
      exportQAForm.type,
      exportQAForm.version,
      exportQAForm.tag || null
    )

    // Get filename from Content-Disposition header or generate it
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = generateQAFilename()
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Create blob and trigger download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出问题和答案成功！')
    showExportQADialog.value = false
    
    // Reset export form
    exportQAForm.type = ''
    exportQAForm.version = ''
    exportQAForm.tag = ''
  } catch (error) {
    console.error('Export Q&A failed:', error)
    ElMessage.error('导出失败：' + (error.message || '未知错误'))
  } finally {
    exportingQA.value = false
  }
}

const viewQuestion = (question) => {
  selectedQuestion.value = question
  showDetailDialog.value = true
}

const viewRawQuestion = (rawQuestionId) => {
  // Navigate to raw question detail or open in new tab
  window.open(`/raw-questions/${rawQuestionId}`, '_blank')
}

const manageTags = (question) => {
  selectedQuestion.value = question
  showTagDialog.value = true
}

const addTag = async () => {
  if (!newTagName.value) return

  try {
    await standardQuestionApi.addTag(selectedQuestion.value.id, newTagName.value)
    ElMessage.success('标签添加成功')
    newTagName.value = ''
    
    // Refresh the selected question data
    fetchQuestions()
    // Update the selected question in the dialog
    const updatedQuestion = questions.value.find(q => q.id === selectedQuestion.value.id)
    if (updatedQuestion) {
      selectedQuestion.value = updatedQuestion
    }
  } catch (error) {
    console.error('Failed to add tag:', error)
  }
}

const removeTag = async (tagName) => {
  try {
    await standardQuestionApi.removeTag(selectedQuestion.value.id, tagName)
    ElMessage.success('标签删除成功')
    
    // Refresh the data
    fetchQuestions()
    const updatedQuestion = questions.value.find(q => q.id === selectedQuestion.value.id)
    if (updatedQuestion) {
      selectedQuestion.value = updatedQuestion
    }
  } catch (error) {
    console.error('Failed to remove tag:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(async () => {
  await Promise.all([
    commonStore.fetchVersions(),
    commonStore.fetchTags(),
    fetchQuestions()
  ])
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

.header-buttons {
  display: flex;
  gap: 10px;
}
</style> 