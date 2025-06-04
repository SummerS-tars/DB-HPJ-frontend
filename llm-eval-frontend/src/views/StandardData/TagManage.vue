<template>
  <div class="tag-manage">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>标签管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建标签
          </el-button>
        </div>
      </template>

      <el-table :data="commonStore.tags" :loading="commonStore.loading.tags">
        <el-table-column prop="tag" label="标签名称" />
      </el-table>
    </el-card>

    <!-- Create Tag Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新标签"
      width="400px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="标签名称" required>
          <el-input 
            v-model="createForm.tag" 
            placeholder="例如: Linux Kernel, System Calls"
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
  tag: ''
})

const handleCreate = async () => {
  if (!createForm.tag.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }

  creating.value = true
  try {
    await commonStore.createTag(createForm.tag)
    ElMessage.success('标签创建成功')
    showCreateDialog.value = false
    createForm.tag = ''
  } catch (error) {
    console.error('Failed to create tag:', error)
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  commonStore.fetchTags()
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