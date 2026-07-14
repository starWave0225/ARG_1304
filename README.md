# 不存在的住户 / ARG_1304

一款伪装成物业管理系统的中文浏览器ARG。玩家以物业管理员 `CJ-0713` 的身份处理夜间滴水投诉，并通过全文检索、监控复核、声纹分轨、账号恢复与跨系统档案逐步发现澄江公寓的真相。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm ci
npm run dev
```

常用验证命令：

```bash
npm run lint
npm test
npm run build:pages
```

## 项目结构

- `app/page.tsx`：主游戏、状态机、谜题与hash路由
- `app/truth/page.tsx`：独立全案真相页
- `app/globals.css`：主游戏视觉与演出
- `public/`：记忆、监控、搜救、人物、音频和结局素材
- `scripts/generate-field-audio.mjs`：现场分轨WAV生成器
- `tests/rendered-html.test.mjs`：剧情门槛与关键交互回归测试
- `AGENTS.md`：云端开发接手规范
- `docs/story-bible.md`：完整剧情真值表与密码契约，含剧透
- `docs/game-flow.md`：完美通关、触发条件与回归清单，含剧透

## 状态与路由

游戏进度保存在浏览器 `localStorage`，键名为 `chengjiang-search-arg-v1`。主游戏使用hash路由以兼容GitHub Pages静态部署，刷新和浏览器前进/后退会恢复可访问的当前页面。登录页的 `遗忘` 可以清除本机调查记录。

全案真相使用独立静态路由 `/truth/`。

## 部署

`.github/workflows/pages.yml` 会在 `main` 分支更新后构建静态站点并发布到GitHub Pages。

- 游戏：<https://starwave0225.github.io/ARG_1304/>
- 全案真相：<https://starwave0225.github.io/ARG_1304/truth/>

功能分支需要先合并到 `main` 并等待 Pages 工作流成功，线上地址才会包含最新内容。
