const fs = require('fs');
const path = require('path');

// 统一管理核心文件路径
const PATHS = {
  vue: path.join(__dirname, 'code.vue'),
  html: path.join(__dirname, 'index.html'),
  config: path.join(__dirname, 'config.json')
};

function runBuild() {
  console.log('🚀 [Build] 正在启动极简 AI 工作流编译流水线...');

  try {
    // 1. 读取并校验配置文件 config.json
    if (!fs.existsSync(PATHS.config)) {
      console.error(`❌ [Error] 找不到配置文件: ${PATHS.config}`);
      return;
    }
    const configContent = fs.readFileSync(PATHS.config, 'utf8');
    const configJsonString = JSON.stringify(JSON.parse(configContent));

    // 2. 读取并转换源码文件 code.vue 为 Data URL
    if (!fs.existsSync(PATHS.vue)) {
      console.error(`❌ [Error] 找不到源码文件: ${PATHS.vue}`);
      return;
    }
    const vueContent = fs.readFileSync(PATHS.vue, 'utf8');
    const base64Content = Buffer.from(vueContent).toString('base64');
    const dataUrl = `data:text/plain;charset=utf-8;base64,${base64Content}`;

    // 3. 读取主体容器 index.html
    if (!fs.existsSync(PATHS.html)) {
      console.error(`❌ [Error] 找不到主体容器文件: ${PATHS.html}`);
      return;
    }
    let htmlContent = fs.readFileSync(PATHS.html, 'utf8');

    // 4. 正则匹配：替换 app.task.template
    const templateRegex = /(template:\s*[`'"])(data:text\/plain;charset=utf-8;base64,[A-Za-z0-9+/=]*)([`'"])/;
    if (!templateRegex.test(htmlContent)) {
      console.error('❌ [Error] 在 index.html 中未匹配到 app.task.template 特征结构！');
      return;
    }
    let updatedHtmlContent = htmlContent.replace(templateRegex, `$1${dataUrl}$3`);

    // 5. 正则匹配：通过 template 右边界锚点精准全量平替 app.task.data（具备完全幂等性，防重复执行异常）
    const dataRegex = /(data:\s*)([\s\S]*?)(,\s*\n?\s*template:)/;
    if (!dataRegex.test(updatedHtmlContent)) {
      console.error('❌ [Error] 在 index.html 中未匹配到 app.task.data 特征结构！');
      return;
    }
    updatedHtmlContent = updatedHtmlContent.replace(dataRegex, `$1${configJsonString}$3`);

    // 6. 将编译成果写回容器
    fs.writeFileSync(PATHS.html, updatedHtmlContent, 'utf8');
    console.log('✨ [Success] ==================================================');
    console.log('✨ [Success] 编译成功！code.vue 与 config.json 已完美融合进 index.html');
    console.log('✨ [Success] ==================================================');

  } catch (error) {
    console.error('❌ [Exception] 编译过程中遭遇异常:', error);
  }
}

// 执行构建
runBuild();