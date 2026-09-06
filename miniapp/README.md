# 《不存在的房间》千岛兼容迁移

## 当前实现，不等同于已经上线

这是 **原生小程序单页容器 + HTTPS 网页游戏** 的首阶段迁移，不是把全部 React/DOM 游戏重写成 Taro 原生组件。游戏源仍在仓库根 `app/`，所有谜题、剧情与素材共用原版。`frontend/` 只承载网页及加载失败重试，包内不包含游戏媒体，需要网络。

选型依据：[Dimina 官方能力参考](https://github.com/didi/dimina/blob/main/docs/API-Reference.md) 列出 `web-view`；[官方实现](https://github.com/didi/dimina/blob/main/fe/packages/components/src/component/web-view/WebView.vue) 包含宿主原生层挂载和 load/error 事件。**上游支持不代表千岛当前宿主/域名已开放**。必须在千岛真机确认业务域名和组件可用性，不能用本地编译成功代替平台验收。

已关联公开 AppID `echoe5QUk7CamzuGZPqs`，loader 为 `EMP`。纯单机游戏不需要后端或 AppSecret；本仓库不复制相邻脚手架的私密配置。根 `.gitignore` 已忽略任何层级 `qdmp-config.json`、环境文件和打包产物。

## 构建（PowerShell）

要求 Node >=22.13、pnpm 10.14.0、qdmp-cli（本地验证版本 0.1.24）。

在仓库根目录设置 **将要托管本分支网页产物** 的完整 HTTPS 根路径，末尾必须 `/`：

```powershell
$env:QDMP_GAME_URL = 'https://your-game-host.example/ARG_1304/'
npm ci
npm run test:miniapp
npm run build:miniapp-web
```

输出 `out/`，把其**内容**部署到 URL 对应目录（此步骤需另行授权/执行）。支持独立域名根目录或子路径，不依赖 Unix 环境变量赋值语法。不要把不存在的 example 地址用于实际上传。

```powershell
Set-Location miniapp/frontend
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm run pack
```

同一终端的 URL 会进入容器编译产物；换终端需要重新设置环境变量。`pnpm run pack` 只本地打包，不需要 AppSecret，不执行 upload。生成位置由 qdmp CLI 管理，可在 `dist/` 和 `deploy_versions/` 查找。URL 改动后必须重建容器；不能通过入口 query 换域。配置缺失会直接终止构建。

若仅做编译检查，可以将 URL 设置为既有公开主站 `https://starwave0225.github.io/ARG_1304/`。但主站在本分支部署前仍是旧版，**不包含本分支新增的存储保护和千岛媒体/摄像头适配**，不得把这样的容器当作迁移验收版。

## 兼容处理

- 容器自动在 URL 上添加 `?platform=qiandao`，hash 路由变化保留该参数。
- 原存档键 `chengjiang-search-arg-v1`、静音偏好、剧情字段不变。千岛与外部浏览器可能使用不同存储空间；更换域名也会隔离存档，没有跨端同步承诺。
- localStorage 读取、写入、删除失败不再抛异常导致白屏；显示持续警告。删除失败时不刷新、不谎报已遗忘。
- 千岛模式响应网页 `visibilitychange`/`pagehide`，暂停媒体与音效上下文；返回后案件音轨需手动重播，背景音乐由下一次用户操作恢复。宿主若不转发这些事件，本适配不能保证后台静音，必须真机验收。
- 千岛模式隐藏摄像头申请，继续使用既有“无画面校验”，不改变日记阅读时长和后续演出门槛。普通浏览器保持原摄像头选项。
- 既有手机布局、点击编排搜救路线、逐帧监控兜底、减少动态效果与 Canvas 彩蛋继续复用。
- 未引入千岛账号、云存档、真实留言或社区系统，剧情中的账号/留言仍为虚构内容。

## 发布前人工验收（全部待千岛真机）

- [ ] Android/iOS 的 WebView、HTTPS 业务域名、load/error 事件是否可用。
- [ ] 断网、45 秒加载超时后原生层卸载，能看到重试并成功重连。
- [ ] 首屏资源、中文字幕、输入键盘、触屏操作、原生返回/关闭正常。
- [ ] 退出小程序再进入恢复进度；“遗忘”确认后确实重置；存储受限时提示。
- [ ] 音乐解锁、静音持久化、四轨播放、视频逐帧、前后台与锁屏行为。
- [ ] 第四篇日记维持至少 45 秒阅读、末尾到达与悬念延迟；无画面校验走通。
- [ ] 按根目录 `docs/game-flow.md` 全流程验证两种结局、真相页、Canvas 彩蛋。
- [ ] `/truth/` 页链接、所有图片/音视频和授权说明可以从同一部署路径加载。
- [ ] 目标平台的内容审核允许当前恐怖题材和剧情界面。

本分支不自动上传、送审、覆盖主站或合并 main。若平台不支持 WebView/外部域名，停止上传；下一阶段需要改为原生组件迁移或平台明确允许的其他承载方式。
