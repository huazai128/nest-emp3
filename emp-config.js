import {defineConfig} from '@empjs/cli'
import ReactPlugin from '@empjs/plugin-react'
import {pluginRspackEmpShare} from '@empjs/share'
import { join, resolve } from 'path'
const InlineCodePlugin = require('html-inline-code-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { TypedCssModulesPlugin } = require('typed-css-modules-webpack-plugin')

export default defineConfig(store => {
  const env = process.env.EMP_ENV = store.env || 'dev'
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
      template: resolve('./views/index.html'),
      filename: resolve('./dist/views/index.html'),
      title: '基础架构框架',
    },
    chain(chain) {
      if (env !== 'dev' && !!env) {
        chain.devtool('source-map')
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
        )
      }
      chain.plugin('InlineCodePlugin').use(
        new InlineCodePlugin({
          begin: false,
          tag: 'script',
          inject: 'body',
          code: `window.INIT_DATA = <%- JSON.stringify(data) %>`,
        }),
      )

      // chain.plugin('CopyRspackPlugin').use(
      //   require('@rspack/plugin-copy'), // 引入 CopyRspackPlugin
      //   [
      //     {
      //       patterns: [
      //         {
      //           from: path.resolve(__dirname, './public'),
      //           to: path.resolve(__dirname, './dist/views'),
      //         },
      //       ],
      //     },
      //   ]
      // );

      chain.plugin('TypedCssModulesPlugin').use(
        new TypedCssModulesPlugin({
          globPattern: 'src/!(styles)/**/*.scss',
        }),
      )

    },
  }
})
