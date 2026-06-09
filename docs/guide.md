# 工作流构建指南

欢迎使用 **Trans-Workflow**。本平台基于统一的工作流模板，支持通过灵活调整 Agent 节点来快速构建并导出全新的定制化工作流。

本教程将在 **10 分钟**内，带你完整体验 Agent 工作流构建的核心流程。

> 💡 **核心概念与持久化机制：**
> * **工作流参数**：在 Web 端配置的工作流参数为内存实时状态，**只有在执行“下载导出”后，才会持久化保存至本地**。
> * **Agent 应用**：每个新创建的 Agent 应用均会自动持久化保存于 Agent 基座系统的后台数据库中。
> * **Agent 基座访问地址**：[agent.transweb.cn](https://agent.transweb.cn)
> 
> 

---

## 1. 准备/创建可选 Agent 应用节点

在构建工作流之前，需要先将所需的 Agent 应用加入到当前项目的**可选 Agent 列表**中。打开 Agent 工作流界面（[transweb.cn/workflow](https://transweb.cn/workflow)）后的操作步骤如下。

### 操作步骤：

1. **打开配置窗口**：点击界面右上角的 **“新增”** 按钮，唤起 *“新增可用 Agent”* 对话框。
![唤起新增对话框](https://transweb.cn/workflow/docs/images/guide001.png "唤起新增对话框")
![AI 智能生成](https://transweb.cn/workflow/docs/images/guide002.png "AI 智能生成")
2. **添加 Agent 应用**（提供以下两种方式）：
* **方式 A（AI 智能生成）**：在对话框上方的输入框中，输入具体的 **Agent 需求描述**，点击 **“开始生成”**。等待 1~3 分钟，待应用生成完毕后，点击 **“确认添加”**。
![AI 智能生成等待中](https://transweb.cn/workflow/docs/images/guide003.png "AI 智能生成等待中")

![AI 智能生成等待中](https://transweb.cn/workflow/docs/images/guide004.png "AI 智能生成等待中")

* **方式 B（自选已有应用）**：在对话框下方的 Agent 应用列表中，直接浏览并点击所需的 Agent 实例，在详情页点击 **“确认添加”**。
![已添加 Agent](https://transweb.cn/workflow/docs/images/guide006.png "已添加 Agent")

![Agent 应用界面](https://transweb.cn/workflow/docs/images/guide005.png "Agent 应用界面")

3. **确认列表**：重复上述步骤，将本次工作流所需的所有 Agent 应用全部加入到下拉备选项中。
![备用 Agent 列表](https://transweb.cn/workflow/docs/images/guide007.png "备用 Agent 列表")


---

## 2. 配置工作流节点拓扑

在**工作流 Agent 节点配置区域**，你可以按照业务逻辑顺序，依次组装你的 Agent 链条。

### 操作步骤：

1. **配置首节点**：点击左侧输入框，在弹出的下拉列表中选择一个 Agent 应用作为初始节点。

![配置首节点](https://transweb.cn/workflow/docs/images/guide008.png "配置首节点")

2. **配置后续节点**：点击右侧关联输入框，在下拉列表中依次选择并绑定后续的多个 Agent 应用。

![配置首节点](https://transweb.cn/workflow/docs/images/guide009.png "配置首节点")

按照业务流水线顺序完成 Agent 节点的选择与串联后，当前工作流即宣告构建完成。

---

## 3. 导出与持久化工作流

由于线上版本的 Trans-Workflow 处于无状态运行模式（不实时缓存或自动持久化配置参数），因此完成配置后必须手动导出。

### 操作步骤：

* **导出本地文件**：点击界面右上角的 **“下载导出”** 图标按钮。系统会自动生成并下载一个最新的 `.html` 文件存档至本地。

![配置首节点](https://transweb.cn/workflow/docs/images/guide010.png "配置首节点")

---

> 🛠️ **开发者进阶提示：**
> 如果你的业务场景需要**实时状态缓存**、**多版本历史持久化**或**自定义节点回滚**等高级功能，建议下载 Trans-Workflow 的开源代码仓库，基于零部署架构进行二次开发。