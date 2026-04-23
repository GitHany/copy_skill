const fs = require('fs');
const path = require('path');

// 获取当前脚本所在目录
const scriptDir = __dirname;
// 计算项目根目录（scripts 的上一级）
const rootDir = path.resolve(scriptDir, '..');
// 计算 commands.json 的路径
const targetFile = path.join(rootDir, 'docs/public/commands.json');
let data;
try {
  data = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
} catch (e) {
  console.error(`Failed to parse ${targetFile}:`, e.message);
  process.exit(1);
}

function extractParamNames(cmd) {
  const regex = /%\{([^}]+)\}%/g;
  const params = [];
  let match;
  while ((match = regex.exec(cmd)) !== null) {
    params.push(match[1]);
  }
  return params;
}

let fixedCount = 0;
let noParamsNeeded = 0;
let hasParamsButShouldNot = 0;

data.data.forEach(item => {
  if (item.data && item.data.extensions) {
    item.data.extensions.forEach(ext => {
      if (ext.params === undefined) {
        ext.params = {};
      }
      
      const cmdParams = extractParamNames(ext.cmd);
      const definedParams = Object.keys(ext.params);
      
      if (cmdParams.length > 0 && definedParams.length === 0) {
        cmdParams.forEach(paramName => {
          ext.params[paramName] = {
            type: 'string',
            required: true,
            description: `参数: ${paramName}`,
            example: paramName
          };
        });
        fixedCount++;
      } else if (cmdParams.length === 0 && definedParams.length > 0) {
        hasParamsButShouldNot++;
      } else if (cmdParams.length === 0 && definedParams.length === 0) {
        noParamsNeeded++;
      }
    });
  }
});

fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
console.log('修复完成!');
console.log('- 自动为无params但cmd有占位符的extension添加了params:', fixedCount);
console.log('- 无需params的extension(无占位符):', noParamsNeeded);
console.log('- 有params但cmd无占位符:', hasParamsButShouldNot);
