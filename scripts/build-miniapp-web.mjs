import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import gameUrlConfig from '../miniapp/frontend/config/game-url.cjs';

// Do not inherit the GitHub Pages path: a miniapp may use a separate HTTPS host.
const gameUrl = new URL(gameUrlConfig.buildGameUrl(process.env.QDMP_GAME_URL));
gameUrl.search = '';
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'build'], {
  cwd: fileURLToPath(new URL('../', import.meta.url)),
  stdio: 'inherit',
  env: {
    ...process.env,
    MINIAPP_WEB_EXPORT: 'true',
    NEXT_PUBLIC_BASE_PATH: gameUrl.pathname.replace(/\/$/, ''),
    NEXT_PUBLIC_SITE_URL: gameUrl.href,
  },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
