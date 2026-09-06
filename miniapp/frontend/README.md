# 千岛容器前端

先读 [迁移说明](../README.md)。本目录基于 qdmp 官方 default 模板收敛为单页 Taro Vue 3 + EMP 容器。不要删除 `src/app.js` 中的 Dimina 白屏保护。不要添加 AppSecret、示例登录、SPU 示例或无业务需要的权限。

构建需要 `QDMP_GAME_URL`；配置只在构建时读取，页面入口参数不能修改目标地址。URL 校验位于 `config/game-url.cjs`，与网页静态导出共用。`pnpm test` 检查 URL；`pnpm run build` 生成 Taro 产物；`pnpm run pack` 调用 qdmp CLI 本地打包，不上传。

样式遵循 `../DESIGN.md`。所有原生 token 在 `src/app.css` 的 `page` 下，页面 class 具名，不直接套用网页的 DOM/CSS。`src/pages/index/index.vue` 只有 WebView 和异常恢复；加载提示是否在原生层可见需真机确认。
