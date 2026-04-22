const fs = require('fs');

const sourceFile = 'C:/code/copy_skill_extends/docs/public/commands.json';
const targetFile = 'c:/code/copy_skill/docs/public/commands.json';

const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

const sourceItems = sourceData.data;
const existingNames = new Set(targetData.data.map(item => item.name));
const newItems = sourceItems.filter(item => !existingNames.has(item.name));

function convertToTargetFormat(item) {
  const params = item.data.params || {};
  const targetParams = {};
  Object.keys(params).forEach(key => {
    targetParams[key] = {
      type: params[key].type || 'string',
      required: params[key].required || false,
      description: params[key].description || '',
      example: params[key].example || ''
    };
  });

  const targetExtensions = (item.data.extensions || []).map(ext => ({
    name: ext.name,
    cmd: ext.cmd,
    params: ext.params || {},
    keyword: ext.keyword || ''
  }));

  return {
    dirPath: item.dirPath || "/AI_ML工具/",
    name: item.name,
    keyword: item.keyword || '',
    description: item.description || '',
    data: {
      cmd: item.data.cmd,
      extensions: targetExtensions,
      params: targetParams
    }
  };
}

const convertedItems = newItems.map(convertToTargetFormat);

console.log(`找到 ${newItems.length} 个新命令需要添加`);
console.log('命令列表:');
newItems.forEach((item, i) => {
  console.log(`${i + 1}. ${item.name}`);
});

if (convertedItems.length > 0) {
  targetData.data.push(...convertedItems);
  fs.writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf-8');
  console.log(`\n已成功添加 ${convertedItems.length} 个命令到目标文件`);
} else {
  console.log('\n没有需要添加的新命令');
}
