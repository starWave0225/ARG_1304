import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
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

test("server-renders the Room 1304 ARG opening performance", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>不存在的住户<\/title>/i);
  assert.match(html, /class="opening-dream opening-dream--0"/);
  assert.match(html, /人总以为，明天会照常到来/);
  assert.match(html, /跳过梦境/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps dense desktop investigation screens readable", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(styles, /@media \(min-width: 1100px\)/);
  assert.match(styles, /\.record-article p[\s\S]*?font-size: 14px/);
  assert.match(styles, /\.archive-sidebar button[\s\S]*?font-size: 12px/);
  assert.match(styles, /\.callback-center-head p[\s\S]*?font-size: 13px/);
});

test("publishes a complete standalone truth archive after the endings", async () => {
  const [response, gamePage, truthPage, truthCss] = await Promise.all([
    render("/truth"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/truth/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/truth/truth.module.css", import.meta.url), "utf8"),
  ]);

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /全案真相档案/);
  assert.match(html, /他正在调查自己为什么死后仍在上班/);
  assert.match(html, /id="case-1204"/);
  assert.match(html, /空置房里的未登记儿童/);
  assert.match(html, /id="case-1404"/);
  assert.match(html, /主角是谁，以及妻子为什么一直认得他/);
  assert.match(html, /恒目不是普通外包商/);
  assert.match(html, /hengmurecyclezm0602/);
  assert.match(html, /第224次第一次见面/);
  assert.match(gamePage, /href=\{`\$\{BASE_PATH\}\/truth\/`\}>查看全案真相/);
  assert.match(truthPage, /CS-046就是被更早一次记忆清除后的主角/);
  assert.match(truthCss, /\.indexNav/);
  assert.match(truthCss, /@media \(max-width: 620px\)/);
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
  assert.match(page, /员工身份认证/);
  assert.match(page, /物业管理员/);
  assert.match(page, /不要按顺序读。按你怀疑的内容去找。/);
  assert.match(page, /生命是一场轮回/);
  assert.match(page, /生命转瞬即逝/);
  assert.match(page, /不论如何，我需要醒来了/);
  assert.doesNotMatch(layout, /next\/headers|headers\(/);
  assert.match(layout, /starwave0225\.github\.io\/ARG_1304/);
  assert.match(nextConfig, /output:\s*"export"/);
  assert.match(nextConfig, /basePath:/);
  assert.match(packageJson, /"build:pages"/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/out/);
});

test("lets the login terminal forget the local investigation and restart from the opening", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const \[forgetConfirming, setForgetConfirming\] = useState\(false\)/);
  assert.match(page, /const forgetInvestigation = \(\) =>/);
  assert.match(page, /localStorage\.removeItem\(SAVE_KEY\)/);
  assert.match(page, /writeAppRoute\("\/opening", true\)/);
  assert.match(page, /window\.location\.reload\(\)/);
  assert.match(page, />遗忘<\/button>/);
  assert.match(page, /确认遗忘本机调查/);
  assert.match(page, /档案阅读、解密进度和恢复账号将永久清除/);
  assert.match(css, /\.login-forget-confirm/);
});

