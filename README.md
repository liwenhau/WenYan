# WenYan (闻言)

<p align="center">
  <img src="./public/favicon.ico" width="100" />
</p>

<p align="center">
  一个专注于展示优美文字与诗词的桌面客户端，融合沉浸式阅读与动态桌面壁纸。
</p>

---

## 📖 项目简介

**WenYan (闻言)** 是一个基于 Vue 3、TypeScript 和 Electron 构建的桌面客户端。它旨在提供一个静谧、优雅的环境，让用户欣赏、收藏和分享触动人心的文字（Hitokoto 一言），也可以把当前沉浸式现场直接设置为动态桌面壁纸。

## ✨ 主要功能

- **每日一言**：随机获取并展示优美的文字、诗词或名言。
- **排版切换**：支持传统的**竖排文字**与现代横排文字的一键切换。
- **主题模式**：内置**深色模式 (Dark Mode)** 与浅色模式，适应不同阅读环境。
- **背景音乐**：支持背景白噪音或轻音乐播放，增强沉浸感。
- **交互体验**：
  - **收藏**：将喜欢的句子加入收藏夹（本地存储）。
  - **复制**：一键复制文字内容。
  - **分享**：生成精美的图片卡片进行分享。
- **动态桌面壁纸客户端**：使用 Electron 客户端可将沉浸式现场设置为桌面动态壁纸，保留动画、鼠标视差、点击换句和长按凝听。
- **客户端常驻**：支持托盘菜单、开机启动、壁纸模式恢复。

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
- **桌面客户端**: [Electron](https://www.electronjs.org/) (动态壁纸窗口、托盘、开机启动)

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- pnpm

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/your-username/wenyan.git
cd wenyan
```

2. **安装依赖**

```bash
pnpm install
```

3. **启动客户端**

```bash
pnpm run dev
```

该命令会自动启动 Vite 开发服务并打开 Electron 客户端。

在客户端中点击侧边栏的壁纸按钮，可将当前沉浸式现场设置为动态桌面壁纸。Windows 下客户端会尝试把壁纸窗口挂到桌面 WorkerW 层；其他系统会退化为置底全屏壁纸窗口。

如需仅调试 Web 页面，可运行：

```bash
pnpm run web:dev
```

### 构建部署

构建生产环境代码：

```bash
pnpm run build
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
