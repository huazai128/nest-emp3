#!/usr/bin/env node

/**
 * 处理HTML文件中的a标签脚本
 * 功能：
 * 1. 删除a标签内的所有其他标签，只保留文本内容
 * 2. 给a标签添加样式：color: rgb(5, 99, 193); font-size: 10.0000pt;
 *
 * @type {module}
 */

import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

// 检查命令行参数
if (process.argv.length < 3) {
  console.error('使用方法: node format-links.js <目录路径>');
  process.exit(1);
}

const targetDir = process.argv[2];

// 检查目录是否存在
if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`错误: 目录 "${targetDir}" 不存在或不是一个目录`);
  process.exit(1);
}

// 处理HTML文件
const processHtmlFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);

    let modified = false;

    // 处理所有a标签
    $('a').each((_, element) => {
      const $a = $(element);

      // 获取a标签里的所有文本内容（包括子元素中的文本）
      const textContent = $a.text();

      // 检查是否有子元素
      if ($a.children().length > 0) {
        // 清空a标签并只保留文本
        $a.html(textContent);
        modified = true;
      }

      // 添加样式
      $a.css('color', 'rgb(5, 99, 193)');
      $a.css('font-size', '10.0000pt');
      modified = true;
    });

    if (modified) {
      // 保存修改后的文件
      fs.writeFileSync(filePath, $.html());
      console.log(`处理完成: ${filePath}`);
    } else {
      console.log(`无需修改: ${filePath}`);
    }
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error);
  }
};

// 递归处理目录下的所有HTML文件
const processDirectory = (dirPath) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 递归处理子目录
      processDirectory(filePath);
    } else if (
      stat.isFile() &&
      (path.extname(filePath).toLowerCase() === '.html' ||
        path.extname(filePath).toLowerCase() === '.htm')
    ) {
      // 处理HTML文件
      processHtmlFile(filePath);
    }
  });
};

// 开始处理
console.log(`开始处理目录: ${targetDir}`);
processDirectory(targetDir);
console.log('处理完成!');
