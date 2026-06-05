# Minimalist AI Workflow（极简 AI 工作流）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

一个基于 [transweb 在线 Agent 基座](https://transweb.cn/?appName=appGenerator&agent=4140329349) 与 Node.js 构建的轻量级、无服务器（Serverless）同步 AI Agent 工作流程序。

项目通过 **DataURL 动态注入技术**，将开发态源码一键编译压缩至单文件 HTML 容器中，实现真正的“零部署、本地即开即用”。所有编排逻辑均在本地浏览器运行，不依赖任何后端服务。

本项目面向 **意图驱动编程（Intent-Driven Programming）** 与 **Vibe Coding** 的开发者，适用于快速搭建 AI 应用原型、多 Agent 协作任务流，以及需要高度可移植性的全端交互界面。

> 📌 每个 Agent 均可通过 transweb 在线基座，使用自然语言以 Vibe 方式直接创建和维护。基座体验入口：https://transweb.cn/?appName=appGenerator&agent=4140329349

---

## 📖 目录

- [项目特性](#-项目特性)
- [项目文件结构](#-项目文件结构)
- [准备工作](#-准备工作)
- [快速上手](#-快速上手)
- [核心设计原理](#-核心设计原理)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [开源协议](#-开源协议)
- [联系方式](#-联系方式)

---

## 🌟 项目特性

- **🔗 多 Agent 同步串联**：支持多个 AI Agent 节点流水线式无缝交接，前一个 Agent 的输出（DataId / InputItem）自动作为下一个 Agent 的初始输入。
- **👁️ 执行过程透明、可干预**：每个 Agent 节点内嵌于高隔离性的 Iframe 容器中，执行状态、网络日志、URL 变更、数据载荷全程可见，开发者可随时介入修改。
- **🔄 节点级回溯与重触发**：支持在工作流的任意中间节点一键“重新触发”或“状态重置”，无需从头开始，极大提升调试与交互效率。
- **🎛️ 动态自由编排**：允许在界面上动态新增、删除、调换 Agent 节点，随时重新生成步骤流。编排完成后可导出新版工作流 HTML 文件，方便分享或归档。
- **💾 自动持久化运行结果**：工作流执行过程数据及最终产出自动存储在您个人的 transweb Agent 基座后台数据库中，可随时登录各 Agent 查看、编辑或导出，数据所有权完全归属您。

---

## 📂 项目文件结构

- **`index.html`（主体运行容器）**：全自包含的单文件 HTML，**无需任何 Web 服务器**，直接双击即可在浏览器中独立运行完整工作流。
- **`code.vue`（工作流源码）**：开发态核心业务逻辑组件，包含 UI 视图层、多步骤状态机渲染、重置事件处理，以及底层的 **Iframe 通信监听逻辑**。
- **`config.json`（集群配置文件）**：集中管理 Agent 集群的元数据（如“行业认知”“长文章”“课程课件”等 Agent 的 ID 与标签）以及默认工作流的初始化执行顺序。
- **`build.js`（自动化编译脚本）**：基于 Node.js 原生 API 的构建工具，**零 npm 依赖**，一键完成“数据注入 + 源码转 DataURL 编译 + 容器代码替换”的全自动打包。

---

## 🧰 准备工作

1. 确保本地已安装 [Node.js](https://nodejs.org/)（推荐 v14.0.0 或更高版本）。
2. 访问 [transweb 在线基座](https://transweb.cn/?appName=appGenerator&agent=4140329349) 并注册/登录。
3. 使用自然语言创建一个或多个 AI Agent，记录下每个 Agent 的唯一 ID（例如 `agent_id_0`）。  
   *（您可以在 Agent 的编辑页面或地址栏中找到该 ID）*

---

## 🛠️ 快速上手

### 1. 配置工作流

打开 `config.json`，根据您的 Agent 集群定义 `apps`（可选的 Agent 库）和 `accountData`（默认执行的工作流路径）：
```json
{
  "title": "行业认知工作流",
  "apps": [
    { "value": "agent_id_0", "label": "行业认知" },
    { "value": "agent_id_1", "label": "长文章" },
    { "value": "agent_id_2", "label": "课程课件" }
  ],
  "accountData": {
    "appId": "agent_id_0",
    "workflow": ["agent_id_1", "agent_id_2"]
  }
}
```

请将示例中的 agent_id_* 替换为您的真实 Agent ID。

### 2. 一键编译

在项目根目录下打开终端，执行编译合并指令：

`node build.js`

编译内幕：该脚本会做两件事：

将 config.json 的 JSON 数据无缝注入到 index.html 的 app.task.data 中。

将 code.vue 的完整源码转换为 Base64 格式的 DataURL，精准全量平替 index.html 中的 app.task.template。

### 3. 运行预览

编译完成后，直接双击打开 index.html，或者使用任意静态浏览器插件（如 Live Server）预览即可。


## ⚙️ 核心设计原理

### 1. 独立运行与记忆，基座负责时序

工作流仅负责编排配置和执行状态监听。每个 Agent 运行于 transweb Agent 基座提供的沙盒 Iframe 中，拥有独立的记忆、编辑修改、结果版本管理以及文档导出功能。基座会根据地址栏中的工作流参数，自动将当前 Agent 的执行结果传递给下一个 Agent 节点，确保任务有序进行。

### 2. 双域兼容的 Iframe 状态监听器
code.vue 中内建了一套高兼容性的生命周期钩子，用于实时捕获 Agent 所在 Iframe 的 URL 变动：

- 同域环境：直接监听 iframe.contentWindow.location.href。
- 跨域环境：安全监听跨域消息总线 window.addEventListener('message', ...)，当收到 IFRAME_URL_CHANGE 事件时，工作流自动更新状态。

## ❓ 常见问题

- 我的数据会被上传到哪里？安全性如何？

所有工作流编排与界面逻辑均运行在您的本地浏览器中，不会上传至任何第三方。Agent 的执行与结果存储由 transweb 基座提供，数据存储在您个人的 transweb 账户下。我们建议您阅读 transweb 隐私政策 以了解更多信息。

- 为什么我在 config.json 中填入 Agent ID 后无法正常工作？

请确认：
Agent ID 已在 transweb 平台正确创建且为有效 ID。
build.js 执行无报错，且 index.html 已更新。
检查当前设备网络状态正常，如果有使用 VPN 可暂时退出后再尝试

- 支持哪些浏览器？

推荐使用 Chrome、Edge、Firefox 等现代浏览器。需允许 Iframe 跨域通信及弹出窗口。

## 🤝 贡献指南

欢迎任何关于 AI Agent 编排、轻量化前端架构的 Issue 与 Pull Request！在提交 PR 前，请先阅读我们的贡献指引（即将补充）。
如有功能建议或 BUG 反馈，请通过 Issue 模板提交，以便我们高效跟进。

## 📝 开源协议

本项目基于 MIT License 开源，您可以自由使用、修改和分发，但需保留原始版权声明。

## 📮 联系方式

项目地址：https://github.com/liuwenjin/trans-workflow

问题反馈：Issues 页面

邮箱：neilking@163.com

