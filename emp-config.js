import { defineConfig } from '@empjs/cli';
import { pluginRspackEmpShare } from '@empjs/share';
import { join, resolve } from 'path';
import InlineCodePlugin from 'html-inline-code-plugin';
import { TypedCssModulesPlugin } from 'typed-css-modules-webpack-plugin';

export default defineConfig((store) => {
  const env = (process.env.EMP_ENV = store.env || 'dev');
  return {
    plugins: [
      pluginRspackEmpShare({
        empRuntime: {
          runtimeLib: `https://unpkg.com/@empjs/share@3.1.5/output/sdk.js`,
          frameworkLib: `https://unpkg.com/@empjs/libs-18@0.0.1/dist`,
          frameworkGlobal: 'EMP_ADAPTER_REACT',
          framework: 'react',
        },
      }),
    ],
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
      polyfill: {
        entryCdn: `https://unpkg.com/@empjs/polyfill@0.0.1/dist/es.js`,
      },
    },
    html: {
      template: resolve(__dirname, './views/index.html'),
      filename: resolve(__dirname, './dist/views/index.html'),
      title: '基础架构框架',
      meta: {
        viewport: 'width=device-width, initial-scale=1.0',
      },
    },
    chain(chain) {
      if (env !== 'dev' && !!env) {
        chain.devtool('source-map');
        chain.plugin('SourcemapUploadPlugin').use(
          new UploadSourceMapPlugin({
            url: `http:localhost:5005/api/upload-zip`,
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
          globPattern: 'src/**/*.scss',
          camelCase: true,
          content: '',
          encoding: 'utf-8',
          logger: true,
        }),
      );

      // 修改 CSS 规则配置,内置的@empjs/plugin-postcss和@empjs/plugin-lightningcss 都没达到满意的效果
      chain.module
        .rule('css')
        .test(/\.(css|scss)$/)
        .type('javascript/auto')
        .use('style-loader')
        .loader('style-loader')
        .end()
        .use('css-loader')
        .loader('css-loader')
        .options({
          importLoaders: 2,
          modules: {
            auto: true,
            localIdentName: '[local]_[hash:base64:5]',
          },
        })
        .end()
        .use('postcss-loader')
        .loader('postcss-loader')
        .options({
          postcssOptions: {
            plugins: [
              [
                'postcss-pxtorem',
                {
                  rootValue: 37.5,
                  propList: ['*', '!font-size'],
                  unitPrecision: 5,
                  minPixelValue: 1,
                },
              ],
              'autoprefixer',
            ],
          },
        })
        .end()
        .use('sass-loader')
        .loader('sass-loader')
        .options({
          sourceMap: true,
          sassOptions: {
            outputStyle: 'compressed',
          },
        });
    },
  };
});
