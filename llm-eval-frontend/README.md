# LLM评估数据集管理系统 - 前端

这是一个用于管理 LLM 评估数据集的前端应用，基于 Vue 3 + Element Plus 构建。

## 功能特性

- **原始数据管理**: 导入和管理来自各平台的原始问答数据
- **标准数据管理**: 版本管理、标签管理、标准问题管理
- **答案管理**: 候选答案审核、标准答案管理
- **评估分析**: 评估结果管理和分析

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP客户端)
- Vite (构建工具)

## 项目设置

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 公共组件
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── RawData/        # 原始数据管理
│   ├── StandardData/   # 标准数据管理
│   ├── CandidateAnswer/# 候选答案管理
│   ├── StandardAnswer/ # 标准答案管理
│   ├── Evaluation/     # 评估管理
│   ├── Analysis/       # 分析管理
│   └── Statistics/     # 统计分析
├── services/           # API服务
├── stores/             # Pinia状态管理
├── router/             # 路由配置
├── assets/             # 静态资源
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## API配置

默认API地址为 `http://localhost:8080/api/v1`，可在 `src/services/api.js` 中修改。

## 开发说明

1. 所有API调用都通过 `src/services/` 目录下的模块进行
2. 使用 Pinia 进行状态管理，公共状态存储在 `src/stores/common.js`
3. 使用 Element Plus 组件库，已全局注册图标
4. 支持分页、排序、筛选等功能
5. 包含文件上传、数据导入等功能

## 主要功能页面

- `/` - 首页
- `/raw-questions` - 原始问题管理
- `/std-questions` - 标准问题管理
- `/candidate-answers` - 候选答案管理
- `/versions` - 版本管理
- `/tags` - 标签管理

更多页面请参考路由配置文件 `src/router/index.js`。
