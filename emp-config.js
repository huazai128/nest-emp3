import { defineConfig } from '@empjs/cli';
import { join, resolve } from 'path';
import InlineCodePlugin from 'html-inline-code-plugin';
import { TypedCssModulesPlugin } from 'typed-css-modules-webpack-plugin';
import { glob } from 'glob';
import pluginReact from '@empjs/plugin-react';
import { UploadSourceMapPlugin } from './build/sourcemap-upload-plugin';

export default defineConfig(() => {
  const env = process.env.NODE_ENV;

  // 自动扫描pages目录下的入口文件
  const getEntries = () => {
    const entries = {
      'index.ts': {
        title: '主页',
        template: resolve(__dirname, './views/index.html'),
      },
    };

    // 仅在非开发环境或指定了特定入口时扫描所有页面
    if (env !== 'development' || !env || process.env.ENTRY) {
      // 使用glob匹配pages目录下所有的index.tsx文件，但排除所有二级pages目录
      const files = glob.sync('./src/pages/**/index.tsx', {
        ignore: ['./src/pages/**/pages/**'],
      });

      files.forEach((file) => {
        const entryKey = file.replace('./src/', '');
        // 如果指定了特定入口，只添加匹配的入口
        if (!process.env.ENTRY || file.includes(process.env.ENTRY)) {
          entries[entryKey] = {
            title: '页面',
            template: resolve(__dirname, './views/index.html'),
          };
        }
      });
    }

    return entries;
  };

  return {
    entries: getEntries(),
    plugins: [pluginReact()],
    base: '/',
    resolve: {
      alias: {
        '@src': resolve(__dirname, './src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'],
    },
    server: {
      port: 8008,
      open: false,
      devMiddleware: {
        index: true,
        mimeTypes: {
          phtml: 'text/html',
        },
        publicPath: './dist/client',
        serverSideRender: true,
        writeToDisk: true,
      },
    },
    build: {
      staticDir: '.',
      outDir: join(__dirname, './dist/client'),
      output: {
        filename: 'js/[name].[contenthash].js',
        chunkFilename: 'js/[name].[contenthash].chunk.js',
        sourcemapFilename: 'js/[name].[contenthash].map',
      },
      polyfill: {
        entryCdn: `https://unpkg.com/@empjs/polyfill@0.0.1/dist/es.js`,
      },
    },
    html: {
      filename: (pathData) => {
        console.log('当前chunk名称:', pathData.chunk.name);
        if (pathData.chunk.name.startsWith('pages/')) {
          const pagePath = pathData.chunk.name.split('/');
          pagePath.pop();
          const dirPath = pagePath.join('/');
          console.log('生成的目录路径:', dirPath);
          return resolve(__dirname, `./dist/client/${dirPath}/index.html`);
        }
        return resolve(__dirname, './dist/client/[name].html');
      },
      meta: {
        viewport: 'width=device-width, initial-scale=1.0',
      },
      inject: true,
      chunks: 'all',
    },
    chain(chain) {
      const isProd = env !== 'development' && !!env;
      if (isProd) {
        chain.devtool('source-map');
        // 优化 sourcemap 上传配置
        const sourcemapConfig = {
          url:
            process.env.SOURCEMAP_UPLOAD_URL ||
            'http://localhost:5005/api/upload-zip',
          uploadPath: resolve(__dirname, './dist/client/js'),
          patterns: [/\.js\.map$/],
          requestOption: {
            timeout: 30000, // 设置30秒超时
            retries: 3, // 失败重试3次
            data: {
              siteId: process.env.SITE_ID || '63b6568f66704eb3458306d6',
              env: env,
              version: process.env.VERSION || '1.0.0',
            },
          },
          onSuccess: (response) => {
            console.log('Sourcemap uploaded successfully:', response);
          },
          onError: (error) => {
            console.error('Sourcemap upload failed:', error);
          },
        };

        chain
          .plugin('SourcemapUploadPlugin')
          .use(UploadSourceMapPlugin, [sourcemapConfig]);
      }

      chain.plugin('InlineCodePlugin').use(
        new InlineCodePlugin({
          begin: false,
          tag: 'script',
          inject: 'body',
          code: `window.INIT_DATA = <%- JSON.stringify(data) %>`,
        }),
      );

      chain.plugin('TypedCssModulesPlugin').use(
        new TypedCssModulesPlugin({
          globPattern: 'src/**/*.scss',
          camelCase: true,
          content: '',
          encoding: 'utf-8',
          logger: true,
        }),
      );

      // 修改 CSS 规则配置,内置的@empjs/plugin-postcss和@empjs/plugin-lightningcss 都没达到满意的效果
      // 使用 style-loader 和 css-loader 处理 CSS 文件
      // 使用 sass-loader 处理 SCSS 文件
      // 使用 postcss-loader 处理 CSS 文件
      // 使用 lightningcss-loader 处理 SCSS 文件
      // 使用 postcss-loader 处理 CSS 文件
      chain.module
        .rule('css')
        .test(/\.(css|scss)$/)
        .type('javascript/auto') // 添加type配置以解决experiments.css冲突
        .use('style-loader')
        .loader('style-loader')
        .end()
        .use('css-loader')
        .loader('css-loader')
        .options({
          modules: {
            auto: true,
            localIdentName: '[local]_[hash:base64:5]',
          },
        })
        .end()
        .use('sass-loader')
        .loader('sass-loader');
    },
  };
});
