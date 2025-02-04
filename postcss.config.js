module.exports = {
  plugins: [
    require('postcss-px-to-viewport')({
      viewportWidth: 750,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: ['.ignore-class', /^#header/],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/, /src\/assets\/lib/],
      landscape: true,
      landscapeUnit: 'vh',
      landscapeWidth: 1334,
    }),
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 1%',
        'Android >= 2.1',
        'ios 7',
        'firefox >= 15',
        'IE 10',
      ],
    }),
  ],
};
