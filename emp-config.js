import { defineConfig } from '@empjs/cli';
import ReactPlugin from '@empjs/plugin-react';
import { pluginRspackEmpShare } from '@empjs/share';
import { join, resolve } from 'path';
import InlineCodePlugin from 'html-inline-code-plugin';
import { TypedCssModulesPlugin } from 'typed-css-modules-webpack-plugin';

export default defineConfig((store) => {
  const env = (process.env.EMP_ENV = store.env || 'dev');
  return {
    plugins: [
      ReactPlugin(),
      pluginRspackEmpShare({
        empRuntime: {
          runtimeLib: `https://unpkg.com/@empjs/share@3.1.5/output/sdk.js`,
          frameworkLib: `https://unpkg.com/@empjs/libs-18@0.0.1/dist`,
          frameworkGlobal: 'EMP_ADAPTER_REACT',
          framework: 'react',
        },
      }),
    ],
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
      polyfill: {
        entryCdn: `https://unpkg.com/@empjs/polyfill@0.0.1/dist/es.js`,
      },
    },
    resolve: {
      alias: {
        '@src': resolve(__dirname, './src'),
      },
    },
    html: {
      template: resolve(__dirname, './views/index.html'),
      filename: resolve(__dirname, './dist/views/index.html'), // 修改输出路径配置,将HTML文件输出到views目录
      title: '基础架构框架',
    },
    chain(chain) {
      if (env !== 'dev' && !!env) {
        chain.devtool('source-map');
        chain.plugin('SourcemapUploadPlugin').use(
          new UploadSourceMapPlugin({
            url: `http:localhost:5005/api/upload-zip`, // 上传url
            uploadPath: resolve(__dirname, './dist/client/js'),
            patterns: [/\js.map$/],
            requestOption: {
              data: {
                siteId: '63b6568f66704eb3458306d6',
              },
            },
          }),
        );
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
          globPattern: 'src/!(styles)/**/*.scss',
        }),
      );
    },
  };
});
