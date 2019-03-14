import html from 'rollup-plugin-fill-html';
import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy-glob';

export default {
  input: 'src/js/index.js',
  output: {
    file: 'dist/js/bundle.js',
    format: 'umd'
  },
  plugins: [
    html({
      template: 'src/index.html'
    }),
    postcss({
      extract: 'dist/css/bundle.css'
    }),
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env']
    }),
    terser(),
    copy([
      { files: 'src/chart_data.json', dest: 'dist' }
    ])
  ]
};
