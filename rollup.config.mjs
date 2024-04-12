

export default {
  input: 'src/index.js', // 入口文件路径
  output: {
    file: 'lib/index.js', // 打包输出文件路径
    format: 'umd', // 设置输出格式为ES Module
    name: 'printTool'
  },
  plugins: []
};