import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import archiver from 'archiver';

// 默认匹配 .map 后缀的文件
const initPatterns = [/\.map$/];
const PLUGIN_NAME = 'UploadSourceMapPlugin';

/**
 * 上传 sourcemap 文件的 rspack 插件
 */
class UploadSourceMapPlugin {
  constructor(options) {
    this.options = options;
    // 生成临时压缩文件的路径名
    this.pathName = `./${Date.now()}.zip`;
  }

  /**
   * 上传文件到指定 URL
   * @param {Object} params 上传参数
   * @param {string} params.url 上传地址
   * @param {string} params.path 文件路径
   * @param {Object} params.requestOption 请求配置项
   */
  async uploadFile({ url, path, requestOption }) {
    try {
      const { data = {}, header = {}, other = {} } = requestOption;
      const formData = new FormData();

      // 添加额外的表单数据
      if (Object.keys(data).length > 0) {
        for (const key in data) {
          formData.append(key, data[key]);
        }
      }

      // 添加文件流
      formData.append('file', fs.createReadStream(path));

      // 发送请求
      await axios({
        ...other,
        url,
        method: 'post',
        data: formData,
        headers: {
          ...formData.getHeaders(),
          ...header,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 递归读取目录下的所有文件
   * @param {string} dirPath 目录路径
   * @param {RegExp[]} patterns 文件匹配规则
   * @returns {string[]} 匹配的文件路径列表
   */
  readDir(dirPath, patterns) {
    const filesContent = [];

    function readSingleFile(currentPath) {
      const files = fs.readdirSync(currentPath);
      files.forEach((filePath) => {
        const wholeFilePath = path.resolve(currentPath, filePath);
        const fileStat = fs.statSync(wholeFilePath);

        // 如果是目录则递归读取
        if (fileStat.isDirectory()) {
          readSingleFile(wholeFilePath);
        }

        // 使用传入的匹配规则或默认规则
        const _patterns = patterns || initPatterns;
        if (fileStat.isFile() && _patterns.some((r) => r.test(filePath))) {
          filesContent.push(wholeFilePath);
        }
      });
    }

    readSingleFile(dirPath);
    return filesContent;
  }

  /**
   * 删除文件
   * @param {string} path 文件路径
   */
  deleteFile(path) {
    fs.unlink(path, () => { });
  }

  /**
   * 获取数据类型
   * @param {any} obj 需要判断类型的数据
   * @returns {string} 数据类型字符串
   */
  typeOf(obj) {
    const s = Object.prototype.toString.call(obj);
    return s.match(/\[object (.*?)\]/)[1].toLowerCase();
  }

  /**
   * rspack 插件应用函数
   * @param {Object} compiler rspack compiler 对象
   */
  apply(compiler) {
    const { url, uploadPath, patterns, requestOption } = this.options;

    // 校验必要参数
    if (!url || !uploadPath) {
      throw new Error('Missing necessary parameters');
    }

    // 校验参数类型
    if (this.typeOf(url) !== 'string') {
      throw new Error('The "url" parameter type is incorrect');
    }

    if (this.typeOf(uploadPath) !== 'string') {
      throw new Error('The "uploadPath" parameter type is incorrect');
    }

    if (patterns && this.typeOf(patterns) !== 'array') {
      throw new Error('The "patterns" parameter type is incorrect');
    }

    // 在 rspack 编译完成后执行
    compiler.hooks.done.tapPromise(PLUGIN_NAME, async () => {
      // 创建压缩文件
      const archive = archiver('zip', {
        gzip: true,
        zlib: { level: 9 }, // 最高压缩级别
      });

      // 错误处理
      archive.on('error', (err) => {
        throw new Error(err);
      });

      // 获取所有匹配的 sourcemap 文件路径
      const sourceMapPaths = this.readDir(uploadPath, patterns);

      // 压缩完成后的处理
      archive.on('end', async () => {
        console.info('Packed successfully, uploading files now...');
        // 上传压缩文件
        await this.uploadFile({
          url,
          path: this.pathName,
          requestOption,
        });

        // 清理临时文件
        this.deleteFile(this.pathName);
        sourceMapPaths.forEach((p) => this.deleteFile(p));
      });

      // 创建写入流
      archive.pipe(fs.createWriteStream(this.pathName));

      // 添加文件到压缩包
      sourceMapPaths.forEach((p) => {
        archive.append(fs.createReadStream(p), {
          name: `./${p.replace(uploadPath, '')}`,
        });
      });

      console.log('sourceMapPaths', sourceMapPaths);

      // 完成压缩
      archive.finalize();
    });
  }
}

export { UploadSourceMapPlugin };
