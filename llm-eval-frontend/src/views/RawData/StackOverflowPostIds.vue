<template>
  <div class="stackoverflow-post-ids">
    <!-- Page Header -->
    <div class="page-header">
      <h2>StackOverflow Post IDs</h2>
      <p class="page-description">
        获取没有原始答案的StackOverflow问题的Post ID列表，用于数据收集和分析
      </p>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-button 
            type="primary" 
            @click="fetchPostIds"
            :loading="loading"
            icon="Search"
          >
            获取Post IDs
          </el-button>
          <el-button 
            type="success" 
            @click="downloadSimpleFormat"
            :disabled="!postIds.length"
            icon="Download"
          >
            下载简单格式
          </el-button>
          <el-button 
            type="info" 
            @click="downloadFullFormat"
            :disabled="!postIds.length"
            icon="Download"
          >
            下载完整格式
          </el-button>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-tag v-if="totalCount > 0" type="info" size="large">
            总计: {{ totalCount }} 个问题
          </el-tag>
        </el-col>
      </el-row>
    </div>

    <!-- Statistics Cards -->
    <el-row :gutter="20" class="stats-cards" v-if="postIds.length > 0">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ totalCount }}</div>
            <div class="stat-label">问题总数</div>
          </div>
          <el-icon class="stat-icon"><Document /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ postIds.length }}</div>
            <div class="stat-label">已加载Post IDs</div>
          </div>
          <el-icon class="stat-icon"><List /></el-icon>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ formatDate(lastUpdated) }}</div>
            <div class="stat-label">最后更新</div>
          </div>
          <el-icon class="stat-icon"><Clock /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- Post IDs Display -->
    <el-card class="post-ids-card" v-if="postIds.length > 0">
      <template #header>
        <div class="card-header">
          <span>Post IDs 列表</span>
          <div class="header-actions">
            <el-button size="small" @click="copyToClipboard" icon="CopyDocument">
              复制到剪贴板
            </el-button>
            <el-button size="small" @click="toggleView" :icon="viewMode === 'grid' ? 'List' : 'Grid'">
              {{ viewMode === 'grid' ? '列表视图' : '网格视图' }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="post-ids-grid">
        <el-tag 
          v-for="postId in displayedPostIds" 
          :key="postId"
          class="post-id-tag"
          type="info"
          effect="plain"
        >
          {{ postId }}
        </el-tag>
      </div>

      <!-- List View -->
      <div v-else class="post-ids-list">
        <el-table :data="paginatedPostIds" stripe>
          <el-table-column prop="index" label="序号" width="80" />
          <el-table-column prop="postId" label="Post ID" />
          <el-table-column label="StackOverflow链接" width="200">
            <template #default="{ row }">
              <el-link 
                :href="`https://stackoverflow.com/questions/${row.postId}`" 
                target="_blank"
                type="primary"
              >
                查看问题
              </el-link>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- Pagination -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100, 200]"
            :total="postIds.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- Show More Button for Grid View -->
      <div v-if="viewMode === 'grid' && postIds.length > displayLimit" class="show-more-container">
        <el-button @click="showMore" v-if="displayLimit < postIds.length">
          显示更多 ({{ postIds.length - displayLimit }} 个剩余)
        </el-button>
        <el-button @click="showLess" v-if="displayLimit > 50">
          显示更少
        </el-button>
      </div>
    </el-card>

    <!-- Empty State -->
    <el-empty 
      v-if="!loading && postIds.length === 0" 
      description="暂无数据，请点击【获取Post IDs】按钮加载数据"
      :image-size="200"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { rawQuestionApi } from '@/services/rawQuestion'

// Reactive data
const loading = ref(false)
const postIds = ref([])
const totalCount = ref(0)
const lastUpdated = ref(null)
const viewMode = ref('grid') // 'grid' or 'list'
const displayLimit = ref(50)
const currentPage = ref(1)
const pageSize = ref(20)

// Computed properties
const displayedPostIds = computed(() => {
  return postIds.value.slice(0, displayLimit.value)
})

const paginatedPostIds = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return postIds.value.slice(start, end).map((postId, index) => ({
    index: start + index + 1,
    postId
  }))
})

// Methods
const fetchPostIds = async () => {
  loading.value = true
  try {
    const response = await rawQuestionApi.getStackOverflowPostIds()
    
    if (response.data.success) {
      const data = response.data.data
      postIds.value = data.postIds || []
      totalCount.value = data.totalCount || postIds.value.length
      lastUpdated.value = new Date()
      
      ElMessage.success(`成功获取 ${totalCount.value} 个StackOverflow问题的Post ID`)
    } else {
      throw new Error(response.data.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取Post IDs失败:', error)
    ElMessage.error('获取Post IDs失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const downloadSimpleFormat = async () => {
  try {
    const response = await rawQuestionApi.downloadStackOverflowPostIdsSimple()
    downloadFile(response, 'stackoverflow_raw_questions_postIds.json')
    ElMessage.success('简单格式文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

const downloadFullFormat = async () => {
  try {
    const response = await rawQuestionApi.downloadStackOverflowPostIds()
    downloadFile(response, `stackoverflow_post_ids_full_${formatDateForFilename(new Date())}.json`)
    ElMessage.success('完整格式文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

const downloadFile = (response, filename) => {
  const blob = new Blob([response.data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const copyToClipboard = async () => {
  try {
    const text = JSON.stringify({ postIds: postIds.value }, null, 2)
    await navigator.clipboard.writeText(text)
    ElMessage.success('Post IDs已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动选择复制')
  }
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const showMore = () => {
  displayLimit.value = Math.min(displayLimit.value + 50, postIds.value.length)
}

const showLess = () => {
  displayLimit.value = Math.max(50, displayLimit.value - 50)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const formatDateForFilename = (date) => {
  return date.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
}

// Lifecycle
onMounted(() => {
  // Auto-fetch data on component mount
  fetchPostIds()
})
</script>

<style scoped>
.stackoverflow-post-ids {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-description {
  color: #606266;
  margin: 0;
  font-size: 14px;
}

.action-bar {
  margin-bottom: 20px;
}

.text-right {
  text-align: right;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  color: #E4E7ED;
  z-index: 1;
}

.post-ids-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.post-ids-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.post-id-tag {
  margin: 0;
  cursor: pointer;
  transition: all 0.3s;
}

.post-id-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-ids-list {
  max-height: 600px;
  overflow-y: auto;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.show-more-container {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.loading-container {
  padding: 40px;
}

/* Responsive design */
@media (max-width: 768px) {
  .stats-cards .el-col {
    margin-bottom: 16px;
  }
  
  .post-ids-grid {
    max-height: 300px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 