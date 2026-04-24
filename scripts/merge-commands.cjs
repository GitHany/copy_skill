const fs = require('fs');
const path = require('path');

// 获取当前脚本所在目录
const scriptDir = __dirname;
// 计算项目根目录（scripts 的上一级）
const rootDir = path.resolve(scriptDir, '..');

// 计算源文件和目标文件的路径
const sourceFile = path.join(rootDir, '../copy_skill_extends/docs/public/commands.json');
const targetFile = path.join(rootDir, 'docs/public/commands.json');

console.log('开始合并命令文件...');
console.log(`源文件: ${sourceFile}`);
console.log(`目标文件: ${targetFile}`);

if (!fs.existsSync(sourceFile)) {
  console.error(`Source file not found: ${sourceFile}`);
  process.exit(1);
}

const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

const sourceItems = sourceData.data;
const existingNames = new Set(targetData.data.map(item => item.name));
const newItems = sourceItems.filter(item => !existingNames.has(item.name));

function convertToTargetFormat(item) {
  const params = item.data.params || [];
  const targetParams = {};
  if (Array.isArray(params)) {
    params.forEach(p => {
      targetParams[p.name] = {
        type: p.type || 'string',
        required: p.required || false,
        description: p.description || '',
        example: p.example || '',
        notes: p.notes || ''
      };
    });
  } else if (typeof params === 'object') {
    Object.keys(params).forEach(key => {
      targetParams[key] = {
        type: params[key].type || 'string',
        required: params[key].required || false,
        description: params[key].description || '',
        example: params[key].example || '',
        notes: params[key].notes || ''
      };
    });
  }

  const targetExtensions = (item.data.extensions || []).map(ext => ({
    name: ext.name,
    cmd: ext.cmd,
    params: ext.params || {},
    keyword: ext.keyword || ''
  }));

  return {
    dirPath: item.dirPath || '',
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

console.log(`\n找到 ${newItems.length} 个新命令需要添加`);
if (convertedItems.length > 0) {
  console.log('命令列表:');
  newItems.forEach((item, i) => {
    console.log(`${i + 1}. ${item.name}`);
  });

  targetData.data.push(...convertedItems);
  
  const output = JSON.stringify(targetData, null, 2);
  fs.writeFileSync(targetFile, output, 'utf-8');
  
  const sizeMB = (Buffer.byteLength(output, 'utf8') / 1024 / 1024).toFixed(2);
  console.log(`\n✓ 已成功添加 ${convertedItems.length} 个命令`);
  console.log(`✓ 目标文件大小: ${sizeMB} MB`);
  console.log(`✓ 总命令数: ${targetData.data.length}`);
} else {
  console.log('\n没有需要添加的新命令');
}
