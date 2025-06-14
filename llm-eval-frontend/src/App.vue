<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <el-container style="height: 100vh">
      <!-- Header -->
      <el-header style="background-color: #409EFF; color: white">
        <div style="display: flex; align-items: center; height: 100%">
          <h2 style="margin: 0">LLM评估数据集管理系统</h2>
        </div>
      </el-header>
      
      <el-container>
        <!-- Sidebar Navigation -->
        <el-aside width="250px" style="background-color: #f5f5f5">
          <el-menu
            :default-active="$route.path"
            router
            style="border: none; background-color: transparent"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            
            <el-sub-menu index="raw-data">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>原始数据</span>
              </template>
              <el-menu-item index="/raw-questions">原始问题</el-menu-item>
              <el-menu-item index="/raw-answers">原始答案</el-menu-item>
              <el-menu-item index="/stackoverflow-post-ids">StackOverflow Post IDs</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="standard-data">
              <template #title>
                <el-icon><Files /></el-icon>
                <span>标准数据</span>
              </template>
              <el-menu-item index="/versions">版本管理</el-menu-item>
              <el-menu-item index="/tags">标签管理</el-menu-item>
              <el-menu-item index="/std-questions">标准问题</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="answers">
              <template #title>
                <el-icon><ChatDotRound /></el-icon>
                <span>答案管理</span>
              </template>
              <el-menu-item index="/candidate-answers">候选答案</el-menu-item>
              <el-menu-item index="/std-answers">标准答案</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="evaluation">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>评估分析</span>
              </template>
              <el-menu-item index="/evaluation-tags">评估标签</el-menu-item>
              <el-menu-item index="/evaluation-results">评估结果</el-menu-item>
              <el-menu-item index="/analysis-tags">分析标签</el-menu-item>
              <el-menu-item index="/evaluation-analysis">评估分析</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/statistics">
              <el-icon><TrendCharts /></el-icon>
              <span>统计概览</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <!-- Main Content -->
        <el-main style="padding: 20px">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
}

.el-header {
  padding: 0 20px;
}

.el-aside {
  border-right: 1px solid #dcdfe6;
}

.el-menu {
  padding-top: 10px;
}
</style>
