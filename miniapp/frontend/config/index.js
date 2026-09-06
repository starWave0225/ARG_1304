import { defineConfig } from '@tarojs/cli'
import gameUrlConfig from './game-url.cjs'

export default defineConfig({
  projectName: 'nonexistent-room',
  designWidth: 750,
  deviceRatio: { 640: 1.17, 750: 1, 375: 2, 828: 0.905 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'vue3',
  compiler: 'vite',
  plugins: ['@tarojs/plugin-generator', 'taro-plugin-qd'],
  defineConstants: { __GAME_URL__: JSON.stringify(gameUrlConfig.buildGameUrl(process.env.QDMP_GAME_URL)) },
  mini: { postcss: { pxtransform: { enable: true }, cssModules: { enable: false } } },
})
