<template>
  <div class="home">
    <el-card class="welcome-card">
      <template #header>
        <h1>欢迎使用 LLM评估数据集管理系统</h1>
      </template>
      <p>这是一个用于管理 LLM 评估数据集的系统，包含原始问答数据管理、标准问题答案管理、评估结果分析等功能。</p>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card class="nav-card" @click="$router.push('/raw-questions')">
          <div class="card-content">
            <el-icon size="48"><Document /></el-icon>
            <h3>原始数据管理</h3>
            <p>导入和管理来自各平台的原始问答数据</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="nav-card" @click="$router.push('/std-questions')">
          <div class="card-content">
            <el-icon size="48"><Files /></el-icon>
            <h3>标准问题管理</h3>
            <p>创建和管理标准化的问题数据集</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="nav-card" @click="$router.push('/evaluation-results')">
          <div class="card-content">
            <el-icon size="48"><DataAnalysis /></el-icon>
            <h3>评估结果</h3>
            <p>查看和分析 LLM 评估结果</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card class="nav-card" @click="$router.push('/candidate-answers')">
          <div class="card-content">
            <el-icon size="48"><ChatDotRound /></el-icon>
            <h3>候选答案</h3>
            <p>管理和审核候选答案</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="nav-card" @click="$router.push('/std-answers')">
          <div class="card-content">
            <el-icon size="48"><Star /></el-icon>
            <h3>标准答案</h3>
            <p>查看已确认的标准答案</p>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="nav-card" @click="$router.push('/statistics')">
          <div class="card-content">
            <el-icon size="48"><TrendCharts /></el-icon>
            <h3>统计分析</h3>
            <p>查看系统统计和数据分析</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// No additional logic needed for basic home page
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  text-align: center;
}

.welcome-card h1 {
  margin: 0;
  color: #409EFF;
}

.nav-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-content {
  text-align: center;
  padding: 20px;
}

.card-content h3 {
  margin: 15px 0 10px 0;
  color: #303133;
}

.card-content p {
  color: #606266;
  margin: 0;
}

.el-icon {
  color: #409EFF;
}
</style> 