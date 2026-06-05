<template>
  <div id="rootContainerItem" class="tw-relative tw-bg-slate-50 tw-px-5">
    <div class="tw-w-full tw-max-w-5xl tw-mx-auto tw-pt-8 tw-relative">
      <div class="tw-w-full tw-flex tw-justify-between">
        <h1
          :class="[
            'tw-font-bold tw-text-gray-900 tw-whitespace-nowrap tw-m-0',
            flag ? 'tw-text-xl' : 'tw-text-2xl tw-w-custom-160',
          ]"
        >
          {{ title || "极简工作流" }}
        </h1>
        <el-button text type="primary" @click="exportWorkflow()">
          导出工作流
        </el-button>
      </div>
      <div
        :class="[
          'tw-w-full tw-mt-4 tw-relative tw-flex tw-gap-4',
          flag ? 'tw-flex-col tw-items-stretch' : 'tw-flex-row tw-items-center',
        ]"
      >
        <div
          :class="[
            'tw-flex tw-w-full',
            flag
              ? 'tw-flex-col tw-gap-3 tw-bg-transparent tw-border-none tw-shadow-none'
              : 'tw-flex-row tw-items-stretch tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-md configuration-wrapper tw-flex-1',
          ]"
        >
          <div
            :class="[
              'tw-flex tw-items-center tw-gap-2',
              flag
                ? 'tw-w-full'
                : 'tw-px-2 tw-py-1 tw-flex-initial tw-w-custom',
            ]"
          >
            <i
              class="bi bi-robot tw-text-indigo-400 tw-text-base tw-ml-1 tw-flex-shrink-0"
              v-if="!flag"
            ></i>
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
              flag ? 'tw-w-full' : 'tw-px-2 tw-py-1 tw-flex-1',
            ]"
          >
            <i
              class="bi bi-arrow-right tw-text-purple-400 tw-text-base tw-ml-1 tw-flex-shrink-0"
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
          </div>
        </div>

        <div
          :class="['tw-flex-shrink-0 tw-flex', flag ? 'tw-justify-end' : '']"
          style="position: absolute; z-index: 1000; right: 0px; bottom: -55px"
        >
          <el-button
            circle
            @click="resetWorkflow()"
            class="tw-shadow-sm reset-btn"
          >
            <el-icon>
              <refresh-right />
            </el-icon>
          </el-button>
          <slot
            v-if="
              stepData[activeStepIndex] && stepData[activeStepIndex].resultUrl
            "
          >
            <el-button
              circle
              @click="continueWorkflow()"
              class="tw-shadow-sm continue-btn tw-mt-2"
            >
              <el-icon>
                <el-icon><video-play /></el-icon>
              </el-icon>
            </el-button>
          </slot>
        </div>
      </div>
      <div
        v-if="accountData.appId"
        class="tw-mt-6 tw-relative tw-w-full tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-sm tw-border tw-border-slate-200"
      >
        <el-steps
          class="tw-w-full tw-relative"
          :active="activeStepIndex"
          finish-status="success"
          align-center
        >
          <el-step
            :class="['tw-cursor-pointer', index === Number(activeStepIndex) ? 'activeStepItem' : '']"
            @click="refreshCurrentWorkflow(index)"
            v-for="(wf, index) in stepData"
            :key="index"
            :active="index === Number(activeStepIndex)"
            :status="getStepStuts(index)"
            :title="getLabel(wf.appId).slice(0, 5)"
          ></el-step>
        </el-steps>
      </div>
    </div>

    <div
      v-if="accountData.appId"
      class="tw-bg-white tw-max-w-5xl tw-mx-auto tw-h-viewer tw-rounded-xl tw-shadow-lg tw-overflow-hidden tw-border tw-border-slate-200 tw-mt-6"
    >
      <iframe
        ref="workflowFrame"
        :src="currentNodeUrl"
        class="tw-w-full tw-h-full tw-border-none"
        @load="initIframeMonitor"
      >
      </iframe>
    </div>

    <div
      v-else
      class="tw-py-10 tw-px-5 tw-max-w-5xl tw-mx-auto tw-bg-white tw-rounded-xl tw-border-2 tw-border-dashed tw-border-slate-200 tw-mt-6"
    >
      <el-empty description="请在上方输入 Agent ID 以加载工作流" />
    </div>
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
      },
      stepData: [],
      currentNodeUrl: "",
      flag:
        typeof WebTool !== "undefined"
          ? WebTool.adjustSize([false, false, true])
          : false,
      activeStepIndex: 0,
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
          let nextNode = this.stepData[this.activeStepIndex + 1];
          if (nextNode) {
            this.currentNodeUrl = WebTool.attachParams(nextNode.currentNodeUrl, {
              inputItem: dataId,
              auto: true
            }); 
          }
        }
      } else {
        this.$message.warning(
          "当前步骤没有结果可展示，请先在下方完成当前步骤的操作"
        );
      }
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
      let temp = [this.accountData.appId];
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        if (temp.indexOf(item) === -1) {
          temp.push(item);
          this.stepData.push({
            appId: item,
            currentNodeUrl: this.getUrl(item),
            resultUrl: "",
          });
        }
      }
      this.activeStepIndex = 0;
      this.stepData.unshift({
        appId: this.accountData.appId,
        currentNodeUrl: this.getUrl(),
        resultUrl: "",
      });
      this.currentNodeUrl = this.getUrl();
    },
    exportWorkflow() {
      let config = {
        title: this.title,
        accountData: this.accountData,
        apps: this.apps,
      };
      WebTool.exportWorkflow(config, (name) => {
        // 处理导出的 HTML 文本
        this.$message.success("工作流已导出，文件名: " + name);
      });
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
      const item = this.apps.find((a) => a.value === val);
      return item ? item.label : val;
    },
    getUrl(id) {
      let params = {
        headerHidden: true,
        workflow: this.accountData.workflow.join(","),
        id: id || this.accountData.appId,
        transformRadio: 1,
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

      // 1. 核心业务逻辑抽取（修复了原代码 node 未定义的 Bug）
      const checkUrl = (currentUrl) => {
        try {
          if (!iframe.contentWindow) return;

          if (location.origin === webCpu.documentPrefix) {
            currentUrl = iframe.contentWindow.location.href;
          }

          let params = WebTool.urlQuery(currentUrl);

          params.workflow = params.workflow || "";
          let workflow = params.workflow.split(",");

          let id = params.id;
          let inputItem = params.inputItem;
          let dataId = params.dataId;
          let stepIndex = workflow.indexOf(id) + 1;

          this.activeStepIndex = stepIndex;

          console.log("当前 URL: ", currentUrl, "stepIndex: ", stepIndex);

          if (stepIndex > 0 && stepIndex < this.stepData.length) {
            this.activeStepIndex = String(stepIndex);
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

            console.log("上一步数据 (node): ", node);
            console.log("当前步数据: ", this.stepData[stepIndex]);
            console.log("步骤数据: ", this.stepData);
          }
        } catch (e) {
          // 跨域时会捕获到错误，安全退出
          console.warn("捕获异常: ", e);
        }
      };

      if (location.origin === webCpu.documentPrefix) {
        iframe.onload = () => {
          // 每次 iframe 页面变化（硬加载），先执行一次检查
          checkUrl();
        };
      } else {
        let callback = function (event) {
          // 校验数据格式
          if (event.data && event.data.type === "IFRAME_URL_CHANGE") {
            const latestIframeUrl = event.data.url;

            checkUrl(latestIframeUrl);
            console.log("获取到 iframe 最新的 URL:", latestIframeUrl);
            // 在这里执行你需要的业务逻辑
          }
        };
        window.removeEventListener("message", callback);
        window.addEventListener("message", callback);
      }
    },
  },
  mounted() {
    this.initIframeMonitor();
    this.initStepData();
  },
};
</script>

