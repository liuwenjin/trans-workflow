<template>
  <div id="rootContainerItem" class="tw-relative tw-p-6">
    <el-card class="tw-rounded-2xl tw-shadow-lg tw-border-0 tw-bg-white">
      <div class="tw-mb-6 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-3">
          <div
            class="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-lg tw-bg-blue-main tw-text-white"
          >
            <i class="bi bi-diagram-3 tw-text-lg"></i>
          </div>
          <h2
            class="tw-text-lg tw-font-semibold tw-leading-relaxed tw-text-slate-900"
          >
            Agent 依赖关系编排器
          </h2>
        </div>
        <el-button
          type="primary"
          size="small"
          @click="showAddLineDialog = true"
          :disabled="isAddLineDisabled"
        >
          <i class="bi bi-plus-lg tw-mr-1"></i>
          新增连线
        </el-button>
      </div>

      <div
        class="tw-relative tw-overflow-x-auto tw-bg-slate-50 tw-rounded-xl tw-p-6 tw-pb-24 canvas-container"
        style="min-height: 320px"
      >
        <svg
          ref="svgCanvas"
          class="tw-absolute tw-top-0 tw-left-0 tw-pointer-events-none tw-z-10"
          :width="svgWidth"
          :height="svgHeight"
        >
          <line
            v-for="(line, idx) in serialLines"
            :key="`serial-${idx}`"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            class="tw-stroke-blue-400"
            style="stroke-width: 2px"
            marker-end="url(#arrowblue)"
          />

          <path
            v-for="(line, idx) in extraLines"
            :key="`extra-${idx}`"
            :ref="
              (el) => {
                if (el) extraLineRefs[idx] = el;
              }
            "
            :d="line.path"
            stroke-dasharray="5,5"
            class="tw-stroke-purple-main tw-stroke-2 tw-fill-none tw-cursor-pointer tw-pointer-events-auto tw-transition-all extra-path-dashed"
            marker-end="url(#arrowpurple)"
            @click="selectExtraLine(idx)"
            @mouseenter="hoveredLineIdx = idx"
            @mouseleave="hoveredLineIdx = -1"
            :class="{
              'tw-stroke-orange-500': selectedLineIdx === idx,
              'tw-stroke-purple-700 tw-stroke-[3px]':
                hoveredLineIdx === idx && selectedLineIdx !== idx,
            }"
          />

          <defs>
            <marker
              id="arrowblue"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
            </marker>
            <marker
              id="arrowpurple"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#a855f7" />
            </marker>
          </defs>
        </svg>

        <div
          class="tw-relative tw-flex tw-gap-24 tw-justify-start tw-items-center tw-z-20"
          style="min-height: 180px; padding: 20px 0"
        >
          <div
            v-for="(node, idx) in nodes"
            :key="node.id"
            :ref="
              (el) => {
                if (el) nodeRefs[idx] = el;
              }
            "
            class="tw-flex tw-flex-col tw-items-center tw-flex-shrink-0"
          >
            <div
              class="tw-rounded-lg tw-border-2 tw-border-blue-300 tw-bg-white tw-shadow-md tw-p-4 tw-w-32 tw-text-center tw-transition-all"
              :class="{
                'tw-border-blue-500 tw-shadow-lg': hoveredNodeIdx === idx,
              }"
              @mouseenter="hoveredNodeIdx = idx"
              @mouseleave="hoveredNodeIdx = -1"
            >
              <div
                class="tw-text-xs tw-font-semibold tw-leading-relaxed tw-text-slate-500 tw-mb-1"
              >
                {{ node.id.slice(0, 5) }}#{{ idx }}
              </div>
              <div
                class="tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900"
              >
                {{ node.name }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-for="(line, idx) in serialLines"
          :key="`serial-btn-${idx}`"
          class="tw-absolute tw-pointer-events-auto tw-z-30"
          :style="getSerialLineMenuPosition(idx)"
        >
          <el-button
            type="info"
            size="small"
            circle
            class="tw-shadow tw-bg-white tw-border-blue-300 tw-text-blue-500 hover:tw-bg-blue-50 tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center"
            @click.stop="editLineProperty(line.rawIndex)"
          >
            <i class="bi bi-pencil-square tw-text-xs"></i>
          </el-button>
        </div>

        <div
          v-for="(line, idx) in extraLines"
          :key="`menu-${idx}`"
          class="tw-absolute tw-pointer-events-auto tw-flex tw-flex-col tw-items-center tw-transition-transform"
          :style="getLineMenuPosition(idx)"
          @mouseenter="hoveredLineIdx = idx"
          @mouseleave="hoveredLineIdx = -1"
        >
          <el-button
            type="primary"
            size="small"
            circle
            @click.stop="toggleLineMenu(idx)"
            class="tw-shadow-md tw-flex-shrink-0 tw-border-2 tw-transition-all"
            :class="[
              selectedLineIdx === idx
                ? 'tw-border-orange-500 tw-bg-orange-500'
                : hoveredLineIdx === idx
                ? 'tw-border-purple-700 tw-scale-110'
                : 'tw-border-purple-300',
              'line-menu-btn',
            ]"
            :title="`连线 ${nodes[line.from].id}#${nodes[line.from].name} → ${
              nodes[line.to].id
            }#${nodes[line.to].name}`"
          >
            <span class="tw-text-[10px] tw-font-bold"
              >{{ line.from }}-{{ line.to }}</span
            >
          </el-button>

          <div
            v-if="expandedLineMenuIdx === idx"
            class="tw-absolute tw-bottom-full tw-mb-2 tw-flex tw-flex-col tw-bg-white tw-rounded-lg tw-shadow-lg tw-border tw-border-slate-200 tw-overflow-hidden tw-z-40"
          >
            <button
              @click="editLineProperty(line.rawIndex)"
              class="tw-px-3 tw-py-2 tw-text-sm tw-text-slate-700 tw-hover:bg-slate-50 tw-transition-all tw-flex tw-items-center tw-gap-2 tw-whitespace-nowrap"
            >
              <i class="bi bi-pencil-square"></i>
              编辑
            </button>
            <button
              @click="deleteExtraLine(line.rawIndex)"
              class="tw-px-3 tw-py-2 tw-text-sm tw-text-red-600 tw-hover:bg-red-50 tw-transition-all tw-flex tw-items-center tw-gap-2 tw-whitespace-nowrap"
            >
              <i class="bi bi-trash"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showAddLineDialog"
      title="新增连线"
      width="400px"
      @close="resetLineForm"
    >
      <div class="tw-space-y-4">
        <div>
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >起点节点</label
          >
          <el-select
            v-model="lineForm.from"
            placeholder="选择起点"
            class="tw-w-full"
            @change="startNodeChange(lineForm.from)"
          >
            <el-option
              v-for="(node, idx) in nodes"
              :key="node.id"
              :label="`${node.id.slice(0, 5)}#${idx} - ${node.name.slice(
                0,
                8
              )}`"
              :value="idx"
            />
          </el-select>
        </div>
        <div>
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >终点节点</label
          >
          <el-select
            v-model="lineForm.to"
            placeholder="选择终点"
            class="tw-w-full"
          >
            <el-option
              v-for="(node, idx) in nodes"
              :key="node.id"
              :label="`${node.id.slice(0, 5)}#${idx} - ${node.name.slice(
                0,
                8
              )}`"
              :value="idx"
              :disabled="isNodeDisabled(idx)"
            />
          </el-select>
        </div>
        <div>
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >连线属性</label
          >
          <el-select
            v-model="lineForm.property"
            placeholder="选择属性"
            class="tw-w-full"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in currentOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <div>
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >备注</label
          >
          <el-input
            v-model="lineForm.remark"
            type="textarea"
            placeholder="添加备注信息"
            :rows="3"
          />
        </div>
      </div>
      <template #footer>
        <div class="tw-flex tw-gap-2 tw-justify-end">
          <el-button @click="showAddLineDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddLine">添加</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showEditLineDialog"
      title="编辑连线属性"
      width="400px"
      @close="resetLineForm"
    >
      <div class="tw-space-y-4">
        <div v-if="lineForm.from !== null && lineForm.to !== null">
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >连线路径</label
          >
          <div
            class="tw-rounded tw-bg-slate-50 tw-px-3 tw-py-2 tw-text-sm tw-leading-relaxed tw-text-slate-700"
          >
            {{ nodes[lineForm.from].id.slice(0, 5) }}#{{ lineForm.from }}[{{
              nodes[lineForm.from].name
            }}] → {{ nodes[lineForm.to].id.slice(0, 5) }}#{{ lineForm.to }}[{{
              nodes[lineForm.to].name
            }}]
          </div>
        </div>
        <div>
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >连线属性</label
          >
          <el-select
            v-model="lineForm.property"
            placeholder="选择属性"
            multiple
            @change="handlePropertyChange()"
            collapse-tags
            collapse-tags-tooltip
            class="tw-w-full"
          >
            <el-option
              v-for="item in currentOptions"
              :key="item"
              :label="item"
              :value="item"
            />
            <el-option
              v-if="Number(lineForm.to) - Number(lineForm.from) === 1"
              label="(none)"
              value="(none)"
              key="(none)"
            ></el-option>
          </el-select>
          <span
            style="font-size: 12px; margin-top: 5px; color: #888"
            v-if="lineForm.property.indexOf('(none)') !== -1"
            >当前相邻节点不传递数据</span
          >
        </div>
        <div>
          <label
            class="tw-block tw-text-sm tw-font-medium tw-leading-relaxed tw-text-slate-900 tw-mb-2"
            >备注</label
          >
          <el-input
            v-model="lineForm.remark"
            type="textarea"
            placeholder="添加备注信息"
            :rows="3"
          />
        </div>
      </div>
      <template #footer>
        <div class="tw-flex tw-gap-2 tw-justify-end">
          <el-button @click="showEditLineDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmEditLine">更新</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AgentWorkflowOrchestrator",
  data() {
    return {
      nodes: [
        { id: "agent-1", name: "数据采集" },
        { id: "agent-2", name: "数据清洗" },
        { id: "agent-3", name: "特征工程" },
      ],
      // 统一的连线数据中心，合并管理相邻和非相邻连线
      allLines: [],
      showAddLineDialog: false,
      showEditLineDialog: false,
      currentOptions: [],
      lineForm: {
        from: null,
        to: null,
        property: [],
        remark: "",
      },
      editingLineRawIdx: -1, // 正在编辑的连线在 allLines 中的真实索引
      selectedLineIdx: -1,
      hoveredNodeIdx: -1,
      hoveredLineIdx: -1,
      expandedLineMenuIdx: -1,
      svgWidth: 0,
      svgHeight: 0,
      nodePositions: [],
      extraLineRefs: {},
      nodeRefs: {},
    };
  },
  computed: {
    // 过滤出相邻节点的基础连线，计算坐标用于 SVG 直线渲染
    serialLines() {
      const lines = [];
      if (this.nodePositions.length < this.nodes.length) return lines;

      this.allLines.forEach((line, index) => {
        if (line.to - line.from === 1) {
          const pos1 = this.nodePositions[line.from];
          const pos2 = this.nodePositions[line.to];
          if (pos1 && pos2) {
            lines.push({
              rawIndex: index, // 保留其在全量数组中的真实索引
              from: line.from,
              to: line.to,
              x1: pos1.x + pos1.width + 2,
              y1: pos1.y + pos1.height / 2,
              x2: pos2.x - 2,
              y2: pos2.y + pos2.height / 2,
            });
          }
        }
      });
      return lines;
    },
    // 过滤出跨节点的额外连线，计算路径用于 SVG 贝塞尔曲线渲染
    extraLines() {
      const lines = [];
      this.allLines.forEach((line, index) => {
        if (line.to - line.from > 1) {
          lines.push({
            ...line,
            rawIndex: index, // 保留其在全量数组中的真实索引
            path: this.getExtraLinePath(line),
          });
        }
      });
      return lines;
    },
    isAddLineDisabled() {
      const maxExtraLines =
        (this.nodes.length * (this.nodes.length - 1)) / 2 -
        (this.nodes.length - 1);
      return this.extraLines.length >= maxExtraLines;
    },
  },
  watch: {
    nodePositions: {
      handler() {
        this.updateSvgDimensions();
      },
      deep: true,
    },
  },
  methods: {
    toggleLineMenu(idx) {
      this.expandedLineMenuIdx = this.expandedLineMenuIdx === idx ? -1 : idx;
    },
    getLineOptions(nodeIdx, callback) {
      const node = this.nodes[nodeIdx] || this.nodes[0];
      if (typeof aigcInterface !== "undefined" && aigcInterface.getAppData) {
        aigcInterface.getAppData(
          node.id,
          (data) => {
            let keys = Object.keys(data);
            if (typeof callback === "function") callback(keys);
          },
          () => {
            if (typeof callback === "function") callback([]);
          }
        );
      } else {
        if (typeof callback === "function")
          callback(["condition", "data-flow", "error-handler", "parallel"]);
      }
    },
    getSerialLineMenuPosition(idx) {
      const line = this.serialLines[idx];
      if (!line) return { display: "none" };

      const midX = (line.x1 + line.x2) / 2;
      const midY = (line.y1 + line.y2) / 2;

      return {
        left: `${midX}px`,
        top: `${midY - 14}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 35,
      };
    },
    getLineMenuPosition(idx) {
      const pathEl = this.extraLineRefs[idx];
      const line = this.extraLines[idx];
      if (!pathEl || !line) return { display: "none" };

      try {
        const totalLength = pathEl.getTotalLength();
        const step = line.to - line.from;
        const ratio = Math.min(0.12 + step * 0.03, 0.35);
        const offsetPoint = pathEl.getPointAtLength(totalLength * ratio);

        return {
          left: `${offsetPoint.x}px`,
          top: `${offsetPoint.y - 12}px`,
          transform: "translate(-50%, -50%)",
          zIndex:
            this.expandedLineMenuIdx === idx
              ? 45
              : this.hoveredLineIdx === idx
              ? 42
              : 30,
        };
      } catch (e) {
        return { display: "none" };
      }
    },
    isNodeDisabled(idx) {
      if (this.lineForm.from === null) return false;
      if (idx - this.lineForm.from === 1) return true; // 相邻节点不可再次手动添加
      return (
        idx <= this.lineForm.from ||
        this.allLines.some(
          (line) => line.from === this.lineForm.from && line.to === idx
        )
      );
    },
    calculateNodePositions() {
      const action = () => {
        const newPositions = [];
        let valid = true;

        for (let i = 0; i < this.nodes.length; i++) {
          const el = this.nodeRefs[i];
          if (el) {
            const rect = el.getBoundingClientRect();
            const svgRect = this.$refs.svgCanvas?.getBoundingClientRect();
            if (svgRect) {
              newPositions.push({
                x: rect.left - svgRect.left,
                y: rect.top - svgRect.top,
                width: rect.width,
                height: rect.height,
              });
            } else {
              valid = false;
            }
          } else {
            valid = false;
          }
        }
        if (valid && newPositions.length === this.nodes.length) {
          this.nodePositions = newPositions;
        }
      };

      this.$nextTick(() => {
        action();
        setTimeout(action, 60);
      });
    },
    updateSvgDimensions() {
      const container = this.$refs.svgCanvas?.parentElement;
      if (container) {
        this.svgWidth = container.scrollWidth;
        this.svgHeight = Math.max(360, container.scrollHeight);
      }
    },
    handlePropertyChange() {
      if (this.lineForm.property.indexOf("(none)") !== -1) {
        this.lineForm.property = ["(none)"];
      }
    },
    getExtraLinePath(line) {
      if (!this.nodePositions[line.from] || !this.nodePositions[line.to])
        return "";

      const from = this.nodePositions[line.from];
      const to = this.nodePositions[line.to];

      const x1 = from.x + from.width;
      const y1 = from.y + from.height / 2;
      const x2 = to.x;
      const y2 = to.y + to.height / 2;

      const distance = Math.abs(x2 - x1);
      const controlOffset = Math.min(distance / 3, 80);
      const step = line.to - line.from;
      const curveHeight = 35 + step * 20;

      return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1 + curveHeight}, ${
        x2 - controlOffset
      } ${y2 + curveHeight}, ${x2} ${y2}`;
    },
    // 合并后的统一编辑函数（支持基础连线和跨节点连线）
    editLineProperty(rawIndex) {
      const line = this.allLines[rawIndex];
      if (!line) return;

      this.lineForm = {
        from: line.from,
        to: line.to,
        property: Array.isArray(line.property)
          ? [...line.property]
          : line.property
          ? [line.property]
          : [],
        remark: line.remark || "",
      };

      this.editingLineRawIdx = rawIndex;
      this.showEditLineDialog = true;
      this.expandedLineMenuIdx = -1;

      // 依据起点的 index 获取异步下拉配置项数据
      this.getLineOptions(line.from, (arr) => {
        this.currentOptions = arr;
      });
    },
    // 确认更新属性逻辑
    confirmEditLine() {
      if (this.editingLineRawIdx !== -1) {
        const targetLine = this.allLines[this.editingLineRawIdx];
        this.allLines[this.editingLineRawIdx] = {
          ...targetLine,
          property: this.lineForm.property,
          remark: this.lineForm.remark,
        };
        this.showEditLineDialog = false;
        this.resetLineForm();
        this.calculateNodePositions();
        console.log("this.allLines: ", this.allLines);
      }
    },
    selectExtraLine(idx) {
      this.selectedLineIdx = this.selectedLineIdx === idx ? -1 : idx;
    },
    deleteExtraLine(rawIndex) {
      this.$confirm("确定删除该连线？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.allLines.splice(rawIndex, 1);
          this.selectedLineIdx = -1;
          this.expandedLineMenuIdx = -1;
          this.extraLineRefs = {}; // 重置引用触发重算
          this.calculateNodePositions();
          console.log("this.allLines (After Delete): ", this.allLines);
        })
        .catch(() => {});
    },
    startNodeChange(from) {
      this.getLineOptions(from, (arr) => {
        this.currentOptions = arr;
        this.lineForm.property = [];
      });
    },
    confirmAddLine() {
      if (
        this.lineForm.from === null ||
        this.lineForm.to === null ||
        this.lineForm.from >= this.lineForm.to
      ) {
        this.$message.error("请选择有效的连线路径");
        return;
      }

      const isExists = this.allLines.some(
        (line) =>
          line.from === this.lineForm.from && line.to === this.lineForm.to
      );
      if (isExists) {
        this.$message.error("该连线已存在");
        return;
      }

      this.allLines.push({
        from: this.lineForm.from,
        to: this.lineForm.to,
        property: this.lineForm.property,
        remark: this.lineForm.remark,
      });

      this.showAddLineDialog = false;
      this.resetLineForm();
      this.calculateNodePositions();
      console.log("this.allLines (After Add): ", this.allLines);
    },
    resetLineForm() {
      this.lineForm = {
        from: null,
        to: null,
        property: [],
        remark: "",
      };
      this.editingLineRawIdx = -1;
    },
  },
  mounted() {
    // 1. 生成默认的相邻节点基础连线
    const baseLines = [];
    for (let i = 0; i < this.nodes.length - 1; i++) {
      baseLines.push({
        from: i,
        to: i + 1,
        property: [],
        remark: "",
      });
    }

    // 2. 将已有数据（假设从外部、本地存储或组件现有变量传入）与基础连线合并取并集
    // 这里的 this.allLines 可以是父组件传入的 prop，也可以是本地已有的持久化数据
    const existingLines = this.allLines || [];

    // 3. 以 from 和 to 为唯一标识进行去重合并
    // 策略：如果 existingLines 中已存在该路径，则优先使用已有的（保留自定义属性）；否则使用基础连线
    const mergedLines = [...existingLines];

    baseLines.forEach((baseLine) => {
      const isAlreadyExists = mergedLines.some(
        (line) => line.from === baseLine.from && line.to === baseLine.to
      );
      if (!isAlreadyExists) {
        mergedLines.push(baseLine);
      }
    });

    // 4. 对合并后的连线按照路径先后顺序做个微型排序（可选，方便维护和 debug）
    mergedLines.sort((a, b) => {
      if (a.from === b.from) return a.to - b.to;
      return a.from - b.from;
    });

    // 5. 最终赋值
    this.allLines = mergedLines;

    // 6. 触发布局计算
    this.calculateNodePositions();
    window.addEventListener("resize", this.calculateNodePositions);
    console.log("Union merged allLines: ", this.allLines);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculateNodePositions);
  },
};
</script>

<style scoped>
.tw-bg-blue-main {
  background-color: rgba(59, 130, 246, 0.1);
}
.tw-stroke-blue-400 {
  stroke: #60a5fa !important;
}
.tw-stroke-purple-main {
  stroke: #a855f7;
}
.tw-stroke-purple-700 {
  stroke: #6b21a8;
}
.tw-stroke-orange-500 {
  stroke: #f97316;
}
.tw-border-blue-300 {
  border-color: #93c5fd;
}
.tw-border-blue-500 {
  border-color: #3b82f6;
}
.tw-border-purple-300 {
  border-color: #d8b4fe;
}
.tw-border-purple-700 {
  border-color: #6b21a8;
}
.tw-border-orange-500 {
  border-color: #ea580c;
}
.tw-bg-orange-500 {
  background-color: #f97316 !important;
  color: #ffffff !important;
}
.tw-bg-blue-50 {
  background-color: #eff6ff;
}
.tw-cursor-pointer {
  cursor: pointer;
}
.extra-path-dashed {
  transition: stroke 0.3s, stroke-width 0.3s;
}
.line-menu-btn {
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #a855f7;
}
.line-menu-btn:hover {
  background-color: #f3e8ff;
}
.canvas-container {
  position: relative;
}
</style>