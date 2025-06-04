<template>
  <div class="std-question-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>标准问题管理</h2>
          <el-button type="primary" @click="showImportDialog = true">
            <el-icon><Plus /></el-icon>
            导入标准问题
          </el-button>
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
        <el-table-column prop="content" label="问题内容" min-width="300" show-overflow-tooltip />
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
            <el-link 
              type="primary" 
              @click="viewRawQuestion(row.originalRawQuestionId)"
            >
              {{ row.originalRawQuestionId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestion(row)">查看</el-button>
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
      <el-form :model="importForm" label-width="150px">
        <el-form-item label="原始问题ID" required>
          <el-input 
            v-model.number="importForm.originalRawQuestionId" 
            placeholder="必须关联一个原始问题ID"
            type="number"
          />
        </el-form-item>
        <el-form-item label="问题类型" required>
          <el-select v-model="importForm.type">
            <el-option label="客观题" value="OBJECTIVE" />
            <el-option label="主观题" value="SUBJECTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题内容" required>
          <el-input 
            v-model="importForm.content" 
            type="textarea" 
            :rows="4"
            placeholder="标准化后的问题内容"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="importForm.status">
            <el-option label="等待答案" value="WAITING_ANSWERS" />
            <el-option label="已回答" value="ANSWERED" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联版本">
          <el-select v-model="importForm.versionIds" multiple>
            <el-option 
              v-for="version in commonStore.versions"
              :key="version.version"
              :label="version.version"
              :value="version.version"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联标签">
          <el-select v-model="importForm.tagNames" multiple>
            <el-option 
              v-for="tag in commonStore.tags"
              :key="tag.tag"
              :label="tag.tag"
              :value="tag.tag"
            />
          </el-select>
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
      title="标准问题详情"
      width="800px"
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
          <el-descriptions-item label="原始问题ID">
            {{ selectedQuestion.originalRawQuestionId }}
          </el-descriptions-item>
          <el-descriptions-item label="问题内容" :span="2">
            <div style="max-height: 200px; overflow-y: auto;">
              {{ selectedQuestion.content }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
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
const showDetailDialog = ref(false)
const showTagDialog = ref(false)
const importing = ref(false)
const selectedQuestion = ref(null)
const newTagName = ref('')

const filters = reactive({
  type: '',
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
  originalRawQuestionId: null,
  type: 'OBJECTIVE',
  content: '',
  status: 'WAITING_ANSWERS',
  versionIds: [],
  tagNames: []
})

const availableTags = computed(() => {
  if (!selectedQuestion.value) return commonStore.tags
  const currentTags = selectedQuestion.value.tags.map(t => t.tag)
  return commonStore.tags.filter(tag => !currentTags.includes(tag.tag))
})

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
    questions.value = response.data.content
    totalElements.value = response.data.totalElements
  } catch (error) {
    console.error('Failed to fetch questions:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  fetchQuestions()
}

const handleImport = async () => {
  if (!importForm.originalRawQuestionId || !importForm.content) {
    ElMessage.warning('请填写必需字段')
    return
  }

  importing.value = true
  try {
    const response = await standardQuestionApi.importQuestions([importForm])
    ElMessage.success('导入成功')
    showImportDialog.value = false
    fetchQuestions()
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    importing.value = false
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
</style> 