<style scoped>
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
  height: 75vh !important;
}

.tw-max-w-900 {
  width: 100%;
  max-width: 900px !important;
}

.activeStepItem .el-step__title {
  color: #4f46e5 !important;
}

.custom-select-no-border :deep(.el-select__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  padding: 6px 8px !important;
}

.custom-select-no-border :deep(.el-select__wrapper:hover) {
  background: rgba(248, 250, 252, 0.8) !important;
  border-radius: 10px !important;
}

.mobile-select-bordered :deep(.el-select__wrapper) {
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
  padding: 6px 10px !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
}

.mobile-select-bordered :deep(.el-select__wrapper:hover) {
  border-color: #a5b4fc !important;
  box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.15) !important;
}

.mobile-select-bordered :deep(.el-select__wrapper.is-focused) {
  border-color: #818cf8 !important;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2) !important;
}

.configuration-wrapper {
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  min-height: 46px;
}

.configuration-wrapper:hover {
  border-color: #c7d2fe !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08) !important;
}

.configuration-wrapper:focus-within {
  border-color: #818cf8 !important;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18),
    0 4px 16px rgba(99, 102, 241, 0.1) !important;
}

.reset-btn,
.continue-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
  margin-top: 15px;
}

.continue-btn:hover{
  transform: scale(1.08) !important;
  border-color: #a5b4fc !important;
  color: #a5b4fc !important;
  box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.15) !important;
}

.reset-btn:hover {
  transform: rotate(30deg) scale(1.08) !important;
  border-color: #818cf8 !important;
  color: #818cf8 !important;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15) !important;
}
</style>