<template>
  <div id="rootContainerItem" class="tw-relative tw-bg-page-gradient tw-px-5">
    <div class="tw-w-full tw-max-w-5xl tw-mx-auto tw-pt-8 tw-relative">
      <div class="tw-w-full tw-flex tw-justify-between tw-items-center">
        <div class="tw-flex tw-items-center tw-gap-3">
          <div class="tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9">
            <img
              class="tw-w-9 tw-h-9"
              src="https://transweb.cn/assets/logo.png"
            />
          </div>
          <h3
            :class="[
              'tw-font-bold tw-text-gray-900 tw-whitespace-nowrap tw-m-0',
              flag ? 'tw-text-xl' : 'tw-text-2xl tw-w-custom-160',
            ]"
            style="outline: none; line-height: 1.2"
            :contenteditable="!isViewer"
            @blur="handleTitleChange"
          >
            {{ title || "极简工作流" }}
          </h3>
        </div>
        <span
          class="optionsArea tw-flex tw-items-center tw-gap-1"
          v-if="!isViewer"
        >
          <el-button
            circle
            class="tw-mr-1 header-action-btn"
            size="small"
            title="新增可选 Agent"
            @click="newAgentDialog()"
          >
            <el-icon>
              <plus />
            </el-icon>
          </el-button>
          <el-dropdown trigger="click" data-edit-id="39">
            <el-button
              circle
              size="small"
              class="header-action-btn"
              data-edit-id="40"
            >
              <el-icon data-edit-id="41">
                <setting data-edit-id="42" />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu data-edit-id="44">
                <el-dropdown-item @click="handleEditingDialog" data-edit-id="46"
                  >修改 Agent 列表</el-dropdown-item
                >
                <slot v-for="(item, index) in apps" :key="item.label">
                  <el-dropdown-item
                    @click="openAppItem(item)"
                    :divided="index === 0"
                    >{{ item.label }}</el-dropdown-item
                  >
                </slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click">
            <el-button circle class="tw-ml-1 header-action-btn" size="small">
              <el-icon>
                <download />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  title="导出编辑模式"
                  @click="exportWorkflow()"
                  >导出编辑模式</el-dropdown-item
                >
                <el-dropdown-item
                  title="导出预览模式"
                  @click="exportWorkflow('record')"
                  >导出预览模式</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
        <span v-else>
          <el-button
            circle
            class="tw-ml-2 header-action-btn"
            style="margin-top: -3px"
            size="small"
            title="编辑工作流"
            @click="switchEditMode()"
          >
            <el-icon>
              <el-icon>
                <edit />
              </el-icon>
            </el-icon>
          </el-button>
        </span>
      </div>

      <div
        v-if="!isViewer"
        :class="[
          'tw-w-full tw-mt-5 tw-relative tw-flex tw-gap-4',
          flag ? 'tw-flex-col tw-items-stretch' : 'tw-flex-row tw-items-center',
        ]"
      >
        <div
          :class="[
            'tw-flex tw-w-full',
            flag
              ? 'tw-flex-col tw-gap-3 tw-bg-transparent tw-border-none tw-shadow-none'
              : 'tw-flex-row tw-items-stretch tw-bg-white tw-rounded-2xl tw-border tw-border-indigo-50 tw-shadow-card configuration-wrapper tw-flex-1',
          ]"
        >
          <div
            :class="[
              'tw-flex tw-items-center tw-gap-2',
              flag
                ? 'tw-w-full'
                : 'tw-px-3 tw-py-1 tw-flex-initial tw-w-custom',
            ]"
          >
            <div class="tw-ml-1" v-if="!flag">
              <i class="bi bi-robot tw-bot-icon-inner"></i>
            </div>
            <el-select
              v-model="accountData.appId"
              allow-create
              filterable
              placeholder="请挑选或输入 Agent ID"
              :class="[
                'tw-w-full',
                flag ? 'mobile-select-bordered' : 'custom-select-no-border',
              ]"
            >
              <el-option
                v-for="item in apps"
                :key="item.value"
                :label="item.label || item"
                :value="item.value || item"
              ></el-option>
            </el-select>
          </div>

          <div v-if="!flag" class="tw-flex-shrink-0 tw-flex tw-items-center">
            <div class="tw-w-px tw-h-8 tw-bg-slate-100 tw-rounded-full"></div>
          </div>

          <div
            :class="[
              'tw-flex tw-items-center tw-gap-2',
              flag ? 'tw-w-full' : 'tw-px-3 tw-py-1 tw-flex-1',
            ]"
          >
            <i
              class="bi bi-arrow-right tw-text-teal-500 tw-text-base tw-ml-1 tw-flex-shrink-0 tw-drop-shadow-glow"
              v-if="!flag"
            ></i>
            <el-select
              v-model="accountData.workflow"
              multiple
              collapse-tags
              collapse-tags-tooltip
              allow-create
              filterable
              placeholder="请挑选或添加工作流节点"
              :class="[
                'tw-w-full',
                flag ? 'mobile-select-bordered' : 'custom-select-no-border',
              ]"
            >
              <el-option
                v-for="item in apps"
                :key="item.value"
                :label="item.label || item"
                :value="item.value || item"
              ></el-option>
            </el-select>
            <el-button
              text
              :title="relationEditor.tips"
              v-if="!flag"
              @click="startEditRelation()"
              ><el-icon><edit-pen /></el-icon
            ></el-button>
          </div>
        </div>
      </div>

      <div
        v-if="accountData.appId"
        class="tw-mt-6 tw-relative tw-pr-12 tw-w-full tw-bg-white tw-p-6 tw-rounded-2xl tw-shadow-card tw-border tw-border-indigo-50 steps-panel"
      >
        <el-steps
          class="tw-w-full tw-relative custom-cyber-steps"
          :active="activeStepIndex"
          finish-status="success"
          align-center
        >
          <el-step
            :class="[
              'tw-cursor-pointer',
              index === Number(activeStepIndex) ? 'activeStepItem' : '',
            ]"
            @click="refreshCurrentWorkflow(index)"
            v-for="(wf, index) in stepData"
            :key="index"
            :active="index === Number(activeStepIndex)"
            :status="getStepStuts(index)"
            :title="getLabel(wf.appId).slice(0, 5)"
          ></el-step>
        </el-steps>
        <div
          class="optionsBtnArea tw-flex-shrink-0 tw-flex tw-flex-col tw-items-center"
        >
          <el-button
            circle
            @click="resetWorkflow()"
            class="tw-shadow-sm reset-btn tw-mt-4"
          >
            <el-icon>
              <refresh-right />
            </el-icon>
          </el-button>
          <span
            class="tw-shadow-sm tw-mt-2"
            v-if="
              true ||
              (stepData[activeStepIndex] && stepData[activeStepIndex].resultUrl)
            "
          >
            <el-button
              :disabled="
                !(
                  stepData[activeStepIndex] &&
                  stepData[activeStepIndex].resultUrl
                )
              "
              class="continue-btn"
              circle
              @click="continueWorkflow()"
            >
              <el-icon>
                <el-icon>
                  <caret-right />
                </el-icon>
              </el-icon>
            </el-button>
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="accountData.appId"
      class="tw-bg-white tw-max-w-5xl tw-mx-auto tw-h-viewer tw-rounded-2xl tw-shadow-iframe tw-overflow-hidden tw-border tw-border-indigo-50 tw-mt-6 iframe-glow"
    >
      <iframe
        ref="workflowFrame"
        :src="currentNodeUrl"
        class="tw-w-full tw-h-full tw-border-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        loading="lazy"
        @load="initIframeMonitor"
      >
      </iframe>
    </div>

    <div
      v-else
      class="tw-py-16 tw-px-5 tw-max-w-5xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-indigo-100 tw-mt-6 empty-panel"
    >
      <el-empty description="请在上方输入 Agent ID 以加载工作流">
        <template #image>
          <div
            class="tw-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-rounded-full tw-bg-indigo-50 tw-mx-auto"
          >
            <i class="bi bi-diagram-3 tw-text-indigo-300 tw-text-4xl"></i>
          </div>
        </template>
      </el-empty>
    </div>

    <el-dialog
      v-model="showAppConfig"
      title="可选 Agent 列表"
      width="400px"
      destroy-on-close
    >
      <div class="tw-flex tw-justify-between tw-mb-4" data-edit-id="64">
        <el-button
          type="primary"
          size="small"
          @click="addItem('apps')"
          data-edit-id="65"
          >新增 Agent</el-button
        >
        <el-button
          type="warning"
          size="small"
          plain
          @click="resetToDefault()"
          data-edit-id="102"
          >恢复默认</el-button
        >
      </div>
      <el-table :data="editingApps" border size="small" data-edit-id="66">
        <el-table-column label="Agent 名称" width="80px" data-edit-id="67">
          <template #default="scope">
            <el-input
              v-model="scope.row.label"
              size="small"
              data-edit-id="69"
            />
          </template>
        </el-table-column>
        <el-table-column label="Agent ID" data-edit-id="70">
          <template #default="scope">
            <el-input
              v-model="scope.row.value"
              size="small"
              data-edit-id="72"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" data-edit-id="73">
          <template #default="scope">
            <el-button
              type="danger"
              link
              @click="removeItem(scope.$index)"
              data-edit-id="75"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer" data-edit-id="111">
          <el-button @click="showAppConfig = false" data-edit-id="112"
            >取消</el-button
          >
          <el-button
            type="primary"
            @click="handleConfirmDialog"
            data-edit-id="113"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SmartSearchVerification",
  data() {
    return {
      title: "行业认知工作流",
      apps: [
        {
          value: "97de7ea5d065e96a6b71909f4768fac1",
          label: "研究报告",
        },
        {
          value: "dcd76a6c644295cdc29b33bdbe825017",
          label: "商业方案",
        },
        {
          value: "2d233c906f091e2f17385e4494fdd05f",
          label: "行业认知",
        },
        {
          value: "236d92571c458ed21469b9c4327be3fe",
          label: "长文章",
        },
        {
          value: "60116b5ffe98003395b70402748aeab6",
          label: "课程课件",
        },
      ],
      accountData: {
        workflow: [
          "236d92571c458ed21469b9c4327be3fe",
          "60116b5ffe98003395b70402748aeab6",
        ],
        appId: "2d233c906f091e2f17385e4494fdd05f",
        allLines: [],
      },
      isViewer: WebTool.urlQuery(location.href).isView === "1",
      stepData: [],
      currentNodeUrl: "",
      relationEditor: {
        tips: "编辑 Agent 依赖关系",
        url: "",
        className: "ElementVueItem",
      },
      flag:
        typeof WebTool !== "undefined"
          ? WebTool.adjustSize([false, false, true])
          : false,
      activeStepIndex: 0,
      showAppConfig: false,
      agentResults: [],
      editingApps: [],
    };
  },
  watch: {
    "accountData.workflow": function (newValue, older) {
      this.currentNodeUrl = this.getUrl();
      this.initStepData();
    },
    "accountData.appId": function (newValue, older) {
      this.currentNodeUrl = this.getUrl();
      this.initStepData();
    },
  },
  methods: {
    newAgentDialog() {
      let app = {
        className: "ElementVueItem",
        task: {
          template: `<div class='tw-w-full tw-h-full'>
                  <iframe class='tw-w-full tw-h-full' src='https://agent.transweb.cn?headerHidden=true'></iframe>
                </div>`,
        },
      };
      webCpu.renderCardDialog(
        document.body,
        app,
        {
          title: "新增可用 Agent",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
          menu: [
            {
              label: "确认添加",
              action: () => {
                let iframe = app.task.container.querySelector("iframe");
                if (iframe) {
                  let url = iframe.contentWindow.location.href;
                  let params = WebTool.urlQuery(url);
                  if (params.id) {
                    this.apps.push({
                      value: params.id,
                      label: (iframe.contentDocument.title || params.id).slice(
                        0,
                        5
                      ),
                    });
                    this.$message.success("已添加 Agent: " + params.id);
                    webCpu.CardItem.dismissMask(document.body);
                  } else {
                    this.$message.error(
                      "未获取到有效的 Agent ID，请确认后重试"
                    );
                  }
                } else {
                  this.$message.error("未找到内嵌的 Agent 页面，请确认后重试");
                }
              },
            },
          ],
        },
        {
          width: "100%",
          maxWidth: "900px",
          height: this.flag ? "100%" : "90%",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
        }
      );
    },
    switchEditMode() {
      this.isViewer = false;
    },
    getStepStuts(index) {
      let ret = "";
      if (this.stepData[index].resultUrl) {
        ret = "success";
      } else if (index === Number(this.activeStepIndex)) {
        ret = "process";
      } else {
        ret = "wait";
      }
      return ret;
    },
    openAppItem(item) {
      let appId = item.value;
      window.open(`https://transweb.cn?id=${appId}`, "_blank");
    },
    updateInputData(stepIndex, dataId) {
      let arr = this.accountData.allLines;
      for (let i = 0; i < arr.length; i++) {
        let idx = arr[i].to;
        let from = arr[i].from;
        if (from === Number(stepIndex)) {
          arr[i].property = arr[i].property || [];
          if (dataId) {
            this.stepData[idx].inputData = this.stepData[idx].inputData || {};
            this.stepData[idx].inputData[from] = {
              label: this.getLabel(this.stepData[from].appId),
              dataId: dataId,
              property: arr[i].property,
            };
          }
        }
      }
    },
    startEditRelation() {
      let app = JSON.parse(JSON.stringify(this.relationEditor));
      // console.log("this.stepData: ", this.stepData);
      app.dsl = {
        data: {
          nodes: this.stepData.map((item) => {
            return {
              id: item.appId,
              name: this.getLabel(item.appId).slice(0, 5),
            };
          }),
          allLines: this.accountData.allLines,
        },
      };
      let callback = () => {
        this.accountData.allLines = app.card.task.vueItem.allLines || [];
        this.$message.success("Agent 依赖关系已更新成功。");
        webCpu.CardItem.dismissMask(document.body);
      };
      webCpu.renderCardDialog(document.body, app, {
        title: this.relationEditor.tips,
        closeType: "back",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        menu: [
          {
            label: "确认",
            action: callback,
          },
        ],
      });
    },
    handleEditingDialog() {
      this.editingApps = JSON.parse(JSON.stringify(this.apps));
      this.$nextTick(() => {
        this.showAppConfig = true;
      });
    },
    handleConfirmDialog() {
      this.apps = JSON.parse(JSON.stringify(this.editingApps));
      this.showAppConfig = false;
    },
    addItem() {
      this.editingApps.push({
        value: "",
        label: "新应用",
      });
    },
    resetToDefault() {
      this.$confirm(`确认要恢复初始列表吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.editingApps = JSON.parse(JSON.stringify(this.apps));
          this.$message.success("已恢复默认设置");
        })
        .catch(() => {});
    },
    removeItem(index) {
      this.editingApps.splice(index, 1);
    },
    continueWorkflow() {
      if (Number(this.activeStepIndex) >= this.stepData.length - 1) {
        this.$message.warning("没有更多步骤了");
        return;
      }
      let currentNode = this.stepData[this.activeStepIndex];
      if (currentNode.resultUrl) {
        let params = WebTool.urlQuery(currentNode.resultUrl);
        let dataId = params.dataId;
        if (dataId) {
          let nextNode = this.stepData[Number(this.activeStepIndex) + 1];
          if (nextNode) {
            this.currentNodeUrl = WebTool.attachParams(
              nextNode.currentNodeUrl,
              {
                inputItem: dataId,
                auto: true,
              }
            );
          }
        }
      } else {
        this.$message.warning(
          "当前步骤没有结果可展示，请先在下方完成当前步骤的操作"
        );
      }
    },
    handleTitleChange(e) {
      let elem = e.currentTarget;
      this.title = elem.innerText;
      document.title = elem.innerText;
    },
    resetWorkflow() {
      this.$confirm(
        "确定要重置当前执行结果和状态吗？",
        webCpu.messages[lang].confirmDialogTitle,
        {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }
      ).then(() => {
        this.stepData = this.stepData.map((item) => {
          item.resultUrl = "";
          return item;
        });
        this.refreshCurrentWorkflow(0, "currentNodeUrl");
      });
    },
    initStepData() {
      let arr = this.accountData.workflow || [];
      this.stepData = [];
      this.agentResults = this.agentResults || [];
      let temp = [this.accountData.appId];
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        if (temp.indexOf(item) === -1) {
          temp.push(item);
          this.stepData.push({
            appId: item,
            currentNodeUrl: this.getUrl(item),
            resultUrl: this.isViewer
              ? this.agentResults[i + 1]
                ? this.agentResults[i + 1].resultUrl
                : ""
              : "",
          });
        }
      }
      this.activeStepIndex = 0;
      this.stepData.unshift({
        appId: this.accountData.appId,
        currentNodeUrl: this.getUrl(),
        resultUrl: this.isViewer
          ? this.agentResults[0]
            ? this.agentResults[0].resultUrl
            : ""
          : "",
      });
      this.currentNodeUrl = this.isViewer
        ? this.stepData[0].resultUrl || this.getUrl()
        : this.getUrl();

      //this.accountData.allLines = [];
    },
    exportWorkflow(type, isViewer) {
      let config = {
        title: this.title,
        accountData: this.accountData,
        apps: this.apps,
      };
      if (type === "record") {
        config.isViewer = true;
        config.agentResults = this.stepData.map((item) => {
          return {
            appId: item.appId,
            resultUrl: item.resultUrl,
          };
        });
      } else {
        config.isViewer = isViewer;
        config.agentResults = [];
      }
      let time = new Date()
        .toLocaleString()
        .replace(/\//g, "-")
        .replace(/:\s*/g, "-");
      let tName = `${config.title || "workflow"}-${time}.html`;
      WebTool.exportWorkflow(
        config,
        (name) => {
          this.$message.success("工作流已导出，文件名: " + name);
        },
        config.isViewer ? tName : ""
      );
    },
    refreshCurrentWorkflow(index, flag) {
      let url = "";
      if (!flag) {
        url =
          this.stepData[index].resultUrl || this.stepData[index].currentNodeUrl;
      } else {
        url = this.stepData[index][flag] || this.stepData[index].currentNodeUrl;
      }
      this.currentNodeUrl = WebTool.attachParams(url, {
        _t: new Date().getTime(),
      });

      this.activeStepIndex = index || 0;
    },
    getLabel(val) {
      val = val || "";
      const item = this.apps.find((a) => a.value === val);
      return item ? item.label : val.slice(0, 5);
    },
    getUrl(id) {
      let params = {
        headerHidden: true,
        workflow: this.accountData.workflow.join(","),
        id: id || this.accountData.appId,
        solo: true,
      };
      let url = webCpu.documentPrefix;
      return typeof WebTool !== "undefined"
        ? WebTool.attachParams(url, params)
        : url;
    },
    initIframeMonitor() {
      const iframe = this.$refs.workflowFrame;
      console.log("iframe DOM 节点: ", iframe);
      if (!iframe) return;

      const checkUrl = (currentUrl) => {
        try {
          if (!iframe.contentWindow) return;

          let params = WebTool.urlQuery(currentUrl);

          params.workflow = params.workflow || "";
          let workflow = params.workflow.split(",");

          let id = params.id;
          let inputItem = params.inputItem;
          let dataId = params.dataId;
          let stepIndex = workflow.indexOf(id) + 1;

          this.activeStepIndex = stepIndex;

          console.log("当前 URL: ", currentUrl, "stepIndex: ", stepIndex);

          if (stepIndex < this.stepData.length) {
            this.activeStepIndex = stepIndex;
            let node = this.stepData[stepIndex - 1] || {};
            let url = webCpu.documentPrefix;
            if (inputItem) {
              params.id = node.appId;
              params.dataId = inputItem;
              delete params.inputItem;
              node.resultUrl = WebTool.attachParams(url, params);
            } else if (dataId) {
              params.id = this.stepData[stepIndex].appId;
              this.stepData[stepIndex].resultUrl = WebTool.attachParams(
                url,
                params
              );
            }

            if (inputItem) {
              this.updateInputData(stepIndex - 1, inputItem);
              if (this.stepData[stepIndex].inputData) {
                let tParams = WebTool.urlQuery(currentUrl);
                tParams.inputData = JSON.stringify(
                  this.stepData[stepIndex].inputData
                );
                delete tParams.inputItem;

                console.log(
                  "this.stepData[stepIndex].inputData: ",
                  this.stepData[stepIndex].inputData
                );

                currentUrl = WebTool.attachParams(
                  webCpu.documentPrefix,
                  tParams
                );
              }
              iframe.src = currentUrl;
            }

            console.log("上一步数据 (node): ", node);
            console.log("当前步数据: ", this.stepData[stepIndex]);
            console.log("步骤数据: ", this.stepData);
          }
        } catch (e) {
          console.warn("捕获异常: ", e);
        }
      };

      let callback = function (event) {
        if (event.data && event.data.type === "IFRAME_URL_CHANGE") {
          const latestIframeUrl = event.data.url;

          checkUrl(latestIframeUrl);
          console.log("获取到 iframe 最新的 URL:", latestIframeUrl);
        }
      };
      window.removeEventListener("message", callback);
      window.addEventListener("message", callback);
      this._iframeMessageCallback = callback;
    },
  },
  mounted() {
    this.initIframeMonitor();
    this.initStepData();
  },
  beforeUnmount() {
    if (this._iframeMessageCallback) {
      window.removeEventListener("message", this._iframeMessageCallback);
      this._iframeMessageCallback = null;
    }
    const iframe = this.$refs.workflowFrame;
    if (iframe) {
      iframe.onload = null;
    }
  },
};
</script>

<style scoped>
.tw-bg-page-gradient {
  background: linear-gradient(160deg, #f8f9ff 0%, #f1f4fe 40%, #f5f3ff 100%);
  min-height: 100vh;
}

.tw-bg-indigo-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
}

.tw-shadow-icon {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.tw-shadow-card {
  box-shadow: 0 2px 16px rgba(99, 102, 241, 0.07), 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tw-shadow-iframe {
  box-shadow: 0 8px 40px rgba(99, 102, 241, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tw-w-custom-160 {
  width: 160px !important;
}

.tw-w-custom {
  width: 240px !important;
}

.tw-h-30 {
  height: 30px !important;
  line-height: 30px !important;
}

.tw-h-viewer {
  height: 105vh !important;
}

.tw-max-w-900 {
  width: 100%;
  max-width: 900px !important;
}

.header-action-btn {
  border-color: #e0e7ff !important;
  color: #6366f1 !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease !important;
}

.header-action-btn:hover {
  border-color: #a5b4fc !important;
  background: #eef2ff !important;
  box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.18) !important;
  transform: translateY(-1px) !important;
}

/* 3D Glossy Metallic AI Bot Head */
.tw-ai-bot-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(20, 184, 166, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(45, 212, 191, 0.6);
  position: relative;
  overflow: hidden;
}

.tw-ai-bot-icon::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 60%
  );
  transform: rotate(45deg);
  pointer-events: none;
}

.tw-bot-icon-inner {
  color: #2dd4bf;
  font-size: 18px;
  text-shadow: 0 0 8px #2dd4bf, 0 0 15px #5eead4;
  z-index: 1;
}

.tw-drop-shadow-glow {
  filter: drop-shadow(0 0 4px rgba(45, 212, 191, 0.8));
}

/* Input Fields with Soft Inner Shadows and Glow */
.configuration-wrapper {
  background: #ffffff;
  border: 1px solid rgba(45, 212, 191, 0.3) !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 15px rgba(45, 212, 191, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 50px;
}

.configuration-wrapper:hover {
  border-color: rgba(168, 85, 247, 0.5) !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 20px rgba(168, 85, 247, 0.15) !important;
}

.configuration-wrapper:focus-within {
  border-color: #a855f7 !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 3px rgba(168, 85, 247, 0.2), 0 0 25px rgba(168, 85, 247, 0.25) !important;
}

/* Select Dropdown Tags Enhancement */
:deep(.el-select__tags .el-tag) {
  background: linear-gradient(135deg, #f0fdfa, #faf5ff) !important;
  border: 1px solid rgba(45, 212, 191, 0.4) !important;
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.9),
    0 2px 5px rgba(168, 85, 247, 0.1) !important;
  color: #1e293b !important;
  border-radius: 8px !important;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-select__tags .el-tag:hover) {
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.9),
    0 3px 8px rgba(168, 85, 247, 0.2) !important;
  transform: translateY(-1px);
}

.custom-select-no-border :deep(.el-select__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  padding: 6px 8px !important;
}

.custom-select-no-border :deep(.el-select__wrapper:hover) {
  background: rgba(240, 253, 250, 0.5) !important;
  border-radius: 10px !important;
}

.mobile-select-bordered :deep(.el-select__wrapper) {
  border: 1px solid #ccfbf1 !important;
  border-radius: 12px !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02) !important;
  padding: 6px 10px !important;
  transition: all 0.3s ease !important;
}

.mobile-select-bordered :deep(.el-select__wrapper:hover) {
  border-color: #5eead4 !important;
  box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.2) !important;
}

.mobile-select-bordered :deep(.el-select__wrapper.is-focused) {
  border-color: #a855f7 !important;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2) !important;
}

.steps-panel {
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%) !important;
}

/* --- Cyber/Neon Timeline & Milestones --- */
.custom-cyber-steps :deep(.el-step__line) {
  background: linear-gradient(90deg, #14b8a6, #a855f7) !important;
  height: 6px !important;
  top: 13px !important;
  border-radius: 3px !important;
  box-shadow: 0 0 12px rgba(20, 184, 166, 0.5), 0 0 12px rgba(168, 85, 247, 0.5) !important;
  opacity: 0.15;
  transition: opacity 0.5s ease;
}

.custom-cyber-steps :deep(.el-step__head.is-success .el-step__line),
.custom-cyber-steps :deep(.el-step__head.is-process .el-step__line) {
  opacity: 1;
}

.custom-cyber-steps :deep(.el-step__icon) {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #f8fafc !important;
  border: 2px solid #cbd5e1 !important;
  color: transparent !important;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.custom-cyber-steps :deep(.el-step__icon-inner) {
  display: none !important;
}

.custom-cyber-steps :deep(.el-step__head.is-success .el-step__icon) {
  background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
  border: none !important;
  box-shadow: 0 0 15px rgba(20, 184, 166, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.4) !important;
}

.custom-cyber-steps :deep(.el-step__head.is-success .el-step__icon::before) {
  content: "\F26A";
  font-family: "bootstrap-icons";
  color: #ffffff !important;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.custom-cyber-steps :deep(.el-step__head.is-process .el-step__icon) {
  background: linear-gradient(135deg, #a855f7, #7e22ce) !important;
  border: none !important;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.7),
    inset 0 2px 4px rgba(255, 255, 255, 0.4) !important;
  animation: pulse-glow 2s infinite;
}

.custom-cyber-steps :deep(.el-step__head.is-process .el-step__icon::before) {
  content: "\F4E1";
  font-family: "bootstrap-icons";
  color: #ffffff !important;
  font-size: 16px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.6),
      inset 0 2px 4px rgba(255, 255, 255, 0.4);
  }

  50% {
    box-shadow: 0 0 25px rgba(168, 85, 247, 0.9),
      inset 0 2px 4px rgba(255, 255, 255, 0.4);
  }

  100% {
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.6),
      inset 0 2px 4px rgba(255, 255, 255, 0.4);
  }
}

.activeStepItem .el-step__title {
  color: #9333ea !important;
  font-weight: 700 !important;
  text-shadow: 0 0 8px rgba(168, 85, 247, 0.3);
}

.iframe-glow {
  position: relative;
}

.iframe-glow::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.15),
    rgba(168, 85, 247, 0.1),
    rgba(20, 184, 166, 0.08)
  );
  z-index: -1;
  pointer-events: none;
}

.empty-panel {
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%) !important;
  transition: border-color 0.3s ease;
}

.empty-panel:hover {
  border-color: #c7d2fe !important;
}

.optionsBtnArea {
  position: absolute;
  z-index: 1000;
  right: 0px;
  height: 108px;
  width: 50px;
  text-align: center;
  top: 0px;
  background: linear-gradient(
    180deg,
    rgba(240, 253, 250, 0.9) 0%,
    rgba(250, 245, 255, 0.7) 100%
  ) !important;
  border-radius: 0 16px 16px 0 !important;
  backdrop-filter: blur(8px);
  border-left: 1px solid rgba(45, 212, 191, 0.2);
}

.reset-btn,
.continue-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  border-color: #ccfbf1 !important;
  color: #14b8a6 !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

.el-button[disabled] {
  border-color: #f1f5f9 !important;
  color: #cbd5e1 !important;
  background: #f8fafc !important;
  box-shadow: none !important;
  cursor: not-allowed !important;
}

.continue-btn:hover {
  transform: scale(1.1) !important;
  border-color: #a855f7 !important;
  color: #9333ea !important;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2),
    0 4px 12px rgba(168, 85, 247, 0.2) !important;
  background: #faf5ff !important;
}

.reset-btn:hover {
  transform: rotate(30deg) scale(1.1) !important;
  border-color: #5eead4 !important;
  color: #0d9488 !important;
  box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.2),
    0 4px 12px rgba(20, 184, 166, 0.2) !important;
  background: #f0fdfa !important;
}
</style>