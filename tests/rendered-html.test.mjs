import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Room 1304 ARG entry screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>1304：不存在的住户<\/title>/i);
  assert.match(html, /class="login-screen"/);
  assert.match(html, /澄江物业服务中心/);
  assert.match(html, /CJ-0713/);
  assert.match(html, /刷卡并开始值班/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps GitHub Pages publishing static and subpath-safe", async () => {
  const [page, layout, nextConfig, packageJson, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
  ]);

  assert.match(page, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(page, /assetPath\(/);
  assert.doesNotMatch(layout, /next\/headers|headers\(/);
  assert.match(layout, /starwave0225\.github\.io\/ARG_1304/);
  assert.match(nextConfig, /output:\s*"export"/);
  assert.match(nextConfig, /basePath:/);
  assert.match(packageJson, /"build:pages"/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/out/);
});
