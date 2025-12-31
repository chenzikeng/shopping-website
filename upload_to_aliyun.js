#!/usr/bin/env node

/**
 * 阿里云服务器上传脚本
 * 用于将项目文件上传到阿里云服务器
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置信息
const CONFIG = {
  // 服务器信息
  server: {
    ip: '您的服务器IP地址', // 请替换为您的阿里云服务器IP
    user: 'root',
    password: '', // 不建议在此处明文存储密码，可使用SSH密钥
    remotePath: '/home/shopping web'
  },
  
  // 需要上传的文件和目录
  uploadItems: [
    // 根目录文件
    '.env',
    
    // 后端目录
    'backend/.env',
    'backend/server.js',
    'backend/server_with_diagnostics.js',
    'backend/test_db_connection.js',
    'backend/package.json',
    'backend/package-lock.json',
    'backend/config/',
    'backend/models/',
    'backend/routes/',
    'backend/services/',
    'backend/middleware/',
    
    // 前端目录
    'frontend/',
    
    // 文档文件
    'ALIBABA_CLOUD_DEPLOYMENT_GUIDE.md',
    'DIAGNOSE_DB_CONNECTION.md',
    'FIX_ALIYUN_MYSQL_CONNECTION.md'
  ],
  
  // SSH密钥配置（如果使用密钥登录）
  sshKey: {
    useKey: false,
    keyPath: '~/.ssh/id_rsa' // SSH私钥路径
  }
};

/**
 * 打印带颜色的日志
 * @param {string} message - 日志消息
 * @param {string} color - 颜色代码
 */
function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

/**
 * 打印错误日志
 * @param {string} message - 错误消息
 */
function error(message) {
  log(`❌ ${message}`, '\x1b[31m');
}

/**
 * 打印成功日志
 * @param {string} message - 成功消息
 */
function success(message) {
  log(`✅ ${message}`, '\x1b[32m');
}

/**
 * 打印信息日志
 * @param {string} message - 信息消息
 */
function info(message) {
  log(`ℹ️ ${message}`, '\x1b[34m');
}

/**
 * 打印警告日志
 * @param {string} message - 警告消息
 */
function warn(message) {
  log(`⚠️  ${message}`, '\x1b[33m');
}

/**
 * 检查文件或目录是否存在
 * @param {string} itemPath - 项目路径
 * @returns {boolean} - 是否存在
 */
function checkExists(itemPath) {
  try {
    fs.accessSync(itemPath);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 执行SCP命令上传文件
 * @param {string} localPath - 本地路径
 * @param {string} remotePath - 远程路径
 * @returns {boolean} - 是否上传成功
 */
function uploadItem(localPath, remotePath) {
  try {
    // 构建SCP命令
    let scpCommand = '';
    
    if (CONFIG.sshKey.useKey) {
      // 使用SSH密钥登录
      scpCommand = `scp -i "${CONFIG.sshKey.keyPath}" -r "${localPath}" "${CONFIG.server.user}@${CONFIG.server.ip}:${remotePath}"`;
    } else {
      // 使用密码登录（需要在命令行输入密码）
      scpCommand = `scp -r "${localPath}" "${CONFIG.server.user}@${CONFIG.server.ip}:${remotePath}"`;
    }
    
    info(`上传: ${localPath} -> ${remotePath}`);
    info(`执行命令: ${scpCommand}`);
    
    // 执行命令
    execSync(scpCommand, { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    error(`上传失败: ${localPath}`);
    error(`错误信息: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  log('\n========================================', '\x1b[36m');
  log('       阿里云服务器上传脚本', '\x1b[36m');
  log('========================================\n', '\x1b[36m');
  
  // 检查配置
  if (!CONFIG.server.ip) {
    error('请先配置服务器IP地址！');
    process.exit(1);
  }
  
  info(`服务器IP: ${CONFIG.server.ip}`);
  info(`远程目录: ${CONFIG.server.remotePath}`);
  info(`使用SSH密钥: ${CONFIG.sshKey.useKey}`);
  
  // 创建远程目录
  try {
    const mkdirCommand = `ssh ${CONFIG.server.user}@${CONFIG.server.ip} "mkdir -p ${CONFIG.server.remotePath}/backend ${CONFIG.server.remotePath}/frontend"`;
    info(`创建远程目录...`);
    execSync(mkdirCommand, { stdio: 'inherit' });
    success('远程目录创建成功');
  } catch (error) {
    warn('远程目录创建失败（可能已存在）:', error.message);
  }
  
  // 上传文件
  log('\n开始上传文件...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of CONFIG.uploadItems) {
    const localPath = path.resolve(__dirname, item);
    const remotePath = `${CONFIG.server.remotePath}/${item}`;
    
    // 检查本地文件是否存在
    if (!checkExists(localPath)) {
      error(`跳过不存在的文件: ${localPath}`);
      errorCount++;
      continue;
    }
    
    // 上传文件
    if (uploadItem(localPath, remotePath)) {
      success(`上传成功: ${item}`);
      successCount++;
    } else {
      errorCount++;
    }
    
    log(''); // 空行
  }
  
  // 上传完成
  log('\n========================================', '\x1b[36m');
  log('              上传完成', '\x1b[36m');
  log('========================================', '\x1b[36m');
  success(`成功上传: ${successCount} 个文件/目录`);
  error(`上传失败: ${errorCount} 个文件/目录`);
  log('\n上传完成！\n');
  
  // 显示后续步骤
  log('后续操作建议:', '\x1b[36m');
  log('1. 登录服务器: ssh root@您的服务器IP');
  log('2. 切换到后端目录: cd /home/shopping web/backend');
  log('3. 安装依赖: npm install');
  log('4. 运行诊断脚本: node server_with_diagnostics.js');
  log('5. 启动服务器: node server.js');
  log('');
  
  log('或使用一键命令:', '\x1b[36m');
  log('ssh root@您的服务器IP "cd /home/shopping web/backend && npm install && node server.js"');
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  CONFIG,
  main
};
