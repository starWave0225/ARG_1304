// Build-time configuration only: entry query parameters must never select a host.
function buildGameUrl(value) {
  if (!value) throw new Error('请设置 QDMP_GAME_URL，指向本分支网页产物的 HTTPS 地址。');
  let url;
  try { url = new URL(value); } catch { throw new Error('QDMP_GAME_URL 必须是完整的 HTTPS 地址。'); }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('QDMP_GAME_URL 仅支持无账号密码的 HTTPS 地址。');
  }
  if (url.hash || url.search) {
    throw new Error('QDMP_GAME_URL 请只填游戏根路径，不包含 query 或 hash。');
  }
  if (!url.pathname.endsWith('/')) {
    throw new Error('QDMP_GAME_URL 必须以 / 结尾，以保持静态资源和真相页路径正确。');
  }
  url.searchParams.set('platform', 'qiandao');
  return url.href;
}
module.exports = { buildGameUrl };
