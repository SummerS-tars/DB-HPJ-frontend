<template>
  <div class="analysis-tag-manage">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>分析标签管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建分析标签
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.evaluationTagId" placeholder="评估标签筛选" clearable>
              <el-option 
                v-for="tag in evaluationTags" 
                :key="tag.tagId" 
                :label="`${tag.model || '未知模型'} v${tag.dataSetVersion || '未知版本'} (${tag.evaluationTime || 0}次)`" 
                :value="tag.tagId" 
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input 
              v-model="filters.model" 
              placeholder="分析模型筛选" 
              clearable 
            />
          </el-col>
          <el-col :span="6">
            <el-button @click="fetchTags">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table 
        :data="tags" 
        :loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="analysisTagId" label="ID" width="80" />
        <el-table-column prop="model" label="分析模型" min-width="150" />
        <el-table-column prop="evaluationTagModel" label="评估模型" min-width="150" />
        <el-table-column prop="analysisTime" label="分析轮次" width="100" />
        <el-table-column label="评估标签" width="200">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewEvaluationTag(row.evaluationTagId)"
            >
              ID: {{ row.evaluationTagId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="分析结果数量" width="120">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewAnalysisResults(row.analysisTagId)"
            >
              {{ row.analysisCount || 0 }} 条
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewTag(row)">详情</el-button>
            <el-button size="small" type="primary" @click="editTag(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTag(row)">删除</el-button>
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
        @current-change="fetchTags"
        @size-change="fetchTags"
      />
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingTag ? '编辑分析标签' : '创建分析标签'"
      width="600px"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-form-item label="评估标签" prop="evaluationTagId">
          <el-select 
            v-model="createForm.evaluationTagId" 
            placeholder="选择评估标签" 
            style="width: 100%"
            :disabled="editingTag"
          >
            <el-option 
              v-for="tag in evaluationTags" 
              :key="tag.tagId" 
              :label="`${tag.model || '未知模型'} v${tag.dataSetVersion || '未知版本'} (${tag.evaluationTime || 0}次)`" 
              :value="tag.tagId" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分析模型" prop="model">
          <el-input 
            v-model="createForm.model" 
            placeholder="请输入分析模型名称，如 gpt-4" 
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="分析轮次" prop="analysisTime">
          <el-input-number 
            v-model="createForm.analysisTime" 
            :min="1" 
            placeholder="分析轮次" 
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="creating"
          @click="handleCreateOrUpdate"
        >
          {{ editingTag ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="分析标签详情"
      width="700px"
    >
      <div v-if="selectedTag">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分析标签ID">{{ selectedTag.analysisTagId }}</el-descriptions-item>
          <el-descriptions-item label="评估标签ID">{{ selectedTag.evaluationTagId }}</el-descriptions-item>
          <el-descriptions-item label="分析模型">{{ selectedTag.model }}</el-descriptions-item>
          <el-descriptions-item label="评估模型">{{ selectedTag.evaluationTagModel }}</el-descriptions-item>
          <el-descriptions-item label="分析轮次">{{ selectedTag.analysisTime }}</el-descriptions-item>
          <el-descriptions-item label="分析结果数量">{{ selectedTag.analysisCount || 0 }} 条</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(selectedTag.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px; text-align: center;">
          <el-button 
            type="primary" 
            @click="viewAnalysisResults(selectedTag.analysisTagId)"
          >
            查看分析结果
          </el-button>
          <el-button 
            type="success" 
            @click="viewStatistics(selectedTag.analysisTagId)"
          >
            查看统计信息
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { analysisTagApi, evaluationTagApi } from '@/services/evaluation'

const router = useRouter()

const tags = ref([])
const evaluationTags = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const creating = ref(false)
const selectedTag = ref(null)
const editingTag = ref(null)
const createFormRef = ref()

const filters = reactive({
  evaluationTagId: '',
  model: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  sortBy: 'analysisTagId',
  sortDir: 'desc'
})

const createForm = reactive({
  evaluationTagId: '',
  model: '',
  analysisTime: 1
})

const createRules = {
  evaluationTagId: [
    { required: true, message: '请选择评估标签', trigger: 'change' }
  ],
  model: [
    { required: true, message: '请输入分析模型名称', trigger: 'blur' },
    { max: 100, message: '模型名称不能超过100个字符', trigger: 'blur' }
  ],
  analysisTime: [
    { required: true, message: '请输入分析轮次', trigger: 'blur' },
    { type: 'number', min: 1, message: '分析轮次必须大于0', trigger: 'blur' }
  ]
}

const fetchTags = async () => {
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
      if (params[key] === '') delete params[key]
    })

    const response = await analysisTagApi.getTags(params)
    console.log('Analysis Tags API Response:', response.data)
    
    const data = response.data.data || response.data
    
    if (data.content) {
      // Paginated response
      tags.value = data.content
      totalElements.value = data.totalElements
    } else if (Array.isArray(data)) {
      // Simple array response
      tags.value = data
      totalElements.value = data.length
    } else {
      tags.value = []
      totalElements.value = 0
    }
  } catch (error) {
    console.error('Failed to fetch analysis tags:', error)
    ElMessage.error('获取分析标签失败')
  } finally {
    loading.value = false
  }
}

const fetchEvaluationTags = async () => {
  try {
    const response = await evaluationTagApi.getTags()
    const data = response.data.data || response.data
    
    if (data.content) {
      evaluationTags.value = data.content
    } else if (Array.isArray(data)) {
      evaluationTags.value = data
    } else {
      evaluationTags.value = []
    }
  } catch (error) {
    console.error('Failed to fetch evaluation tags:', error)
    ElMessage.error('获取评估标签失败')
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  pagination.page = 1
  fetchTags()
}

const handleCreateOrUpdate = async () => {
  try {
    await createFormRef.value.validate()
    
    creating.value = true
    
    if (editingTag.value) {
      // Update existing tag
      await analysisTagApi.updateTag(editingTag.value.analysisTagId, createForm)
      ElMessage.success('分析标签更新成功')
    } else {
      // Create new tag
      await analysisTagApi.createTag(createForm)
      ElMessage.success('分析标签创建成功')
    }
    
    showCreateDialog.value = false
    resetCreateForm()
    fetchTags()
  } catch (error) {
    console.error('Failed to create/update analysis tag:', error)
    ElMessage.error('操作失败：' + (error.response?.data?.message || '未知错误'))
  } finally {
    creating.value = false
  }
}

const resetCreateForm = () => {
  Object.keys(createForm).forEach(key => {
    if (key === 'analysisTime') {
      createForm[key] = 1
    } else {
      createForm[key] = ''
    }
  })
  editingTag.value = null
}

const viewTag = (tag) => {
  selectedTag.value = tag
  showDetailDialog.value = true
}

const editTag = (tag) => {
  editingTag.value = tag
  createForm.evaluationTagId = tag.evaluationTagId
  createForm.model = tag.model
  createForm.analysisTime = tag.analysisTime
  showCreateDialog.value = true
}

const deleteTag = async (tag) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个分析标签吗？删除后相关的分析结果也将被删除。', 
      '确认删除', 
      { type: 'warning' }
    )
    
    await analysisTagApi.deleteTag(tag.analysisTagId)
    ElMessage.success('分析标签删除成功')
    fetchTags()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete analysis tag:', error)
      ElMessage.error('删除失败')
    }
  }
}

const viewEvaluationTag = (evaluationTagId) => {
  router.push(`/evaluation-tags?highlight=${evaluationTagId}`)
}

const viewAnalysisResults = (analysisTagId) => {
  router.push(`/evaluation-analysis?analysisTagId=${analysisTagId}`)
}

const viewStatistics = (analysisTagId) => {
  router.push(`/statistics?analysisTagId=${analysisTagId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchEvaluationTags()
  fetchTags()
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