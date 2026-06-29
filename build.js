const fs = require('fs');
const path = require('path');

// 统一管理核心文件路径
const PATHS = {
  vue: path.join(__dirname, 'code.vue'),
  editorVue: path.join(__dirname, 'relationEditor.vue'),
  html: path.join(__dirname, 'index.html'),
  config: path.join(__dirname, 'config.json')
};

function runBuild() {
  console.log('🚀 [Build] 正在启动极简 AI 工作流多模态编译流水线...');

  try {
    // 1. 读取并校验配置文件 config.json
    if (!fs.existsSync(PATHS.config)) {
      console.error(`❌ [Error] 找不到配置文件: ${PATHS.config}`);
      return;
    }
    const configContent = fs.readFileSync(PATHS.config, 'utf8');
    const configJsonString = JSON.stringify(JSON.parse(configContent));

    // 2. 读取并转换 relationEditor.vue 为 Base64 Data URL
    if (!fs.existsSync(PATHS.editorVue)) {
      console.error(`❌ [Error] 找不到关系编辑器组件: ${PATHS.editorVue}`);
      return;
    }
    const editorContent = fs.readFileSync(PATHS.editorVue, 'utf8');
    const editorBase64 = Buffer.from(editorContent).toString('base64');
    const editorDataUrl = `data:text/plain;charset=utf-8;base64,${editorBase64}`;
    console.log('📦 [Process] relationEditor.vue 已成功转化为 Base64 缓存流.');

    // 3. 读取核心源码文件 code.vue
    if (!fs.existsSync(PATHS.vue)) {
      console.error(`❌ [Error] 找不到核心源码文件: ${PATHS.vue}`);
      return;
    }
    let vueContent = fs.readFileSync(PATHS.vue, 'utf8');

    // 4. 【严谨级校验替换】动态注入关系链 URL 到 code.vue 内存中
    // 升级正则：限定 relationEditor 后必须紧跟对象结构，提高匹配排他性
    const relationBlockRegex = /(relationEditor\s*:\s*\{[\s\S]*?\n?\s*\})/;
    if (!relationBlockRegex.test(vueContent)) {
      console.error('❌ [Error] 在 code.vue 中未匹配到 relationEditor 对象结构！');
      return;
    }

    const matchResult = vueContent.match(relationBlockRegex);
    let blockText = matchResult[0];
    
    // 在该对象块内部替换 url 属性的值
    const urlRegex = /(url\s*:\s*)([`'"][\s\S]*?)([`'"])/;
    if (!urlRegex.test(blockText)) {
      console.error('❌ [Error] relationEditor 对象内未找到 url 属性或格式不正确！');
      return;
    }
    
    // 执行块内平替
    blockText = blockText.replace(urlRegex, `$1"${editorDataUrl}"`);

    // 将修改后的整个块精准塞回原文本中（通过 match 出来的原字符串进行直接精准替换，避免正则二次检索失焦）
    const oldVueContent = vueContent;
    vueContent = vueContent.replace(matchResult[0], blockText);

    // 【核心修复：断言校验】防静默失败机制
    if (vueContent === oldVueContent || !vueContent.includes(editorDataUrl.substring(0, 40))) {
      console.error('❌ [Error] 动态平替发生静默失败！修改未成功写入 vueContent 缓冲区。');
      return;
    }
    console.log('🔗 [Link] 已将关系编辑器 Data URL 动态注入 code.vue 的 data.relationEditor.url 中.');

    // 5. 将打包好的整体 vueContent 转换为最终的 Data URL
    const finalVueBase64 = Buffer.from(vueContent).toString('base64');
    const finalVueDataUrl = `data:text/plain;charset=utf-8;base64,${finalVueBase64}`;

    // 6. 读取主体容器 index.html
    if (!fs.existsSync(PATHS.html)) {
      console.error(`❌ [Error] 找不到主体容器文件: ${PATHS.html}`);
      return;
    }
    let htmlContent = fs.readFileSync(PATHS.html, 'utf8');

    // 7. 正则匹配：替换 index.html 中的 app.task.template 
    const templateRegex = /(template:\s*[`'"])(data:text\/plain;charset=utf-8;base64,[A-Za-z0-9+/=]*)([`'"])/;
    if (!templateRegex.test(htmlContent)) {
      console.error('❌ [Error] 在 index.html 中未匹配到 app.task.template 特征结构！');
      return;
    }
    let updatedHtmlContent = htmlContent.replace(templateRegex, `$1${finalVueDataUrl}$3`);

    // 8. 正则匹配：平替 app.task.data（具备完全幂等性）
    const dataRegex = /(data:\s*)([\s\S]*?)(,\s*\n?\s*template:)/;
    if (!dataRegex.test(updatedHtmlContent)) {
      console.error('❌ [Error] 在 index.html 中未匹配到 app.task.data 特征结构！');
      return;
    }
    updatedHtmlContent = updatedHtmlContent.replace(dataRegex, `$1${configJsonString}$3`);

    // 9. 最终断言：校验 index.html 的 template 区域是否确实更新为了最新特征码
    if (!updatedHtmlContent.includes(finalVueDataUrl.substring(0, 40))) {
      console.error('❌ [Error] 写入 index.html 缓冲区的最终校验失败，拒绝写入磁盘！');
      return;
    }

    // 将最终编译成果写回容器
    fs.writeFileSync(PATHS.html, updatedHtmlContent, 'utf8');
    console.log('✨ [Success] ==========================================================');
    console.log('✨ [Success] 联动编译成功！');
    console.log('✨ [Success] relationEditor.vue -> code.vue -> config.json -> index.html');
    console.log('✨ [Success] ==========================================================');

  } catch (error) {
    console.error('❌ [Exception] 编译过程中遭遇异常:', error);
  }
}

// 执行构建
runBuild();