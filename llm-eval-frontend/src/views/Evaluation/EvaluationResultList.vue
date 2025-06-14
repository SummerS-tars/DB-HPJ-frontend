<template>
  <div class="evaluation-result-list">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>评估结果管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="showImportDialog = true">
              <el-icon><Upload /></el-icon>
              导入结果
            </el-button>
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.evaluationTagId" placeholder="评估标签" clearable>
              <el-option 
                v-for="tag in evaluationTags" 
                :key="tag.tagId" 
                :label="`${tag.model || '未知模型'} v${tag.dataSetVersion || '未知版本'} (${tag.evaluationTime || 0}次)`" 
                :value="tag.tagId" 
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.type" placeholder="题目类型" clearable>
              <el-option label="客观题" value="OBJECTIVE" />
              <el-option label="主观题" value="SUBJECTIVE" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="状态筛选" clearable>
              <el-option label="待分析" value="PENDING" />
              <el-option label="已分析" value="ANALYZED" />
              <el-option label="已忽略" value="OMITTED" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="fetchResults">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table 
        :data="results" 
        :loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="stdQuestionId" label="标准问题ID" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'OBJECTIVE' ? 'success' : 'primary'" size="small">
              {{ row.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="LLM生成答案" min-width="300" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="evaluationTagId" label="评估标签ID" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewResult(row)">查看</el-button>
            <el-dropdown @command="handleStatusUpdate">
              <el-button size="small" type="primary">
                更新状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ id: row.id, status: 'ANALYZED' }">
                    标记为已分析
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
        @current-change="fetchResults"
        @size-change="fetchResults"
      />
    </el-card>

    <!-- Import Dialog -->
    <el-dialog
      v-model="showImportDialog"
      title="导入评估结果"
      width="600px"
    >
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="评估标签" required>
          <el-select v-model="importForm.evaluationTagId" placeholder="选择评估标签">
            <el-option 
              v-for="tag in evaluationTags" 
              :key="tag.tagId" 
              :label="`${tag.model || '未知模型'} v${tag.dataSetVersion || '未知版本'} (${tag.evaluationTime || 0}次)`" 
              :value="tag.tagId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="答案类型" required>
          <el-select v-model="importForm.type" placeholder="选择答案类型">
            <el-option label="客观题" value="OBJECTIVE" />
            <el-option label="主观题" value="SUBJECTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".json,.csv"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持JSON/CSV格式文件，文件大小不超过50MB
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

    <!-- Export Dialog -->
    <el-dialog
      v-model="showExportDialog"
      title="导出评估数据"
      width="500px"
    >
      <el-form :model="exportForm" label-width="120px">
        <el-form-item label="评估标签" required>
          <el-select v-model="exportForm.evaluationTagId" placeholder="选择评估标签">
            <el-option 
              v-for="tag in evaluationTags" 
              :key="tag.tagId" 
              :label="`${tag.model || '未知模型'} v${tag.dataSetVersion || '未知版本'} (${tag.evaluationTime || 0}次)`" 
              :value="tag.tagId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="答案类型">
          <el-select v-model="exportForm.type" placeholder="选择答案类型" clearable>
            <el-option label="客观题" value="OBJECTIVE" />
            <el-option label="主观题" value="SUBJECTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="JSON">JSON格式</el-radio>
            <el-radio label="CSV">CSV格式</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="exporting"
          @click="confirmExport"
        >
          导出
        </el-button>
      </template>
    </el-dialog>

    <!-- Result Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="评估结果详情"
      width="800px"
    >
      <div v-if="selectedResult">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedResult.id }}</el-descriptions-item>
          <el-descriptions-item label="标准问题ID">{{ selectedResult.stdQuestionId }}</el-descriptions-item>
          <el-descriptions-item label="评估标签ID">{{ selectedResult.evaluationTagId }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="selectedResult.type === 'OBJECTIVE' ? 'success' : 'primary'">
              {{ selectedResult.type === 'OBJECTIVE' ? '客观题' : '主观题' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedResult.status)">
              {{ getStatusText(selectedResult.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="LLM生成答案" :span="2">
            <div style="max-height: 300px; overflow-y: auto; white-space: pre-wrap;">
              {{ selectedResult.content }}
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
import { evaluationResultApi, evaluationTagApi } from '@/services/evaluation'

const results = ref([])
const evaluationTags = ref([])
const loading = ref(false)
const totalElements = ref(0)
const showImportDialog = ref(false)
const showExportDialog = ref(false)
const showDetailDialog = ref(false)
const importing = ref(false)
const exporting = ref(false)
const selectedResult = ref(null)

const filters = reactive({
  evaluationTagId: '',
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  sortBy: 'id',
  sortDirection: 'asc'
})

const importForm = reactive({
  evaluationTagId: '',
  type: '',
  file: null
})

const exportForm = reactive({
  evaluationTagId: '',
  type: '',
  format: 'JSON'
})

const fetchResults = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.size,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      ...filters
    }

    const response = await evaluationResultApi.getResults(params)
    results.value = response.data.data.content
    totalElements.value = response.data.data.totalElements
  } catch (error) {
    console.error('Failed to fetch results:', error)
    ElMessage.error('获取评估结果失败')
  } finally {
    loading.value = false
  }
}

const fetchEvaluationTags = async () => {
  try {
    const response = await evaluationTagApi.getTags()
    console.log('Evaluation Tags API Response:', response.data) // Debug log
    
    // The API response structure is { success: true, data: { content: [...], ... } }
    const data = response.data.data || response.data
    
    // Handle both paginated and non-paginated responses
    if (data.content) {
      // Paginated response
      evaluationTags.value = data.content
    } else if (Array.isArray(data)) {
      // Simple array response
      evaluationTags.value = data
    } else {
      // Fallback
      evaluationTags.value = []
    }
  } catch (error) {
    console.error('Failed to fetch evaluation tags:', error)
    ElMessage.error('获取评估标签失败')
  }
}

const handleFileChange = (file) => {
  importForm.file = file.raw
}

const handleImport = async () => {
  if (!importForm.file || !importForm.evaluationTagId || !importForm.type) {
    ElMessage.warning('请填写完整的导入信息')
    return
  }

  importing.value = true
  try {
    const response = await evaluationResultApi.importResults(
      importForm.file,
      importForm.evaluationTagId,
      importForm.type
    )
    
    const result = response.data.data || response.data
    const importedCount = result.importedCount || result.count || '未知数量'
    
    ElMessage.success(`导入完成！成功导入 ${importedCount} 条记录`)
    showImportDialog.value = false
    fetchResults()
  } catch (error) {
    console.error('Import failed:', error)
    ElMessage.error('导入失败，请检查文件格式')
  } finally {
    importing.value = false
  }
}

const handleExport = () => {
  showExportDialog.value = true
}

const confirmExport = async () => {
  if (!exportForm.evaluationTagId) {
    ElMessage.warning('请选择评估标签')
    return
  }

  exporting.value = true
  try {
    const params = {
      evaluationTagId: exportForm.evaluationTagId,
      type: exportForm.type,
      format: exportForm.format.toLowerCase()
    }

    const response = await evaluationResultApi.exportResults(params)
    
    // Create download link
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `evaluation_results_${exportForm.evaluationTagId}.${exportForm.format.toLowerCase()}`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
    showExportDialog.value = false
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const handleStatusUpdate = async ({ id, status }) => {
  try {
    await evaluationResultApi.updateStatus(id, status)
    ElMessage.success('状态更新成功')
    fetchResults()
  } catch (error) {
    console.error('Failed to update status:', error)
    ElMessage.error('状态更新失败')
  }
}

const viewResult = (result) => {
  selectedResult.value = result
  showDetailDialog.value = true
}

const getStatusType = (status) => {
  const types = {
    'PENDING': 'warning',
    'ANALYZED': 'success',
    'OMITTED': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': '待分析',
    'ANALYZED': '已分析',
    'OMITTED': '已忽略'
  }
  return texts[status] || status
}

onMounted(() => {
  fetchEvaluationTags()
  fetchResults()
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