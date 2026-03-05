# WenYan (闻言)

<p align="center">
  <img src="./public/favicon.ico" width="100" />
</p>

<p align="center">
  一个专注于展示优美文字与诗词的 Web 应用，融合了传统美学与现代设计。
</p>

---

## 📖 项目简介

**WenYan (闻言)** 是一个基于 Vue 3 和 TypeScript 构建的现代化 Web 应用。它旨在提供一个静谧、优雅的环境，让用户欣赏、收藏和分享触动人心的文字（Hitokoto 一言）。项目采用了极简主义设计风格，支持竖排文字展示（传统中文排版）、深色模式以及背景音乐播放，为用户带来沉浸式的阅读体验。

## ✨ 主要功能

- **每日一言**：随机获取并展示优美的文字、诗词或名言。
- **排版切换**：支持传统的**竖排文字**与现代横排文字的一键切换。
- **主题模式**：内置**深色模式 (Dark Mode)** 与浅色模式，适应不同阅读环境。
- **背景音乐**：支持背景白噪音或轻音乐播放，增强沉浸感。
- **交互体验**：
  - **收藏**：将喜欢的句子加入收藏夹（本地存储）。
  - **复制**：一键复制文字内容。
  - **分享**：生成精美的图片卡片进行分享。
- **响应式设计**：完美适配桌面端与移动端设备。

## 🛠️ 技术栈

本项目采用现代前端技术栈构建：

- **核心框架**: [Vue 3](https://v3.vuejs.org/) (Composition API, `<script setup>`)
- **构建工具**: [Vite](https://vitejs.dev/)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 组件库**: [Naive UI](https://www.naiveui.com/)
- **样式工具**: [Tailwind CSS](https://tailwindcss.com/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) (或 Vue Reactivity)
- **HTTP 请求**: [Axios](https://axios-http.com/)
- **工具库**: 
  - [html2canvas](https://html2canvas.hertzen.com/) (图片生成)
  - [NProgress](https://rstacruz.github.io/nprogress/) (加载进度条)

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/your-username/wenyan.git
cd wenyan
```

2. **安装依赖**

```bash
npm install
# 或者
yarn install
```

3. **启动开发服务器**

```bash
npm run dev
# 或者
yarn dev
```

启动后，访问 `http://localhost:3000` 即可预览项目。

### 构建部署

构建生产环境代码：

```bash
npm run build
# 或者
yarn build
```

构建产物将输出到 `dist` 目录。

## 📂 目录结构

```
WenYan/
├── public/              # 静态资源
├── src/
│   ├── api/             # API 请求封装
│   ├── assets/          # 项目静态资源 (CSS, Images)
│   ├── components/      # 公共组件
│   ├── router/          # 路由配置
│   ├── views/           # 页面视图
│   │   └── home/        # 主页及相关组件
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   └── ...
├── index.html           # HTML 模板
├── package.json         # 项目配置与依赖
├── tailwind.config.js   # Tailwind CSS 配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 📄 开源协议

MIT License
