'use strict'

const path = require('path')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')

const plugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    // Include the helpers in the bundle, at most one copy of each
    babelHelpers: 'bundled'
  }),

]

const rollupConfig = {
  input: path.resolve(__dirname, `../js/index.js`),
  output: {
    file: path.resolve(__dirname, `../dist/js/uxui.js`),
    format: 'umd',
    generatedCode: 'es2015'
  },
  plugins
}
rollupConfig.output.name = 'uxui'

module.exports = rollupConfig