test("plays a notification chime when new board messages are announced", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const startGame = page.slice(page.indexOf("const startGame ="), page.indexOf("const continueGame ="));

  assert.match(page, /const playMessageNotificationSound = useCallback\(\(\) =>/);
  assert.match(page, /new AudioContext\(\)/);
  assert.match(page, /if \(messages\.length === 0\) return;\s+playMessageNotificationSound\(\);/);
  assert.match(page, /const FIRST_LOGIN_MESSAGE_DELAY_MS = 3200/);
  assert.match(page, /const firstLoginMessageTimer = useRef<number \| null>\(null\)/);
  assert.match(startGame, /writeAppRoute\("\/system\/home"\)[\s\S]*?window\.setTimeout\(\(\) => \{[\s\S]*?announceMessages\(\[1, 101, 102, 103\]\)[\s\S]*?FIRST_LOGIN_MESSAGE_DELAY_MS/);
  assert.doesNotMatch(startGame, /writeAppRoute\("\/system\/home"\);\s+announceMessages/);
});

test("groups board messages by sender and orders each thread chronologically", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const boardMessageThreads = Array\.from\(visibleBoardMessages\.reduce/);
  assert.match(page, /threads\.get\(message\.author\)/);
  assert.match(page, /const orderedMessages = \[\.\.\.messages\]\.sort\(\(a, b\) => a\.sequence - b\.sequence\)/);
  assert.match(page, /\.sort\(\(a, b\) => b\.latest\.sequence - a\.latest\.sequence\)/);
  assert.match(page, /boardMessageThreads\.map\(\(thread\) => <section/);
  assert.match(page, /thread\.messages\.map\(\(message\) => <article/);
  assert.match(page, /className="message-thread-group__header"/);
  assert.match(page, /className="message-entry__time"/);
  assert.match(css, /\.message-thread-group__messages/);
  assert.match(css, /\.message-entry__time/);
});

test("turns the first 1404 message into a restrained multi-round dialogue", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /text: "今天还是你来处理吗？"/);
  assert.match(page, /text: "仔细点，慢慢来，不着急的。"/);
  assert.doesNotMatch(page, /如果找不到入口，先查工单里最具体的时间/);
  assert.doesNotMatch(page, /1204登记里没有儿童，但巡检照片拍到了童鞋/);
  assert.match(page, /const WIFE_DIALOGUE_TURNS: Record<string, WifeDialogueTurn>/);
  assert.match(page, /recognition: \{ player: "我们以前见过吗？", resident: "你每次都这么问。系统大概还是说没有吧。" \}/);
  assert.match(page, /assignment: \{ player: "上一位来处理的是谁？", resident: "就是你。至少工牌上的编号，和你现在戴的一样。" \}/);
  assert.match(page, /when: \{ player: "你说的上次是哪天？"/);
  assert.match(page, /dispatch: \{ player: "那次有派单记录吗？"/);
  assert.match(page, /audit: \{ player: "我去查一下以前的回访记录。"/);
  assert.match(page, /procedure: \{ player: "那我先帮你重新报修。"/);
  assert.match(page, /wifeDialoguePath\.length === 2[\s\S]*?WIFE_DIALOGUE_FINAL_CHOICES/);
  assert.match(page, /wifeDialoguePath\.map\(\(reply, index\) =>/);
  assert.match(page, /会话已暂存 · 未写入工单/);
  assert.match(page, /restored\.wifeReply === "known"[\s\S]*?"recognition"/);
  assert.doesNotMatch(page, /见过。很多次。只是每次都是我记得/);
  assert.doesNotMatch(page, /谢谢。你还是只会说这一句/);
  assert.match(css, /\.dialogue-thread--wife \.dialogue-resident/);
});

test("plays one distinct chime when new evidence is written to the ledger", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /const evidenceNotificationKeys = useRef\(new Set<string>\(\)\)/);
  assert.match(page, /const playEvidenceNotificationSound = \(\) =>/);
  assert.match(page, /frequency: 196/);
  assert.match(page, /frequency: 293\.66/);
  assert.match(page, /frequency: 277\.18/);
  assert.match(page, /const notifyEvidenceWrite = \(evidenceIds: string\[\]\) =>/);
  assert.match(page, /!game\.evidence\.includes\(evidenceId\) && !evidenceNotificationKeys\.current\.has\(evidenceId\)/);
  assert.match(page, /notifyEvidenceWrite\(gained\);/);
  assert.match(page, /notifyEvidenceWrite\(\["bodyWall", "internalTransfer"\]\);/);
  assert.match(page, /notifyEvidenceWrite\(\["marriage"\]\);/);
});

test("escalates from the somber opening through licensed system and horror scores", async () => {
  const [page, css, generator, backgroundMusic, systemBackgroundMusic, systemMusicSource, horrorBackgroundMusic, horrorMusicSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-field-audio.mjs", import.meta.url), "utf8"),
    readFile(new URL("../public/audio/background-sorrow.wav", import.meta.url)),
    readFile(new URL("../public/audio/background-system-countdown.mp3", import.meta.url)),
    readFile(new URL("../public/audio/SYSTEM_MUSIC_SOURCE.md", import.meta.url), "utf8"),
    readFile(new URL("../public/audio/background-horror-lights.mp3", import.meta.url)),
    readFile(new URL("../public/audio/HORROR_MUSIC_SOURCE.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /MUSIC_PREF_KEY = "chengjiang-background-music-muted"/);
  assert.match(page, /const zhouLoginMusicActive = !game\.started/);
  assert.match(page, /game\.view === "denied"/);
  assert.match(page, /game\.activeAccount === MINGCHUAN_ACCOUNT/);
  assert.match(page, /employeeIdInput\.trim\(\)\.toUpperCase\(\) === MINGCHUAN_ACCOUNT/);
  assert.match(page, /const systemMusicUnlocked = hasVisited\(game, "symbol-eye-record"\)/);
  assert.match(page, /const backgroundMusicAvailable = !game\.started[\s\S]*?\|\| systemMusicUnlocked/);
  assert.match(page, /"\/audio\/background-horror-lights\.mp3"/);
  assert.doesNotMatch(page, /background-horror-alert\.wav/);
  assert.match(page, /"\/audio\/background-system-countdown\.mp3"/);
  assert.doesNotMatch(page, /background-system-uncanny\.wav/);
  assert.match(page, /"\/audio\/background-sorrow\.wav"/);
  assert.match(page, /src=\{assetPath\(backgroundMusicPath\)\}/);
  assert.match(page, /const backgroundMusicAudio = backgroundMusicAvailable \? <audio/);
  assert.match(page, /backgroundMusicAvailable \? <button/);
  assert.match(page, /document\.addEventListener\("pointerdown", startMusic, \{ once: true \}\)/);
  assert.match(page, /BACKGROUND_MUSIC_DUCKED_VOLUME/);
  assert.match(page, /fieldAudioPlaying \|\| cctvVideoPlaying/);
  assert.match(page, /Math\.max\(0, Math\.min\(1, \(now - startedAt\) \/ duration\)\)/);
  assert.match(page, /audio\.volume = Math\.max\(0, Math\.min\(1, nextVolume\)\)/);
  assert.match(page, /aria-label=\{backgroundMusicEnabled \? "关闭背景音乐" : "播放背景音乐"\}/);
  assert.match(generator, /const backgroundTempo = 52/);
  assert.match(generator, /function createBackgroundMusic\(\)/);
  assert.match(generator, /const roots = \[38, 34, 41, 36, 38, 43, 34, 45\]/);
  assert.doesNotMatch(generator, /createSystemBackgroundMusic/);
  assert.doesNotMatch(generator, /background-system-uncanny\.wav/);
  assert.doesNotMatch(generator, /createHorrorBackgroundMusic/);
  assert.doesNotMatch(generator, /background-horror-alert\.wav/);
  assert.equal(backgroundMusic.subarray(0, 4).toString(), "RIFF");
  assert.equal(backgroundMusic.subarray(8, 12).toString(), "WAVE");
  assert.ok(backgroundMusic.length > 1_000_000);
  assert.equal(systemBackgroundMusic[0], 0xff);
  assert.ok(systemBackgroundMusic.length > 10_000_000);
  assert.match(systemMusicSource, /Alexander Nakarada/);
  assert.match(systemMusicSource, /Countdown/);
  assert.match(systemMusicSource, /CC BY 4\.0/);
  assert.match(systemMusicSource, /commons\.wikimedia\.org/);
  assert.equal(horrorBackgroundMusic.subarray(0, 3).toString(), "ID3");
  assert.ok(horrorBackgroundMusic.length > 5_000_000);
  assert.match(horrorMusicSource, /Rafael Krux/);
  assert.match(horrorMusicSource, /CC BY 4\.0/);
  assert.match(horrorMusicSource, /commons\.wikimedia\.org/);
  assert.match(css, /\.background-music-control--header/);
  assert.match(css, /@keyframes background-music-meter/);
});

test("grounds operational clues in auditable property records", async () => {
  const [page, ceilingInspectionPhoto] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/evidence/1204-ceiling-inspection.png", import.meta.url)),
  ]);
  const workorderBody = page.slice(page.indexOf('if (id === "workorder-1204")'), page.indexOf('if (id === "vacancy-1204")'));

  assert.match(page, /临时接触式拾振器/);
  assert.match(page, /\/evidence\/1204-ceiling-inspection\.png/);
  assert.match(page, /照片仅记录可见表面与现场测点，不代表已完成1304室内管线检查/);
  assert.match(page, /confirmed: "已确认非水管破损，怀疑人为因素"/);
  assert.doesNotMatch(page, /已确认零用水与固定声响并存/);
  assert.ok(ceilingInspectionPhoto.length > 1_000_000);
  assert.match(page, /公安协查回函/);
  assert.match(page, /ZC-LH/);
  assert.match(page, /殡仪馆寄存转出单/);
  assert.match(page, /title: "恒目管理顾问供应商备案"[\s\S]*terms: \["恒目", "澄江物业"/);
  assert.match(page, /data-copy="保留该保留的，遗忘该遗忘的。"/);
  assert.doesNotMatch(page, /异常不是错误。异常只是尚未完成校准的记录。/);
  assert.match(page, /以上身份仅为报事人自述，不作为房屋关系结论/);
  assert.doesNotMatch(workorderBody, /<p className="is-anomalous"><time>01:29<\/time>/);
  assert.doesNotMatch(page, /楼上的人是不是已经死了/);
  assert.doesNotMatch(page, /设备不是设备。驻场不是在岗/);
  assert.doesNotMatch(page, /将记忆清除称为<mark>过滤/);
  assert.doesNotMatch(page, /产权人、承租人及家庭成员名册中均无对应记录/);
  assert.doesNotMatch(page, /账号来源为已终止的历史服务授权/);
});

test("pairs Gu Changhe's subjective callback statement with a damaged identity copy", async () => {
  const [page, css, guChangheId] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/evidence/gu-changhe-cut-id.png", import.meta.url)),
  ]);
  const residentBody = page.slice(page.indexOf('if (id === "resident-1304")'), page.indexOf('if (id === "height-mark")'));

  assert.match(residentBody, /我总是听到她在敲门。我们已经分开很久了，她还是总来打扰我和孩子的生活。/);
  assert.doesNotMatch(residentBody, /是不是有人冒用住户资料/);
  assert.match(residentBody, /\/evidence\/gu-changhe-cut-id\.png/);
  assert.match(residentBody, /原件右下角缺失/);
  assert.match(page, /const guChangheDocumentRef = useRef<HTMLElement \| null>\(null\)/);
  assert.match(page, /window\.addEventListener\("pointermove", trackEyes\)/);
  assert.match(page, /documentFigure\.style\.setProperty\("--eye-track-x"/);
  assert.match(residentBody, /resident-profile__eye-overlay--left/);
  assert.match(residentBody, /resident-profile__eye-overlay--right/);
  assert.equal((residentBody.match(/style=\{\{ objectFit: "contain" \}\}/g) ?? []).length, 3);
  assert.match(css, /\.resident-profile__document \{[^}]*position: relative;/);
  assert.match(css, /\.resident-profile__document img \{ object-fit: contain;/);
  assert.match(css, /\.resident-profile__eye-overlay--left \{ clip-path: ellipse/);
  assert.match(css, /rotate\(var\(--eye-track-rotate\)\)/);
  assert.ok(guChangheId.length > 1_000_000);
});

test("presents the 1304 rescue archive as an aged newspaper scan", async () => {
  const [page, css, newspaper] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/evidence/1304-rescue-newspaper-aged.png", import.meta.url)),
  ]);
  const accidentBody = page.slice(page.indexOf('if (id === "accident-xiaoman")'), page.indexOf('if (id === "alibi-liang")'));

  assert.match(accidentBody, /className="aged-newspaper-scan"/);
  assert.match(accidentBody, /\/evidence\/1304-rescue-newspaper-aged\.png/);
  assert.match(accidentBody, /查看物业附件转写与来源边界/);
  assert.match(accidentBody, /后续讯问、伤情和责任认定不在物业卷宗内/);
  assert.match(css, /\.aged-newspaper-scan \{/);
  assert.match(css, /filter: sepia\(\.16\) saturate\(\.72\) contrast\(1\.04\)/);
  assert.ok(newspaper.length > 1_000_000);
});

test("turns the 1204 rescue into an evidence-led emergency workflow", async () => {
  const [page, css, livingRoomPhoto, airConditionerPhoto, kitchenPhoto, childShoesPhoto, cctvAmbience, cctvAudioSource, rescueGhostFrame] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/evidence/1204-vacancy/01-covered-living-room.png", import.meta.url)),
    readFile(new URL("../public/evidence/1204-vacancy/02-covered-air-conditioner.png", import.meta.url)),
    readFile(new URL("../public/evidence/1204-vacancy/03-kitchen-recent-use.png", import.meta.url)),
    readFile(new URL("../public/evidence/1204-child-shoes.png", import.meta.url)),
    readFile(new URL("../public/cctv/cam-12f-elevator-ambience.mp3", import.meta.url)),
    readFile(new URL("../public/cctv/CCTV_AUDIO_SOURCE.md", import.meta.url), "utf8"),
    readFile(new URL("../public/rescue-route/09-1304-gu-changhe-ghost.png", import.meta.url)),
  ]);
  const cctvMeta = page.slice(page.indexOf('id: "cctv-1204"'), page.indexOf('id: "audio-1304"'));
  const workorderBody = page.slice(page.indexOf('if (id === "workorder-1204")'), page.indexOf('if (id === "vacancy-1204")'));
  const vacancyBody = page.slice(page.indexOf('if (id === "vacancy-1204")'), page.indexOf('if (id === "scheduled-service-1204")'));
  const policeRouteMessage = page.slice(page.indexOf('{ id: 121'), page.indexOf('{ id: 3'));

  assert.match(vacancyBody, /现场巡检原始影像/);
  assert.match(vacancyBody, /\/evidence\/1204-vacancy\/01-covered-living-room\.png/);
  assert.match(vacancyBody, /\/evidence\/1204-vacancy\/02-covered-air-conditioner\.png/);
  assert.match(vacancyBody, /\/evidence\/1204-vacancy\/03-kitchen-recent-use\.png/);
  assert.match(vacancyBody, /\/evidence\/1204-child-shoes\.png/);
  assert.match(vacancyBody, /家具防尘覆盖[\s\S]*?立式空调封存状态[\s\S]*?台面近期使用痕迹[\s\S]*?未清点儿童鞋履/);
  assert.ok(livingRoomPhoto.length > 1_000_000);
  assert.ok(airConditionerPhoto.length > 1_000_000);
  assert.ok(kitchenPhoto.length > 1_000_000);
  assert.ok(childShoesPhoto.length > 1_000_000);
  assert.match(css, /\.vacancy-photo-grid \{ display: grid; grid-template-columns: repeat\(4,minmax\(0,1fr\)\);/);
  assert.match(page, /cam-12f-event-review\.mp4/);
  assert.match(page, /cam-12f-elevator-ambience\.mp3/);
  assert.match(page, /ref=\{cctvAmbienceRef\}/);
  assert.match(page, /ambience\.volume = Math\.max\(0, Math\.min\(1, video\.volume \* CCTV_AMBIENCE_VOLUME\)\)/);
  assert.match(page, /onSeeking=\{\(\) => syncCctvAmbience\(\)\}/);
  assert.match(page, /onVolumeChange=\{\(\) => syncCctvAmbience\(\)\}/);
  assert.match(page, /拾音轨：公共区域设备环境声/);
  assert.ok(cctvAmbience.length > 700_000);
  assert.match(cctvAudioSource, /Recordist: stephan/);
  assert.match(cctvAudioSource, /License: Public domain/);
  assert.match(cctvMeta, /available: \(game\) => game\.childMissingReported/);
  assert.match(cctvMeta, /接到失联儿童协查后/);
  assert.doesNotMatch(workorderBody, /openRelatedArticle\("cctv-1204"\)|12层公共区域事件录像/);
  assert.match(page, /本任务由失联儿童接警回执DL-0713-0041触发，不属于W-0713-019滴水投诉的原始附件/);
  assert.match(page, /className="cctv-video-play" onClick=\{playCctvReview\}/);
  assert.match(page, /ref=\{cctvVideoRef\}/);
  assert.match(css, /\.cctv-video-shell > \.camera-overlay \{ pointer-events: none; \}/);
  assert.match(page, /事件片段串联回放/);
  assert.match(page, /片段间不代表连续录像/);
  assert.match(page, /const \[cctvAnomalyTimes, setCctvAnomalyTimes\] = useState<string\[\]>\(\[\]\)/);
  assert.match(page, /const expected = \["00:04", "00:07", "00:10", "00:12"\]/);
  assert.match(page, /expected\.every\(\(time\) => cctvAnomalyTimes\.includes\(time\)\)/);
  assert.match(page, /type="checkbox" checked=\{selected\}/);
  assert.match(page, /选择所有出现画面、通道或录像数据异常的时间节点/);
  assert.doesNotMatch(page, /用于比较人员与地面的基准切片/);
  assert.doesNotMatch(page, /time === "00:04" \? "地面变化"/);
  assert.match(page, /未成年人失联不受住户登记状态限制/);
  assert.match(page, /姓名许芷遥/);
  assert.match(page, /normalizeText\("许芷遥"\) \|\| name === "xuzhiyao"/);
  assert.match(page, /\/evidence\/xu-zhiyao-health-photo\.png/);
  assert.doesNotMatch(page, /何芷遥|hezhiyao|he-zhiyao/);
  assert.match(page, /DL-0713-0041/);
  assert.match(page, /最后确认日期（年月日）<input value=\{childLastDate\}/);
  assert.match(page, /normalizeChineseDate\(childLastDate\) !== "2026-07-13"/);
  assert.doesNotMatch(page, /最后确认时间<input type="datetime-local"/);
  assert.doesNotMatch(page, /childStart !== "2026-07-13T00:03"/);
  assert.match(page, /terms: \["DL-0713-0041", "接警回执", "报警回执"/);
  assert.match(page, /id: "register-child"[\s\S]*?available: \(game\) => game\.childMissingReported && game\.evidence\.includes\("vacancyMismatch"\)/);
  assert.doesNotMatch(page, /available: \(game\) => game\.childMissingReported && hasVisited\(game, "clinic-child"\)/);
  assert.match(page, /id: "clinic-child"[\s\S]*?title: "1204 童鞋内拾获儿童健康信息卡"[\s\S]*?available: \(game\) => game\.inspectedArticles\.includes\("vacancy-1204"\) \|\| hasVisited\(game, "clinic-child"\)/);
  assert.match(page, /<dt>监护人<\/dt><dd>许\*\*、赵\*\*<\/dd>/);
  assert.match(page, /<dt>出生日期<\/dt><dd>2020年4月12日<\/dd>/);
  assert.match(page, /function normalizeChineseDate\(value: string\)/);
  assert.match(page, /normalizeChineseDate\(childBirthday\) !== "2020-04-12"/);
  assert.match(page, /normalizeChineseDate\(childLastDate\) !== "2026-07-13"/);
  assert.match(page, /出生日期（年月日）<input value=\{childBirthday\}[\s\S]*placeholder="x年x月x日"/);
  assert.doesNotMatch(page, /出生日期（年月日）<input value=\{childBirthday\}[\s\S]*placeholder="例：2020年4月12日"/);
  assert.match(page, /最后确认日期（年月日）<input value=\{childLastDate\}[\s\S]*placeholder="x年x月x日"/);
  assert.doesNotMatch(page, /最后确认日期（年月日）<input value=\{childLastDate\}[\s\S]*placeholder="例：2026年7月13日"/);
  assert.doesNotMatch(page, /<dt>监护人<\/dt><dd>许建国、赵秀兰<\/dd>/);
  assert.doesNotMatch(page.slice(page.indexOf('id: "clinic-child"'), page.indexOf('id: "register-child"')), /childMissingReported|vacancyMismatch/);
  assert.match(page, /const inspectChildShoes = \(\) =>/);
  assert.match(page, /inspectedArticles: addUnique\(current\.inspectedArticles, \["vacancy-1204"\]\)/);
  assert.match(page, /visited: addUnique\(current\.visited, \["clinic-child"\]\)/);
  assert.match(vacancyBody, /className=\{`shoe-note-hotspot/);
  assert.match(vacancyBody, /onClick=\{inspectChildShoes\}/);
  assert.equal((vacancyBody.match(/onClick=\{inspectChildShoes\}/g) ?? []).length, 1);
  assert.match(vacancyBody, /aria-controls="vacancy-child-health-card"/);
  assert.match(vacancyBody, /renderChildHealthCard\(true\)/);
  assert.doesNotMatch(vacancyBody, /shoe-evidence-photo|shoe-card-inspect|shoe-card-result/);
  assert.match(page, /id=\{inline \? "vacancy-child-health-card" : undefined\}/);
  assert.match(page, /鞋内折叠卡片/);
  assert.match(page, /"儿童健康", "儿童健康卡", "健康信息卡"/);
  assert.match(page, /restored\.visited\?\.includes\("clinic-child"\) \? \["vacancy-1204"\] : \[\]/);
  assert.match(page, /\["1204儿童房", "1204门外", "消防楼梯", "13层前室", "1304门外"\]/);
  assert.match(page, /const rescueRouteScenes: RescueRouteScene\[\]/);
  assert.match(page, /id: "rescue-route"[\s\S]*?available: \(game\) => game\.surveillanceSolved && game\.childRegistered/);
  assert.match(policeRouteMessage, /author: "辖区民警"[\s\S]*?badge: "现场协查指令"/);
  assert.match(policeRouteMessage, /建立《失联儿童现场搜索路线》/);
  assert.match(policeRouteMessage, /1304室内未经授权不得进入/);
  assert.doesNotMatch(policeRouteMessage, /1204儿童房[\s\S]*?1204门外[\s\S]*?消防楼梯[\s\S]*?13层前室[\s\S]*?1304门外/);
  assert.match(page, /routeInstructionSeen: restored\.routeInstructionSeen \?\? Boolean\(restored\.visited\?\.includes\("rescue-route"\) \|\| restored\.childSaved\)/);
  assert.match(page, /!game\.surveillanceSolved \|\| !game\.childRegistered \|\| game\.routeInstructionSeen \|\| game\.childSaved/);
  assert.match(page, /announceMessages\(\[121\]\)/);
  assert.match(page, /\/rescue-route\/01-1204-child-room\.jpg/);
  assert.match(page, /\/rescue-route\/05-1304-door\.jpg/);
  assert.match(page, /className="route-scene-strip"/);
  assert.match(page, /type RescueRouteDrag =/);
  assert.match(page, /const insertRouteAt = \(place: string, targetIndex: number\) =>/);
  assert.match(page, /const moveRouteStep = \(index: number, direction: -1 \| 1\) =>/);
  assert.match(page, /onDragStart=\{\(event\) => scene \? startRouteDrag\(event, scene\.place, index\)/);
  assert.match(page, /onDrop=\{\(event\) => dropRouteAt\(event, index\)\}/);
  assert.match(page, /onDrop=\{dropRouteInPool\}/);
  assert.match(page, /aria-pressed=\{selected\}/);
  assert.match(page, /route-option-pool/);
  assert.match(css, /\.route-scene-strip article\.is-drop-target/);
  assert.match(css, /\.route-option-pool\.is-drop-target/);
  assert.doesNotMatch(page, /影子未通过目标识别/);
  assert.doesNotMatch(page, /画面已完成复核/);
  assert.doesNotMatch(page, /两部电梯门在复核时段内保持关闭/);
  assert.doesNotMatch(page, /地库车道在完整复核区间内没有人员移动/);
  assert.doesNotMatch(page, /系统只能调取2023年的入户巡检归档照/);
  assert.match(page, /activeRescueScene\.observation && <p>\{activeRescueScene\.observation\}<\/p>/);
  assert.match(page, /ELEV-12F \/ 呼梯0次/);
  assert.match(page, /历史入户影像 \/ 非本次时段/);
  assert.match(page, /CAM-B2-07 \/ 事件0/);
  assert.match(page, /const rescueResultScene = rescueRouteScenes\.find\(\(scene\) => scene\.place === "1304门外"\)!/);
  assert.match(page, /assetPath\(rescueResultScene\.image\)/);
  assert.match(page, /type RescueCinematicStage = "idle" \| "found" \| "corridor" \| "ghost"/);
  assert.match(page, /GU_CHANGHE_RESCUE_FRAME = "\/rescue-route\/09-1304-gu-changhe-ghost\.png"/);
  assert.match(page, /setRescueCinematicStage\("found"\)/);
  assert.match(page, /rescueCinematicStage === "found"[\s\S]*?"corridor"[\s\S]*?"ghost"/);
  assert.match(page, /aria-label="许芷遥获救场景演出"/);
  assert.match(page, /带我来的小姑娘没有跟出来/);
  assert.match(page, /现场设备没有保存这一帧/);
  assert.match(page, /记录现场，继续调查/);
  assert.match(css, /\.route-rescue-cinematic\.is-corridor \.route-rescue-cinematic__base/);
  assert.match(css, /\.route-rescue-cinematic\.is-ghost \.route-rescue-cinematic__ghost/);
  assert.match(css, /@keyframes rescue-caption-enter/);
  assert.ok(rescueGhostFrame.length > 1_000_000);
  assert.doesNotMatch(page, /route-scene-missing|该位置没有连续现场记录|无连续信号/);
  assert.match(page, /route\.length !== 5/);
  const submitRoute = page.slice(page.indexOf("const submitRoute ="), page.indexOf("const submitFatherStatus ="));
  assert.doesNotMatch(submitRoute, /if \(game\.route\.join\("\|"\)[\s\S]*?route: \[\][\s\S]*?路线无法下发/);
  assert.match(css, /\.route-scene-stage,.route-rescue-result/);
  assert.doesNotMatch(page, /route-final-mask|现场画面待响应人员回传/);
  assert.doesNotMatch(css, /\.route-final-mask/);
  await Promise.all(["01-1204-child-room.jpg", "02-1204-corridor.jpg", "03-fire-stair.jpg", "04-13f-vestibule.jpg", "05-1304-door.jpg", "06-12f-elevator-lobby.png", "07-1304-archive-interior.png", "08-b2-parking.png"].map((name) => readFile(new URL(`../public/rescue-route/${name}`, import.meta.url))));
  assert.match(page, /已经报警/);
  assert.match(page, /孩子不见了。芷遥，五岁/);
  assert.match(page, /家里都找遍了，卧室、卫生间、阳台都没有/);
  assert.match(page, /能不能先帮忙看看楼梯间？求你们了/);
  assert.match(page, /房子是我们占住的，是真没办法了，大城市房租太贵/);
  assert.doesNotMatch(page, /1204卧室、卫生间、阳台和同层走廊已经找过/);
  assert.match(page, /110报警已受理，接警回执已经生成/);
  assert.match(page, /安保正在封闭一层出口并逐层核对消防门/);
  assert.match(page, /announceMessages\(\[112, 118, 119, 120\]\)/);
  assert.match(page, /missingChildAlertSeen: restored\.missingChildAlertSeen \?\? false/);
  assert.match(page, /!game\.childMissingReported \|\| game\.missingChildAlertSeen/);
  assert.match(page, /missingChildAlertSeen: current\.missingChildAlertSeen \|\| triggersMissingChild/);
  assert.match(page, /archive-app--emergency-alert/);
  assert.match(page, /儿童失联 · \$\{messagePopup\.count\}条紧急消息/);
  assert.match(css, /@keyframes emergency-window-shake/);
  assert.match(css, /\.message-popup--urgent/);
  assert.doesNotMatch(page, /我们没敢报警/);
  assert.match(page, /const requestMissingChildDetail = \(detail: "last_seen" \| "police_ref"\) =>/);
  assert.match(page, /missingChildReply\.includes\("last_seen"\)/);
  assert.match(page, /missingChildReply\.includes\("police_ref"\)/);
  assert.doesNotMatch(page, /message\.id === 112 && !game\.missingChildReply/);
});

test("does not use service-contact names to index the police receipt", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const policeRecordMeta = page.slice(page.indexOf('id: "register-child"'), page.indexOf('id: "rescue-route"'));

  assert.match(policeRecordMeta, /terms: \["DL-0713-0041", "接警回执", "报警回执", "未登记儿童", "许芷遥", "协查", "最后确认日期", "1204"\]/);
  assert.doesNotMatch(policeRecordMeta, /许建国|赵秀兰|父亲|母亲|监护人/);
});

test("reveals the missing-child emergency before creating the separate CCTV review task", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const openArticle = page.slice(page.indexOf("const openArticle ="), page.indexOf("const openRelatedArticle ="));
  const submitCctv = page.slice(page.indexOf("const submitCctvReview ="), page.indexOf("const stopFieldAudio ="));

  assert.match(page, /const missingChildEvidence = \["vacancyMismatch"\]/);
  assert.match(page, /missingChildEvidence\.every\(\(item\) => nextEvidence\.includes\(item\)\)/);
  assert.match(page, /id: "cctv-1204"[\s\S]*?available: \(game\) => game\.childMissingReported/);
  assert.match(page, /available: \(game\) => game\.childMissingReported && game\.evidence\.includes\("vacancyMismatch"\)/);
  assert.match(page, /childMissingReported: Boolean\(restored\.childMissingReported \|\| restored\.evidence\?\.includes\("vacancyMismatch"\)\)/);
  assert.match(page, /const readArticles = articles\.filter\(\(article\) => game\.visited\.includes\(article\.id\) && article\.available\(game\)\)/);
  assert.match(page, /requestedArticle && requestedArticle\.available\(saved\)/);
  assert.doesNotMatch(submitCctv, /triggersMissingChild|childMissingReported|announceMessages\(\[112\]\)/);
  assert.doesNotMatch(openArticle, /triggersMissingChild|childMissingReported|articleEvidence/);
});

test("hides the 1204 service contacts inside a mixed building schedule", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const vacancyBody = page.slice(page.indexOf('if (id === "vacancy-1204")'), page.indexOf('if (id === "scheduled-service-1204")'));

  assert.match(page, /id: "scheduled-service-1204"/);
  assert.match(page, /title: "1号楼第二季度定时入户服务排班"/);
  assert.match(page, /available: \(game\) => hasVisited\(game, "vacancy-1204"\)/);
  assert.match(page, /绿植养护[\s\S]*?净水滤芯更换[\s\S]*?室内保洁[\s\S]*?信件代收转交[\s\S]*?独居住户物资代办/);
  assert.match(page, /许建国 \/ 赵秀兰/);
  assert.match(page, /"scheduled-service-1204": \["vacancyMismatch"\]/);
  assert.doesNotMatch(vacancyBody, /许建国|赵秀兰|每月两次保洁/);
});

test("gives the 1204 owner a searchable public-news trail", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const vacancyBody = page.slice(page.indexOf('if (id === "vacancy-1204")'), page.indexOf('if (id === "scheduled-service-1204")'));

  assert.match(vacancyBody, /产权登记[\s\S]*?陈大国[\s\S]*?不动产权证尾号 4417/);
  assert.doesNotMatch(vacancyBody, /公开信息索引|经侦通报|畏罪潜逃|姓名命中一条公开信息/);
  assert.match(page, /id: "vacancy-1204"[\s\S]*?terms: \["1204", "空置房", "产权人", "陈大国", "4417", "保洁"/);
  assert.match(page, /id: "owner-chen-public-notice"/);
  assert.match(page, /terms: \["陈大国", "陈某国", "经侦通报", "畏罪潜逃"/);
  assert.match(page, /available: \(game\) => hasVisited\(game, "vacancy-1204"\)/);
  assert.match(page, /和裕供应链财务负责人被列为在逃人员/);
  assert.match(page, /证件号码末四位为<mark>4417<\/mark>[\s\S]*?澄江公寓1号楼1204/);
  assert.match(page, /“畏罪潜逃”来自媒体转载标题，不是司法结论/);
  assert.doesNotMatch(vacancyBody, /产权人涉嫌经济犯罪，长期境外失联/);
});

test("links the pending 1204 identity status to the property review record", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const workorderBody = page.slice(page.indexOf('if (id === "workorder-1204")'), page.indexOf('if (id === "vacancy-1204")'));

  assert.match(workorderBody, /className="complainant-review-link"/);
  assert.match(workorderBody, /onClick=\{\(\) => openRelatedArticle\("vacancy-1204"\)\}/);
  assert.match(workorderBody, /资料状态[\s\S]*?待复核[\s\S]*?本工单未附产权证明、租赁备案或家庭成员材料/);
  assert.match(workorderBody, /查看1204产权复核材料/);
  assert.match(css, /\.complainant-review-link:focus-visible/);
});

test("keeps locked search results fragmented and out of the full-text answer index", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /lockedTerms\?: string\[\]/);
  assert.match(page, /function isArticleLocked\(article: ArticleMeta, game: GameState\)/);
  assert.match(page, /const terms = \(locked \? article\.lockedTerms \?\? \[\] : article\.terms\)/);
  assert.match(page, /function brokenTitleFor\(article: ArticleMeta\)/);
  assert.match(page, /标题索引在加密迁移中碎裂/);
  assert.match(page, /className=\{locked \? "broken-record-title" : ""\}/);
  assert.match(css, /\.broken-record-title::before/);
  assert.match(css, /@keyframes broken-title-slip/);
});

test("treats room numbers as narrow entry searches instead of master keys", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /const genericRoomSearchEntries: Record<string, readonly string\[]> = \{/);
  assert.match(page, /"1204": \["workorder-1204", "vacancy-1204", "meter-1304"\]/);
  assert.match(page, /"1304": \["meter-1304", "resident-1304", "height-mark", "workorder-1204", "case-correction"\]/);
  assert.match(page, /if \(!article\.available\(game\) && !indexedWhileLocked\) return 0/);
  assert.match(page, /id: "height-mark"[\s\S]*?available: \(game\) => game\.childSaved/);
  assert.match(page, /"1104": \["employee-sync", "room-1104-live", "room-1104"\]/);
  assert.match(page, /"1404": \["workorder-1404", "w04-directory"\]/);
  assert.match(page, /query\.match\(\/\^\(\?:房间\|房号\|单元\)\?\(1204\|1304\|1104\|1404\)\(\?:室\|房\|户\)\?\$\/\)/);
  assert.match(page, /if \(roomQuery\) \{[\s\S]*?if \(entryIndex === -1\) return 0;[\s\S]*?if \(!article\.available\(game\) && !indexedWhileLocked\) return 0;[\s\S]*?return 100 - entryIndex;/);
});

test("opens the 1104 live room view from Zhou's password-free plea", async () => {
  const [page, css, roomFrame, ghostFrame] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/evidence/1104/room-live.jpg", import.meta.url)),
    readFile(new URL("../public/evidence/1104/room-live-ghost.jpg", import.meta.url)),
  ]);

  assert.match(page, /text: "一切都放在1104，救救我，我被困住了！"/);
  assert.match(page, /id: "room-1104-live"[\s\S]*?title: "1104 房间实况"[\s\S]*?available: \(game\) => hasVisited\(game, "employee-sync"\)/);
  assert.match(page, /id: "room-1104"[\s\S]*?title: "1104墙体复测与人员流转复核"/);
  assert.match(page, /id: "employee-mingchuan"[\s\S]*?title: "周明川员工基本信息"/);
  assert.match(page, /设施巡检专员/);
  assert.match(page, /多次拒绝无照片结单/);
  assert.match(page, /话不多，但会把哪里坏了讲清楚/);
  assert.match(page, /const MINGCHUAN_BIRTHDAY = "1991-09-17"/);
  assert.match(page, /const MINGCHUAN_RECORD_PASSWORD = "19910917"/);
  assert.match(page, /normalizeText\(roomPassword\) !== MINGCHUAN_RECORD_PASSWORD/);
  assert.doesNotMatch(page, /11·04·2713|11042713/);
  assert.match(page, /className="room-1104-live__wall-hotspot"/);
  assert.match(page, /aria-pressed=\{room1104GhostPinned\}/);
  assert.match(page, /onClick=\{inspectRoom1104Wall\}/);
  assert.match(page, /wallAnomalyInspected: boolean/);
  assert.match(page, /检索关键词已记录：墙面破拆/);
  assert.match(page, /id: "wall-demolition-1104"[\s\S]*?title: "1104西墙封闭施工派工记录"[\s\S]*?available: \(game\) => game\.wallAnomalyInspected/);
  assert.match(page, /available: \(game\) => hasVisited\(game, "wall-demolition-1104"\)/);
  assert.match(page, /恒目驻场设施组接收1104西墙“局部封闭”任务/);
  assert.doesNotMatch(page, /<label>“内部转移”流程合规性/);
  assert.doesNotMatch(page, /wallArchive/);
  assert.match(page, /\/evidence\/1104\/room-live\.jpg/);
  assert.match(page, /\/evidence\/1104\/room-live-ghost\.jpg/);
  assert.doesNotMatch(page, /author: "周明川"[\s\S]{0,300}text: "[^"]*密码/);
  assert.match(css, /\.room-1104-live:has\(\.room-1104-live__wall-hotspot:hover\)/);
  assert.match(css, /\.room-1104-live\.is-pinned \.room-1104-live__ghost/);
  assert.ok(roomFrame.length > 100_000);
  assert.ok(ghostFrame.length > 100_000);
});

test("awards article evidence only after attachment inspection or cross-checking", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const openArticle = page.slice(page.indexOf("const openArticle ="), page.indexOf("const openRelatedArticle ="));
  const unlockArticle = page.slice(page.indexOf("const submitProtectedArticlePassword ="), page.indexOf("const confirmArticleEvidence ="));

  assert.match(page, /inspectedArticles: string\[\]/);
  assert.match(page, /const confirmArticleEvidence = \(articleId: string\) =>/);
  assert.match(page, /inspectedArticles: addUnique\(current\.inspectedArticles, \[articleId\]\)/);
  assert.match(page, /renderArticleVerification\("scheduled-service-1204"\)/);
  assert.doesNotMatch(page, /renderArticleVerification\("vacancy-1204"\)/);
  assert.match(page, /renderArticleVerification\("crash-cj0713"\)/);
  assert.doesNotMatch(openArticle, /evidence:/);
  assert.doesNotMatch(unlockArticle, /evidence:/);
});

test("renders the night acoustic puzzle with licensed real-world recordings", async () => {
  const [page, css, generator, recordingNotes, ...stems] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-field-audio.mjs", import.meta.url), "utf8"),
    readFile(new URL("../public/audio/FIELD_RECORDINGS.md", import.meta.url), "utf8"),
    ...["pipe", "tv", "bath", "child"].map((name) => readFile(new URL(`../public/audio/field-${name}.mp3`, import.meta.url))),
  ]);

  assert.match(page, /fieldAudioElements = useRef<Partial<Record<AudioTrackKey, HTMLAudioElement>>>/);
  assert.match(page, /src=\{assetPath\(track\.src\)\}/);
  assert.match(page, /await Promise\.all\(elements\.map\(\(\{ element \}\) => element!\.play\(\)\)\)/);
  assert.match(page, /fieldAudioStartedAt\.current = performance\.now\(\)/);
  assert.doesNotMatch(page, /primary\.currentTime/);
  assert.match(page, /element\.muted = willMute/);
  assert.match(page, /播放拾振样本/);
  assert.match(page, /game\.audioSolved \? track\.resolved : track\.label/);
  assert.match(page, /src: "\/audio\/field-pipe\.mp3"[\s\S]*?label: "低沉的金属嗡鸣"[\s\S]*?note: "持续水流低鸣，偶尔带有金属腔体回响"/);
  assert.match(page, /src: "\/audio\/field-tv\.mp3"[\s\S]*?label: "远处电视播报声"[\s\S]*?note: "隔墙人声模糊，无法辨清具体语句"/);
  assert.match(page, /src: "\/audio\/field-bath\.mp3"[\s\S]*?label: "空腔里的规律滴水声"[\s\S]*?note: "水滴落入浴缸排水口，带有瓷砖空间反射"/);
  assert.match(page, /src: "\/audio\/field-child\.mp3\?v=girl-hum-2"[\s\S]*?label: "女孩轻声哼唱儿歌"[\s\S]*?note: "没有歌词，旋律断续，近处换气与浴室短反射清楚"/);
  assert.match(page, /"儿童哼唱", "童谣残句", "近场换气"/);
  assert.doesNotMatch(page, /label: "结构传导"|label: "公共环境"|label: "近场瞬态"|label: "近场窄带"/);
  assert.doesNotMatch(generator, /createChildVoiceTrack|littleWhiteBoatMotif|createTrack\(track\)|field-child-voice-source/);
  assert.match(recordingNotes, /Creative Commons 0/);
  assert.match(recordingNotes, /sounds\/69979/);
  assert.match(recordingNotes, /girlprettyvoicehumming\.wav/);
  assert.match(recordingNotes, /sounds\/543782/);
  assert.match(recordingNotes, /sounds\/434508/);
  assert.match(recordingNotes, /sounds\/740288/);
  assert.ok(stems.every((stem) => stem.length > 40_000 && stem[0] === 0xff && (stem[1] & 0xe0) === 0xe0));
  assert.match(css, /\.field-audio-monitor/);
  assert.match(css, /@keyframes field-waveform/);
});

test("accepts free-text alcohol poisoning wording in the 1304 status receipt", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const form = page.slice(page.indexOf('if (id === "case-correction")'), page.indexOf('if (id === "resident-separation-guide")'));

  assert.match(page, /const normalizedDeath = normalizeText\(caseDeath\)/);
  assert.match(page, /normalizedDeath\.includes\("酒精"\) && normalizedDeath\.includes\("中毒"\)/);
  assert.match(form, /<label>死因字段<input/);
  assert.match(form, /placeholder="按公安协查回函原文填写"/);
  assert.doesNotMatch(form, /<option value="alcohol">急性酒精中毒<\/option>/);
});

test("makes the 1304 deduction reconstruct records before revealing the chapter", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /const fatherCaseRecords = \[/);
  assert.match(page, /\["incident", "death", "door-off", "child-path", "message-token"\]/);
  assert.match(page, /核对1304死亡主体与异常账号链/);
  assert.match(page, /从八条记录中选出五条/);
  assert.match(page, /历史事故.*主体状态.*凭证处置.*本次关联.*当前活动/s);
  assert.match(page, /removeCaseRecord/);
  assert.doesNotMatch(page, /if \(caseTimeline\.join\("\|"\) !== expected\.join\("\|"\)\) \{\s*setCaseTimeline\(\[\]\)/);
  assert.match(page, /A-1304-0821 \/ 110附件/);
  assert.match(page, /1304-FAMILY-KEEP \/ 创建于 2023-02-08 09:24/);
  assert.match(page, /CJ-0713，不得动用私情/);
  assert.match(page, /系统不能证明门外的呼唤是思念，也不能把它登记成宽恕/);
  assert.match(page, /附加事故回执，保全会话并停用令牌/);
  assert.match(page, /visible: \(game\) => game\.fatherResolved, text: "小满只是想念父亲。思念不等于原谅/);
  assert.match(page, /if \(!game\.fatherResolved\) announceMessages\(\[4\]\)/);
  assert.doesNotMatch(page, /<label>顾小满死亡责任/);
  assert.doesNotMatch(page, /<label>每日呼唤的含义/);
  assert.doesNotMatch(page, /<option value="longing">儿童思念，不构成宽恕/);
  assert.doesNotMatch(page, /<button onClick=\{\(\) => closeFatherChat\("guilt"\)\}/);
});

test("keeps case titles sealed until their room deduction is complete", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /title: "空房间与隐形孩子"/);
  assert.match(page, /title: "没离开的人"/);
  assert.match(page, /title: "周明川，最后一次呼叫"/);
  assert.match(page, /title: "明天，再一次"/);
  assert.match(page, /chapter\.isResolved \? chapter\.title : chapter\.room/);
  assert.match(page, /game\.childSaved \? evidenceChapters\[0\]\.title : "1204"/);
  assert.match(page, /game\.fatherResolved \? evidenceChapters\[1\]\.title : "1304"/);
  assert.match(page, /game\.colleagueSolved \? evidenceChapters\[2\]\.title : "1104"/);
  assert.match(page, /game\.homeSolved \? evidenceChapters\[3\]\.title : "1404"/);
  assert.match(page, /章节标题只会在对应推导完成后归档/);
  assert.match(page, /className="ledger-evidence-list"/);
  assert.match(page, /chapter\.foundEvidence\.map\(\(item, index\) =>/);
  assert.match(page, /evidenceLabels\[item\] \?\? item/);
  assert.match(page, /vacancyMismatch: "1204空置登记与实际居住记录冲突"/);
  assert.match(page, /bodyWall: "1104西墙空腔尺寸与有机来源环境读数异常"/);
  assert.match(page, /vacancyMismatch: "scheduled-service-1204"/);
  assert.match(page, /const openEvidenceSource = \(evidenceId: string\) =>/);
  assert.match(page, /aria-label=\{`打开证据来源：\$\{label\}`\}/);
  assert.match(css, /\.ledger-chapter\.is-sealed/);
  assert.match(css, /\.ledger-chapter\.is-revealed/);
  assert.match(css, /\.ledger-evidence-list li/);
  assert.match(css, /\.ledger-evidence-list li > button/);
});

test("keeps unread records out of the archive reading drawer", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /const readArticles = articles\.filter\(\(article\) => game\.visited\.includes\(article\.id\) && article\.available\(game\)\)/);
  assert.match(page, /readArticles\.length \? readArticles\.map/);
  assert.match(page, /暂无阅读记录/);
  assert.doesNotMatch(page, /目录显示系统内全部档案/);
});

test("restores game screens from static-safe hash routes", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /const parseAppRoute = \(hash: string\): AppRoute/);
  assert.match(page, /`\/system\/search\/\$\{encodeURIComponent\(term\)\}`/);
  assert.match(page, /`\/system\/article\/\$\{article\.id\}`/);
  assert.match(page, /`\/system\/denied\/\$\{article\.id\}`/);
  assert.match(page, /writeAppRoute\("\/system\/legacy"\)/);
  assert.match(page, /segments\[1\] === "quality" && segments\[2\] === "trace-046"/);
  assert.match(page, /writeAppRoute\("\/system\/quality\/trace-046"\)/);
  assert.match(page, /window\.addEventListener\("popstate", applyBrowserRoute\)/);
  assert.match(page, /saved\.visited\.includes\(route\.articleId\)/);
});

test("lets the 1304 callback break CS-046's standard service voice", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const callback = page.slice(page.indexOf('id: "1304-status-return"'), page.indexOf('id: "1104-employee-return"'));

  assert.match(callback, /你跟我一样，都是这样的存在。只是苦了我的小满。/);
  assert.match(callback, /你让这个账号一直留在房间，只会让她的记录继续被困在这里/);
  assert.match(callback, /你也有自己的痛苦要遗忘吧/);
  assert.doesNotMatch(callback, /请不要提及未登记的家庭成员/);
});

test("gates the CS-046 identity archive behind explicit player confirmation", async () => {
  const [page, styles, eyeAsset, eyeSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/evidence/cs046-eye-cc0.jpg", import.meta.url)),
    readFile(new URL("../public/evidence/CS046_EYE_SOURCE.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /view: "callbacks"; callbackId: string \| null/);
  assert.match(page, /id: "1204-first-return"/);
  assert.match(page, /id: "1304-status-return"/);
  assert.match(page, /id: "1104-employee-return"/);
  assert.match(page, /id: "1404-care-return"/);
  assert.match(page, /callbackRead: addUnique\(current\.callbackRead, \[record\.id\]\)/);
  assert.match(page, /const callbackReviewReady = callbackCoreIds\.every\(\(id\) => game\.callbackRead\.includes\(id\)\) && hasVisited\(game, "workorder-1404"\)/);
  assert.match(page, /id: 123[\s\S]*?action: "callback-review"[\s\S]*?复核任务未登记到全文索引/);
  assert.match(page, /callbackReviewNoticeSeen: boolean/);
  assert.match(page, /if \(!game\.started \|\| !callbackReviewReady \|\| game\.callbackReviewNoticeSeen\) return/);
  assert.match(page, /announceMessages\(\[123\]\)/);
  assert.match(page, /const openCallbackIdentityReview = \(\) => \{/);
  assert.match(page, /const callbackReviewReachable = saved\.cs046TraceSolved[\s\S]*?callbackCoreIds\.every/);
  assert.match(page, /game\.view === "callback-review" && <div className=\{`callback-review-page/);
  assert.doesNotMatch(page, /callback-correlation-locked/);
  assert.match(page, /normalizeText\(callbackOperatorName\) !== "陈峻" \|\| normalizeText\(callbackResidentRelation\) !== "夫妻" \|\| normalizeText\(callbackEmployeeStatus\) !== "已死亡"/);
  assert.match(page, /cs046TraceSolved: boolean/);
  assert.match(page, /cs046TraceSolved: restored\.cs046TraceSolved \?\? restored\.cs046Solved \?\? false/);
  assert.match(page, /CS-046是谁？<\/span><input/);
  assert.match(page, /1404房主和CJ-0713的关系？<\/span><input/);
  assert.match(page, /CJ-0713状态？<\/span><select[\s\S]*?<option value="已死亡">已死亡<\/option>/);
  assert.match(page, /CS-046为陈峻，1404住户与CJ-0713为夫妻，CJ-0713已死亡/);
  assert.doesNotMatch(page, /CS-046与CJ-0713是同一意识|主角已多次调查这些住户并被清除记忆/);
  assert.match(page, /disabled=\{!game\.colleagueSolved \|\| !game\.cs046Solved\}/);
  assert.match(page, /id: "cs046-operator-archive"[\s\S]*?available: \(game\) => game\.cs046Solved/);
  assert.match(page, /if \(query === "cs046"\) return game\.cs046Solved && article\.id === "cs046-operator-archive" \? 100 : 0/);
  assert.match(page, /normalizeText\(game\.lastQuery\) === "cs046" && !game\.cs046Solved/);
  assert.match(page, /const CS046_SEARCH_PASSES = \[[\s\S]*?QUERY OWNER \/ CJ-0713/);
  assert.match(page, /isCs046Search \? <Cs046SearchIntrusion stage=\{cs046SearchStage\} \/>/);
  assert.match(page, /setCs046SearchStage\(\(current\) => Math\.min\(CS046_SEARCH_FINAL_STAGE, current \+ 1\)\)/);
  assert.match(page, /没有找到完全匹配的记录[\s\S]*?未收到终止标记/);
  assert.match(page, /Array\.from\(\{ length: 24 \}\)/);
  assert.match(page, /assetPath\("\/evidence\/cs046-eye-cc0\.jpg"\)/);
  assert.match(styles, /@keyframes cs046-result-arrive/);
  assert.match(styles, /@keyframes cs046-eye-blink/);
  assert.match(styles, /\.cs046-search-intrusion\.is-taken-over \.cs046-eye-takeover \{ animation: cs046-takeover \.18s/);
  assert.match(styles, /\.archive-app--callback-review \.evidence-rail \{ display: none/);
  assert.match(styles, /\.callback-review-page\.is-confirming \.callback-review-ghosts/);
  assert.match(styles, /@keyframes callback-review-title-slip/);
  assert.ok(eyeAsset.length > 80_000 && eyeAsset[0] === 0xff && eyeAsset[1] === 0xd8);
  assert.match(eyeSource, /Liam Welch[\s\S]*?CC0 1\.0/);
});

test("makes the 1404 complaint and memory rewrite the final chapter", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /id: "workorder-1404"/);
  assert.match(page, /title: "1404 固定回访人员投诉工单"/);
  assert.match(page, /available: \(game\) => game\.colleagueSolved && game\.evidence\.includes\("churchFlow"\)/);
  assert.match(page, /查找周明川留下的离线同步记录[\s\S]*?核验恒目复训与账号变更记录[\s\S]*?处理1404重复回访投诉/);
  assert.match(page, /queuedArticle\("church-compliance", "恒目"[\s\S]*?queuedArticle\("workorder-1404", "1404"/);
  assert.match(page, /工单转派至被投诉的固定回访人员 CJ-0713/);
  assert.match(page, /id: "w04-directory"[\s\S]*?available: \(game\) => hasVisited\(game, "workorder-1404"\)/);
  const w04Directory = page.match(/id: "w04-directory"[\s\S]*?available: \(game\) => hasVisited\(game, "workorder-1404"\)/)?.[0] ?? "";
  assert.doesNotMatch(w04Directory, /账号建档时刻/);
  assert.match(page, /id: "identity-1404"[\s\S]*?available: \(game\) => hasUnlockedArticle\(game, "crash-cj0713"\) && hasUnlockedArticle\(game, "on-site-device"\),/);
  assert.match(page, /type MemoryRewriteStage = "none" \| "queued" \| "running" \| "resisted"/);
  assert.match(page, /restored\.homeSolved[\s\S]*?"workorder-1404"/);
  assert.match(page, /memoryRewriteStage: "running"/);
  assert.match(page, /const expected = \["crash", "ashes", "voice"\]/);
  assert.match(page, /memoryRewriteStage: "resisted"/);
  assert.match(page, /员工记忆一致性校正/);
  assert.match(page, /正在写入员工标准记忆/);
  assert.match(page, /用原始记录阻断覆盖写入/);
  assert.match(page, /事故协查回执中的紧急联系人房号/);
  assert.match(page, /className="memory-admin-table"><p><span>REL-1404<\/span><b>来源冲突 · 3/);
  assert.match(page, /className="rewrite-diff"><article><span>REL-1404<\/span><b>原始字段已隔离/);
  assert.doesNotMatch(page, /className="memory-admin-table"><p><span>1404 \/ 林若岚/);
  assert.doesNotMatch(page, /className="rewrite-diff"><article><span>住户关系<\/span><del>/);
  assert.doesNotMatch(page, /林若岚与当前员工关系<select/);
  assert.doesNotMatch(page, /1404封存物判断<select/);
  assert.match(page, /id: "clock-out"[\s\S]*?available: \(game\) => game\.homeSolved,/);
});

test("limits the dashboard queue to discovered receipts instead of revealing the evidence chain", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /function getPendingWorkItem\(game: GameState\): PendingWorkItem/);
  const queue = page.slice(page.indexOf("function getPendingWorkItem"), page.indexOf("const callbackRecords"));
  assert.match(queue, /hasVisited\(game, "vacancy-1204"\) && hasVisited\(game, "scheduled-service-1204"\)[\s\S]*?填写核验回执/);
  assert.match(queue, /: queuedArticle\("workorder-1204", "1204", \{[\s\S]*?action: "返回工单 →"[\s\S]*?direct: true/);
  assert.match(queue, /game\.inspectedArticles\.includes\("vacancy-1204"\)[\s\S]*?填写协查回执/);
  assert.ok(queue.indexOf("queuedArticle(\"register-child\"") < queue.indexOf("queuedArticle(\"cctv-1204\""));
  assert.match(queue, /eyebrow: "失联人员核对 · DL-0713-0041"/);
  assert.match(queue, /eyebrow: "录像保全 · DL-0713-0041"/);
  assert.match(queue, /kind: "search"[\s\S]*?title: "确认1304户主状态"[\s\S]*?query: "1304"/);
  assert.doesNotMatch(queue, /queuedArticle\("vacancy-1204"|queuedArticle\("meter-1304"|queuedArticle\("audio-1304"|queuedArticle\("alibi-liang"|queuedArticle\("resident-1304"|queuedArticle\("height-mark"|queuedArticle\("accident-xiaoman"|queuedArticle\("employee-sync"|queuedArticle\("w04-directory"|queuedArticle\("care-w04"/);
  assert.match(queue, /if \(!hasUnlockedArticle\(game, "w04-directory"\)\) \{[\s\S]*?queuedArticle\("workorder-1404", "1404"[\s\S]*?action: "返回工单 →"/);
  assert.match(queue, /if \(!hasUnlockedArticle\(game, "care-w04"\)\) \{\s*return null;/);
  assert.match(page, /if \(pendingWork\.direct \|\| game\.visited\.includes\(article\.id\)\)[\s\S]*?openArticle\(article\)[\s\S]*?searchFor\(pendingWork\.query \?\? article\.title\)/);
  assert.match(page, /暂无待填回执/);
  assert.match(page, /系统不会列出后续证据/);
  assert.match(page, /onClick=\{openPendingWork\}/);
});

test("stages the evidence ending as the protagonist leaving the building", async () => {
  const [page, css, lobby, outside] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/endings/01-lobby-farewell.png", import.meta.url)),
    readFile(new URL("../public/endings/02-outside-threshold.png", import.meta.url)),
  ]);

  assert.match(page, /const departureEndingScenes = \[/);
  assert.match(page, /\/endings\/01-lobby-farewell\.png/);
  assert.match(page, /\/endings\/02-outside-threshold\.png/);
  assert.match(page, /const \[endingStep, setEndingStep\] = useState\(0\)/);
  assert.match(page, /证据已经出去。<br\/>现在轮到你了。/);
  assert.match(page, /留下的灵魂却第一次越过了物业边界/);
  assert.match(page, /天亮以后，<br\/>CJ-0713没有回来/);
  assert.match(page, /setEndingStep\(\(current\) => current \+ 1\)/);
  assert.match(page, /结局 \/ 重新打卡/);
  assert.match(page, /const reconsiderEnding = \(\) =>/);
  assert.match(page, /ending: null, view: "article", activeArticle: "clock-out"/);
  assert.equal((page.match(/onClick=\{reconsiderEnding\}>重新选择结局/g) ?? []).length, 2);
  assert.equal((page.match(/>重新选择回复<\/button>/g) ?? []).length, 2);
  assert.match(page, /wifeReply: ""/);
  assert.match(page, /fatherReply: ""/);
  assert.match(css, /\.ending-choice-return/);
  assert.match(css, /\.ending-cinematic > img \{ object-fit: cover/);
  assert.match(css, /@keyframes ending-camera-drift/);
  assert.match(css, /\.ending-cinematic > img \{ object-fit: contain; object-position: center top/);
  assert.ok([lobby, outside].every((image) => image.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"));
});

test("stages the loop ending around the wife's repeated loss", async () => {
  const [page, css, doorway, sugarBox] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/endings/03-loop-first-visit.png", import.meta.url)),
    readFile(new URL("../public/endings/04-loop-sugar-box.png", import.meta.url)),
  ]);

  assert.match(page, /const loopEndingScenes = \[/);
  assert.match(page, /\/endings\/03-loop-first-visit\.png/);
  assert.match(page, /\/endings\/04-loop-sugar-box\.png/);
  assert.match(page, /关系字段已归零。<br\/>下一班次可以开始。/);
  assert.match(page, /今天第一次上门，请您配合身份核验/);
  assert.match(page, /她没有再纠正“第一次”/);
  assert.match(page, /把那盒他值夜班会吃的糖重新盖好/);
  assert.match(page, /第224次“首次接触”/);
  assert.match(page, /她终于不再等你想起来/);
  assert.match(page, /不是因为问题解决了，而是林若岚不再相信下一次会有所不同/);
  assert.match(css, /\.ending-performance--loop/);
  assert.match(css, /\.ending-performance--loop\.is-loop-epilogue/);
  assert.ok([doorway, sugarBox].every((image) => image.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"));
});

test("keeps chapter summaries factual and leaves supernatural attribution unresolved", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /引导者未核实/);
  assert.match(page, /账号为何仍能调用本机缓存，不属于工程与人事复核可以证明的范围/);
  assert.match(page, /系统无法据此判断当前操作者的生命状态或意识来源/);
  assert.match(page, /预生成处置记录/);
  assert.match(page, /任务模板与前三次1404投诉使用同一策略编号/);
  assert.match(page, /header data-chapter="01"/);
  assert.match(page, /header data-chapter="04"/);
  assert.match(css, /content: attr\(data-chapter\)/);
  assert.doesNotMatch(page, /真正引她回家的，是从1304出现的顾小满/);
  assert.doesNotMatch(page, /其灵体仍通过已注销的员工账号留下信息/);
  assert.doesNotMatch(page, /当前操作者已经死于车祸/);
});

test("locks the four 1404 records behind personal-memory passwords", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /type ProtectedArticleId = "w04-directory" \| "care-w04" \| "on-site-device" \| "crash-cj0713"/);
  assert.match(page, /id: "care-w04"[\s\S]*?lockedTerms: \["林若岚", "1404", "回访记录", "关怀冷备份"\]/);
  assert.match(page, /id: "on-site-device"[\s\S]*?terms: \["陈峻", "1404", "驻场设备"/);
  assert.match(page, /id: "on-site-device"[\s\S]*?lockedTerms: \["陈峻", "1404", "zc-lh", "特殊保管物", "封存物"\]/);
  assert.match(page, /password: "LINRUOLAN"/);
  assert.match(page, /password: "CHENJUN"/);
  assert.match(page, /const PROTAGONIST_NAME = "陈峻"/);
  assert.match(page, /const PROTAGONIST_ARCHIVE_REF = "DL-JJ-1104-27"/);
  assert.match(page, /id: "accident-report-cj0713"[\s\S]*?available: \(game\) => hasVisited\(game, "employee-cj0713-index"\)/);
  assert.match(page, /特殊档案编号<\/dt><dd>\{PROTAGONIST_ARCHIVE_REF\}/);
  assert.match(page, /死者为<strong>\{PROTAGONIST_NAME\}<\/strong>/);
  assert.match(page, /password: "1404"/);
  assert.match(page, /password: "IMISSYOU"/);
  assert.match(page, /报事人<\/dt><dd>林若岚 \/ 住户本人/);
  assert.match(page, /报事人姓名通过住户端实名校验：林若岚/);
  assert.match(page, /后台创建<\/dt><dd>2025-11-05 08:12/);
  assert.match(page, /搜索特殊档案编号，在公开事故报道中找到死者姓名/);
  assert.match(page, /旧库定位字段<\/th><td>仅接受四位原址房号/);
  assert.match(page, /id: 122[\s\S]*?visible: \(game\) => hasUnlockedArticle\(game, "on-site-device"\)[\s\S]*?text: "I MISS YOU\."/);
  assert.match(page, /articleId === "on-site-device"[\s\S]*?announceMessages\(\[122\]\)/);
  assert.match(page, /protectedArticlesUnlocked: Array\.from\(new Set/);
  assert.match(page, /surveillanceEyes: current\.surveillanceEyes \+ 1/);
  assert.match(page, /Array\.from\(\{ length: game\.surveillanceEyes \}\)/);
  assert.match(page, /口令不匹配/);
  assert.doesNotMatch(page, /passwordLockout|passwordLockedUntil|remainingPasswordAttempts/);
  assert.doesNotMatch(page, /T04240713|12213|260312081404|1105290713/);
  assert.match(styles, /\.protected-article-gate--4/);
  assert.match(styles, /\.surveillance-eye-field/);
  assert.match(styles, /\.surveillance-eye-field \.eye-mark[\s\S]*animation: watched-eye-blink/);
  assert.match(styles, /@keyframes watched-eye-blink/);
});

test("supports manual login to Zhou Mingchuan's optional local archive", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /type LoginMethod = "badge" \| "password"/);
  assert.match(page, /const MINGCHUAN_ACCOUNT: EmployeeAccount = "ZM-0602"/);
  assert.match(page, /const MINGCHUAN_PASSWORD = "hengmurecyclezm0602"/);
  assert.match(page, /第二段为摩斯码，解码后按显示顺序连续输入/);
  assert.match(page, /<span className="credential-company-clue">公司名 <EyeMark small \/><\/span><span>\.\-\. \. \-\.\-\. \-\.\-\- \-\.\-\. \.\-\.\. \.<\/span><span>该员工工号<\/span>/);
  assert.doesNotMatch(page, /房号—墙体缺失厚度—员工状态修改次数|1104-42-17/);
  assert.match(page, /game\.colleagueSolved && <section className="credential-recovery">/);
  assert.match(page, /警方破拆西墙空腔，发现周明川遗体/);
  assert.match(page, /DNA比对确认死者为失联员工周明川/);
  assert.match(page, /const \[employeeIdInput, setEmployeeIdInput\] = useState\(""\)/);
  assert.match(page, /const accountId = employeeIdInput\.trim\(\)\.toUpperCase\(\)/);
  assert.match(page, /员工工号<input value=\{employeeIdInput\}/);
  assert.doesNotMatch(page, /<option value=\{MINGCHUAN_ACCOUNT\}>/);
  assert.doesNotMatch(page, /accountAvailable/);
  assert.match(page, /if \(saved\.activeAccount !== MINGCHUAN_ACCOUNT\)/);
  assert.doesNotMatch(page, /!saved\.colleagueCredentialsRecovered \|\| saved\.activeAccount !== MINGCHUAN_ACCOUNT/);
  assert.match(page, /"你是谁？" : "我发现你了"/);
  assert.match(page, /Array\.from\(\{ length: 88 \}\)/);
  assert.match(page, /PRIVATE DIARY/);
  assert.match(page, /四篇日记/);
  assert.match(page, /第一个没有去向的人/);
  assert.match(page, /钱最后都去了同一个地方/);
  assert.match(page, /没有电的标签亮了/);
  assert.match(page, /如果明天我没有来/);
  assert.doesNotMatch(page, /title: "内部转移人员复核表"|title: "物业服务费异常流水"|title: "ZC-LH 标签观察笔记"|title: "恒目旧项目通讯残片"/);
});

test("keeps the Zhou Mingchuan breach playable when camera access is unavailable", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /type LegacyBreachStage = "none" \| "camera" \| "question"/);
  assert.match(page, /type LegacyCameraState = .*"fallback"/);
  assert.match(page, /navigator\.mediaDevices\.getUserMedia\(\{ video: \{ facingMode: "user" \}, audio: false \}\)/);
  assert.match(page, /const LEGACY_READING_GRACE_MS = 18000/);
  assert.match(page, /const LEGACY_CAMERA_PREVIEW_MS = 2200/);
  assert.match(page, /const LEGACY_CAMERA_REQUEST_TIMEOUT_MS = 8000/);
  assert.match(page, /legacyCameraPending: current\.legacyCameraPending \|\| completesEvidenceSet/);
  assert.match(page, /const mustResumeLegacyCamera = Boolean\(saved\?\.legacyCameraPending/);
  assert.match(page, /writeAppRoute\("\/system\/legacy", true\)/);
  assert.match(page, /const legacyCameraRequired = game\.activeAccount === MINGCHUAN_ACCOUNT/);
  assert.match(page, /本机身份校验/);
  assert.match(page, /未检测到活体/);
  assert.match(page, /无可用画面时将继续执行离线校验/);
  assert.match(page, /const continueLegacyWithoutCamera/);
  assert.match(page, /无画面校验/);
  assert.match(page, /Camera request timed out/);
  assert.match(page, /track\.stop\(\)/);
  assert.match(page, /setLegacyBreachStage\("question"\)/);
  assert.doesNotMatch(page, /completeLegacyCameraCheck/);
});

test("leaves only emerging red eyes after Zhou Mingchuan's account collapses", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /legacyAccountCollapsed: false/);
  assert.match(page, /legacyAccountCollapsed: true/);
  assert.match(page, /game\.legacyAccountCollapsed && legacyBreachStage === "none"/);
  assert.match(page, /Array\.from\(\{ length: 108 \}\)/);
  assert.match(page, /className="legacy-return-escape"/);
  assert.match(page, /onClick=\{disconnectLegacyAccount\}>快逃<\/button>/);
  assert.match(page, /断开周明川账号并返回登录/);
  assert.match(css, /\.legacy-return-eyes/);
  assert.match(css, /\.legacy-return-escape button/);
  assert.match(css, /@keyframes legacy-escape-arrive/);
  assert.match(css, /@keyframes return-eye-emerge/);
});

test("renders Zhou Mingchuan's live account as a dark disabled admin console", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /archive-app legacy-console/);
  assert.match(page, /<header className="archive-header">/);
  assert.match(page, /<div className="archive-layout">/);
  assert.match(page, /<nav aria-label="已停用的系统导航"><button disabled>调查首页/);
  assert.match(page, /className="legacy-evidence-grid"/);
  assert.match(page, /onClick=\{\(\) => openLegacyFile\(file\.id\)\}/);
  assert.match(css, /\.legacy-console \{ --ink:/);
  assert.match(css, /\.legacy-evidence-grid > button/);
});
