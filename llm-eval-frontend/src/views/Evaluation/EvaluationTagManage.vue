<template>
  <div class="evaluation-tag-manage">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>评估标签管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建评估标签
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.dataSetVersion" placeholder="数据集版本" clearable>
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
              v-model="filters.model" 
              placeholder="模型名称" 
              clearable 
            />
          </el-col>
          <el-col :span="6">
            <el-input 
              v-model="filters.evaluationTime" 
              placeholder="评估轮次" 
              clearable 
              type="number"
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
        <el-table-column prop="tagId" label="ID" width="80" />
        <el-table-column prop="dataSetVersion" label="数据集版本" width="150" />
        <el-table-column prop="evaluationTime" label="评估轮次" width="120" />
        <el-table-column prop="model" label="模型名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="评估结果数量" width="120">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              @click="viewResults(row.tagId)"
            >
              {{ row.resultCount || 0 }} 条
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewTag(row)">查看</el-button>
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

    <!-- Create Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建评估标签"
      width="600px"
    >
      <el-form 
        :model="createForm" 
        :rules="createRules"
        ref="createFormRef"
        label-width="120px"
      >
        <el-form-item label="数据集版本" prop="dataSetVersion" required>
          <el-select 
            v-model="createForm.dataSetVersion" 
            placeholder="选择数据集版本"
            style="width: 100%"
          >
            <el-option 
              v-for="version in commonStore.versions"
              :key="version.version"
              :label="version.version"
              :value="version.version"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评估轮次" prop="evaluationTime" required>
          <el-input-number 
            v-model="createForm.evaluationTime" 
            :min="1"
            placeholder="评估轮次（整数）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="模型名称" prop="model" required>
          <el-input 
            v-model="createForm.model" 
            placeholder="如：GPT-4-Turbo, Claude-3-Sonnet"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="createForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="可选：评估标签的详细描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="creating"
          @click="handleCreate"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="评估标签详情"
      width="700px"
    >
      <div v-if="selectedTag">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedTag.tagId }}</el-descriptions-item>
          <el-descriptions-item label="数据集版本">{{ selectedTag.dataSetVersion }}</el-descriptions-item>
          <el-descriptions-item label="评估轮次">{{ selectedTag.evaluationTime }}</el-descriptions-item>
          <el-descriptions-item label="模型名称">{{ selectedTag.model }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedTag.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="评估结果数量">{{ selectedTag.resultCount || 0 }} 条</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            <div style="max-height: 150px; overflow-y: auto; white-space: pre-wrap;">
              {{ selectedTag.description || '无描述' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px; text-align: center;">
          <el-button 
            type="primary" 
            @click="viewResults(selectedTag.tagId)"
          >
            查看评估结果
          </el-button>
          <el-button 
            type="success" 
            @click="createAnalysisTag(selectedTag.tagId)"
          >
            创建分析标签
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
import { evaluationTagApi } from '@/services/evaluation'
import { useCommonStore } from '@/stores/common'

const router = useRouter()
const commonStore = useCommonStore()

const tags = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const creating = ref(false)
const selectedTag = ref(null)
const createFormRef = ref()

const filters = reactive({
  dataSetVersion: '',
  model: '',
  evaluationTime: ''
})

const pagination = reactive({
  page: 1,
  size: 20
})

const createForm = reactive({
  dataSetVersion: '',
  evaluationTime: 1,
  model: '',
  description: ''
})

const createRules = {
  dataSetVersion: [
    { required: true, message: '请选择数据集版本', trigger: 'change' }
  ],
  evaluationTime: [
    { required: true, message: '请输入评估轮次', trigger: 'blur' },
    { type: 'number', min: 1, message: '评估轮次必须大于0', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ]
}

const fetchTags = async () => {
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

    const response = await evaluationTagApi.getTags(params)
    // The API response structure is { success: true, data: { content: [...], ... } }
    const data = response.data.data || response.data
    
    // Handle both paginated and non-paginated responses
    if (data.content) {
      // Paginated response
      tags.value = data.content
      totalElements.value = data.totalElements
    } else if (Array.isArray(data)) {
      // Simple array response
      tags.value = data
      totalElements.value = data.length
    } else {
      // Fallback
      tags.value = []
      totalElements.value = 0
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    ElMessage.error('获取评估标签失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  fetchTags()
}

const handleCreate = async () => {
  try {
    await createFormRef.value.validate()
    
    creating.value = true
    await evaluationTagApi.createTag(createForm)
    
    ElMessage.success('评估标签创建成功')
    showCreateDialog.value = false
    
    // Reset form
    Object.keys(createForm).forEach(key => {
      if (key === 'evaluationTime') {
        createForm[key] = 1
      } else {
        createForm[key] = ''
      }
    })
    
    fetchTags()
  } catch (error) {
    console.error('Failed to create tag:', error)
  } finally {
    creating.value = false
  }
}

const viewTag = (tag) => {
  selectedTag.value = tag
  showDetailDialog.value = true
}

const deleteTag = async (tag) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个评估标签吗？删除后相关的评估结果也将无法访问。', 
      '确认删除', 
      { type: 'warning' }
    )
    
    await evaluationTagApi.deleteTag(tag.tagId)
    ElMessage.success('评估标签删除成功')
    fetchTags()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete tag:', error)
    }
  }
}

const viewResults = (tagId) => {
  router.push(`/evaluation-results?evaluationTagId=${tagId}`)
}

const createAnalysisTag = (tagId) => {
  router.push(`/analysis-tags?evaluationTagId=${tagId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  commonStore.fetchVersions()
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