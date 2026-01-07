# LLM 评估数据集管理系统 (DB-HPJ)

<div align="center">

一个用于管理和评估 LLM (大型语言模型) 数据集的前端应用系统

[功能特性](#功能特性) • [技术栈](#技术栈) • [快速开始](#快速开始) • [项目结构](#项目结构) • [文档](#文档)

</div>

---

## 📋 项目概述

DB-HPJ-frontend 是一个基于 Vue 3 和 Element Plus 构建的 LLM 评估数据集管理系统前端应用。该系统提供了完整的数据导入、管理、评估和分析功能，支持从原始问答数据到标准化数据集的全流程管理。

### 主要功能模块

- **原始数据管理** - 导入和管理来自 Stack Overflow 等平台的原始问答数据
- **标准数据管理** - 版本控制、标签管理和标准问题管理
- **答案管理** - 候选答案审核和标准答案管理
- **评估分析** - LLM 评估结果管理和数据分析
- **统计可视化** - 多维度数据统计和图表展示

## ✨ 功能特性

### 1. 原始问答模块
- 📥 批量导入原始问题和答案（支持 XML 格式）
- 🔍 分页、排序、筛选原始数据
- 🏷️ 支持多平台数据源（Stack Overflow 等）
- 📊 数据状态管理（待转换、已转换、已忽略）

### 2. 标准数据模块
- 📌 版本管理：支持数据集的版本控制
- 🏷️ 标签管理：灵活的标签分类系统
- ✅ 标准问题管理：将原始问题转换为标准化格式
- 🔗 关联管理：原始问题与标准问题的关联关系

### 3. 答案管理模块
- 🎯 候选答案审核：支持接受/拒绝操作
- ⭐ 答案评分：为接受的答案设置分数
- 📝 标准答案管理：自动生成和管理标准答案
- 📤 批量导入：支持 CSV 格式批量导入

### 4. 评估分析模块
- 🤖 评估结果管理：管理 LLM 生成的答案
- 🏷️ 评估标签：关联数据集版本和评估批次
- 📊 评估分析：LLM 评估分数和分析结果
- 📈 数据可视化：图表展示评估结果分布

### 5. 统计分析模块
- 📊 数据统计仪表盘
- 📈 多维度数据分析（按类型、状态、标签等）
- 🎨 ECharts 可视化图表
- 📉 趋势分析和对比

## 🛠 技术栈

### 核心框架
- **Vue 3** - 使用 Composition API 的现代化前端框架
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 轻量级状态管理库
- **Vite** - 新一代前端构建工具

### UI 组件
- **Element Plus** - 企业级 UI 组件库
- **@element-plus/icons-vue** - Element Plus 图标库
- **ECharts 5** - 强大的数据可视化库

### 工具库
- **Axios** - HTTP 客户端，用于 API 请求
- **Vitest** - 单元测试框架
- **@vue/test-utils** - Vue 组件测试工具

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/SummerS-tars/DB-HPJ-frontend.git
   cd DB-HPJ-frontend/llm-eval-frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   应用将在 `http://localhost:5173` 运行

4. **构建生产版本**
   ```bash
   npm run build
   ```

5. **预览生产构建**
   ```bash
   npm run preview
   ```

### 运行测试

```bash
npm run test:unit
```

## 📁 项目结构

```
DB-HPJ-frontend/
├── llm-eval-frontend/          # 前端应用主目录
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   ├── views/              # 页面组件
│   │   │   ├── Home.vue        # 首页
│   │   │   ├── RawData/        # 原始数据管理页面
│   │   │   ├── StandardData/   # 标准数据管理页面
│   │   │   ├── CandidateAnswer/# 候选答案管理页面
│   │   │   ├── StandardAnswer/ # 标准答案管理页面
│   │   │   ├── Evaluation/     # 评估管理页面
│   │   │   ├── Analysis/       # 分析管理页面
│   │   │   └── Statistics/     # 统计分析页面
│   │   ├── services/           # API 服务封装
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── router/             # 路由配置
│   │   ├── assets/             # 静态资源
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 应用入口
│   ├── public/                 # 公共静态资源
│   ├── package.json            # 项目依赖配置
│   ├── vite.config.js          # Vite 配置
│   └── vitest.config.js        # Vitest 配置
├── document/                   # 项目文档
│   ├── api/                    # API 文档
│   ├── backend/                # 后端设计文档
│   ├── frontend/               # 前端设计文档
│   ├── design-supplement/      # 设计补充文档
│   ├── problem/                # 问题记录
│   └── FrontendDevelopPlan.md  # 前端开发计划
├── response/                   # 响应示例
└── README.md                   # 项目说明文档（本文件）
```

## 🔗 API 配置

默认 API 基础地址为 `http://localhost:8080/api/v1`

可在 `llm-eval-frontend/src/services/api.js` 中修改配置：

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
```

推荐使用环境变量配置不同环境的 API 地址，在项目根目录创建 `.env.local` 文件：

```bash
VITE_API_BASE_URL=http://your-api-server:8080/api/v1
```

## 📖 文档

详细的项目文档位于 `document/` 目录：

- **[API 文档](document/api/api.md)** - 完整的 REST API 接口文档
- **[前端开发计划](document/FrontendDevelopPlan.md)** - 前端开发的详细计划和实施指南
- **[前端 README](llm-eval-frontend/README.md)** - 前端应用的详细说明文档

### 主要功能页面

| 路由路径 | 功能描述 |
|---------|---------|
| `/` | 系统首页和导航 |
| `/raw-questions` | 原始问题管理 |
| `/raw-answers` | 原始答案管理 |
| `/versions` | 数据集版本管理 |
| `/tags` | 标签管理 |
| `/std-questions` | 标准问题管理 |
| `/candidate-answers` | 候选答案审核 |
| `/std-answers` | 标准答案管理 |
| `/evaluation-tags` | 评估标签管理 |
| `/evaluation-results` | 评估结果管理 |
| `/analysis-tags` | 分析标签管理 |
| `/evaluation-analysis` | 评估分析结果 |
| `/statistics` | 统计分析仪表盘 |

## 🎯 开发指南

### 代码规范

- 使用 Vue 3 Composition API
- 遵循 Element Plus 组件使用规范
- API 调用统一通过 `services/` 目录下的模块进行
- 使用 Pinia 进行状态管理
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 状态管理

公共状态存储在 `src/stores/common.js`，包括：
- 用户认证状态
- 全局配置信息
- 通用数据缓存

### API 服务封装

所有 API 请求都通过统一的 Axios 实例，支持：
- 请求拦截器（添加认证 Token）
- 响应拦截器（统一错误处理）
- 请求取消（避免重复请求）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发进度

- [x] 项目基础架构搭建
- [x] 原始问答模块
- [x] 标准数据模块
- [x] 候选答案模块
- [x] 标准答案模块
- [x] 评估结果模块
- [x] 评估分析模块
- [x] 统计分析模块
- [x] 数据可视化
- [ ] 用户认证系统（规划中）
- [ ] 权限管理系统（规划中）

## 📄 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 👥 开发团队

- **SummerS-tars** - 项目维护者

## 🔗 相关链接

- [Vue.js 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)

---

<div align="center">

**如有问题或建议，欢迎提交 Issue！**

⭐ 如果觉得这个项目不错，请给个 Star 支持一下！

</div>
