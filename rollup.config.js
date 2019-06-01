import html from 'rollup-plugin-fill-html';
import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy-glob';
import browsersync from 'rollup-plugin-browsersync';
import gcc from '@ampproject/rollup-plugin-closure-compiler';

const isProduction = process.env.MODE !== 'development';

const plugins = [
  html({
    template: 'src/index.html'
  }),
  postcss({
    extract: 'dist/css/bundle.css',
    minimize: isProduction
  }),
  babel({
    exclude: 'node_modules/**',
    presets: ['@babel/preset-env'],
    plugins: [
      '@babel/plugin-proposal-class-properties'
    ]
  }),
  copy([
    { files: 'src/assets/**/*', dest: 'dist/assets' }
  ], { verbose: isProduction, watch: !isProduction })
];

if (isProduction) {
  plugins.push(
    gcc()
  );
} else {
  plugins.push(
    browsersync({
      open: 'local',
      notify: true,
      minify: false,
      cors: false,
      server: 'dist',
      port: 3000
    })
  )
}

export default {
  input: 'src/js/index.js',
  output: {
    file: 'dist/js/bundle.js',
    format: 'umd'
  },
  plugins
};
