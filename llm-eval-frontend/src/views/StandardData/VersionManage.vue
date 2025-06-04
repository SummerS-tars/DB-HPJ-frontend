<template>
  <div class="version-manage">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>版本管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建版本
          </el-button>
        </div>
      </template>

      <el-table :data="commonStore.versions" :loading="commonStore.loading.versions">
        <el-table-column prop="version" label="版本号" />
        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Create Version Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新版本"
      width="400px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="版本号" required>
          <el-input 
            v-model="createForm.version" 
            placeholder="例如: 1.0, 1.1-alpha"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommonStore } from '@/stores/common'

const commonStore = useCommonStore()

const showCreateDialog = ref(false)
const creating = ref(false)

const createForm = reactive({
  version: ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleCreate = async () => {
  if (!createForm.version.trim()) {
    ElMessage.warning('请输入版本号')
    return
  }

  creating.value = true
  try {
    await commonStore.createVersion(createForm.version)
    ElMessage.success('版本创建成功')
    showCreateDialog.value = false
    createForm.version = ''
  } catch (error) {
    console.error('Failed to create version:', error)
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  commonStore.fetchVersions()
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
</style> 