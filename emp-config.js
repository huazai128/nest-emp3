import {defineConfig} from '@empjs/cli'
import ReactPlugin from '@empjs/plugin-react'
import {pluginRspackEmpShare} from '@empjs/share'
import { join, resolve } from 'path'

export default defineConfig(store => {
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
  }
})
