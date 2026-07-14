"use client";

import Image from "next/image";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type View = "home" | "search" | "article" | "denied" | "callbacks" | "ending" | "legacy";
type Ending = "expose" | "loop" | null;
type EntryStage = "dream" | "wake" | "login";
type EmployeeAccount = "CJ-0713" | "ZM-0602";
type LoginMethod = "badge" | "password";
type AudioTrackKey = "pipe" | "tv" | "bath" | "child";
type LegacyBreachStage = "none" | "camera" | "question" | "found" | "eyes";
type LegacyCameraState = "idle" | "requesting" | "active" | "error" | "fallback";
type MemoryRewriteStage = "none" | "queued" | "running" | "resisted";
type ProtectedArticleId = "w04-directory" | "care-w04" | "on-site-device" | "crash-cj0713";
type AppRoute =
  | { kind: "entry"; stage: EntryStage }
  | { kind: "view"; view: "home" }
  | { kind: "view"; view: "search"; query: string }
  | { kind: "view"; view: "article" | "denied"; articleId: string }
  | { kind: "view"; view: "callbacks"; callbackId: string | null }
  | { kind: "view"; view: "legacy"; fileId: string | null }
  | { kind: "view"; view: "ending"; ending: Exclude<Ending, null> };

type GameState = {
  started: boolean;
  view: View;
  activeArticle: string | null;
  activeCallback: string | null;
  lastQuery: string;
  searchHistory: string[];
  visited: string[];
  inspectedArticles: string[];
  evidence: string[];
  wifeRead: number[];
  wifeReply: string;
  childMissingReported: boolean;
  missingChildReply: string;
  nightFrames: string[];
  mutedTracks: string[];
  route: string[];
  surveillanceSolved: boolean;
  audioSolved: boolean;
  childRegistered: boolean;
  childSaved: boolean;
  fatherConfirmedDead: boolean;
  fatherResolved: boolean;
  fatherReply: string;
  fatherClosure: string;
  colleagueAccess: boolean;
  colleagueSolved: boolean;
  colleagueCredentialsRecovered: boolean;
  activeAccount: EmployeeAccount;
  legacyRead: string[];
  legacyBreachSeen: boolean;
  legacyAccountCollapsed: boolean;
  legacyCameraPending: boolean;
  callbackRead: string[];
  cs046Solved: boolean;
  protectedArticlesUnlocked: ProtectedArticleId[];
  surveillanceEyes: number;
  memoryRewriteStage: MemoryRewriteStage;
  homeSolved: boolean;
  ending: Ending;
};

type ArticleMeta = {
  id: string;
  title: string;
  section: string;
  date: string;
  snippet: string;
  terms: string[];
  lockedTerms?: string[];
  kind?: "record" | "media" | "restricted" | "noise";
  available: (game: GameState) => boolean;
};

type BoardMessage = {
  id: number;
  sequence: number;
  author: string;
  unit: string;
  badge: string;
  time: string;
  text: string;
  tone?: "resident" | "warning" | "system";
  visible: (game: GameState) => boolean;
};

type CallbackRecord = {
  id: string;
  code: string;
  title: string;
  related: string;
  time: string;
  duration: string;
  available: (game: GameState) => boolean;
  lines: Array<{ at: string; speaker: string; text: string; flagged?: boolean }>;
  note: string;
};

type RescueRouteScene = {
  place: string;
  time: string;
  signal: string;
  image: string;
  alt: string;
  observation: string;
  review: string;
  supportsRoute: boolean;
};

const SAVE_KEY = "chengjiang-search-arg-v1";
const WIFE_NAME = "林若岚";
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const assetPath = (path: string) => `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
const loginBackgroundStyle = { "--login-background-image": `url("${assetPath("/cctv/cam-2358.png")}")` } as CSSProperties;
const deniedBackgroundStyle = { "--denied-background-image": `url("${assetPath("/backgrounds/access-denied-corridor.png")}")` } as CSSProperties;
const MINGCHUAN_ACCOUNT: EmployeeAccount = "ZM-0602";
const MINGCHUAN_PASSWORD = "1104-42-17";
const LEGACY_READING_GRACE_MS = 18000;
const LEGACY_CAMERA_PREVIEW_MS = 2200;
const LEGACY_CAMERA_FALLBACK_MS = 1600;
const LEGACY_CAMERA_REQUEST_TIMEOUT_MS = 8000;
const PROTECTED_ARTICLE_IDS: ProtectedArticleId[] = ["w04-directory", "care-w04", "on-site-device", "crash-cj0713"];
const protectedArticleGates: Record<ProtectedArticleId, { password: string; code: string; title: string; source: string; hint: string }> = {
  "w04-directory": {
    password: "T040713",
    code: "RESIDENT INDEX / TERMINAL KEY",
    title: "旧版住户索引需要终端派生口令",
    source: "可检索线索：员工账号 CJ-0713 基础索引",
    hint: "旧客户端丢弃身份字母前缀，只保留终端区域码与员工数字段；连接符不参与校验。",
  },
  "care-w04": {
    password: "32213",
    code: "CARE ARCHIVE / MIRROR SEQUENCE",
    title: "冷备份回访记录需要旧序列口令",
    source: "可检索线索：1404住户关怀索引 + 员工账号基础索引",
    hint: "把索引中的“本年度首次接触次数”从右向左读取，再追加当前岗位短号。",
  },
  "on-site-device": {
    password: "ZCLH1404",
    code: "ASSET VAULT / DERIVED LOOKUP KEY",
    title: "特殊保管物字段已与当前账号隔离",
    source: "可检索线索：特殊保管物 ZC-LH 编码说明 + 1404回访记录",
    hint: "旧资产库以分类码和原址房号拼接查询键，网关会删除分类码中的标点。",
  },
  "crash-cj0713": {
    password: "11050713",
    code: "CROSS-SYSTEM AUDIT / EXTERNAL RECEIPT",
    title: "事故协查接口正在核对当前操作者",
    source: "可检索线索：1404特殊保管物登记 + 员工账号 CJ-0713 基础索引",
    hint: "依次连接最近一份外部凭证和当前员工账号中的数字段；字母与连接符不会传入协查网关。",
  },
};

const memoryScenes = [
  {
    src: "/memories/kitchen-evening.png",
    alt: "一对夫妻在厨房准备晚饭",
    title: "人总以为，明天会照常到来。",
    copy: "一顿晚饭，一件洗好的衬衣，一场没有下完的雨。",
  },
  {
    src: "/memories/rainy-morning.png",
    alt: "一对夫妻在雨天的公交站等车",
    title: "生命其实轻得没有声音。",
    copy: "一次偏离，一秒失神，就足以让一个名字从日常里消失。",
  },
  {
    src: "/memories/weekend-laundry.png",
    alt: "一对夫妻在家中一起整理衣物",
    title: "可我为什么还记得这些？",
    copy: "那是我的手，还是某个已经死去的人借给我的记忆？",
  },
] as const;

const departureEndingScenes = [
  {
    src: "/endings/01-lobby-farewell.png",
    alt: "主角从老旧住宅楼门厅走向出口，林若岚坐在门内目送他",
    time: "00:09:58 / 一层门厅",
    title: "门第一次没有要求你刷卡。",
    copy: "你的脚步经过门禁，读卡器没有亮。玻璃里的倒影比你慢了半拍，像这栋楼终于来不及再把你登记成一个在岗员工。",
    quote: "“别回头。回头就又是明天。”",
    action: "走出大门",
  },
  {
    src: "/endings/02-outside-threshold.png",
    alt: "主角的灵魂走出住宅楼，林若岚留在玻璃门后向他告别",
    time: "00:10:00 / 物业边界之外",
    title: "这一次，没有离场记录。",
    copy: "你的身体早已不在，留下的灵魂却第一次越过了物业边界。身后的终端失去连接，工牌、岗位和每天清晨的首次登录都没有追上来。",
    quote: "门内有人抬起手。你知道她终于不需要再等一次。",
    action: "继续向前",
  },
] as const;

const loopEndingScenes = [
  {
    src: "/endings/03-loop-first-visit.png",
    alt: "失去记忆的主角以物业管理员身份站在1404门外，轮椅上的林若岚认出他",
    time: "08:41 / 1404门口",
    title: "他准时来了。像第一次一样。",
    copy: "门铃响起时，桌上还放着两只杯子。CJ-0713站在门外，工牌端正，夹板上的表格从“住户身份核验”开始。他看见她的轮椅，也看见她，却没有认出任何一个等待过他的清晨。",
    quote: "“林女士您好，我是物业管理员CJ-0713。今天第一次上门，请您配合身份核验。”",
    action: "继续本次回访",
  },
  {
    src: "/endings/04-loop-sugar-box.png",
    alt: "林若岚独自坐在1404餐桌旁收起为丈夫准备的糖盒",
    time: "08:46 / 1404餐桌",
    title: "她没有再纠正“第一次”。",
    copy: "她在服务单上写下自己的名字，没有再补充“妻子”，也没有再问他是否记得。门关上以后，她把第二只杯子里的水倒掉，把那盒他值夜班会吃的糖重新盖好。",
    quote: "“谢谢你来。”",
    action: "归档回访记录",
  },
] as const;

const legacyFiles = [
  {
    id: "transfer-list",
    code: "ZM-EVID-01",
    title: "内部转移人员复核表",
    summary: "过去三年共有17名员工被改写为外派、离职或失联，实际离场记录均为空。",
    paragraphs: [
      "周明川将人事库、门禁、派车单和施工采购记录逐项比对：17份“内部转移”均缺少目的地、接收部门、交通安排或本人签字。",
      "这些员工在状态变更前都触发过恒目数据合规复核；其中6人的最后门禁位置集中在后续封闭施工的房屋附近。",
    ],
  },
  {
    id: "property-ledger",
    code: "ZM-EVID-02",
    title: "物业服务费异常流水",
    summary: "澄江物业长期将住户服务费拆分汇入恒目文化基金和无登记的设备维护项目。",
    paragraphs: [
      "“特殊保管服务”“终端校准”和“数据过滤”三个科目没有对应供应商验收单，收款方最终均归集至恒目关联文化基金。",
      "审批附件没有负责人姓名，只有同一个单眼图形电子章；财务系统无法校验该印章对应的企业证书。",
    ],
  },
  {
    id: "device-notes",
    code: "ZM-EVID-03",
    title: "ZC-LH 标签观察笔记",
    summary: "部分无供电保管物标签会在外部终端打卡后生成临时在线记录，现有设备文档无法解释。",
    paragraphs: [
      "周明川记录到，异常会话集中在00:04至00:10，且关联标签多为骨灰盒或遗物箱。标签本身没有芯片、电源或网络模块。",
      "终端离线后，本机检索历史会被“过滤”任务清空，次日任务队列重新生成；员工无法从常规界面判断同一工单是否已重复处理。",
    ],
  },
  {
    id: "church-fragment",
    code: "ZM-EVID-04",
    title: "恒目旧项目通讯残片",
    summary: "残缺邮件提到物业、殡葬寄存与长期观察项目，但发件组织和项目主体均未备案。",
    paragraphs: [
      "邮件反复使用“观察者”“回返窗口”和“记忆一致性”等非物业术语，并要求项目点优先接收意外死亡者家属的特殊保管委托。",
      "发件人、项目地址和附件均被删除。周明川在打印件边缘写下：先别相信这些词的解释，去看账号每天被清掉了什么。",
    ],
  },
] as const;

const initialGame: GameState = {
  started: false,
  view: "home",
  activeArticle: null,
  activeCallback: null,
  lastQuery: "",
  searchHistory: [],
  visited: [],
  inspectedArticles: [],
  evidence: [],
  wifeRead: [],
  wifeReply: "",
  childMissingReported: false,
  missingChildReply: "",
  nightFrames: [],
  mutedTracks: [],
  route: [],
  surveillanceSolved: false,
  audioSolved: false,
  childRegistered: false,
  childSaved: false,
  fatherConfirmedDead: false,
  fatherResolved: false,
  fatherReply: "",
  fatherClosure: "",
  colleagueAccess: false,
  colleagueSolved: false,
  colleagueCredentialsRecovered: false,
  activeAccount: "CJ-0713",
  legacyRead: [],
  legacyBreachSeen: false,
  legacyAccountCollapsed: false,
  legacyCameraPending: false,
  callbackRead: [],
  cs046Solved: false,
  protectedArticlesUnlocked: [],
  surveillanceEyes: 0,
  memoryRewriteStage: "none",
  homeSolved: false,
  ending: null,
};

const parseAppRoute = (hash: string): AppRoute => {
  const segments = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (segments[0] === "wake") return { kind: "entry", stage: "wake" };
  if (segments[0] === "login") return { kind: "entry", stage: "login" };
  if (segments[0] !== "system") return { kind: "entry", stage: "dream" };
  if (segments[1] === "search") {
    const encodedQuery = segments.slice(2).join("/");
    try {
      return { kind: "view", view: "search", query: decodeURIComponent(encodedQuery) };
    } catch {
      return { kind: "view", view: "search", query: "" };
    }
  }
  if ((segments[1] === "article" || segments[1] === "denied") && segments[2]) {
    return { kind: "view", view: segments[1], articleId: segments[2] };
  }
  if (segments[1] === "callbacks") return { kind: "view", view: "callbacks", callbackId: segments[2] ?? null };
  if (segments[1] === "legacy") return { kind: "view", view: "legacy", fileId: segments[2] ?? null };
  if (segments[1] === "ending" && (segments[2] === "expose" || segments[2] === "loop")) {
    return { kind: "view", view: "ending", ending: segments[2] };
  }
  return { kind: "view", view: "home" };
};

const routeForGame = (game: GameState) => {
  if (game.view === "search") return `/system/search/${encodeURIComponent(game.lastQuery)}`;
  if ((game.view === "article" || game.view === "denied") && game.activeArticle) return `/system/${game.view}/${game.activeArticle}`;
  if (game.view === "callbacks") return `/system/callbacks${game.activeCallback ? `/${game.activeCallback}` : ""}`;
  if (game.view === "legacy") return "/system/legacy";
  if (game.view === "ending" && game.ending) return `/system/ending/${game.ending}`;
  return "/system/home";
};

const writeAppRoute = (route: string, replace = false) => {
  const nextHash = `#${route}`;
  if (window.location.hash === nextHash) return;
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history[replace ? "replaceState" : "pushState"](null, "", nextUrl);
};

const readSavedGame = (): GameState | null => {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return null;
  try {
    const restored = JSON.parse(saved) as Partial<GameState>;
    return {
      ...initialGame,
      ...restored,
      visited: restored.homeSolved
        ? Array.from(new Set([...(restored.visited ?? []), "workorder-1404"]))
        : restored.visited ?? [],
      protectedArticlesUnlocked: restored.protectedArticlesUnlocked
        ?? PROTECTED_ARTICLE_IDS.filter((id) => restored.visited?.includes(id)),
      inspectedArticles: restored.inspectedArticles
        ?? Object.entries(articleEvidence)
          .filter(([, evidence]) => evidence.some((item) => restored.evidence?.includes(item)))
          .map(([articleId]) => articleId),
      surveillanceEyes: restored.surveillanceEyes ?? 0,
      fatherConfirmedDead: restored.fatherConfirmedDead ?? restored.fatherResolved ?? false,
      legacyCameraPending: restored.legacyCameraPending ?? ((restored.legacyRead?.length ?? 0) === legacyFiles.length && !restored.legacyBreachSeen && !restored.legacyAccountCollapsed),
      memoryRewriteStage: restored.memoryRewriteStage ?? (restored.homeSolved ? "resisted" : "none"),
      started: true,
    };
  } catch {
    return null;
  }
};

const always = () => true;
const hasVisited = (game: GameState, id: string) => game.visited.includes(id);
const isProtectedArticle = (id: string): id is ProtectedArticleId => PROTECTED_ARTICLE_IDS.includes(id as ProtectedArticleId);
const hasUnlockedArticle = (game: GameState, id: ProtectedArticleId) => game.protectedArticlesUnlocked.includes(id);
const normalizeAccessCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const articles: ArticleMeta[] = [
  {
    id: "workorder-1204",
    title: "1204 夜间滴水投诉复核",
    section: "客服工单",
    date: "2026-07-13",
    snippet: "投诉人称楼上每晚出现六分钟滴水声，但1304近24小时用水量为零。",
    terms: ["1204", "1304", "滴水", "投诉", "六分钟", "00:04", "00:10", "w-0713-019", "许先生", "报事人", "身份核验", "楼上到底有没有人住", "实际居住"],
    available: always,
  },
  {
    id: "vacancy-1204",
    title: "1204 长期空置房巡检记录",
    section: "房屋台账",
    date: "2026-07-09",
    snippet: "产权登记人无法联系，定时入户服务已停费；近期门禁与生活用电却持续出现。",
    terms: ["1204", "空置房", "产权人", "陈大国", "4417", "公开信息", "经侦通报", "保洁", "定时服务", "门禁", "续费停止", "停了续费", "2026-04-03", "儿童床品", "童鞋"],
    available: always,
  },
  {
    id: "scheduled-service-1204",
    title: "1号楼第二季度定时入户服务排班",
    section: "客户服务",
    date: "2026-04-06",
    snippet: "季度排班汇总包含保洁、代收、绿植养护等定时入户服务；已终止项目与实际门禁需要另行核对。",
    terms: ["1204", "定时服务", "定时入户服务", "服务排班", "履约排班", "保洁", "服务授权", "每月两次", "许建国", "赵秀兰", "2026-03-31", "2026-04-03"],
    available: (game) => hasVisited(game, "vacancy-1204"),
  },
  {
    id: "owner-chen-public-notice",
    title: "东临晚报经济与法治版公开信息收录",
    section: "公共信息收录",
    date: "2024-11-18",
    snippet: "地方媒体转载一则经济犯罪协查通报，报道对象的身份信息需与内部产权档案交叉核对。",
    terms: ["陈大国", "陈某国", "经侦通报", "畏罪潜逃", "在逃人员", "和裕供应链", "经济犯罪", "产权人", "1204", "4417", "公开信息"],
    available: (game) => hasVisited(game, "vacancy-1204"),
  },
  {
    id: "meter-1304",
    title: "1204 卧室顶面渗漏排查记录",
    section: "工程运维",
    date: "2026-07-12",
    snippet: "1204卧室顶面未见水迹，1304远传水表读数无变化；固定时段的异常声响仍待复核。",
    terms: ["1204", "1304", "渗漏排查", "水表", "湿度", "滴水", "声纹", "声纹分轨", "00:04", "六分钟", "零用水", "浴室反射"],
    available: always,
  },
  {
    id: "cctv-1204",
    title: "12层公共区域事件回放复核",
    section: "安防中心",
    date: "2026-07-13",
    snippet: "系统将五段事件触发录像串联为回放，门禁、消防门磁、画面序列与校验日志需要人工交叉复核。",
    terms: ["00:04", "00:07", "00:10", "00:12", "监控", "事件回放", "湿脚印", "地面", "消防楼梯", "cam-12f-02", "门禁匹配", "门磁", "丢帧", "序列号"],
    kind: "media",
    available: (game) => hasVisited(game, "workorder-1204"),
  },
  {
    id: "audio-1304",
    title: "1304 夜间声纹分轨报告",
    section: "安防中心",
    date: "2026-07-13",
    snippet: "四条同步声轨分别包含金属嗡鸣、电视新闻播报、规律滴水与孩童哼唱，需要排除背景串音后定位近场声源。",
    terms: ["1304", "声纹", "声学", "滴水", "浴缸", "浴缸滴水", "儿童哼唱", "管道共振", "邻户电视", "六分钟"],
    kind: "media",
    available: (game) => hasVisited(game, "meter-1304"),
  },
  {
    id: "clinic-child",
    title: "拾获童鞋健康信息卡",
    section: "失物招领",
    date: "2026-07-06",
    snippet: "1204门外童鞋内发现儿童健康卡，姓名许芷遥，系统内无对应住户。",
    terms: ["童鞋", "未登记儿童", "许芷遥", "2020-04-12", "2026-04-03", "健康信息卡", "1204", "失物招领"],
    available: (game) => game.childMissingReported && game.evidence.includes("vacancyMismatch"),
  },
  {
    id: "register-child",
    title: "未成年人紧急协查登记",
    section: "应急协查",
    date: "2026-07-13",
    snippet: "接警后按回执编号建立临时协查对象，用于公共区域录像调阅、现场辨认和移交；该记录不改变住户身份。",
    terms: ["DL-0713-0041", "接警回执", "报警回执", "未登记儿童", "许芷遥", "许建国", "赵秀兰", "父亲", "母亲", "监护人", "协查", "最后确认日期", "1204"],
    kind: "record",
    available: (game) => game.childMissingReported && game.evidence.includes("vacancyMismatch"),
  },
  {
    id: "rescue-route",
    title: "失联儿童现场搜索路线",
    section: "安防中心",
    date: "2026-07-13",
    snippet: "根据最后目击点、公共区域录像、消防门磁和儿童手环网关记录，生成现场人员的五点搜索顺序。",
    terms: ["消防楼梯", "许芷遥", "失联儿童", "湿脚印", "衣服全湿", "湿衣小姑娘", "搜索路线", "1204儿童房", "13层前室", "1304门外"],
    kind: "media",
    available: (game) => game.surveillanceSolved && game.childRegistered,
  },
  {
    id: "resident-1304",
    title: "1304 住户顾长河重点回访记录",
    section: "住户关怀",
    date: "2026-06-28",
    snippet: "重点回访中反复出现非登记家庭成员、夜间入户和门锁记录不一致，需要核对历史事故附件。",
    terms: ["1304", "顾长河", "酗酒", "前妻", "梁静宜", "穿门", "住户关怀"],
    available: always,
  },
  {
    id: "height-mark",
    title: "1304 墙面修补前影像记录",
    section: "工程运维",
    date: "2021-08-19",
    snippet: "墙面修补影像保留多处儿童身高刻度，文字内容未录入住户成员档案。",
    terms: ["1304", "小满", "顾小满", "五岁", "身高刻度", "浴室", "墙面"],
    available: (game) => hasVisited(game, "resident-1304"),
  },
  {
    id: "accident-xiaoman",
    title: "1304 浴室救援及房屋修复归档",
    section: "历史事故",
    date: "2021-08-21",
    snippet: "2021年浴室救援后形成的物业留档；维修记录、110联动单与邻里噪声投诉存在时间交叉。",
    terms: ["顾小满", "小满", "小姑娘", "爸爸", "浴缸", "溺水", "顾长河", "家暴", "男人骂孩子", "2021-08-19"],
    kind: "restricted",
    available: (game) => hasVisited(game, "height-mark") || game.childSaved,
  },
  {
    id: "alibi-liang",
    title: "梁静宜异地行程与1304门禁核验",
    section: "历史事故",
    date: "2023-02-11",
    snippet: "警方协查日期内，梁静宜位于外省康复机构；门禁、交通与代缴记录能够互相印证。",
    terms: ["梁静宜", "前妻", "顾长河", "死亡", "康复", "不在场", "酒精中毒"],
    available: (game) => hasVisited(game, "resident-1304"),
  },
  {
    id: "case-correction",
    title: "1304 账号主体状态异常复核",
    section: "住户核验",
    date: "2026-07-13",
    snippet: "公安协查回函、门禁停用日期与仍在活跃的住户账号存在冲突，需要确认账号主体及处置方式。",
    terms: ["顾小满", "顾长河", "梁静宜", "死亡状态", "生命体征", "酒精中毒", "实体住户", "公安协查回函", "账号主体", "住户账号", "留言令牌", "账号冒用"],
    kind: "restricted",
    available: (game) => game.childSaved && game.audioSolved && hasVisited(game, "accident-xiaoman") && hasVisited(game, "alibi-liang"),
  },
  {
    id: "resident-separation-guide",
    title: "历史家庭成员拆分与销户操作指引",
    section: "住户关怀",
    date: "2024-04-04",
    snippet: "历史成员注销后，家庭关系、未结工单与代办事项必须分别核验，不得沿用原家庭标签。",
    terms: ["思念", "原谅", "宽恕", "执念", "未完成心愿", "未结事项", "知晓自己", "退房", "长期住户"],
    kind: "restricted",
    available: (game) => game.childSaved,
  },
  {
    id: "employee-sync",
    title: "失联员工周明川手机同步摘要",
    section: "内部协作",
    date: "2026-06-05",
    snippet: "失联前同步包保留一段离线便笺和一组未归档数字，来源设备已停止联网。",
    terms: ["周明川", "失联员工", "1104", "11·04·2713", "共享密码", "手机同步", "公开留言", "留言被删"],
    kind: "restricted",
    available: (game) => game.fatherResolved,
  },
  {
    id: "room-1104",
    title: "1104 非标准墙体与内部转移单",
    section: "内部协作",
    date: "2026-06-02",
    snippet: "竣工图、现场复测和环境检测之间存在无法由普通维修解释的差异。",
    terms: ["1104", "周明川", "42厘米", "西墙", "墙体", "内部转移", "灭口", "生物降解", "2713", "TVOC", "氨类", "环境检测", "公安破拆", "调岗单"],
    kind: "restricted",
    available: (game) => game.fatherResolved,
  },
  {
    id: "symbol-eye-record",
    title: "单眼标记图形备案相似项核验",
    section: "品牌资产中心",
    date: "2026-07-13",
    snippet: "物业资产中的单眼图形出现早于当前备案主体，授权来源字段缺失。",
    terms: ["眼白向下的单眼标记", "眼白向下", "单眼标记", "单眼", "眼睛", "图形备案", "恒目", "全知", "全知教会", "不要深究", "监督之眼"],
    kind: "restricted",
    available: always,
  },
  {
    id: "vendor-hengmu-index",
    title: "恒目管理顾问供应商备案",
    section: "供应商中心",
    date: "2020-01-04",
    snippet: "供应商合同、验收附件和付款科目存在多处缺页，服务范围需要交叉核验。",
    terms: ["恒目", "全知", "全知教会", "眼睛", "眼白向下", "供应商", "管理顾问", "一致性", "物业服务费", "资金来源", "删除过去", "普通人类组织", "数据合规", "员工复训", "特殊保管物"],
    kind: "restricted",
    available: always,
  },
  {
    id: "church-compliance",
    title: "恒目管理顾问合规培训节选",
    section: "合规中心",
    date: "2025-11-03",
    snippet: "供应商培训附件与员工账号变更记录存在时间重合，部分签到及验收页缺失。",
    terms: ["恒目", "全知", "眼睛", "教会", "合规", "过滤器", "记忆清除", "驻场设备", "数据过滤", "一致性复训", "终端重置", "DLP"],
    kind: "restricted",
    available: (game) => game.colleagueSolved,
  },
  {
    id: "workorder-1404",
    title: "1404 固定回访人员投诉工单",
    section: "客服工单",
    date: "2026-07-13",
    snippet: "1404住户投诉物业反复安排同一名员工上门，却每次均按首次接触登记。",
    terms: ["1404", "林若岚", "投诉", "固定回访", "首次接触", "重复上门", "不要再让他明天重新来一次", "w-0713-1404", "cj-0713", "丈夫", "封存物"],
    kind: "restricted",
    available: (game) => game.colleagueSolved && game.evidence.includes("churchFlow"),
  },
  {
    id: "w04-directory",
    title: "1404行动不便住户关怀索引",
    section: "住户索引",
    date: "2026-07-13",
    snippet: "同一住户索引累计出现大量‘首次接触’，接收员工字段始终未变。",
    terms: ["林若岚", "w-04", "w04", "重点关怀", "轮椅", "见过", "很多次", "我记得", "每天回来", "亡夫", "1404", "首次接触", "223", "固定接收员工"],
    lockedTerms: ["1404", "w04", "住户索引", "关怀索引"],
    kind: "restricted",
    available: (game) => hasVisited(game, "workorder-1404"),
  },
  {
    id: "care-w04",
    title: "1404住户重点回访记录",
    section: "住户关怀",
    date: "2026-07-13",
    snippet: "三次历史回访正文包含重复的生活细节，但前台只保留了标准关怀结论。",
    terms: ["1404", "林若岚", "w-04", "轮椅", "亡夫", "重点关怀", "妻子", "每天回来"],
    lockedTerms: ["1404", "回访记录", "关怀冷备份"],
    available: (game) => hasUnlockedArticle(game, "w04-directory"),
  },
  {
    id: "night-shift-sugar",
    title: "夜班员工低血糖应急领取记录",
    section: "员工健康",
    date: "2026-07-11",
    snippet: "CJ-0713长期领取葡萄糖片与硬糖；林若岚曾连续多次代为签收。",
    terms: ["糖", "胃不好", "值夜班", "低血糖", "葡萄糖", "硬糖", "林若岚", "cj-0713", "w-04"],
    kind: "restricted",
    available: (game) => hasUnlockedArticle(game, "care-w04"),
  },
  {
    id: "device-type-index",
    title: "特殊保管物 ZC-LH 编码说明",
    section: "资产索引",
    date: "2022-12-04",
    snippet: "用于登记住户自有封存物；物品不得由物业擅自启封，标签可与外部身份终端关联。",
    terms: ["驻场设备", "设备", "设备同步", "外部打卡终端", "无功耗", "空置房", "资产类型", "校准", "zc-lh", "非授权感知", "移出条件", "知情状态", "未结事项", "设备不是设备", "特殊保管物", "封存物", "住户自有"],
    kind: "restricted",
    available: always,
  },
  {
    id: "on-site-device",
    title: "1404 特殊保管物登记",
    section: "资产管理",
    date: "2025-11-05",
    snippet: "封存物外观、转出凭证和物业标签之间存在字段冲突，需核对原始附件。",
    terms: ["1404", "驻场设备", "cj-0713", "设备", "保管人", "无功耗", "骨灰", "特殊保管物", "殡仪馆", "寄存转出单", "封存物"],
    lockedTerms: ["1404", "zc-lh", "特殊保管物", "封存物"],
    kind: "restricted",
    available: (game) => hasUnlockedArticle(game, "care-w04"),
  },
  {
    id: "employee-cj0713-index",
    title: "员工账号 CJ-0713 基础索引",
    section: "员工目录",
    date: "2026-07-13",
    snippet: "账号状态与考勤记录形成无法闭合的日循环，实名附件需要人工复核。",
    terms: ["cj-0713", "cj0713", "当前员工", "员工账号", "空置房管理员", "刷卡", "下班", "有效下班", "在岗", "2025-11-05", "紧急联系人", "连接中断", "员工仍在楼内", "从未下班"],
    kind: "restricted",
    available: always,
  },
  {
    id: "crash-cj0713",
    title: "CJ-0713 账号来源与同名主体复核",
    section: "内部审计",
    date: "2025-11-05",
    snippet: "外部事故回执与员工账号的创建时间、身份校验字段存在冲突。",
    terms: ["cj-0713", "2025-11-04", "车祸", "员工死亡", "账号创建", "1404", "幸存者", "事故协查", "同名主体", "劳动合同", "实名底档"],
    lockedTerms: ["cj-0713", "事故协查", "账号审计"],
    kind: "restricted",
    available: (game) => hasUnlockedArticle(game, "on-site-device"),
  },
  {
    id: "identity-1404",
    title: "1404 住户关系人工校验",
    section: "内部审计",
    date: "2026-07-13",
    snippet: "三个外部来源返回同一校验冲突，系统要求操作员只录入可复核字段。",
    terms: ["1404", "林若岚", "w-04", "cj-0713", "住户关系", "妻子", "死亡", "骨灰"],
    kind: "restricted",
    available: (game) => hasUnlockedArticle(game, "crash-cj0713") && hasUnlockedArticle(game, "on-site-device"),
  },
  {
    id: "clock-out",
    title: "CJ-0713 下班与退房权限",
    section: "系统管理",
    date: "2026-07-13",
    snippet: "当前员工已满足身份知情条件。请选择保留秘密或提交全部证据。",
    terms: ["下班", "退房", "结束调查", "cj-0713", "曝光", "重新打卡", "告别"],
    kind: "restricted",
    available: (game) => game.homeSolved,
  },
  {
    id: "noise-elevator",
    title: "2号电梯00:04自动重启说明",
    section: "工程运维",
    date: "2026-07-10",
    snippet: "固件维护造成短时楼层显示丢失，与住户投诉无直接关联。",
    terms: ["00:04", "电梯", "重启", "异常时间", "楼层显示"],
    kind: "noise",
    available: always,
  },
  {
    id: "noise-pipe",
    title: "1203空调冷凝水投诉处理",
    section: "客服工单",
    date: "2026-07-08",
    snippet: "住户误将空调冷凝水判断为楼上漏水，已完成排水管更换。",
    terms: ["滴水", "漏水", "投诉", "1203", "冷凝水", "楼上"],
    kind: "noise",
    available: always,
  },
  {
    id: "noise-cat",
    title: "13层流浪猫夜间活动记录",
    section: "秩序管理",
    date: "2026-07-02",
    snippet: "1303住户投喂流浪猫，脚印曾被误认为儿童进入消防楼梯。",
    terms: ["13层", "脚印", "消防楼梯", "儿童", "流浪猫", "1303"],
    kind: "noise",
    available: always,
  },
  {
    id: "noise-alcohol",
    title: "1302深夜酒瓶坠落纠纷",
    section: "秩序管理",
    date: "2026-06-30",
    snippet: "邻里争执涉及酗酒丈夫与分居妻子，双方均无人员伤亡。",
    terms: ["酗酒", "丈夫", "妻子", "酒瓶", "摔酒瓶", "男人骂孩子", "纠纷", "1302"],
    kind: "noise",
    available: always,
  },
];

const callbackRecords: CallbackRecord[] = [
  {
    id: "1204-first-return",
    code: "CALL-W0713-019-R1",
    title: "1204异常噪声首次回访",
    related: "关联工单 W-0713-019",
    time: "2026-07-09 08:52",
    duration: "02:41",
    available: (game) => game.visited.includes("workorder-1204"),
    lines: [
      { at: "00:08", speaker: "客服 CS-046", text: "许先生，我只记录现在能够核对的部分。请先说声音开始和停止的时间。" },
      { at: "00:19", speaker: "许先生", text: "00:04开始，00:10结束。你们昨天已经问过一遍。" },
      { at: "00:31", speaker: "客服 CS-046", text: "系统里没有昨天的回访。我会重新登记，不沿用上一次结论。" },
      { at: "01:54", speaker: "许先生", text: "你连说话顺序都和昨天一样。到底是不是同一个人？", flagged: true },
      { at: "02:10", speaker: "客服 CS-046", text: "请只回答本次工单涉及的问题。" },
    ],
    note: "坐席在挂断前手动取消了“身份已核验”。前一日回访文件为空，但质检序号连续。",
  },
  {
    id: "1304-status-return",
    code: "CALL-R1304-0208-R4",
    title: "1304住户状态回访",
    related: "关联住户 顾长河",
    time: "2026-02-08 00:06",
    duration: "03:12",
    available: (game) => game.fatherConfirmedDead,
    lines: [
      { at: "00:04", speaker: "顾长河", text: "你又打来了。" },
      { at: "00:09", speaker: "客服 CS-046", text: "系统没有显示我们此前联系过。请确认您目前是否仍居住在1304。" },
      { at: "00:21", speaker: "顾长河", text: "你每次都先问我还住不住，再问小满，最后说系统里没有上一次。" },
      { at: "01:03", speaker: "客服 CS-046", text: "请不要提及未登记的家庭成员。" },
      { at: "01:12", speaker: "顾长河", text: "不是系统忘了。是你忘了。", flagged: true },
    ],
    note: "该号码名下存在4次连续质检编号，坐席均为CS-046；除本次外，其余录音正文已被过滤。",
  },
  {
    id: "1104-employee-return",
    code: "CALL-EMP0602-R2",
    title: "失联员工异常回访",
    related: "关联员工 周明川 / 1104",
    time: "2026-06-02 22:18",
    duration: "01:47",
    available: (game) => game.colleagueAccess,
    lines: [
      { at: "00:03", speaker: "周明川", text: "CS-046，别再走系统工单。你那边会被清掉。" },
      { at: "00:11", speaker: "客服 CS-046", text: "请说明需要复核的房号和材料编号。" },
      { at: "00:18", speaker: "周明川", text: "1104。密码11·04·2713。是你让我写在纸上的。" },
      { at: "00:37", speaker: "客服 CS-046", text: "我没有发送过这项要求。" },
      { at: "00:43", speaker: "周明川", text: "你当然不记得。明天他们会给你换一个编号。", flagged: true },
    ],
    note: "文件创建后6分钟，CS-046被标记为“数据一致性复训”；周明川的员工状态开始反复改写。",
  },
  {
    id: "1404-care-return",
    code: "CALL-C1404-R17",
    title: "1404重点关怀回访",
    related: "关联住户 林若岚",
    time: "2026-07-12 08:32",
    duration: "04:04",
    available: (game) => hasUnlockedArticle(game, "care-w04"),
    lines: [
      { at: "00:05", speaker: "林若岚", text: "今天是046，还是0713？" },
      { at: "00:12", speaker: "客服 CS-046", text: "女士，请不要使用非本次来电显示的员工编号。" },
      { at: "00:24", speaker: "林若岚", text: "编号每次都不一样。你问话的顺序、停顿，还有说谎时先吸一口气，都没有变。" },
      { at: "01:16", speaker: "客服 CS-046", text: "我们以前见过？" },
      { at: "01:22", speaker: "林若岚", text: "你以前胃不好，值夜班总带着糖。你是我丈夫。", flagged: true },
    ],
    note: "合规系统将末句标记为“住户哀伤妄想”，但当前终端把这段录音列入了员工身份复核。",
  },
];

const callbackCoreIds = callbackRecords.map((record) => record.id);

const evidenceLabels: Record<string, string> = {
  vacancyMismatch: "1204空置登记与实际居住冲突",
  zeroWater: "1304零用水与滴水声并存",
  wetFootprints: "湿脚印、消防门磁与儿童影像形成交叉证据",
  bathAudio: "浴缸滴水与儿童哼唱声纹",
  childIdentity: "许芷遥身份材料与监护关系",
  childGuide: "许芷遥在1304门外消防前室获救，并提及顾小满",
  fatherDeath: "公安协查确认顾长河已死亡，但其住户账号仍在活动",
  fatherTruth: "1304事故附件、主体状态与异常会话时序",
  fatherAware: "1304注销账号留言会话及令牌停用记录",
  wifeAlibi: "梁静宜异地不在场记录",
  bodyWall: "1104西墙空腔尺寸及有机源环境读数异常",
  internalTransfer: "周明川内部转移单",
  churchFlow: "恒目顾问的数据清理权限、员工复训与异常资金流",
  ashLedger: "CJ-0713标签关联1404封存物及殡仪馆转出凭证",
  protagonistDead: "CJ-0713账号建档晚于同名事故遇难主体",
  marriage: "林若岚与CJ-0713为夫妻",
  operatorIdentity: "CS-046回访档案存在连续编号、缺失正文与T-04终端字段交叉",
};

const fatherCaseRecords = [
  { id: "care-return", time: "2026-06-28", code: "CARE-1304-R3", text: "重点关怀回访：登记号码有应答" },
  { id: "incident", time: "2021-08-21", code: "A-1304-0821 / 110附件", text: "回执记载监护人涉嫌酒后暴力及看护失职" },
  { id: "water-meter", time: "2026-07-12", code: "METER-1304-0712", text: "远传水表近24小时读数无变化" },
  { id: "death", time: "2023-02-08 00:36", code: "公安协查回函", text: "顾长河：急性酒精中毒死亡" },
  { id: "child-path", time: "2026-07-13 00:07", code: "RESCUE-0713 / CAM-13F", text: "许芷遥进入13层前室，获救后陈述提及顾小满" },
  { id: "wall-repair", time: "2021-08-19", code: "IMG-1304-0819", text: "浴室外墙面修补前留有儿童身高刻度" },
  { id: "message-token", time: "2026-07-13 本次会话", code: "MSG-1304 / TOKEN", text: "本人凭证停用后，注销账号留言令牌仍在写入" },
  { id: "door-off", time: "2023-02-08 09:20", code: "DOOR-1304 / AUDIT", text: "物业停用顾长河本人门禁凭证" },
];

const memoryAnchorRecords = [
  { id: "crash", time: "2025-11-04", code: "交警事故协查回执", text: "同名主体死亡，配偶林若岚为事故伤者及紧急联系人", source: "交警协查附件" },
  { id: "employee", time: "2025-11-05", code: "EMP-CJ-0713", text: "物业后台批量创建CJ-0713账号，未关联劳动合同", source: "员工主数据" },
  { id: "ashes", time: "2025-11-05", code: "DL-1105 / 殡仪馆转出单", text: "同名逝者封存物由林若岚转出并留存于1404", source: "殡仪馆纸质回执" },
  { id: "care", time: "2026-07-12", code: "CARE-1404-R17", text: "系统将本次上门登记为与住户首次接触", source: "物业关怀台账" },
  { id: "voice", time: "2026-07-12 08:32", code: "CALL-C1404-R17 / 原始音轨", text: "住户先后使用046与0713称呼坐席，并说出未见于员工档案的生活细节", source: "客服原始音轨" },
  { id: "workorder", time: "2026-07-13", code: "W-0713-1404", text: "当前投诉工单将住户陈述标记为关系错认", source: "当前客服工单" },
];

const rescueRouteScenes: RescueRouteScene[] = [
  {
    place: "1204儿童房",
    time: "00:03",
    signal: "监护人最后确认",
    image: "/rescue-route/01-1204-child-room.jpg",
    alt: "1204儿童房通往走廊的门口出现模糊孩童影子",
    observation: "床边物品没有翻动。赤脚水迹从床前延伸至房门，门外墙面留下无法对应光源的低矮影子。",
    review: "无法区分实体遮挡或二次光源",
    supportsRoute: true,
  },
  {
    place: "1204门外",
    time: "00:04",
    signal: "门磁开启一次",
    image: "/rescue-route/02-1204-corridor.jpg",
    alt: "1204门外走廊尽头的消防门旁有孩童影子",
    observation: "门外痕迹由赤脚印变为断续湿鞋印，方向避开电梯厅，沿走廊转向消防门。",
    review: "无法区分实体遮挡或二次光源",
    supportsRoute: true,
  },
  {
    place: "电梯厅",
    time: "00:04—00:10",
    signal: "ELEV-12F / 呼梯0次",
    image: "/rescue-route/06-12f-elevator-lobby.png",
    alt: "12层电梯厅夜间监控画面，电梯门关闭且地面无人",
    observation: "两部电梯门在复核时段内保持关闭，呼梯、停靠和开门事件均为0。地面干燥，画面没有记录到人员或移动目标。",
    review: "未识别人员、影子或潮湿痕迹",
    supportsRoute: false,
  },
  {
    place: "消防楼梯",
    time: "00:05—00:07",
    signal: "12F消防门 / 上行痕迹",
    image: "/rescue-route/03-fire-stair.jpg",
    alt: "消防楼梯上行台阶与上层墙面的孩童影子",
    observation: "上行台阶记录到两组尺寸不同的潮湿痕迹。较小一组时断时续，墙面影子始终领先一个转角。",
    review: "无法区分实体遮挡或二次光源",
    supportsRoute: true,
  },
  {
    place: "13层前室",
    time: "00:07",
    signal: "BLE-13F-W / -72dBm",
    image: "/rescue-route/04-13f-vestibule.jpg",
    alt: "13层消防前室通往住户走廊方向掠过孩童影子",
    observation: "手环只在西侧网关短暂出现。前室门先开启，走廊影子在门磁记录后掠过画面边缘。",
    review: "无法区分实体遮挡或二次光源",
    supportsRoute: true,
  },
  {
    place: "1304门外",
    time: "00:08",
    signal: "门把手水迹 / 无开锁记录",
    image: "/rescue-route/05-1304-door.jpg",
    alt: "1304门外水迹、墙面孩童影子与消防前室中的协查儿童",
    observation: "水迹停在1304门外，门锁没有开启。最后一段影子落在门板上，协查人员应优先复核相邻消防前室。",
    review: "无法区分实体遮挡或二次光源",
    supportsRoute: true,
  },
  {
    place: "1304室内",
    time: "2023-02-08",
    signal: "历史入户影像 / 非本次时段",
    image: "/rescue-route/07-1304-archive-interior.png",
    alt: "1304室内历史巡检归档照片，房间内没有人员或异常影子",
    observation: "系统只能调取2023年的入户巡检归档照，用于核对户型和房门位置。本次时段没有合法开锁记录，旧照片不能证明儿童进入室内。",
    review: "画面时间早于本次搜救，仅供格局比对",
    supportsRoute: false,
  },
  {
    place: "地库",
    time: "00:03—00:13",
    signal: "CAM-B2-07 / 事件0",
    image: "/rescue-route/08-b2-parking.png",
    alt: "地下停车场夜间监控画面，车道内没有人员或异常影子",
    observation: "地库车道在完整复核区间内没有人员移动，门禁未记录下行，儿童手环也未连接B2网关。画面地面干燥且没有连续痕迹。",
    review: "未识别人员、影子或潮湿痕迹",
    supportsRoute: false,
  },
];

const rescueRouteOptions = ["1204儿童房", "1204门外", "电梯厅", "消防楼梯", "13层前室", "1304门外", "1304室内", "地库"];
const rescueResultScene = rescueRouteScenes.find((scene) => scene.place === "1304门外")!;

const articleEvidence: Record<string, string[]> = {
  "scheduled-service-1204": ["vacancyMismatch"],
  "meter-1304": ["zeroWater"],
  "alibi-liang": ["wifeAlibi"],
  "on-site-device": ["ashLedger"],
  "crash-cj0713": ["protagonistDead"],
  "church-compliance": ["churchFlow"],
};

const missingChildEvidence = ["vacancyMismatch", "wetFootprints"];

const articleVerificationCopy: Record<string, { title: string; description: string; action: string; confirmed: string }> = {
  "scheduled-service-1204": {
    title: "跨表核验 / 服务授权与门禁",
    description: "将1204排班终止日期、最后履约记录和4月3日后的门禁事件交叉核对，区分历史授权与实际占用。",
    action: "核对排班与门禁并写入台账",
    confirmed: "已确认空置登记与实际占用冲突",
  },
  "meter-1304": {
    title: "附件核验 / 用水曲线",
    description: "将远传水表十五分钟曲线与报事时段、顶面检查照片逐项对齐，排除持续渗漏。",
    action: "比对检测附件并写入台账",
    confirmed: "已确认零用水与固定声响并存",
  },
  "alibi-liang": {
    title: "外部凭证核验 / 行程",
    description: "核对客运实名记录、康复机构门禁和费用代缴流水，只确认人在异地，不推断其他主体。",
    action: "交叉核对三方凭证",
    confirmed: "已确认梁静宜在协查时段位于外省",
  },
  "church-compliance": {
    title: "名单核验 / 账号变更",
    description: "将培训批次、终端重置工单和员工状态变更时间对齐，记录可以审计的流程重合。",
    action: "核对培训与账号附件",
    confirmed: "已确认复训、数据清理与账号变更存在流程关联",
  },
  "on-site-device": {
    title: "封签核验 / 外部凭证",
    description: "只检查封签编号、转出日期和标签关联，不启封住户物品，也不读取被遮蔽姓名。",
    action: "核对封签与转出凭证",
    confirmed: "已确认CJ-0713标签与1404封存物使用同一凭证链",
  },
  "crash-cj0713": {
    title: "跨系统核验 / 主体哈希",
    description: "比对事故回执身份哈希、紧急联系人电话尾号、账号创建时间和实名附件状态。",
    action: "提交跨系统字段校验",
    confirmed: "已确认账号建档时间晚于同名事故主体记录",
  },
};

const boardMessages: BoardMessage[] = [
  { id: 1, sequence: 4, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 08:43", tone: "resident", visible: () => true, text: "今天还是你来处理吗？如果找不到入口，先查工单里最具体的时间。" },
  { id: 101, sequence: 3, author: "许先生", unit: "1204", badge: "身份待核", time: "今天 08:36", tone: "warning", visible: () => true, text: "报修三次了。那不是水管，水管不会每天只响六分钟。楼上不开门，你们就把工单关了？" },
  { id: 102, sequence: 2, author: "陈阿姨", unit: "0702", badge: "普通住户", time: "今天 07:58", tone: "resident", visible: () => true, text: "昨晚00:04电梯楼层又全灭了，维修师傅说是自动重启。你们查滴水的时候顺便看看，别什么都说正常。" },
  { id: 103, sequence: 1, author: "张志强", unit: "1302", badge: "普通住户", time: "昨天 23:41", tone: "resident", visible: () => true, text: "昨晚摔酒瓶的是我家，和1304没关系。谁再说听见男人骂孩子，先把房号看清楚。" },

  { id: 2, sequence: 6, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 09:02", tone: "resident", visible: (game) => hasVisited(game, "vacancy-1204"), text: "1204登记里没有儿童，但巡检照片拍到了童鞋。鞋里好像夹着一张卡片。" },
  { id: 104, sequence: 5, author: "1204服务联系人", unit: "1204", badge: "身份待核", time: "今天 08:57", tone: "warning", visible: (game) => hasVisited(game, "vacancy-1204"), text: "我们原本只是来打扫。房主停了续费，房子空着也是空着，孩子暂住几个月怎么了？别拿产权人的事吓唬我们。" },
  { id: 112, sequence: 7.5, author: "1204报警人", unit: "1204", badge: "紧急协查", time: "刚刚", tone: "warning", visible: (game) => game.childMissingReported, text: "我已经报警，接警员让我们不要自行上楼，先请物业封闭消防通道并保全00:04后的公共区域录像。芷遥没穿鞋，门口那双童鞋还在。请配合民警先找孩子。" },

  { id: 3, sequence: 8, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 00:04", tone: "resident", visible: (game) => hasVisited(game, "cctv-1204"), text: "别只看门口。看地面，再看消防楼梯。" },
  { id: 105, sequence: 7, author: "孙阿姨", unit: "1303", badge: "普通住户", time: "今天 00:02", tone: "resident", visible: (game) => hasVisited(game, "cctv-1204"), text: "消防门外的猫脚印我认得，但监控里那串不是猫留下的。猫爪不会一前一后，也不会一路滴着水。" },

  { id: 4, sequence: 10, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 00:11", tone: "resident", visible: (game) => game.fatherResolved, text: "小满只是想念父亲。思念不等于原谅，这两份档案不该合在一起。" },
  { id: 106, sequence: 9, author: "1204报警人", unit: "1204", badge: "协查对象已找到", time: "今天 00:13", tone: "warning", visible: (game) => game.childSaved, text: "民警和安保在1304门外的消防前室找到芷遥，已经送回1204。她一直说是一个衣服全湿的小姑娘带她走楼梯，还问‘爸爸是不是也在等我’。" },

  { id: 5, sequence: 13, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 08:17", tone: "resident", visible: (game) => Boolean(game.fatherClosure), text: "你手机里那个没用过的密码，我替你记着：11·04·2713。" },
  { id: 107, sequence: 12, author: "顾长河", unit: "1304", badge: "账号已注销 · 会话未关闭", time: "刚刚", tone: "system", visible: (game) => game.fatherConfirmedDead, text: "为什么我的住户身份被注销了？回访记录还在，门却一直打不开。你查过那份协查回函，就告诉我到底发生了什么。" },
  { id: 108, sequence: 11, author: "周明川", unit: "物业员工", badge: "离职账号留存", time: "2026-06-02 22:18", tone: "system", visible: (game) => hasVisited(game, "employee-sync"), text: "1104的竣工净宽和复测值对不上。先量西墙，再查我的调岗单有没有车辆、签收人和目的地。" },

  { id: 6, sequence: 15, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 08:32", tone: "resident", visible: (game) => hasVisited(game, "workorder-1404"), text: "工单是我发起的。你们每次都让同一个人来，再让他忘记为什么来。请不要再让他明天重新来一次。" },
  { id: 109, sequence: 14, author: "物业合规中心", unit: "系统", badge: "自动回复", time: "今天 08:33", tone: "system", visible: (game) => hasVisited(game, "workorder-1404"), text: "警示：当前处理人与投诉所述对象存在自指冲突。禁止确认亲属关系、接受住户私人物品或脱离标准关怀话术；违规将立即执行记忆一致性复训。" },
  { id: 115, sequence: 15.5, author: "物业合规中心", unit: "SYSTEM", badge: "主体冲突告警", time: "刚刚", tone: "system", visible: (game) => hasVisited(game, "workorder-1404"), text: "W-0713-1404已转交CJ-0713。系统检测到工单报事对象、固定回访人员与当前处理人重合。该冲突不得作为建立私人关系的依据。" },

  { id: 110, sequence: 16, author: "程启", unit: "物业员工", badge: "账号来源异常", time: "已删除 17次", tone: "system", visible: (game) => game.colleagueSolved, text: "‘内部转移’没有车辆和签收记录，‘过滤’却能清掉门禁、工单和本机缓存。审批人都来自恒目。" },
  { id: 113, sequence: 16.5, author: "物业合规中心", unit: "SYSTEM", badge: "检索行为告警", time: "刚刚", tone: "system", visible: (game) => hasVisited(game, "symbol-eye-record"), text: "员工CJ-0713：当前检索已超出W-0713-019工单授权范围。请返回在办事项；继续查询“恒目”“过滤”或“ZC-LH”将记录为数据合规事件。" },
  { id: 7, sequence: 18, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 00:09", tone: "resident", visible: (game) => game.homeSolved, text: "这一次如果你真的想起来了，就搜索‘下班’。00:10以后不要再刷卡。" },
  { id: 111, sequence: 17, author: "留言板系统", unit: "SYSTEM", badge: "状态同步", time: "今天 00:09", tone: "system", visible: (game) => game.homeSolved, text: "当前在线会话：4。可核验住户账号：0。CJ-0713的本次临时访问权限将在00:10关闭。" },
  { id: 114, sequence: 19, author: "回访质检系统", unit: "SYSTEM", badge: "未决备注已附加", time: "刚刚", tone: "system", visible: (game) => game.cs046Solved, text: "T-04字段在两组坐席导出记录中重复出现。自动归因结果已由上级策略撤回。" },
  { id: 116, sequence: 20, author: "员工一致性服务", unit: "SYSTEM", badge: "强制任务执行中", time: "刚刚", tone: "system", visible: (game) => game.memoryRewriteStage === "running", text: "MEM-CONSISTENCY任务已接管当前中台。住户关系、事故主体与封存物含义将在退出前覆盖写入。请勿关闭终端。" },
  { id: 117, sequence: 21, author: "物业合规中心", unit: "SYSTEM", badge: "拒绝校正已记录", time: "00:09", tone: "system", visible: (game) => game.memoryRewriteStage === "resisted", text: "外部原始记录阻断本轮覆盖写入。CJ-0713权限已降为只读，00:10将强制退出；本次拒绝已上报恒目驻场管理员。" },
];

const uncannyArticleIds = new Set([
  "resident-separation-guide",
  "symbol-eye-record",
  "vendor-hengmu-index",
  "workorder-1404",
  "w04-directory",
  "night-shift-sugar",
  "device-type-index",
  "employee-cj0713-index",
  "church-compliance",
  "crash-cj0713",
]);

const deniedMessages: Record<string, string> = {
  "cctv-1204": "公共区域录像调阅须关联已受理工单。请先打开W-0713-019并确认复核范围。",
  "audio-1304": "工程拾振数据尚未完成现场检测关联，当前账号仅可查看检测结论。",
  "clinic-child": "未成年人身份材料属于敏感信息。请先关联1204实际占用异常记录。",
  "register-child": "紧急协查登记须核对儿童身份、监护关系、最后确认日期和报警回执。",
  "rescue-route": "完整路径包含消防通道录像及儿童定位数据，需先完成协查对象登记与安防复核。",
  "case-correction": "物业无权单独认定自然人状态。请补齐公安协查回函、门禁停用记录和账号审计结果。",
  "employee-sync": "该员工状态被标记为人事争议，移动端备份仅对结案复核人员开放。",
  "room-1104": "非承重墙破拆需工程复测、环境检测及业主授权。现有材料不足。",
  "workorder-1404": "该投诉在1304历史账号纠偏完成后转入当前班次。请先处理在办异常工单。",
  "w04-directory": "1404住户索引仅对其本人发起的在办投诉开放。",
  "care-w04": "重点关怀记录仅向完成历史住户档案纠偏的员工开放。",
  "church-compliance": "供应商内部培训材料不属于常规工单附件。继续申请将触发数据合规审计。",
  "on-site-device": "特殊保管物涉及住户自有财产，请先取得对应关怀记录的查阅权限。",
  "crash-cj0713": "事故协查材料含敏感个人信息，需先确认CJ-0713标签及1404保管关系。",
  "identity-1404": "关系校验需要事故协查、紧急联系人和特殊保管物三方记录。",
  "clock-out": "当前账号实名底档未完成复核，暂不可提交离岗或账号注销申请。",
};

function addUnique(items: string[], values: string[]) {
  return Array.from(new Set([...items, ...values]));
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[\s·•—_\-：:，,。.、/\\（）()《》〈〉]/g, "");
}

function isArticleLocked(article: ArticleMeta, game: GameState) {
  return !article.available(game) || (isProtectedArticle(article.id) && !hasUnlockedArticle(game, article.id));
}

function brokenTitleFor(article: ArticleMeta) {
  const glyphs = ["▧", "▒", "╱", "░", "◫", "⌁"];
  const length = Math.max(8, Math.min(18, Array.from(article.title).filter((char) => char.trim()).length));
  const seed = Array.from(article.id).reduce((total, char) => total + char.charCodeAt(0), 0);
  return Array.from({ length }, (_, index) => glyphs[(seed + index * 3) % glyphs.length])
    .map((char, index) => index === 3 || index === 9 ? `${char} ` : char)
    .join("");
}

function rankArticle(article: ArticleMeta, rawQuery: string, game: GameState) {
  const query = normalizeText(rawQuery);
  if (!query) return 0;
  const locked = isArticleLocked(article, game);
  const title = normalizeText(locked ? article.id : article.title);
  const snippet = normalizeText(locked ? article.section : article.snippet);
  const terms = (locked ? article.lockedTerms ?? [] : article.terms).map(normalizeText);
  let score = 0;
  if (title.includes(query)) score += 8;
  if (snippet.includes(query)) score += 3;
  for (const term of terms) {
    if (term === query) score += 10;
    else if (term.includes(query) || query.includes(term)) score += 4;
  }
  return score;
}

const FIELD_AUDIO_DURATION = 18;
const FIELD_AUDIO_TRACKS: Array<{ key: AudioTrackKey; code: string; label: string; note: string; resolved: string; level: number }> = [
  { key: "pipe", code: "A-01", label: "低沉的金属嗡鸣", note: "持续低音，偶尔带有管壁回响", resolved: "公共管道共振声", level: 0.7 },
  { key: "tv", code: "A-02", label: "电视里的新闻联播声", note: "远处成年男声，语速平稳", resolved: "邻户电视新闻声", level: 0.52 },
  { key: "bath", code: "A-03", label: "空腔里的规律滴水声", note: "约每1.4秒一次，带有短促回声", resolved: "浴缸内滴水声", level: 0.82 },
  { key: "child", code: "A-04", label: "很轻的孩童哼唱", note: "没有歌词，旋律反复出现", resolved: "近距离孩童哼唱", level: 0.62 },
];


function formatFieldAudioTime(value: number) {
  return `00:${Math.floor(value).toString().padStart(2, "0")}`;
}

function EyeMark({ small = false }: { small?: boolean }) {
  return <span className={`eye-mark ${small ? "eye-mark--small" : ""}`} aria-hidden="true"><i /></span>;
}

function MosaicText({ value, revealed }: { value: string; revealed: boolean }) {
  if (revealed) return <span className="mosaic-text is-revealed">{value}</span>;
  return <span className="mosaic-text" aria-label="字段受限"><span className="mosaic-text__placeholder" aria-hidden="true">{Array.from({ length: value.length }).map((_, index) => <i key={index} />)}</span></span>;
}

export default function Home() {
  const [game, setGame] = useState<GameState>(initialGame);
  const [entryStage, setEntryStage] = useState<EntryStage>("dream");
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [endingStep, setEndingStep] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("badge");
  const [selectedAccount, setSelectedAccount] = useState<EmployeeAccount>("CJ-0713");
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [forgetConfirming, setForgetConfirming] = useState(false);
  const [query, setQuery] = useState("");
  const [boardOpen, setBoardOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [archiveIndexOpen, setArchiveIndexOpen] = useState(false);
  const [deductionOpen, setDeductionOpen] = useState(false);
  const [activeDeduction, setActiveDeduction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [messagePopup, setMessagePopup] = useState<{ message: BoardMessage; count: number } | null>(null);
  const messageTimer = useRef<number | null>(null);
  const messageAudioContext = useRef<AudioContext | null>(null);
  const [childName, setChildName] = useState("");
  const [childBirthday, setChildBirthday] = useState("");
  const [childFather, setChildFather] = useState("");
  const [childMother, setChildMother] = useState("");
  const [childRelation, setChildRelation] = useState("");
  const [childLastDate, setChildLastDate] = useState("");
  const [childPoliceRef, setChildPoliceRef] = useState("");
  const [cctvAnomalyTimes, setCctvAnomalyTimes] = useState<string[]>([]);
  const [cctvVideoPlaying, setCctvVideoPlaying] = useState(false);
  const cctvVideoRef = useRef<HTMLVideoElement | null>(null);
  const [fieldAudioPlaying, setFieldAudioPlaying] = useState(false);
  const [fieldAudioPosition, setFieldAudioPosition] = useState(0);
  const fieldAudioElements = useRef<Partial<Record<AudioTrackKey, HTMLAudioElement>>>({});
  const [caseStatus, setCaseStatus] = useState("");
  const [caseDeath, setCaseDeath] = useState("");
  const [caseTimeline, setCaseTimeline] = useState<string[]>([]);
  const [roomPassword, setRoomPassword] = useState("");
  const [wallWidth, setWallWidth] = useState("");
  const [wallSignal, setWallSignal] = useState("");
  const [wallArchive, setWallArchive] = useState("");
  const [credentialCipher, setCredentialCipher] = useState("");
  const [legacyFileId, setLegacyFileId] = useState<string | null>(null);
  const [legacyBreachStage, setLegacyBreachStage] = useState<LegacyBreachStage>("none");
  const [legacyCameraState, setLegacyCameraState] = useState<LegacyCameraState>("idle");
  const [legacyCameraError, setLegacyCameraError] = useState("");
  const [homeWoman, setHomeWoman] = useState("");
  const [homeEmployee, setHomeEmployee] = useState("");
  const [homeDevice, setHomeDevice] = useState("");
  const [memoryAnchors, setMemoryAnchors] = useState<string[]>([]);
  const [articlePasswordInput, setArticlePasswordInput] = useState("");
  const [articlePasswordRejected, setArticlePasswordRejected] = useState(false);
  const [callbackSequence, setCallbackSequence] = useState("");
  const [callbackSystemEvent, setCallbackSystemEvent] = useState("");
  const [callbackTerminalField, setCallbackTerminalField] = useState("");
  const loginTimer = useRef<number | null>(null);
  const legacyTimer = useRef<number | null>(null);
  const legacyCameraStream = useRef<MediaStream | null>(null);
  const legacyCameraVideo = useRef<HTMLVideoElement | null>(null);
  const legacyCameraRequestToken = useRef(0);

  useEffect(() => {
    const applyBrowserRoute = () => {
      const route = parseAppRoute(window.location.hash);
      const saved = readSavedGame();
      const isLegacyRoute = route.kind === "view" && route.view === "legacy";
      const mustResumeLegacyCamera = Boolean(saved?.legacyCameraPending && !saved.legacyBreachSeen && !saved.legacyAccountCollapsed);

      if (saved && mustResumeLegacyCamera) {
        legacyCameraRequestToken.current += 1;
        if (legacyTimer.current !== null) window.clearTimeout(legacyTimer.current);
        legacyTimer.current = null;
        legacyCameraStream.current?.getTracks().forEach((track) => track.stop());
        legacyCameraStream.current = null;
        if (legacyCameraVideo.current) legacyCameraVideo.current.srcObject = null;
        setLegacyCameraState("idle");
        setLegacyCameraError("");
        setLegacyBreachStage("camera");
        setLegacyFileId(null);
        setSelectedAccount(MINGCHUAN_ACCOUNT);
        setGame({ ...saved, started: true, activeAccount: MINGCHUAN_ACCOUNT, view: "legacy", activeArticle: null, activeCallback: null });
        writeAppRoute("/system/legacy", true);
        return;
      }

      if (!isLegacyRoute) {
        legacyCameraRequestToken.current += 1;
        if (legacyTimer.current !== null) window.clearTimeout(legacyTimer.current);
        legacyTimer.current = null;
        legacyCameraStream.current?.getTracks().forEach((track) => track.stop());
        legacyCameraStream.current = null;
        if (legacyCameraVideo.current) legacyCameraVideo.current.srcObject = null;
        setLegacyCameraState("idle");
        setLegacyCameraError("");
        setLegacyBreachStage("none");
      }

      if (route.kind === "entry") {
        const entryGame = saved
          ? { ...saved, started: false, view: "home" as const, activeArticle: null, activeCallback: null }
          : { ...initialGame };
        setGame(entryGame);
        setEntryStage(route.stage);
        setLegacyFileId(null);
        setSelectedAccount(saved?.colleagueCredentialsRecovered ? saved.activeAccount : "CJ-0713");
        if (!window.location.hash) writeAppRoute(route.stage === "dream" ? "/opening" : `/${route.stage}`, true);
        return;
      }

      if (!saved) {
        setGame({ ...initialGame });
        setEntryStage("login");
        writeAppRoute("/login", true);
        return;
      }

      const returnHome = () => {
        setGame({ ...saved, started: true, activeAccount: "CJ-0713", view: "home", activeArticle: null, activeCallback: null });
        setLegacyFileId(null);
        writeAppRoute("/system/home", true);
      };

      if (route.view === "legacy") {
        const validFile = route.fileId && legacyFiles.some((file) => file.id === route.fileId) ? route.fileId : null;
        if (saved.activeAccount !== MINGCHUAN_ACCOUNT) {
          setGame({ ...saved, started: false, view: "home", activeArticle: null });
          setEntryStage("login");
          setSelectedAccount("CJ-0713");
          writeAppRoute("/login", true);
          return;
        }
        setGame({ ...saved, started: true, view: "legacy", activeArticle: null });
        setLegacyFileId(validFile);
        return;
      }

      if (route.view === "ending") {
        if (saved.ending !== route.ending) {
          returnHome();
          return;
        }
        setGame({ ...saved, started: true, view: "ending", activeArticle: null });
        return;
      }

      if (route.view === "callbacks") {
        const requestedCallback = route.callbackId ? callbackRecords.find((record) => record.id === route.callbackId) : null;
        const activeCallback = requestedCallback?.available(saved) ? requestedCallback.id : null;
        setGame({ ...saved, started: true, activeAccount: "CJ-0713", view: "callbacks", activeArticle: null, activeCallback });
        setLegacyFileId(null);
        if (route.callbackId && !activeCallback) writeAppRoute("/system/callbacks", true);
        return;
      }

      if (route.view === "article" || route.view === "denied") {
        const requestedArticle = articles.find((article) => article.id === route.articleId);
        const canRestoreArticle = route.view === "denied"
          || saved.visited.includes(route.articleId)
          || Boolean(requestedArticle && isProtectedArticle(route.articleId) && requestedArticle.available(saved));
        if (!requestedArticle || !canRestoreArticle) {
          returnHome();
          return;
        }
        setArticlePasswordInput("");
        setArticlePasswordRejected(false);
        setGame({ ...saved, started: true, activeAccount: "CJ-0713", view: route.view, activeArticle: route.articleId, activeCallback: null });
        setLegacyFileId(null);
        return;
      }

      if (route.view === "search") {
        const restoredQuery = route.query || saved.lastQuery;
        setQuery(restoredQuery);
        setGame({ ...saved, started: true, activeAccount: "CJ-0713", view: "search", activeArticle: null, activeCallback: null, lastQuery: restoredQuery });
        setLegacyFileId(null);
        return;
      }

      returnHome();
    };

    applyBrowserRoute();
    window.addEventListener("popstate", applyBrowserRoute);
    window.addEventListener("hashchange", applyBrowserRoute);
    return () => {
      window.removeEventListener("popstate", applyBrowserRoute);
      window.removeEventListener("hashchange", applyBrowserRoute);
    };
  }, []);

  useEffect(() => {
    if (game.started || entryStage !== "dream") return;
    const isLastMemory = memoryIndex === memoryScenes.length - 1;
    const timer = window.setTimeout(() => {
      if (isLastMemory) {
        setEntryStage("wake");
        writeAppRoute("/wake");
      }
      else setMemoryIndex((current) => current + 1);
    }, isLastMemory ? 5200 : 4400);
    return () => window.clearTimeout(timer);
  }, [entryStage, game.started, memoryIndex]);

  useEffect(() => () => {
    legacyCameraRequestToken.current += 1;
    if (loginTimer.current !== null) window.clearTimeout(loginTimer.current);
    if (legacyTimer.current !== null) window.clearTimeout(legacyTimer.current);
    legacyCameraStream.current?.getTracks().forEach((track) => track.stop());
    legacyCameraStream.current = null;
  }, []);

  useEffect(() => {
    if (legacyCameraState !== "active" || !legacyCameraVideo.current || !legacyCameraStream.current) return;
    const video = legacyCameraVideo.current;
    video.srcObject = legacyCameraStream.current;
    void video.play().catch(() => setLegacyCameraError("摄像头已开启，但本机预览播放失败。请重新授权。"));
    return () => {
      video.srcObject = null;
    };
  }, [legacyCameraState]);

  useEffect(() => {
    const shouldDelayCamera = game.activeAccount === MINGCHUAN_ACCOUNT
      && game.view === "legacy"
      && game.legacyRead.length === legacyFiles.length
      && game.legacyCameraPending
      && !game.legacyBreachSeen
      && !game.legacyAccountCollapsed
      && legacyBreachStage === "none";
    if (!shouldDelayCamera) return;
    const timer = window.setTimeout(() => {
      if (legacyTimer.current === timer) legacyTimer.current = null;
      setLegacyBreachStage("camera");
    }, LEGACY_READING_GRACE_MS);
    legacyTimer.current = timer;
    return () => {
      window.clearTimeout(timer);
      if (legacyTimer.current === timer) legacyTimer.current = null;
    };
  }, [game.activeAccount, game.legacyAccountCollapsed, game.legacyBreachSeen, game.legacyCameraPending, game.legacyRead.length, game.view, legacyBreachStage]);

  useEffect(() => {
    if (legacyBreachStage !== "question" && legacyBreachStage !== "found") return;
    const nextStage: LegacyBreachStage = legacyBreachStage === "question" ? "found" : "eyes";
    const timer = window.setTimeout(() => {
      if (nextStage === "eyes") setGame((current) => ({ ...current, legacyAccountCollapsed: true }));
      setLegacyBreachStage(nextStage);
    }, legacyBreachStage === "question" ? 1900 : 1700);
    return () => window.clearTimeout(timer);
  }, [legacyBreachStage]);

  useEffect(() => {
    if (game.started) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  useEffect(() => () => {
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    const audioContext = messageAudioContext.current;
    messageAudioContext.current = null;
    if (audioContext && audioContext.state !== "closed") void audioContext.close();
    FIELD_AUDIO_TRACKS.forEach((track) => fieldAudioElements.current[track.key]?.pause());
  }, []);

  useEffect(() => {
    if (!fieldAudioPlaying) return;
    const timer = window.setInterval(() => {
      const primary = fieldAudioElements.current.pipe;
      if (!primary) return;
      for (const track of FIELD_AUDIO_TRACKS) {
        const element = fieldAudioElements.current[track.key];
        if (element && Math.abs(element.currentTime - primary.currentTime) > 0.08) element.currentTime = primary.currentTime;
      }
      setFieldAudioPosition(primary.currentTime % FIELD_AUDIO_DURATION);
    }, 120);
    return () => window.clearInterval(timer);
  }, [fieldAudioPlaying]);

  useEffect(() => {
    if (game.view === "article" && game.activeArticle === "audio-1304") return;
    FIELD_AUDIO_TRACKS.forEach((track) => {
      const element = fieldAudioElements.current[track.key];
      if (!element) return;
      element.pause();
      element.currentTime = 0;
    });
    const resetTimer = window.setTimeout(() => {
      setFieldAudioPlaying(false);
      setFieldAudioPosition(0);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [game.activeArticle, game.view]);

  const currentArticle = articles.find((article) => article.id === game.activeArticle) ?? null;
  const workorder1404 = articles.find((article) => article.id === "workorder-1404")!;
  const employeeSyncArticle = articles.find((article) => article.id === "employee-sync")!;
  const room1104Article = articles.find((article) => article.id === "room-1104")!;
  const churchComplianceArticle = articles.find((article) => article.id === "church-compliance")!;
  const currentCallback = callbackRecords.find((record) => record.id === game.activeCallback) ?? null;
  const activeRescueScene = rescueRouteScenes.find((scene) => scene.place === (game.route.at(-1) ?? rescueRouteScenes[0].place)) ?? null;
  const availableCallbacks = callbackRecords.filter((record) => record.available(game));
  const callbackReviewReady = callbackCoreIds.every((id) => game.callbackRead.includes(id)) && hasVisited(game, "workorder-1404");
  const finalChapterReady = game.colleagueSolved && game.evidence.includes("churchFlow");
  const finalChapterStarted = hasVisited(game, "workorder-1404") || game.memoryRewriteStage !== "none";
  const internalReviewArticle = !hasVisited(game, "employee-sync")
    ? employeeSyncArticle
    : !game.colleagueSolved
      ? room1104Article
      : churchComplianceArticle;
  const memoryRewriteActive = game.memoryRewriteStage === "running";
  const activeLegacyFile = legacyFiles.find((file) => file.id === legacyFileId) ?? null;
  const legacyCameraRequired = game.activeAccount === MINGCHUAN_ACCOUNT
    && game.view === "legacy"
    && game.legacyRead.length === legacyFiles.length
    && game.legacyCameraPending
    && !game.legacyBreachSeen
    && legacyBreachStage === "camera";
  const currentArticleIndex = currentArticle?.id === "w04-directory"
    ? "RESIDENT-1404"
    : currentArticle?.id === "care-w04"
      ? "CARE-1404"
      : currentArticle?.id.toUpperCase();
  const wifeNameRevealed = hasUnlockedArticle(game, "care-w04") || game.homeSolved;
  const visibleBoardMessages = boardMessages.filter((message) => message.visible(game)).sort((a, b) => b.sequence - a.sequence);
  const unreadBoardMessages = visibleBoardMessages.filter((message) => !game.wifeRead.includes(message.id));
  const readArticles = articles.filter((article) => game.visited.includes(article.id));
  const readArticleSections = new Set(readArticles.map((article) => article.section)).size;
  const fatherDeductionRequirements = ["childGuide", "fatherDeath", "fatherAware"];
  const fatherDeductionUnlocked = fatherDeductionRequirements.every((item) => game.evidence.includes(item));

  const searchResults = useMemo(() => {
    return articles
      .map((article) => ({ article, score: rankArticle(article, game.lastQuery, game) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => Number(b.article.available(game)) - Number(a.article.available(game)) || b.score - a.score || a.article.date.localeCompare(b.article.date))
      .map(({ article }) => article);
  }, [game]);

  const objective = !hasVisited(game, "workorder-1204")
    ? "查明1204投诉来源"
    : !game.surveillanceSolved
      ? "复核公共区域事件片段"
    : !game.childMissingReported
        ? "核对1204实际占用与儿童物品"
      : !game.childRegistered
        ? "建立失联儿童协查记录"
        : !game.childSaved
          ? "制定现场搜索路线"
          : !game.audioSolved
            ? "净化夜间拾振声纹"
            : !hasVisited(game, "resident-1304")
              ? "核对重点回访住户记录"
            : !hasVisited(game, "accident-xiaoman") || !hasVisited(game, "alibi-liang")
              ? "补齐事故附件与异地行程凭证"
            : !game.fatherConfirmedDead
              ? "确认顾长河的主体状态"
            : !game.fatherClosure
              ? "回复1304注销账号"
            : !game.fatherResolved
                ? "在真相推导中重建1304审计时序"
            : !hasVisited(game, "employee-sync")
              ? "查找周明川留下的离线同步记录"
            : !game.colleagueAccess
              ? "解开1104内部记录"
            : !game.colleagueSolved
              ? "复核1104工程与人事异常"
            : !game.evidence.includes("churchFlow")
              ? "核验恒目复训与账号变更记录"
            : !hasVisited(game, "workorder-1404")
              ? "处理1404重复回访投诉"
              : !hasUnlockedArticle(game, "w04-directory")
                ? "解开1404住户索引口令"
                : !hasUnlockedArticle(game, "care-w04")
                  ? "解开1404回访冷备份"
                  : !hasUnlockedArticle(game, "on-site-device")
                    ? "解开1404封存物资产库"
                    : !hasUnlockedArticle(game, "crash-cj0713")
                      ? "解开CJ-0713事故协查接口"
                      : game.memoryRewriteStage === "running"
                        ? "阻止记忆一致性校正"
                        : !game.homeSolved
                          ? "提交1404主体关系核验"
                          : "找到结束本次值班的方法";

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const dismissMessagePopup = () => {
    setMessagePopup(null);
    if (messageTimer.current !== null) {
      window.clearTimeout(messageTimer.current);
      messageTimer.current = null;
    }
  };

  const playMessageNotificationSound = () => {
    try {
      const audioContext = messageAudioContext.current ?? new AudioContext();
      messageAudioContext.current = audioContext;

      const playChime = () => {
        const now = audioContext.currentTime;
        const notes = [
          { frequency: 659.25, start: 0, duration: 0.16 },
          { frequency: 987.77, start: 0.14, duration: 0.28 },
        ];

        notes.forEach(({ frequency, start, duration }) => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const noteStart = now + start;
          const noteEnd = noteStart + duration;

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, noteStart);
          gain.gain.setValueAtTime(0.0001, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(noteStart);
          oscillator.stop(noteEnd);
        });
      };

      if (audioContext.state === "suspended") {
        void audioContext.resume().then(playChime).catch(() => undefined);
      } else {
        playChime();
      }
    } catch {
      // Sound is an enhancement; message delivery must still work when audio is unavailable.
    }
  };

  const announceMessages = (ids: number[]) => {
    const messages = ids.map((id) => boardMessages.find((item) => item.id === id)).filter((message): message is BoardMessage => Boolean(message));
    if (messages.length === 0) return;
    playMessageNotificationSound();
    setMessagePopup({ message: messages[0], count: messages.length });
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => {
      setMessagePopup(null);
      messageTimer.current = null;
    }, 9000);
  };

  const startGame = () => {
    const nextGame = { ...initialGame, started: true, activeAccount: "CJ-0713" as const };
    setGame(nextGame);
    writeAppRoute("/system/home");
    announceMessages([1, 101, 102, 103]);
  };

  const continueGame = () => {
    const restored = readSavedGame();
    if (!restored) {
      startGame();
      return;
    }
    const nextGame: GameState = {
      ...restored,
      view: restored.view === "legacy" ? "home" : restored.view,
      activeAccount: "CJ-0713",
      started: true,
    };
    setGame(nextGame);
    setQuery(nextGame.lastQuery);
    writeAppRoute(routeForGame(nextGame));
  };

  const enterSystem = (account: EmployeeAccount, restore = false) => {
    if (isLoggingIn) return;
    const resumeCurrent = game.visited.length > 0 || game.evidence.length > 0 || game.colleagueCredentialsRecovered;
    setSelectedAccount(account);
    setLoginError("");
    setIsLoggingIn(true);
    loginTimer.current = window.setTimeout(() => {
      loginTimer.current = null;
      setIsLoggingIn(false);
      if (restore) {
        continueGame();
      } else if (account === MINGCHUAN_ACCOUNT) {
        setGame((current) => ({ ...current, started: true, activeAccount: account, view: "legacy", activeArticle: null }));
        writeAppRoute("/system/legacy");
      } else if (resumeCurrent) {
        setGame((current) => ({ ...current, started: true, activeAccount: "CJ-0713", view: "home", activeArticle: null }));
        writeAppRoute("/system/home");
      } else {
        startGame();
      }
    }, 1350);
  };

  const submitPasswordLogin = (event: FormEvent) => {
    event.preventDefault();
    const accountId = employeeIdInput.trim().toUpperCase();
    const account: EmployeeAccount | null = accountId === "CJ-0713"
      ? "CJ-0713"
      : accountId === MINGCHUAN_ACCOUNT
        ? MINGCHUAN_ACCOUNT
        : null;
    if (!account) {
      setLoginError("员工工号或密码错误");
      return;
    }
    const correctPassword = account === "CJ-0713"
      ? loginPassword === "0713"
      : normalizeText(loginPassword) === normalizeText(MINGCHUAN_PASSWORD);
    if (!correctPassword) {
      setLoginError(account === MINGCHUAN_ACCOUNT ? "账号已注销，密码校验失败" : "员工工号或密码错误");
      return;
    }
    setSelectedAccount(account);
    enterSystem(account);
  };

  const returnToLogin = () => {
    legacyCameraRequestToken.current += 1;
    if (legacyTimer.current !== null) window.clearTimeout(legacyTimer.current);
    legacyTimer.current = null;
    stopLegacyCamera();
    setLegacyCameraState("idle");
    setLegacyCameraError("");
    setLegacyBreachStage("none");
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, started: true }));
    dismissMessagePopup();
    setBoardOpen(false);
    setLedgerOpen(false);
    setArchiveIndexOpen(false);
    setDeductionOpen(false);
    setGame((current) => ({ ...current, started: false, view: "home", activeArticle: null }));
    setEntryStage("login");
    setLoginMethod("password");
    setSelectedAccount(game.colleagueCredentialsRecovered ? MINGCHUAN_ACCOUNT : "CJ-0713");
    setEmployeeIdInput("");
    setLoginPassword("");
    setLoginError("");
    setIsLoggingIn(false);
    writeAppRoute("/login");
  };

  const forgetInvestigation = () => {
    localStorage.removeItem(SAVE_KEY);
    setForgetConfirming(false);
    writeAppRoute("/opening", true);
    window.location.reload();
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setGame((current) => ({
      ...current,
      view: "search",
      activeArticle: null,
      lastQuery: term,
      searchHistory: [term, ...current.searchHistory.filter((item) => item !== term)].slice(0, 10),
    }));
    writeAppRoute(`/system/search/${encodeURIComponent(term)}`);
  };

  const searchFor = (term: string) => {
    setQuery(term);
    setGame((current) => ({
      ...current,
      view: "search",
      activeArticle: null,
      lastQuery: term,
      searchHistory: [term, ...current.searchHistory.filter((item) => item !== term)].slice(0, 10),
    }));
    writeAppRoute(`/system/search/${encodeURIComponent(term)}`);
  };

  const openArticle = (article: ArticleMeta) => {
    if (!article.available(game)) {
      setGame((current) => ({ ...current, view: "denied", activeArticle: article.id }));
      writeAppRoute(`/system/denied/${article.id}`);
      return;
    }
    setArticlePasswordInput("");
    setArticlePasswordRejected(false);
    const passwordProtected = isProtectedArticle(article.id) && !hasUnlockedArticle(game, article.id);
    const firstVisit = !passwordProtected && !game.visited.includes(article.id);
    const messagesByArticle: Record<string, number[]> = {
      "vacancy-1204": [2, 104],
      "cctv-1204": [3, 105],
      "symbol-eye-record": [113],
      "employee-sync": [108],
      "workorder-1404": [6, 109, 115],
    };
    setGame((current) => ({
      ...current,
      view: "article",
      activeArticle: article.id,
      visited: passwordProtected ? current.visited : addUnique(current.visited, [article.id]),
      memoryRewriteStage: article.id === "workorder-1404" && current.memoryRewriteStage === "none"
        ? "queued"
        : current.memoryRewriteStage,
    }));
    writeAppRoute(`/system/article/${article.id}`);
    if (firstVisit && messagesByArticle[article.id]) announceMessages(messagesByArticle[article.id]);
  };

  const openRelatedArticle = (articleId: string) => {
    const relatedArticle = articles.find((article) => article.id === articleId);
    if (!relatedArticle) {
      flash("关联档案索引已失效");
      return;
    }
    openArticle(relatedArticle);
  };

  const submitProtectedArticlePassword = (event: FormEvent, articleId: ProtectedArticleId) => {
    event.preventDefault();
    const gate = protectedArticleGates[articleId];
    if (normalizeAccessCode(articlePasswordInput) !== gate.password) {
      setArticlePasswordInput("");
      setArticlePasswordRejected(true);
      setGame((current) => ({ ...current, surveillanceEyes: current.surveillanceEyes + 1 }));
      return;
    }
    setArticlePasswordRejected(false);
    setArticlePasswordInput("");
    setGame((current) => ({
      ...current,
      protectedArticlesUnlocked: Array.from(new Set([...current.protectedArticlesUnlocked, articleId])),
      visited: addUnique(current.visited, [articleId]),
    }));
  };

  const confirmArticleEvidence = (articleId: string) => {
    const gained = articleEvidence[articleId] ?? [];
    if (!gained.length || game.inspectedArticles.includes(articleId)) return;
    const nextEvidence = addUnique(game.evidence, gained);
    const triggersMissingChild = !game.childMissingReported
      && missingChildEvidence.every((item) => nextEvidence.includes(item));
    setGame((current) => ({
      ...current,
      inspectedArticles: addUnique(current.inspectedArticles, [articleId]),
      evidence: addUnique(current.evidence, gained),
      childMissingReported: current.childMissingReported || triggersMissingChild,
    }));
    if (triggersMissingChild) announceMessages([112]);
    flash(articleVerificationCopy[articleId]?.confirmed ?? "附件核验完成，关键事实已写入台账");
  };

  const openMessageBoard = () => {
    dismissMessagePopup();
    setLedgerOpen(false);
    setArchiveIndexOpen(false);
    setDeductionOpen(false);
    setBoardOpen(true);
    setGame((current) => ({ ...current, wifeRead: visibleBoardMessages.map((message) => message.id) }));
  };

  const openDeductionDesk = () => {
    dismissMessagePopup();
    setBoardOpen(false);
    setLedgerOpen(false);
    setArchiveIndexOpen(false);
    setActiveDeduction(null);
    setDeductionOpen(true);
  };

  const openLedger = () => {
    dismissMessagePopup();
    setBoardOpen(false);
    setArchiveIndexOpen(false);
    setDeductionOpen(false);
    setLedgerOpen(true);
  };

  const openArchiveIndex = () => {
    dismissMessagePopup();
    setBoardOpen(false);
    setLedgerOpen(false);
    setDeductionOpen(false);
    setArchiveIndexOpen(true);
  };

  const openCallbackCenter = () => {
    dismissMessagePopup();
    setBoardOpen(false);
    setLedgerOpen(false);
    setArchiveIndexOpen(false);
    setDeductionOpen(false);
    setGame((current) => ({ ...current, view: "callbacks", activeArticle: null, activeCallback: null }));
    writeAppRoute("/system/callbacks");
  };

  const openCallback = (record: CallbackRecord) => {
    if (!record.available(game)) return;
    setGame((current) => ({
      ...current,
      view: "callbacks",
      activeArticle: null,
      activeCallback: record.id,
      callbackRead: addUnique(current.callbackRead, [record.id]),
    }));
    writeAppRoute(`/system/callbacks/${record.id}`);
  };

  const submitCallbackReview = (event: FormEvent) => {
    event.preventDefault();
    if (!callbackReviewReady) {
      flash("可读取回访尚未全部核对");
      return;
    }
    if (callbackSequence !== "continuous-gap" || callbackSystemEvent !== "consistency-review" || callbackTerminalField !== "t04") {
      flash("附注未通过：请只记录目录和日志中可以直接核对的字段");
      return;
    }
    setGame((current) => ({ ...current, cs046Solved: true, evidence: addUnique(current.evidence, ["operatorIdentity"]) }));
    if (!game.cs046Solved) announceMessages([114]);
    flash("未决备注已附加，不生成坐席归属结论");
  };

  const reopenReadArticle = (article: ArticleMeta) => {
    if (!game.visited.includes(article.id)) return;
    setArchiveIndexOpen(false);
    openArticle(article);
  };

  const reviewFrame = (time: string) => {
    setGame((current) => ({ ...current, nightFrames: [time] }));
  };

  const toggleCctvAnomalyTime = (time: string) => {
    setCctvAnomalyTimes((current) => current.includes(time)
      ? current.filter((item) => item !== time)
      : [...current, time]);
  };

  const playCctvReview = () => {
    const video = cctvVideoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      setCctvVideoPlaying(false);
      flash("监控回放启动失败，请刷新页面或使用下方逐帧复核");
    });
  };

  const submitCctvReview = (event: FormEvent) => {
    event.preventDefault();
    const expected = ["00:04", "00:07", "00:10", "00:12"];
    const correct = cctvAnomalyTimes.length === expected.length
      && expected.every((time) => cctvAnomalyTimes.includes(time));
    if (!correct) {
      flash("复核未通过：所选时间节点与画面、门磁或录像校验日志不一致");
      return;
    }
    const nextEvidence = addUnique(game.evidence, ["wetFootprints"]);
    const triggersMissingChild = !game.childMissingReported
      && missingChildEvidence.every((item) => nextEvidence.includes(item));
    setGame((current) => ({
      ...current,
      surveillanceSolved: true,
      evidence: addUnique(current.evidence, ["wetFootprints"]),
      childMissingReported: current.childMissingReported || triggersMissingChild,
    }));
    if (triggersMissingChild) announceMessages([112]);
    flash("复核成立：湿脚印、消防通道影像和录像缓存异常已分别标记");
  };

  const stopFieldAudio = () => {
    FIELD_AUDIO_TRACKS.forEach((track) => {
      const element = fieldAudioElements.current[track.key];
      if (!element) return;
      element.pause();
      element.currentTime = 0;
    });
    setFieldAudioPlaying(false);
    setFieldAudioPosition(0);
  };

  const toggleFieldAudio = async () => {
    if (fieldAudioPlaying) {
      stopFieldAudio();
      return;
    }

    const elements = FIELD_AUDIO_TRACKS.map((track) => ({ track, element: fieldAudioElements.current[track.key] }));
    if (elements.some(({ element }) => !element)) {
      flash("拾振样本尚未载入，请稍后重试");
      return;
    }

    try {
      for (const { track, element } of elements) {
        if (!element) continue;
        element.currentTime = 0;
        element.volume = track.level;
        element.muted = game.mutedTracks.includes(track.key);
      }
      await Promise.all(elements.map(({ element }) => element!.play()));
      setFieldAudioPlaying(true);
      setFieldAudioPosition(0);
    } catch {
      stopFieldAudio();
      flash("拾振样本播放失败，请检查页面声音权限或重新载入档案");
    }
  };

  const toggleTrack = (track: AudioTrackKey) => {
    const willMute = !game.mutedTracks.includes(track);
    const element = fieldAudioElements.current[track];
    if (element) element.muted = willMute;
    setGame((current) => ({
      ...current,
      mutedTracks: current.mutedTracks.includes(track)
        ? current.mutedTracks.filter((item) => item !== track)
        : [...current.mutedTracks, track],
    }));
  };

  const submitAudio = () => {
    const correct = game.mutedTracks.length === 2 && ["pipe", "tv"].every((track) => game.mutedTracks.includes(track));
    if (!correct) {
      flash("仍有环境噪声，或关键声道被误删");
      return;
    }
    setGame((current) => ({ ...current, audioSolved: true, evidence: addUnique(current.evidence, ["bathAudio"]) }));
    flash("声纹已净化：滴水来自浴缸，背景存在儿童哼唱");
  };

  const submitChild = (event: FormEvent) => {
    event.preventDefault();
    const name = normalizeText(childName);
    const correctName = name === normalizeText("许芷遥") || name === "xuzhiyao";
    const correctFather = normalizeText(childFather) === normalizeText("许建国");
    const correctMother = normalizeText(childMother) === normalizeText("赵秀兰");
    if (!correctName || !correctFather || !correctMother || childBirthday !== "2020-04-12" || childRelation !== "child" || childLastDate !== "2026-07-13" || normalizeText(childPoliceRef) !== normalizeText("DL-0713-0041")) {
      flash("协查登记被退回：身份、监护关系、最后确认日期或报警回执无法互相印证");
      return;
    }
    setGame((current) => ({ ...current, childRegistered: true, evidence: addUnique(current.evidence, ["childIdentity"]) }));
    flash("许芷遥已建立临时协查记录；该记录不改变1204住户登记");
  };

  const requestMissingChildDetail = (detail: "last_seen" | "police_ref") => {
    setGame((current) => {
      const replies = new Set(current.missingChildReply.split("|").filter(Boolean));
      replies.add(detail);
      return { ...current, missingChildReply: Array.from(replies).join("|") };
    });
  };

  const appendRoute = (place: string) => {
    setGame((current) => current.route.length >= 5 ? current : ({ ...current, route: [...current.route, place] }));
  };

  const undoRouteStep = () => {
    setGame((current) => ({ ...current, route: current.route.slice(0, -1) }));
  };

  const submitRoute = () => {
    const expected = ["1204儿童房", "1204门外", "消防楼梯", "13层前室", "1304门外"];
    if (game.route.join("|") !== expected.join("|")) {
      setGame((current) => ({ ...current, route: [] }));
      flash("路线无法下发：目击位置、门磁和蓝牙网关记录不能连续衔接");
      return;
    }
    setGame((current) => ({ ...current, childSaved: true, evidence: addUnique(current.evidence, ["childGuide"]), route: [] }));
    if (!game.childSaved) announceMessages([106]);
    flash("现场协查完成：许芷遥已在1304门外消防前室找到并移交民警");
  };

  const submitFatherStatus = (event: FormEvent) => {
    event.preventDefault();
    if (caseStatus !== "dead" || caseDeath !== "alcohol") {
      flash("字段核对失败：写入值与公安协查回函不一致");
      return;
    }
    setGame((current) => ({ ...current, fatherConfirmedDead: true, evidence: addUnique(current.evidence, ["fatherDeath"]) }));
    if (!game.fatherConfirmedDead) announceMessages([107]);
    flash("回函字段已写入：死亡 / 急性酒精中毒；账号规则开始重新计算");
  };

  const replyToFather = (reply: string) => {
    setGame((current) => ({ ...current, fatherReply: reply }));
  };

  const closeFatherChat = () => {
    setGame((current) => ({
      ...current,
      fatherClosure: "archived",
      evidence: addUnique(current.evidence, ["fatherAware"]),
    }));
    if (!game.fatherClosure) announceMessages([5]);
    flash("1304留言会话已保全，异常令牌停止写入");
  };

  const appendCaseRecord = (record: string) => {
    setCaseTimeline((current) => [...current, record].slice(-5));
  };

  const submitFatherTruth = (event: FormEvent) => {
    event.preventDefault();
    if (!fatherDeductionUnlocked) {
      flash("关键证据不足，无法开启1304真相推导");
      return;
    }
    const expected = ["incident", "death", "door-off", "child-path", "message-token"];
    if (caseTimeline.join("|") !== expected.join("|")) {
      setCaseTimeline([]);
      flash("记录链未通过：所选材料不能按时间连续证明事故附件、主体状态和当前活动对象");
      return;
    }
    setGame((current) => ({ ...current, fatherResolved: true, evidence: addUnique(current.evidence, ["fatherTruth"]) }));
    if (!game.fatherResolved) announceMessages([4]);
    flash("记录时序已锁定。系统正在载入既有处置策略");
  };

  const submitRoomPassword = (event: FormEvent) => {
    event.preventDefault();
    if (normalizeText(roomPassword) !== "11042713") {
      flash("共享密码错误");
      return;
    }
    setGame((current) => ({ ...current, colleagueAccess: true }));
    flash("1104内部记录已解密");
  };

  const submitWall = (event: FormEvent) => {
    event.preventDefault();
    if (wallWidth !== "42" || wallSignal !== "hidden" || wallArchive !== "transfer") {
      flash("复核未通过：测量、信号或流程结论不一致");
      return;
    }
    setGame((current) => ({ ...current, colleagueSolved: true, evidence: addUnique(current.evidence, ["bodyWall", "internalTransfer"]) }));
    if (!game.colleagueSolved) announceMessages([110]);
    flash("1104复核成立：警方破拆西墙空腔，发现周明川遗体");
  };

  const submitCredentialDecrypt = (event: FormEvent) => {
    event.preventDefault();
    if (normalizeText(credentialCipher) !== normalizeText(MINGCHUAN_PASSWORD)) {
      flash("解密失败：按房号、墙体缺失厚度、员工状态修改次数重新排列");
      return;
    }
    setGame((current) => ({ ...current, colleagueCredentialsRecovered: true }));
    setSelectedAccount(MINGCHUAN_ACCOUNT);
    flash("周明川的已注销账号与本地密码已恢复");
  };

  const openLegacyFile = (fileId: string) => {
    setLegacyFileId(fileId);
    writeAppRoute(`/system/legacy/${fileId}`);
    setGame((current) => {
      const legacyRead = addUnique(current.legacyRead, [fileId]);
      const completesEvidenceSet = legacyRead.length === legacyFiles.length && !current.legacyBreachSeen && !current.legacyAccountCollapsed;
      return {
        ...current,
        legacyRead,
        legacyCameraPending: current.legacyCameraPending || completesEvidenceSet,
      };
    });
  };

  const stopLegacyCamera = () => {
    legacyCameraStream.current?.getTracks().forEach((track) => track.stop());
    legacyCameraStream.current = null;
    if (legacyCameraVideo.current) legacyCameraVideo.current.srcObject = null;
  };

  const beginLegacyBreach = (delay: number) => {
    if (legacyTimer.current !== null) window.clearTimeout(legacyTimer.current);
    legacyTimer.current = window.setTimeout(() => {
      legacyTimer.current = null;
      stopLegacyCamera();
      setLegacyCameraState("idle");
      setLegacyCameraError("");
      setGame((current) => ({ ...current, legacyBreachSeen: true, legacyCameraPending: false }));
      setLegacyBreachStage("question");
    }, delay);
  };

  const continueLegacyWithoutCamera = (reason = "终端未检测到可用画面。正在改用历史身份特征。") => {
    legacyCameraRequestToken.current += 1;
    stopLegacyCamera();
    setLegacyCameraState("fallback");
    setLegacyCameraError(reason);
    beginLegacyBreach(LEGACY_CAMERA_FALLBACK_MS);
  };

  const requestLegacyCamera = async () => {
    if (legacyCameraState === "requesting") return;
    const requestToken = ++legacyCameraRequestToken.current;
    let requestTimeout: number | null = null;
    setLegacyCameraState("requesting");
    setLegacyCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new DOMException("Camera API unavailable", "NotSupportedError");
      const cameraRequest = navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      void cameraRequest.then((lateStream) => {
        if (requestToken !== legacyCameraRequestToken.current) lateStream.getTracks().forEach((track) => track.stop());
      }).catch(() => undefined);
      const stream = await Promise.race([
        cameraRequest,
        new Promise<MediaStream>((_, reject) => {
          requestTimeout = window.setTimeout(() => reject(new DOMException("Camera request timed out", "TimeoutError")), LEGACY_CAMERA_REQUEST_TIMEOUT_MS);
        }),
      ]);
      if (requestTimeout !== null) window.clearTimeout(requestTimeout);
      if (requestToken !== legacyCameraRequestToken.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      legacyCameraStream.current = stream;
      setLegacyCameraState("active");
      beginLegacyBreach(LEGACY_CAMERA_PREVIEW_MS);
    } catch (error) {
      if (requestTimeout !== null) window.clearTimeout(requestTimeout);
      if (requestToken !== legacyCameraRequestToken.current) return;
      legacyCameraRequestToken.current += 1;
      const errorName = error instanceof DOMException ? error.name : "";
      continueLegacyWithoutCamera(errorName === "NotAllowedError"
        ? "摄像头权限被拒绝。画面中没有人，正在改用历史身份特征。"
        : errorName === "NotFoundError"
          ? "未检测到摄像头。画面中没有人，正在改用历史身份特征。"
          : errorName === "TimeoutError"
            ? "授权等待超时。画面中没有人，正在改用历史身份特征。"
            : "无法启动摄像头。画面中没有人，正在改用历史身份特征。");
    }
  };

  const disconnectLegacyAccount = () => {
    legacyCameraRequestToken.current += 1;
    if (legacyTimer.current !== null) window.clearTimeout(legacyTimer.current);
    stopLegacyCamera();
    setLegacyCameraState("idle");
    setLegacyCameraError("");
    const savedGame: GameState = { ...game, started: true, activeAccount: "CJ-0713", view: "home", activeArticle: null, legacyAccountCollapsed: true };
    localStorage.setItem(SAVE_KEY, JSON.stringify(savedGame));
    setLegacyBreachStage("none");
    setLegacyFileId(null);
    setGame({ ...savedGame, started: false });
    setEntryStage("login");
    setLoginMethod("password");
    setSelectedAccount("CJ-0713");
    setEmployeeIdInput("");
    setLoginPassword("");
    setLoginError("");
    writeAppRoute("/login");
  };

  const submitIdentity = (event: FormEvent) => {
    event.preventDefault();
    if (normalizeText(homeWoman) !== "1404" || homeEmployee !== "2025-11-05" || normalizeText(homeDevice) !== "dl1105") {
      flash("字段核验失败：请按原始凭证填写，不要提交关系结论");
      return;
    }
    setMemoryAnchors([]);
    setGame((current) => ({ ...current, memoryRewriteStage: "running" }));
    if (game.memoryRewriteStage !== "running") announceMessages([116]);
    flash("核验已提交。员工一致性服务正在接管当前中台");
  };

  const appendMemoryAnchor = (recordId: string) => {
    setMemoryAnchors((current) => current.includes(recordId) ? current.filter((id) => id !== recordId) : [...current, recordId].slice(-3));
  };

  const resistMemoryRewrite = () => {
    const expected = ["crash", "ashes", "voice"];
    if (memoryAnchors.length !== expected.length || memoryAnchors.some((id, index) => id !== expected[index])) {
      setMemoryAnchors([]);
      flash("阻断失败：所选记录并非可外部核验的原始时间链，覆盖写入仍在继续");
      return;
    }
    setGame((current) => ({
      ...current,
      memoryRewriteStage: "resisted",
      homeSolved: true,
      evidence: addUnique(current.evidence, ["marriage"]),
    }));
    if (!game.homeSolved) announceMessages([7, 111, 117]);
    flash("覆盖写入已阻断：本机保留了未校正的主体关系记录");
  };

  const chooseEnding = (ending: Exclude<Ending, null>) => {
    setEndingStep(0);
    setGame((current) => ({ ...current, ending, view: "ending", activeArticle: null }));
    writeAppRoute(`/system/ending/${ending}`);
  };

  const goHome = () => {
    setGame((current) => ({ ...current, view: "home", activeArticle: null }));
    writeAppRoute("/system/home");
  };

  const goSearchResults = () => {
    setGame((current) => ({ ...current, view: "search", activeArticle: null }));
    writeAppRoute(`/system/search/${encodeURIComponent(game.lastQuery)}`);
  };

  const restartGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setEndingStep(0);
    setGame({ ...initialGame, started: true });
    writeAppRoute("/system/home");
  };

  const lockedReason = (article: ArticleMeta) => {
    if (article.id === "cctv-1204") return "需要先阅读投诉工单";
    if (article.id === "audio-1304") return "需要先确认工程检测异常";
    if (article.id === "clinic-child") return "需要先确认1204登记冲突";
    if (article.id === "register-child") return "协查材料尚未核对";
    if (article.id === "rescue-route") return "需要监控证据及协查对象登记";
    if (article.id === "case-correction") return "需要获救记录、净化声纹、事故附件及异地行程凭证";
    if (["employee-sync", "room-1104"].includes(article.id)) return "当前案件尚未完成档案纠偏";
    if (article.id === "workorder-1404") return "需要完成1104工程复核及恒目复训附件核验";
    if (article.id === "w04-directory") return "需要先受理1404住户投诉工单";
    if (article.id === "care-w04") return "需要先解开1404住户关怀索引";
    if (article.id === "church-compliance") return "合规级别不足";
    if (article.id === "on-site-device") return "需要先解开1404重点回访记录";
    if (article.id === "crash-cj0713") return "需要先解开1404特殊保管物登记";
    if (article.id === "identity-1404") return "事故及资产证据不完整";
    if (article.id === "clock-out") return "记忆校正尚未阻断";
    return "前置材料尚未满足";
  };

  const renderProtectedArticleGate = (articleId: ProtectedArticleId) => {
    const gate = protectedArticleGates[articleId];
    const level = PROTECTED_ARTICLE_IDS.indexOf(articleId) + 1;
    const monitorCopy = [
      "授权请求仅在当前物业终端计算，不向住户端发送。",
      "冷备份正在比对当前员工岗位字段与历史接触序列。",
      "资产库正在读取当前终端、保管地址与分类字段的关联。",
      "跨系统协查已启用当前操作者一致性观察。请保持在摄像头可识别区域。",
    ][level - 1];
    return <section className={`protected-article-gate protected-article-gate--${level}`}>
      <header><EyeMark /><div><span>{gate.code}</span><h2>{gate.title}</h2><p>{monitorCopy}</p></div><b>0{level} / 04</b></header>
      <div className="protected-gate-clue"><span>口令恢复说明</span><strong>{gate.source}</strong><p>{gate.hint}</p></div>
      <form onSubmit={(event) => submitProtectedArticlePassword(event, articleId)}>
        <label htmlFor={`protected-password-${articleId}`}>派生访问口令</label>
        <div><input id={`protected-password-${articleId}`} className={articlePasswordRejected ? "is-rejected" : ""} value={articlePasswordInput} onChange={(event) => { setArticlePasswordInput(event.target.value); setArticlePasswordRejected(false); }} placeholder={articlePasswordRejected ? "口令不匹配" : "输入从相关档案中推导出的口令"} autoComplete="off" spellCheck={false}/><button>解密档案</button></div>
      </form>
      <footer><span>当前账号</span><strong>CJ-0713 / 物业管理员</strong><small>口令不保存在本页面正文中</small></footer>
    </section>;
  };

  const renderArticleVerification = (articleId: string) => {
    const copy = articleVerificationCopy[articleId];
    if (!copy) return null;
    const confirmed = game.inspectedArticles.includes(articleId);
    return <section className={`article-verification ${confirmed ? "is-confirmed" : ""}`}>
      <div><span>{copy.title}</span><strong>{confirmed ? copy.confirmed : "正文仅代表发现，尚未形成关键证据"}</strong><p>{copy.description}</p></div>
      <button type="button" disabled={confirmed} onClick={() => confirmArticleEvidence(articleId)}>{confirmed ? "已写入证据台账" : copy.action}</button>
    </section>;
  };

  const renderArticleBody = (id: string) => {
    if (isProtectedArticle(id) && !hasUnlockedArticle(game, id)) return renderProtectedArticleGate(id);
    if (id === "workorder-1204") return <>
      <div className="workorder-document">
        <header className="workorder-sheet-head"><div><span>澄江物业服务中心 / 客服工单</span><strong>夜间异常噪声投诉</strong><small>系统流水号：W-0713-019 · 第3次重新开启</small></div><aside><i>高优先级</i><b>待复核</b></aside></header>

        <dl className="workorder-meta-grid"><div><dt>受理渠道</dt><dd>住户端小程序</dd></div><div><dt>首次报事</dt><dd>2026-07-09 00:12</dd></div><div><dt>本次重开</dt><dd>2026-07-13 00:12</dd></div><div><dt>响应时限</dt><dd>4小时</dd></div><div><dt>服务区域</dt><dd>澄江公寓1号楼1204</dd></div><div><dt>疑似来源</dt><dd>澄江公寓1号楼1304</dd></div><div><dt>工单类型</dt><dd>噪声扰民 / 疑似漏水</dd></div><div><dt>责任班组</dt><dd>工程维修组 · 待复核</dd></div></dl>

        <section className="workorder-section"><header><b>01</b><div><h3>报事信息</h3><span>客服原始录入，房屋关系待复核</span></div></header><div className="complainant-card"><dl><div><dt>报事人</dt><dd>许先生</dd></div><div><dt>联系电话</dt><dd>138 **** 2041</dd></div><div><dt>自述身份</dt><dd>1204住户</dd></div></dl><aside><span>资料状态</span><strong>待复核</strong><p>本工单未附产权证明、租赁备案或家庭成员材料。以上身份仅为报事人自述，不作为房屋关系结论。</p></aside></div></section>

        <section className="workorder-section"><header><b>02</b><div><h3>投诉内容</h3><span>客服原始录入，不代表现场结论</span></div></header><p className="workorder-description">报事人称，自7月9日起，1204北侧卧室顶面每日夜间出现连续滴水声。声音约在<mark>00:04</mark>开始，于<mark>00:10</mark>停止，持续约六分钟，期间频率稳定。顶面肉眼未见水渍，触摸无潮湿。报事人曾自行前往1304敲门，连续三晚无人应答，要求物业核查楼上用水及实际居住情况。</p><div className="workorder-tags"><span>重复发生</span><span>固定时段</span><span>无可见水迹</span><span>楼上无人应答</span></div></section>

        <section className="workorder-section"><header><b>03</b><div><h3>受理通话节选</h3><span>CALL-W0713-019-03 · 录音时长 02:16</span></div></header><div className="call-transcript"><p><time>00:34</time><b>客服 CS-046</b><span>请问您能确认声音来自楼上1304，而不是室内管道吗？</span></p><p><time>00:41</time><b>报事人</b><span>能。它就在卧室顶上，一滴一滴的，每天都是同一个时间。</span></p><p><time>01:08</time><b>客服 CS-046</b><span>白天复查没有发现漏水，工程人员会继续联系楼上住户。</span></p><p><time>01:17</time><b>报事人</b><span>那不是水管。水管不会每天只响六分钟。</span></p><p className="is-anomalous"><time>01:29</time><b>报事人</b><span>1304到底还有没有人住？你们每次都说联系不上，总得核实实际居住情况吧。</span></p></div><small className="transcript-note">质检备注：报事人要求升级为空置房占用核查；客服未承诺入户，仅记录门禁与用水复核需求。</small><button type="button" className="callback-inline-link" onClick={openCallbackCenter}>打开本次回访质检目录 →</button></section>

        <section className="workorder-section"><header><b>04</b><div><h3>历次处理记录</h3><span>按系统写入时间排序</span></div></header><div className="workorder-history"><article><time>07-09 08:40</time><i className="is-done"/><div><strong>工程维修组 / 陈工</strong><p>入户检查1204卧室顶面，未见水迹、起皮或返碱；手持式检测仪多点复测未见异常。1304无人应答，未入户检查。</p></div></article><article><time>07-09 09:05</time><i className="is-done"/><div><strong>客服中心 / CS-046</strong><p>电话联系1304登记号码，无人接听；上门按铃两次，无人应答。</p></div></article><article><time>07-12 15:26</time><i className="is-done"/><div><strong>工程维修组 / 陈工</strong><p>后台核对1304远传水表，近24小时读数无变化。投诉人拒绝撤单，要求在异常发生时段继续复核。</p></div></article><article className="is-current"><time>07-13 08:41</time><i/><div><strong>系统派单 / CJ-0713</strong><p>因相同时段连续三次报事，工单自动重新开启，并转长期空置房管理岗复核。</p></div></article></div></section>

        <section className="workorder-section"><header><b>05</b><div><h3>附件与关联材料</h3><span>点击关联材料可直接进入对应档案</span></div></header><div className="workorder-attachments"><div><i>WAV</i><p><strong>受理通话原始录音</strong><span>CALL-W0713-019-03 · 2.8 MB</span></p><b>已在本页转写</b></div><div><i>JPG</i><p><strong>1204卧室顶面现场照片</strong><span>3张 · 07-12 15:28上传</span></p><b>本工单附件</b></div><button type="button" className="is-related" onClick={() => openRelatedArticle("meter-1304")}><i>ENG</i><p><strong>1204卧室顶面渗漏排查记录</strong><span>关联工程记录 · ENG-1304-0712</span></p><b>打开档案 →</b></button><button type="button" className="is-related" onClick={() => openRelatedArticle("cctv-1204")}><i>CAM</i><p><strong>12层公共区域事件录像</strong><span>建议时段 00:04—00:10 · CAM-12F-02</span></p><b>打开档案 →</b></button></div></section>

        <aside className="workorder-audit"><div><span>系统审计提示 / IDENTITY REVIEW REQUIRED</span><strong>报事人的房屋关系尚未核验</strong><p>紧急报事已先行受理。结单前需另行核对房屋台账、历史服务授权及实际占用情况；本工单不提供核验结论。</p></div><b>待调查</b></aside>
        <footer className="workorder-signoff"><span>当前处理人：CJ-0713</span><span>生成时间：2026-07-13 08:43</span><span>数据来源：客服、工程、门禁联合工单</span></footer>
      </div>
    </>;

    if (id === "vacancy-1204") return <>
      <table className="data-table"><tbody><tr><th>产权登记</th><td><mark>陈大国</mark> · 不动产权证尾号 4417</td></tr><tr><th>产权状态</th><td>限制处分 / 登记电话连续三个月无法接通</td></tr><tr><th>公开信息索引</th><td>姓名存在同名经侦协查记录，系统未自动确认身份</td></tr><tr><th>历史服务</th><td>存在已终止的定时入户服务，联系人字段存于客户服务排班</td></tr><tr><th>服务终止</th><td>2026-03-31（续费停止）</td></tr><tr><th>异常门禁</th><td>2026-04-03起每日出现</td></tr><tr><th>登记儿童</th><td className="danger-text">0人</td></tr></tbody></table>
      <section className="field-record"><header><span>VACANCY INSPECTION / Q-018</span><strong>7月9日现场巡检摘录</strong></header><div><p><time>08:37</time><b>入户</b><span>机械钥匙封条完整，授权保洁钥匙未在前台借出；入户门内侧有新装防撞垫。</span></p><p><time>08:41</time><b>厨房</b><span>冷藏室温度4.8℃，有当周生产的鲜奶和拆封蔬菜；燃气阀关闭，电磁炉表面尚有清洁水痕。</span></p><p><time>08:43</time><b>次卧</b><span>单人床铺设儿童尺寸床品，书桌下发现28码运动鞋包装盒；清点单未列入上述物品。</span></p><p><time>08:48</time><b>离场</b><span>未接触住户私人物品，重新粘贴钥匙封条并上传四张原始照片。</span></p></div></section>
      <div className="shoe-evidence-photo">
        <Image src={assetPath("/evidence/1204-child-shoes.png")} alt="1204门外发现的儿童童鞋与潮湿脚印" fill sizes="(max-width: 900px) 100vw, 62vw" unoptimized />
        <div className="shoe-evidence-overlay"><span>现场巡检影像 / IMG-1204-0709-04</span><b>拍摄时间 2026-07-09 08:43</b></div>
        <aside><strong>证物 04</strong><p>儿童魔术贴运动鞋<br />鞋内发现卡片边角</p></aside>
      </div>
      <div className="evidence-photo-meta"><span>位置：1204入户门外</span><span>拍摄人：巡检员 Q-018</span><span>原始文件未修改</span></div>
      <p>巡检照片显示厨房存在新鲜食材，次卧出现儿童床品。门外<mark>童鞋</mark>约28码，未列入空置房清点单；鞋内卡片边角与门侧潮湿脚印需要单独调取。</p>
      <aside className="article-note"><strong>待交叉核验</strong><p>产权人姓名命中一条公开信息收录，但同名结果不能作为结论。可检索<mark>陈大国</mark>或<mark>经侦通报</mark>，核对证件尾号与通报住址；历史授权人员则需从客户服务档案检索<mark>定时服务</mark>或<mark>履约排班</mark>。</p></aside>
      <div className="document-stamp">空置状态未撤销</div>
    </>;

    if (id === "scheduled-service-1204") return <>
      <div className="service-roster-head"><span>CUSTOMER SERVICE / Q2 SCHEDULE</span><strong>1号楼定时入户服务排班</strong><small>按计划日期排序 · 含已终止服务</small></div>
      <div className="service-roster-scroll"><table className="data-table service-roster-table"><thead><tr><th>房号</th><th>服务项目</th><th>预约/签收</th><th>计划</th><th>当前状态</th></tr></thead><tbody>
        <tr><td>0708</td><td>绿植养护</td><td>吴彩芬 / 本人</td><td>每周三</td><td>正常履约</td></tr>
        <tr><td>0906</td><td>净水滤芯更换</td><td>罗致远 / 前台代收</td><td>季度一次</td><td>等待配件</td></tr>
        <tr className="is-anomalous"><td>1204</td><td>室内保洁</td><td>许建国 / 赵秀兰</td><td>每月两次</td><td>03-31终止</td></tr>
        <tr><td>1401</td><td>信件代收转交</td><td>顾慧 / 本人</td><td>每周五</td><td>暂停一次</td></tr>
        <tr><td>1602</td><td>独居住户物资代办</td><td>潘月华 / 护工签收</td><td>每周一</td><td>正常履约</td></tr>
        <tr><td>1803</td><td>空调滤网清洗</td><td>宋明礼 / 租户签收</td><td>双月一次</td><td>已改期</td></tr>
      </tbody></table></div>
      <section className="field-record"><header><span>SERVICE TRACE / 1204</span><strong>1204服务终止前后记录</strong></header><div><p><time>03-18 09:12</time><b>最后履约</b><span>赵秀兰现场签字，保洁人员归还一次性门禁授权。</span></p><p><time>03-31 18:00</time><b>停止派单</b><span>预约联系人许建国未续费，系统关闭后续保洁计划。</span></p><p><time>04-03 07:46</time><b>门禁事件</b><span>原服务关联卡再次进入1号楼；当日没有保洁工单、人员排班或前台钥匙借用。</span></p><p><time>04-04起</time><b>持续出现</b><span>同一关联卡几乎每日通行，客户服务系统没有生成新的履约记录。</span></p></div></section>
      <aside className="article-note">排班表只能证明两人曾以服务联系人身份进入1204，不能自动证明产权、租赁或家庭关系。服务终止后的持续门禁需要与空置巡检原图另行核对。</aside>
      {renderArticleVerification("scheduled-service-1204")}
    </>;

    if (id === "owner-chen-public-notice") return <>
      <article className="news-clipping">
        <header><span>东临晚报 · 经济与法治</span><time>2024年11月18日 星期一</time></header>
        <h2>和裕供应链财务负责人被列为在逃人员</h2>
        <p className="news-deck">警方通报称涉案人员在审计启动前离境，案件仍在进一步侦办</p>
        <div className="news-byline"><span>本报记者 周启明</span><span>来源：东临市公安局经侦支队协查通报</span></div>
        <div className="news-columns">
          <p>本报讯　东临市公安局经侦支队昨日发布协查通报：和裕供应链管理有限公司原财务负责人陈某国，涉嫌在多个物业改造项目结算期间转移代管款项。公司于2024年10月启动专项审计后，该人员未再到岗，登记电话持续关机。</p>
          <p>通报显示，陈某国于10月29日离开东临，11月2日从南部口岸出境，此后未按通知到案说明。警方已将其列为在逃人员，并向相关单位征集资金往来及实际居住线索。通报公布的证件号码末四位为<mark>4417</mark>，户籍以外的最后登记住址为<mark>澄江公寓1号楼1204</mark>。</p>
          <p>部分转载标题将其描述为“畏罪潜逃”。经侦部门在答复记者时表示，该案仍处侦查阶段，协查通报仅用于查找犯罪嫌疑人及涉案线索，不代表法院已作出生效判决。</p>
          <p>和裕供应链一名工作人员称，涉案人员离境前曾要求暂停其名下住宅的长期家政续费，但未办理房屋转让或委托管理手续。该说法尚未得到办案机关确认。</p>
        </div>
        <footer>馆藏编号：DLRB-20241118-B06 · 数字化日期：2025-01-07 · 本系统仅收录公开报道</footer>
      </article>
      <table className="data-table identity-crosscheck"><tbody><tr><th>物业产权档案</th><td>陈大国 · 不动产权证尾号 4417</td></tr><tr><th>公开协查通报</th><td>陈某国 · 证件号码末四位 4417</td></tr><tr><th>地址字段</th><td>双方均指向澄江公寓1号楼1204</td></tr><tr><th>系统判断</th><td>三项字段一致；需由调查人自行决定是否视为同一人</td></tr></tbody></table>
      <aside className="article-note"><strong>收录说明</strong><p>“畏罪潜逃”来自媒体转载标题，不是司法结论。物业系统没有办案权限，也没有收到产权人授权；这条公开信息只能解释房主为何失联，不能证明目前居住在1204的人是谁。</p></aside>
    </>;

    if (id === "meter-1304") return <>
      <div className="metric-strip"><div><span>1204顶面检查</span><strong>无水迹</strong><small>未见起皮、返碱</small></div><div><span>1304远传水表</span><strong>读数无变化</strong><small>近24小时后台数据</small></div><div><span>异常声响</span><strong>6 min</strong><small>报事人称每日重复</small></div></div>
      <table className="data-table"><tbody><tr><th>检测人员</th><td>工程维修组 陈工 / 物业陪同 Q-018</td></tr><tr><th>顶面测点</th><td>P1—P6，含水率6.1%—7.0%，与同层基准差小于0.4%</td></tr><tr><th>水表设备</th><td>WM-1304-02，最近心跳 07-13 08:15，通讯状态正常</td></tr><tr><th>曲线区间</th><td>07-12 23:45—07-13 00:20，最小分辨率0.001m³，累计量无变化</td></tr><tr><th>入户边界</th><td>1304无人应答，本记录不包含室内管线和洁具检查</td></tr></tbody></table>
      <p>本次仅进入1204检查，1304因无人应答未入户。现场迹象及远传水表数据暂不支持持续渗漏结论。经报事人同意，工程人员在1204卧室顶面布置临时接触式拾振器，次日取回的数据在固定时段记录到稳定冲击信号，建议调取<mark>声纹分轨</mark>。</p>
      <aside className="article-note">工程边界：零用水只能排除通过1304计量表的持续供水，不能单独证明声音性质，也不能证明1304室内是否有人。</aside>
      {renderArticleVerification("meter-1304")}
    </>;

    if (id === "cctv-1204") {
      const frame = game.nightFrames.at(-1)?.replace(":", "") || "2358";
      const reviewPoints = [
        ["23:58", "SEQ 88410", "走廊事件"],
        ["00:04", "SEQ 88862", "走廊事件"],
        ["00:07", "SEQ 89114", "消防前室"],
        ["00:10", "SEQ --", "丢帧 18s"],
        ["00:12", "SEQ 88410", "走廊事件"],
      ];
      const timeOptions = ["23:58", "00:04", "00:07", "00:10", "00:12"];
      return <>
        <section className="cctv-event-review">
          <header><div><span>CAM-12F-02 / EVENT REVIEW</span><strong>事件片段串联回放</strong></div><b>5段 · 13.7秒</b></header>
          <div className="cctv-video-shell"><video ref={cctvVideoRef} controls playsInline preload="metadata" poster={assetPath("/cctv/cam-2358.png")} aria-label="12层公共区域五段事件录像串联回放" onPlay={() => setCctvVideoPlaying(true)} onPause={() => setCctvVideoPlaying(false)} onEnded={() => setCctvVideoPlaying(false)}><source src={assetPath("/cctv/cam-12f-event-review.mp4")} type="video/mp4" />当前浏览器无法播放监控回放，请使用下方逐帧复核。</video><div className="camera-overlay"><span>智能检索回放</span><span>原始片段未改写</span><span>REC</span></div>{!cctvVideoPlaying && <button type="button" className="cctv-video-play" onClick={playCctvReview} aria-label="播放事件回放" title="播放事件回放"><span aria-hidden="true">▶</span></button>}</div>
          <footer><span>录像类型：事件触发切片</span><span>时间范围：07-12 23:58—07-13 00:12</span><span>片段间不代表连续录像</span></footer>
        </section>
        <div className="article-note"><strong>复核说明</strong><p>播放器只把系统保留的五段事件切片按时间排序，不能用片段之间的跳切推断人员移动。请将画面与下方序列号、门禁和消防门磁日志交叉核对。</p></div>
        <div className="frame-picker">{reviewPoints.map(([time, sequence, note]) => <button type="button" key={time} className={game.nightFrames.includes(time) ? "is-selected" : ""} onClick={() => reviewFrame(time)}><i />{time}<small>{sequence} · {note}</small></button>)}</div>
        <div className="camera-feed search-camera"><Image src={assetPath(`/cctv/cam-${frame}.png`)} alt={`12层公共区域监控复核帧 ${game.nightFrames.at(-1) || "23:58"}`} fill sizes="(max-width: 900px) 100vw, 62vw" unoptimized/><div className="camera-overlay"><span>CAM-12F-02</span><span>逐帧复核</span><span>{game.nightFrames.at(-1) || "23:58"}</span></div></div>
        <table className="data-table cctv-audit-log"><tbody><tr><th>23:58:46</th><td>画面序列88410；1204门磁保持关闭；公共区域无告警。</td></tr><tr><th>00:04:02</th><td>画面序列88862；前后30秒无门禁、门磁或电梯呼梯记录。</td></tr><tr><th>00:07:11</th><td>画面序列89114；12层消防门磁于00:07:37记录开启，设备时钟慢26秒。</td></tr><tr><th>00:10:00</th><td>网络抖动导致18秒丢帧；本段只可判定录像异常，不能确认人员去向。</td></tr><tr><th>00:12:14</th><td>服务器返回序列88410；文件校验值与23:58:46切片完全一致。</td></tr></tbody></table>
        <form className="cctv-analysis" onSubmit={submitCctvReview}>
          <header><span>人工复核单 / CAM-12F-02</span><strong>选择所有出现画面、通道或录像数据异常的时间节点</strong></header>
          <div className="cctv-anomaly-options">{timeOptions.map((time) => {
            const selected = cctvAnomalyTimes.includes(time);
            return <label key={time} className={selected ? "is-selected" : ""}><input type="checkbox" checked={selected} onChange={() => toggleCctvAnomalyTime(time)} disabled={game.surveillanceSolved}/><span><b>{time}</b><small>事件切片</small></span></label>;
          })}</div>
          <button className="primary-button" disabled={game.surveillanceSolved}>{game.surveillanceSolved ? "监控复核已归档" : "提交监控复核"}</button>
        </form>
      </>;
    }

    if (id === "audio-1304") return <>
      <p>数据来自工程临时拾振器及公共区域环境麦克风，仅用于漏水定位。系统已按听感拆成四条同步声轨；播放样本，静音你认为与投诉无关的背景声，保留需要继续调查的声音。</p>
      <section className={`field-audio-monitor ${fieldAudioPlaying ? "is-playing" : ""}`}>
        <div className="field-audio-media" aria-hidden="true">{FIELD_AUDIO_TRACKS.map((track) => <audio key={track.key} ref={(element) => { if (element) fieldAudioElements.current[track.key] = element; else delete fieldAudioElements.current[track.key]; }} src={assetPath(`/audio/field-${track.key}.wav`)} preload="auto" loop />)}</div>
        <header><div><span>FIELD RECORDER / FR-0713-0004</span><strong>00:04:12—00:04:30 同步拾振样本</strong></div><button type="button" className="field-audio-toggle" onClick={() => void toggleFieldAudio()} title={fieldAudioPlaying ? "停止播放" : "播放拾振样本"}><i aria-hidden="true"/><span>{fieldAudioPlaying ? "停止播放" : "播放拾振样本"}</span></button></header>
        <div className="field-audio-timeline"><div><i style={{ width: `${(fieldAudioPosition / FIELD_AUDIO_DURATION) * 100}%` }}/></div><time>{formatFieldAudioTime(fieldAudioPosition)} / 00:18</time><span>PCM 22.05 kHz · 4 CH · LOOP</span></div>
      </section>
      <div className={`audio-tracks ${fieldAudioPlaying ? "is-playing" : ""}`}>{FIELD_AUDIO_TRACKS.map((track) => {
        const muted = game.mutedTracks.includes(track.key);
        return <button type="button" key={track.key} className={muted ? "is-muted" : ""} aria-pressed={muted} onClick={() => toggleTrack(track.key)} title={`${track.code} ${muted ? "恢复监听" : "静音"}`}><span>{track.code}</span><div className="waveform" aria-hidden="true">{Array.from({ length: 18 }).map((_, index) => <i key={index} style={{ height: `${8 + ((index * 13) % 28)}px`, animationDelay: `${-index * 73}ms` }} />)}</div><strong>{game.audioSolved ? track.resolved : track.label}</strong><small>{muted ? "已静音" : game.audioSolved ? "声源已归类" : track.note}</small></button>;
      })}</div>
      <button className="primary-button" onClick={submitAudio}>{game.audioSolved ? "关键声道已保存" : "保存净化声纹"}</button>
    </>;

    if (id === "clinic-child") return <>
      <div className="child-health-record">
        <header><div><span>东临妇幼保健中心</span><strong>儿童健康信息卡</strong></div><b>拾获物证复印件</b></header>
        <div className="child-health-body">
          <div className="child-health-photo"><Image src={assetPath("/evidence/xu-zhiyao-health-photo.png")} alt="许芷遥健康档案照片" fill sizes="185px" unoptimized /><span>拍摄：2025-10-12</span></div>
          <section><strong>许芷遥</strong><small>档案号：DL-2020-0412-██</small><dl><div><dt>性别</dt><dd>女</dd></div><div><dt>出生日期</dt><dd>2020-04-12</dd></div><div><dt>监护人</dt><dd>许建国、赵秀兰</dd></div><div><dt>监护关系</dt><dd>婚生子女</dd></div><div><dt>最后登记住址</dt><dd>外区集体宿舍</dd></div><div><dt>本楼住户登记</dt><dd className="danger-text">无记录</dd></div></dl></section>
        </div>
        <footer><span>拾获位置：1204门外左侧童鞋内</span><span>卡片状态：轻微受潮</span></footer>
      </div>
      <section className="field-record"><header><span>FOUND PROPERTY / CHAIN OF CUSTODY</span><strong>拾获物交接记录</strong></header><div><p><time>07-09 08:44</time><b>发现</b><span>巡检员在左脚童鞋鞋垫下发现卡片，未从住户室内取物。</span></p><p><time>07-09 08:52</time><b>封装</b><span>前台使用失物袋 FP-0713-26 封装，双人签名；卡片右下角受潮，正面信息可辨认。</span></p><p><time>07-13 08:46</time><b>调阅</b><span>因未成年人协查申请复印件，原件继续封存并等待民警接收。</span></p></div></section>
      <p>鞋盒购买小票日期为2026-04-03，与1204首次异常门禁同日。该时间关联只能说明物品进入房屋的大致区间；住户系统中仍没有许芷遥的入住记录。</p>
    </>;

    if (id === "register-child") return <>
      <div className="callout"><strong>紧急协查对象登记</strong><p>未成年人失联不受住户登记状态限制。此表仅用于报警协查、公共区域录像调阅和现场辨认，不补录产权、租赁或常住关系。</p></div>
      <form className="archive-form" onSubmit={submitChild} autoComplete="off">
        <label>儿童姓名<input value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="输入中文姓名" /></label>
        <label>出生日期<input type="date" value={childBirthday} onChange={(event) => setChildBirthday(event.target.value)} /></label>
        <label>父亲姓名<input value={childFather} onChange={(event) => setChildFather(event.target.value)} placeholder="按监护材料填写" /></label>
        <label>母亲姓名<input value={childMother} onChange={(event) => setChildMother(event.target.value)} placeholder="按监护材料填写" /></label>
        <label>与报警人关系<select value={childRelation} onChange={(event) => setChildRelation(event.target.value)}><option value="">选择</option><option value="child">报警人监护子女</option><option value="relative">其他同行未成年人</option><option value="unknown">关系待核</option></select></label>
        <label>最后确认日期<input type="date" value={childLastDate} onChange={(event) => setChildLastDate(event.target.value)} /></label>
        <label>报警回执编号<input value={childPoliceRef} onChange={(event) => setChildPoliceRef(event.target.value)} placeholder="按家属留言填写" autoCapitalize="characters" spellCheck={false} /></label>
        <button className="primary-button">{game.childRegistered ? "协查对象已登记" : "提交协查登记"}</button>
      </form>
    </>;

    if (id === "rescue-route") return <>
      <div className="callout"><strong>现场调度原则</strong><p>请从最后确认位置开始，选择五个连续搜索点。不得把无开锁记录的1304室内、没有呼梯记录的电梯或无任何信号的地库列入路线。</p></div>
      <section className={`rescue-visual-route ${game.childSaved ? "is-complete" : ""}`}>
        <header><div><span>RESCUE PATH / VISUAL RECONSTRUCTION</span><strong>失联儿童搜索路线</strong></div><b>{game.childSaved ? "已移交民警" : `${game.route.length} / 5`}</b></header>
        {game.childSaved ? <figure className="route-rescue-result">
          <Image src={assetPath(rescueResultScene.image)} alt={rescueResultScene.alt} fill sizes="(max-width: 900px) 100vw, 72vw" unoptimized />
          <div className="route-scene-vignette" />
          <figcaption><span>00:08 / 13层西侧消防前室</span><strong>许芷遥已找到。</strong><p>人员位于1304门外相邻前室，无明显外伤。1304门锁全程未开启；墙面低矮影子在现场照明恢复后消失。</p></figcaption>
        </figure> : <>
          <figure className={`route-scene-stage ${activeRescueScene?.supportsRoute ? "has-trace" : "is-excluded"}`}>
            {activeRescueScene && <Image key={activeRescueScene.place} src={assetPath(activeRescueScene.image)} alt={activeRescueScene.alt} fill sizes="(max-width: 900px) 100vw, 72vw" unoptimized />}
            {activeRescueScene && <><div className="route-scene-vignette"/><figcaption><span>{activeRescueScene.time} / {activeRescueScene.signal}</span><strong>{activeRescueScene.place}</strong><p>{activeRescueScene.observation}</p></figcaption><aside className={activeRescueScene.supportsRoute ? "is-anomalous" : "is-clear"}><i/><span>{activeRescueScene.supportsRoute ? "影子未通过目标识别" : "画面已完成复核"}</span><small>{activeRescueScene.review}</small></aside></>}
          </figure>
          <div className="route-scene-strip" aria-label="已选择搜索节点">
            {Array.from({ length: 5 }).map((_, index) => {
              const place = game.route[index];
              const scene = rescueRouteScenes.find((item) => item.place === place);
              return <article key={index} className={`${place ? "is-filled" : ""} ${scene && !scene.supportsRoute ? "is-break" : ""} ${index === game.route.length - 1 ? "is-current" : ""}`}>
                <i>{String(index + 1).padStart(2, "0")}</i>
                {scene && <Image src={assetPath(scene.image)} alt="" fill sizes="150px" unoptimized />}
                <span>{place || "等待选择"}</span>
              </article>;
            })}
          </div>
          <div className="route-map">
            <div className="route-sequence"><div>{game.route.length ? game.route.map((place, index) => <span key={`${place}-${index}`}>{index + 1}. {place}</span>) : <em>从最后确认位置开始建立搜索顺序</em>}</div><button type="button" disabled={!game.route.length} onClick={undoRouteStep}>撤回上一步</button></div>
            <div className="route-options">{rescueRouteOptions.map((place) => <button type="button" key={place} className={game.route.includes(place) ? "is-selected" : ""} disabled={game.route.length >= 5 || game.route.includes(place)} onClick={() => appendRoute(place)}><span>{place}</span><small>{rescueRouteScenes.find((scene) => scene.place === place)?.signal}</small></button>)}</div>
          </div>
        </>}
      </section>
      <table className="data-table"><tbody><tr><th>00:03</th><td>监护人确认许芷遥最后在1204次卧，赤脚，未携带手机。</td></tr><tr><th>00:04</th><td>1204门磁开启一次；走廊画面出现向消防门方向延伸的潮湿童鞋印；同期无电梯呼梯。</td></tr><tr><th>00:05</th><td>儿童手环短暂连接13层西侧公共蓝牙网关，信号强度-72dBm。</td></tr><tr><th>00:07</th><td>12层消防门与13层前室门磁先后开启，校正设备时差后间隔26秒。</td></tr><tr><th>00:08</th><td>13层夜间保洁报告1304门把手有新鲜水迹，屋内无人应答。</td></tr></tbody></table>
      <div className="callout"><strong>证据边界</strong><p>路线画面由现场照片、门磁与痕迹记录合成，不等同于连续监控。现有材料无法证明影子的来源；1304没有合法开锁记录，现场人员只能先搜索门外及消防前室，并等待民警处置室内空间。</p></div>
      <button className="primary-button" disabled={game.childSaved || game.route.length !== 5} onClick={submitRoute}>{game.childSaved ? "协查对象已找到" : game.route.length === 5 ? "下发五点搜索路线" : `还需选择 ${5 - game.route.length} 个搜索点`}</button>
    </>;

    if (id === "resident-1304") return <>
      <div className="resident-profile"><div><span>回访对象</span><strong>顾长河</strong><small>独居关怀 · 连续三次未完成入户</small></div><blockquote>“我前妻早就搬走了，可最近总有人用她的名字敲门。还有个孩子在门外叫人，你们查查是不是有人冒用住户资料。”</blockquote></div>
      <table className="data-table"><tbody><tr><th>重点关怀原因</th><td>长期独居、酒精依赖风险</td></tr><tr><th>前妻</th><td>梁静宜 · 2021年迁出</td></tr><tr><th>家庭成员</th><td>一条历史成员记录被遮蔽</td></tr><tr><th>最后一次本人门禁</th><td>2023-02-07</td></tr></tbody></table>
      <section className="field-record"><header><span>CARE VISIT / 1304</span><strong>最近三次回访执行记录</strong></header><div><p><time>06-14 16:20</time><b>电话回访</b><span>登记号码接通，对方拒绝确认身份证后四位，要求物业删除“家庭成员”字段。</span></p><p><time>06-21 10:05</time><b>上门回访</b><span>门铃无人应答；门外无生活垃圾，门锁电量正常，公共区域录像未见人员进出。</span></p><p><time>06-28 18:43</time><b>电话回访</b><span>同一号码再次接通，背景出现电视声；当班秩序员在1304门外未听见室内声响。</span></p></div></section>
      <aside className="article-note">住户陈述、电话接通和实际在场是三个不同事实。前台不得据此填写报事人身份，也不得把陈述中的“前妻”“孩子”自动恢复为在住成员。</aside>
    </>;

    if (id === "height-mark") return <>
      <div className="photo-placeholder height-photo"><span>工程影像 / IMG_1304_0819</span><div className="height-line"><i /><b>小满 五岁</b></div></div>
      <table className="data-table"><tbody><tr><th>拍摄时间</th><td>2021-08-19 22:48，110联动后工程留档</td></tr><tr><th>拍摄位置</th><td>1304浴室外侧墙面，距地0.92m—1.14m</td></tr><tr><th>原始文件</th><td>IMG_1304_0819_01—03，校验值一致</td></tr><tr><th>后续维修</th><td>防潮层重做、门套更换；身高刻度区域未施工</td></tr></tbody></table>
      <p>后续修补申请要求“不要覆盖名字”，申请人签名为<mark>梁静宜</mark>。影像只能确认1304曾长期保留儿童生活痕迹，不能单独确认事故经过。</p>
    </>;

    if (id === "accident-xiaoman") return <>
      <div className="redacted-title">历史事故编号 A-1304-0821</div>
      <dl className="record-grid"><div><dt>报警来源</dt><dd>邻户噪声投诉转110联动</dd></div><div><dt>到场人员</dt><dd>民警2人、120急救3人、物业2人</dd></div><div><dt>现场移交</dt><dd>浴室门锁、地漏及住户手机由民警拍照取证</dd></div><div><dt>物业权限</dt><dd>仅保留到场、门禁和维修记录</dd></div></dl>
      <p>顾小满，女，5岁。物业于00:04接到邻居噪声来电，值班人员协助120送医并按警方要求保护现场。顾长河因明显醉酒状态由民警带离，后续讯问、伤情和责任认定不在物业卷宗内。</p>
      <p>物业结单字段仅写“浴室意外”。附件中的110联动回执另有一行手写补记：现场存在未成年人看护风险及疑似家庭暴力迹象，最终事实以公安案卷为准。该补记在2022年的档案迁移中未进入前台摘要。</p>
      <aside className="article-note article-note--dark">当日首个投诉电话为00:04，现场恢复记录为00:10；与本次六分钟噪声窗口一致，仅作为时间关联保留。</aside>
    </>;

    if (id === "alibi-liang") return <>
      <div className="timeline-list"><div><time>2023-02-07 18:11</time><p>梁静宜在东临康复中心办理入住</p></div><div><time>2023-02-08 00:36</time><p>公安协查记录：顾长河急性酒精中毒死亡</p></div><div><time>2023-02-08 09:20</time><p>物业配合警方停用顾长河门禁凭证</p></div></div>
      <table className="data-table"><tbody><tr><th>康复机构</th><td>纸质入住单与院区闸机记录一致；当夜护理巡房2次</td></tr><tr><th>交通记录</th><td>02-07 15:42实名客运出站，目的地距澄江公寓286公里</td></tr><tr><th>支付记录</th><td>02-08 00:18院内便利店消费，由本人绑定设备完成</td></tr><tr><th>公安回函</th><td>仅载明协查结果，未要求物业判断刑事责任</td></tr></tbody></table>
      <p>三类来源可以证明梁静宜在协查时段位于外省，但“没有返回条件”仍需由操作员完成交叉核验后才能写入台账。</p>
      {renderArticleVerification("alibi-liang")}
    </>;

    if (id === "case-correction") return <form className="archive-form archive-form--wide" onSubmit={submitFatherStatus}>
      <div className="status-review"><span>协查回函字段核对</span><strong>原始回函与账号审计存在状态冲突</strong><p>操作员仅照录人员状态与死因字段。账号处置由规则引擎执行，不在本页填写推测性结论。</p></div>
      <label>人员状态字段<select value={caseStatus} onChange={(event) => setCaseStatus(event.target.value)}><option value="">按回函选择</option><option value="alive">在册</option><option value="missing">失联</option><option value="dead">死亡</option></select></label>
      <label>死因字段<select value={caseDeath} onChange={(event) => setCaseDeath(event.target.value)}><option value="">按回函选择</option><option value="poison">中毒原因待查</option><option value="alcohol">急性酒精中毒</option><option value="unknown">未载明</option></select></label>
      <button className="primary-button">{game.fatherConfirmedDead ? "回函字段已写入" : "写入主体状态"}</button>
    </form>;

    if (id === "resident-separation-guide") return <>
      <div className="uncanny-rule"><span>规程编号 / RS-04</span><h2>死亡成员不得继续作为在住家庭成员合并处理。</h2><p>完成主体注销后，家庭关系、未结投诉、代办事项和历史责任必须分别结清，避免旧账号被系统继续派单。</p></div>
      <table className="data-table"><tbody><tr><th>步骤一</th><td>向相关方告知档案状态和处置依据</td></tr><tr><th>步骤二</th><td>逐项关闭或转移未结事项</td></tr><tr><th>禁止操作</th><td>不得以“家庭团聚”合并责任主体，不得以亲属意愿替代事故责任认定</td></tr></tbody></table>
      <p className="corrupted-copy" data-copy="系统仍在给已经注销的人派发回访。">系统仍在给已经注销的人派发回访。</p>
    </>;

    if (id === "employee-sync") return <>
      <div className="phone-sync"><span>最后同步 · 周明川</span><p>“如果我明天没来，别信‘外派’。我把原件留在自己房间。”</p><strong>11 · 04 · 2713</strong><small>共享密码 · 来源设备已离线38天</small></div>
      <table className="data-table"><tbody><tr><th>来源设备</th><td>ZM-PHONE-02，最后心跳 2026-06-05 22:17</td></tr><tr><th>同步结果</th><td>照片19项失败、备忘录1项成功、定位权限被管理员撤销</td></tr><tr><th>人事状态</th><td>06-02至06-05间被修改17次，操作来源均为HMO-ADMIN</td></tr><tr><th>离场材料</th><td>无交接单、无派车记录、无接收部门签章</td></tr></tbody></table>
      <p>公司没有提交失联报警，也没有找到周明川本人签署的调岗或离职材料。同步摘要只证明他曾主动留下访问线索，不能证明其下落。</p>
      <aside className="article-note">数字间的分隔符来自原始备忘录；系统没有保存自动生成密码的记录。</aside>
    </>;

    if (id === "room-1104") {
      if (!game.colleagueAccess) return <form className="password-gate" onSubmit={submitRoomPassword}><EyeMark /><span>内部记录需要共享密码</span><input value={roomPassword} onChange={(event) => setRoomPassword(event.target.value)} placeholder="输入数字密码" autoComplete="off"/><button className="primary-button">解密1104</button></form>;
      return <>
        <section className="field-record"><header><span>JOINT REVIEW / ENG + HR</span><strong>工程复测与人事附件</strong></header><div><p><time>06-02 09:16</time><b>工程复测</b><span>激光测距仪LD-08完成三次复测，实测净宽均为4.38m；竣工图标注4.80m。</span></p><p><time>06-02 10:05</time><b>环境检测</b><span>西墙插座孔附近温度高于同层基准3.7℃，氨类与TVOC读数需由有资质机构复测。</span></p><p><time>06-02 14:30</time><b>人事流转</b><span>周明川状态改为“内部转移”，附件未填写车辆、目的地、接收人和本人签字。</span></p><p><time>06-05 22:17</time><b>设备离线</b><span>其工作手机最后一次连接1号楼内网，定位字段被HMO-ADMIN清空。</span></p></div></section>
        <form className="archive-form archive-form--wide" onSubmit={submitWall}>
          <div className="wall-visual"><span>竣工图净宽 4.80m</span><div className="wall-gap"><i /><b>实测净宽 4.38m</b></div></div>
          <label>缺失墙体厚度<select value={wallWidth} onChange={(event) => setWallWidth(event.target.value)}><option value="">选择</option><option value="18">18厘米</option><option value="42">42厘米</option><option value="80">80厘米</option></select></label>
          <label>环境读数初步判断<select value={wallSignal} onChange={(event) => setWallSignal(event.target.value)}><option value="">选择</option><option value="pipe">老化管道与防腐材料</option><option value="hidden">封闭空腔内存在有机来源，需公安到场破拆</option><option value="animal">小型动物进入夹层</option></select></label>
          <label>“内部转移”流程合规性<select value={wallArchive} onChange={(event) => setWallArchive(event.target.value)}><option value="">选择</option><option value="travel">外派手续完整</option><option value="transfer">无车辆、目的地和签收人，不能证明员工完成转移</option><option value="resign">已提交主动离职材料</option></select></label>
          <button className="primary-button">{game.colleagueSolved ? "异常链已确认" : "提交工程与人事交叉复核"}</button>
        </form>
        {game.colleagueSolved && <section className="credential-recovery">
          <div className="body-discovery">
            <span>公安协查回执 / 1104-A</span>
            <strong>西墙空腔内发现男性遗体</strong>
            <p>随身工牌与DNA比对确认死者为失联员工周明川。物业所谓“内部转移”没有车辆、目的地或签收记录，遗体旁的离线终端仍保留一组加密凭据。</p>
            <small>身份确认：ZM-0602 · 周明川 / 死亡状态已登记</small>
          </div>
          <header><EyeMark small/><div><span>从周明川的本地终端发现加密凭据</span><strong>已注销员工账号恢复</strong></div></header>
          {!game.colleagueCredentialsRecovered ? <form onSubmit={submitCredentialDecrypt}>
            <p>密码由三个未被系统改写的数字组成。按“房号—墙体缺失厚度—员工状态修改次数”排列。</p>
            <div className="credential-clues"><span>ROOM 1104</span><span>GAP 42cm</span><span>REVISION 17</span></div>
            <label>解密结果<input value={credentialCipher} onChange={(event) => setCredentialCipher(event.target.value)} placeholder="0000-00-00" autoComplete="off" /></label>
            <button className="primary-button">恢复登录凭据</button>
          </form> : <div className="recovered-account">
            <span>本地凭据恢复成功</span>
            <dl><div><dt>员工账号</dt><dd>{MINGCHUAN_ACCOUNT}</dd></div><div><dt>姓名</dt><dd>周明川</dd></div><div><dt>状态</dt><dd>已注销 / 仍可本地登录</dd></div><div><dt>密码</dt><dd>{MINGCHUAN_PASSWORD}</dd></div></dl>
            <p>该账号拥有一份未同步到物业服务器的私人证据目录。</p>
            <button type="button" onClick={returnToLogin}>退出当前账号并返回登录页</button>
          </div>}
        </section>}
      </>;
    }

    if (id === "symbol-eye-record") return <>
      <div className="symbol-dossier">
        <div className="symbol-eye-field" aria-hidden="true">{Array.from({ length: 15 }).map((_, index) => <EyeMark key={index} small />)}</div>
        <header><EyeMark /><div><span>图形相似项 / HMO-EYE-04</span><strong>眼白向下的单眼标记</strong><small>匹配度 98.7% · 自动核验已被上级策略中止</small></div></header>
        <dl><div><dt>当前备案主体</dt><dd>恒目管理顾问有限公司</dd></div><div><dt>物业使用范围</dt><dd>员工证、外部终端、ZC-LH封签</dd></div><div><dt>对外释义</dt><dd>设施全时监督</dd></div><div><dt>最早扫描记录</dt><dd>2018-04-04 · 早于企业成立</dd></div><div><dt>原始权利人</dt><dd className="symbol-redacted">来源字段缺失 / 待补授权</dd></div><div><dt>历史文件名</dt><dd>OMNISIGHT_██.AI</dd></div></dl>
      </div>
      <p>工商图形库未发现更早的企业备案。物业旧服务器却保存着同图形的矢量文件，创建时间比恒目成立早两年，原始权利人和授权合同均为空。</p>
      <div className="search-surveillance"><span>检索组合已记录</span><strong>“眼白向下” + “全知” + “恒目”</strong><p>该组合不属于当前工单的必要查询范围。账号CJ-0713已进入检索行为复核。</p></div>
      <aside className="compliance-threat"><EyeMark /><div><span>物业合规中心 / 自动告警</span><h2>查询已超出授权范围。</h2><p>过去12个月共有17次同类检索触发强制退出；相关本机缓存、私人备忘同步和外接存储记录均由DLP策略清除。</p><strong>请返回1204投诉工单。继续搜索“恒目”“过滤”或“ZC-LH”将提交人工复核。</strong></div></aside>
    </>;

    if (id === "vendor-hengmu-index") return <>
      <div className="compliance-banner compliance-banner--index"><EyeMark /><div><strong>恒目管理顾问</strong><span>OMNISIGHT MANAGEMENT</span></div></div>
      <dl className="record-grid"><div><dt>合作性质</dt><dd>物业管理与数据合规顾问</dd></div><div><dt>服务范围</dt><dd>员工复训、争议客诉与档案清理</dd></div><div><dt>图形备案</dt><dd>眼白向下的单眼标记</dd></div><div><dt>付款科目</dt><dd>物业服务费 / 专项顾问费</dd></div></dl>
      <p>近三年合同均由同一名区域负责人线下补签，验收附件只有账号清单，没有培训签到和服务成果。投标文件首页反复出现一句内部口号：</p>
      <p className="corrupted-copy corrupted-copy--red" data-copy="异常不是错误。异常只是尚未完成校准的记录。">异常不是错误。异常只是尚未完成校准的记录。</p>
    </>;

    if (id === "church-compliance") return <>
      <div className="compliance-banner"><EyeMark /><div><strong>恒目管理顾问</strong><span>看见 · 纠正 · 保持一致</span></div></div>
      <section className="field-record"><header><span>TRAINING BATCH / HMO-11</span><strong>附件完整性检查</strong></header><div><p><time>11-03 08:30</time><b>课程通知</b><span>参训17人，邮件附件含名单但无员工确认回执。</span></p><p><time>11-03 18:10</time><b>验收提交</b><span>供应商提交“已完成”截图，画面未包含场地、讲师或签到页。</span></p><p><time>11-04 08:00</time><b>终端工单</b><span>14个参训账号进入缓存清理与令牌重建队列。</span></p><p><time>11-05 09:12</time><b>人事同步</b><span>6个账号状态改为内部转移，均缺少接收部门。</span></p></div></section>
      <p>培训材料将偏离标准口径的记录称为“噪点”，将批量删除、重建索引和终端缓存清理统称为<mark>过滤</mark>。文件只说明数据操作，没有写明员工记忆或医疗处置；“复训”是否包含其他内容，现有物业附件无法证明。</p>
      <table className="data-table"><tbody><tr><th>ZC-LH</th><td>住户特殊保管物标签，内容物字段仅合规管理员可见</td></tr><tr><th>外部终端</th><td>临时账号认证及标签关联设备</td></tr><tr><th>离岗流程</th><td>清除本机缓存、撤销令牌并重建次日任务队列</td></tr><tr><th>异常资金</th><td>“特殊保管服务费”经物业科目转入恒目关联文化基金</td></tr></tbody></table>
      <p className="muted-copy">付款申请由物业区域负责人审批，供应商验收栏只有单眼图形电子章。财务导出表显示服务费在三个工作日内转入恒目关联文化基金，但用途字段为空。</p>
      {renderArticleVerification("church-compliance")}
    </>;

    if (id === "workorder-1404") return <>
      <div className="workorder-document workorder-document--1404">
        <header className="workorder-sheet-head"><div><span>澄江物业服务中心 / 客服工单</span><strong>固定回访人员重复上门投诉</strong><small>系统流水号：W-0713-1404 · 住户本人发起</small></div><aside><i>合规关注</i><b>待处理</b></aside></header>
        <dl className="workorder-facts"><div><dt>报事地址</dt><dd>1404</dd></div><div><dt>报事人</dt><dd>林若岚 / 住户本人</dd></div><div><dt>受理时间</dt><dd>2026-07-13 08:32</dd></div><div><dt>当前处理人</dt><dd className="glitch-field">CJ-0713</dd></div></dl>
        <section className="workorder-statement"><span>住户原话</span><blockquote>“每天来的都是同一个人。你们却让他每次都说第一次见我，再把回访记成首次接触。请复核他以前的客服编号，也请核对我留在家里的封存物。不要再让他明天重新来一次。”</blockquote></section>
        <div className="workorder-routing"><span>系统派单记录</span><p><b>08:32</b> 住户提交投诉</p><p><b>08:33</b> 关系错认风险自动标记</p><p><b>08:33</b> 工单转派至被投诉的固定回访人员 CJ-0713</p></div>
      </div>
      <aside className="compliance-threat"><EyeMark /><div><span>员工合规警示 / 强制确认</span><strong>不得使用本工单建立你与1404住户的私人关系。</strong><p>当前处理人、投诉所述对象及固定回访人员出现自指冲突。继续调阅历史坐席、事故主体或住户封存物，将启动员工记忆一致性校正。</p></div></aside>
      <div className="article-actions"><button onClick={() => openRelatedArticle("w04-directory")}>核对住户关怀索引</button><button onClick={() => openRelatedArticle("employee-cj0713-index")}>核对当前处理人终端字段</button></div>
    </>;

    if (id === "w04-directory") return <>
      <div className="protected-unlock-trace"><span>DERIVED KEY ACCEPTED / RESIDENT INDEX</span><strong>终端派生口令已接受</strong><small>住户索引已在当前会话临时解密</small></div>
      <div className="w04-index-card"><div className="w04-index-photo"><Image src={assetPath("/residents/w-04.png")} alt="1404住户索引影像" fill sizes="260px" unoptimized/></div><section><span>住户关怀索引</span><strong><MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /></strong><dl><div><dt>房号</dt><dd>1404</dd></div><div><dt>行动状态</dt><dd>需使用轮椅</dd></div><div><dt>关怀原因</dt><dd>重大事故后长期适应支持</dd></div><div><dt>关系字段</dt><dd className="glitch-field">上级权限遮蔽</dd></div><div><dt>固定接收员工</dt><dd className="glitch-field">CJ-0713</dd></div></dl></section></div>
      <table className="data-table"><tbody><tr><th>首次建档</th><td>2025-11-05，由恒目批量接口写入</td></tr><tr><th>服务频率</th><td>工作日每日一次，住户拒绝随机更换人员</td></tr><tr><th>异常字段</th><td>每次到场均被写为首次接触，上一条服务关系在00:10后消失</td></tr><tr><th>质检处理</th><td>7次申请修复计数，均被MEM-CONSISTENCY策略退回</td></tr></tbody></table>
      <p>住户坚持双方已经“见过很多次”，但索引没有保留任何可供前台确认私人关系的字段。可以确认的只有：同一员工编号反复到场，历史会话却没有连续性。</p>
      <div className="uncanny-counter"><span>本年度首次接触次数</span><strong>223</strong><small>计数逻辑错误 / 无法修复</small></div>
      <aside className="article-note">旧版关怀冷备份仍使用“首次接触次数”的镜像序列作为密钥种子；岗位短号由员工目录补齐。</aside>
    </>;

    if (id === "care-w04") return <>
      <div className="protected-unlock-trace protected-unlock-trace--2"><span>COLD BACKUP MOUNTED / CARE ARCHIVE</span><strong>历史回访正文已挂载</strong><small>当前浏览行为未写入住户关怀台账</small></div>
      <div className="wife-evidence"><Image src={assetPath("/residents/w-04.png")} alt="1404住户坐在轮椅上等待" fill sizes="(max-width: 900px) 100vw, 58vw" unoptimized/><div><blockquote>“你又先摸左边口袋找糖。这个习惯没人教过你，可你看我的样子还是像第一次来。”</blockquote><small>1404住户 · <MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /></small></div></div>
      <section className="field-record field-record--dark"><header><span>CARE ARCHIVE / RECOVERED TEXT</span><strong>被前台摘要覆盖的三次回访</strong></header><div><p><time>06-17 08:46</time><b>入户协助</b><span>员工未查看门牌即将轮椅脚踏复位；住户询问“你还记得怎么调高度吗”，员工未回应。</span></p><p><time>06-24 08:44</time><b>物资代办</b><span>住户将一颗硬糖放在玄关，称值夜班的人空腹会胃痛；员工拒绝签收私人食品。</span></p><p><time>07-01 08:45</time><b>异常中断</b><span>住户要求员工查看卧室封存物，终端随即断开6分钟；重新连接后，员工重复自我介绍。</span></p></div></section>
      <div className="callout"><strong>关怀沟通预案</strong><p>只记录住户原话和可观察行为，不确认其对来访者身份的解释；住户提及房内封存物时不得擅自启封。若同一员工再次出现记忆中断，应保留原始音轨并转交质检。</p></div>
      <aside className="article-note">冷备份没有给出人物关系结论。它只保留了前台摘要删去的生活细节、终端断线和重复自我介绍。</aside>
    </>;

    if (id === "night-shift-sugar") return <>
      <div className="receipt-stack"><span>员工健康物资领取 / CJ-0713</span>{["2026-07-11 23:52", "2026-07-10 23:48", "2026-07-09 23:51", "2026-07-08 23:49"].map((time) => <p key={time}><time>{time}</time><b>葡萄糖硬糖 × 1</b><i>代签：林若岚</i></p>)}</div>
      <p>健康档案没有低血糖诊断。备注由林若岚手写：“他胃不舒服的时候不肯吃饭，只肯含一颗糖。”</p>
      <table className="data-table"><tbody><tr><th>物资来源</th><td>客服前台应急柜，不属于处方药品</td></tr><tr><th>领用方式</th><td>员工账号扫码失败后由住户纸质代签</td></tr><tr><th>笔迹核对</th><td>四张单据与1404服务确认单为同一签字特征</td></tr><tr><th>时间异常</th><td>最早一张纸质单早于员工健康档案创建日</td></tr></tbody></table>
      <aside className="article-note article-note--dark">这些记录能证明住户熟悉某人的生活习惯，也能证明该习惯被重复绑定到CJ-0713；它们不能单独证明两人的法律关系。</aside>
    </>;

    if (id === "device-type-index") return <>
      <div className="device-classification"><EyeMark /><span>资产分类 ZC-LH</span><strong>住户特殊保管物</strong><p>住户自有 · 物业不得启封 · 可绑定外部身份终端</p></div>
      <table className="data-table"><tbody><tr><th>适用范围</th><td>骨灰盒、遗物箱及其他住户要求原址封存的物品</td></tr><tr><th>标签用途</th><td>记录保管责任、巡检状态与关联服务账号</td></tr><tr><th>旧库查询键</th><td>分类码 + 原址房号；经物业网关传输时去除标点</td></tr><tr><th>移出条件</th><td><span className="redacted-field">保管人书面同意 / 未结服务清零</span></td></tr><tr><th>管理要求</th><td>物业仅核对封签和外观，不登记住户隐私内容</td></tr></tbody></table>
      <p className="corrupted-copy" data-copy="为什么一个住户自有物，会绑定员工登录终端？">为什么一个住户自有物，会绑定员工登录终端？</p>
    </>;

    if (id === "on-site-device") return <>
      <div className="protected-unlock-trace protected-unlock-trace--3"><span>ASSET ISOLATION OPEN / ZC-LH</span><strong>资产隔离区已临时打开</strong><small>检测到当前账号与封存物标签同名</small></div>
      <div className="device-record"><EyeMark /><span>ZC-LH 标签</span><strong>CJ-0713</strong><dl><div><dt>物品性质</dt><dd>住户自有封存物</dd></div><div><dt>附件凭证</dt><dd>东临殡仪馆寄存转出单 DL-1105-██</dd></div><div><dt>保管地址</dt><dd>1404</dd></div><div><dt>关联系统</dt><dd>外部打卡终端 / CJ-0713</dd></div></dl></div>
      <section className="field-record"><header><span>SEALED ITEM / CUSTODY LOG</span><strong>封存物巡检与移交链</strong></header><div><p><time>2025-11-05</time><b>原址接收</b><span>住户提交东临殡仪馆转出凭证；物业仅拍摄外包装与封签，不接触内容物。</span></p><p><time>2025-11-06</time><b>标签写入</b><span>恒目管理员追加CJ-0713字段，未填写修改依据；物品本身无芯片、电源或网络模块。</span></p><p><time>2026-06-01</time><b>移库申请</b><span>公共寄存室提出统一保管，住户书面拒绝，要求继续留在1404原位置。</span></p><p><time>2026-07-13</time><b>例行核验</b><span>封签编号与原始照片一致，未见启封、移动或受潮痕迹。</span></p></div></section>
      <p>转出单中的姓名字段被上级权限遮蔽。当前页面只能核对紧急联系人电话尾号、转出日期、经办网点和封签编号；任何人物关系都必须等待外部事故回执交叉验证。</p>
      <aside className="article-note article-note--dark">事故协查旧接口沿用外部凭证数字段作为前缀，再连接当前员工账号数字段；字母及连接符由网关剥离。</aside>
      {renderArticleVerification("on-site-device")}
    </>;

    if (id === "employee-cj0713-index") return <>
      <div className="employee-index"><section><span>当前账号</span><strong>CJ-0713</strong><small>长期空置房管理员</small></section><dl><div><dt>账号状态</dt><dd>在岗</dd></div><div><dt>劳动合同</dt><dd className="glitch-field">未关联</dd></div><div><dt>终端指纹</dt><dd>T-04-CJ-0713</dd></div><div><dt>岗位短号</dt><dd>13</dd></div><div><dt>有效打卡</dt><dd>251次</dd></div><div><dt>有效下班</dt><dd className="glitch-field">0次</dd></div><div><dt>紧急联系人</dt><dd><MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /></dd></div></dl></div>
      <div className="access-loop"><span>最近三次登录</span><p>08:41 打卡成功　→　00:10 连接中断</p><p>08:41 打卡成功　→　00:10 连接中断</p><p>08:41 打卡成功　→　<span>员工仍在楼内</span></p></div>
      <aside className="article-note">旧版受限索引使用终端指纹派生口令：删除身份字母前缀，保留终端区域码与员工数字段。</aside>
      <p className="corrupted-copy corrupted-copy--red" data-copy="如果你从未下班，今天为什么还需要重新打卡？">如果你从未下班，今天为什么还需要重新打卡？</p>
    </>;

    if (id === "crash-cj0713") return <>
      <div className="protected-unlock-trace protected-unlock-trace--4"><span>EXTERNAL AUDIT LINKED / OPERATOR WATCH</span><strong>外部事故协查通道已连接</strong><small>当前操作者屏幕活动正在进行一致性记录</small></div>
      <div className="split-record"><section><span>交警协查回执</span><strong>2025-11-04 22:31</strong><p>事故编号：DL-JJ-1104-27<br/>身份字段：哈希 7F2A-19C4<br/>紧急联系人电话：尾号1404</p></section><section><span>员工账号</span><strong>2025-11-05 08:12</strong><p>账号：CJ-0713<br/>实名字段：哈希 7F2A-19C4<br/>劳动合同：未找到</p></section></div>
      <table className="data-table"><tbody><tr><th>事故回执</th><td>一名人员当场死亡；另一名同车人员下肢重伤并作为紧急联系人登记</td></tr><tr><th>账号导入</th><td>由HMO-ADMIN通过“驻场补录”批次创建，无面试、体检和入职审批附件</td></tr><tr><th>考勤起点</th><td>首次打卡晚于账号创建29分钟，终端位置为1404关联外部设备</td></tr><tr><th>身份校验</th><td>两套系统返回相同哈希；姓名明文仍受外部接口权限限制</td></tr></tbody></table>
      <p>事故回执中的紧急联系人电话尾号与1404住户资料一致。当前材料可以建立“事故主体—次日员工账号—1404外部终端”的时间链，但系统不会替操作员填写人物关系。</p>
      {renderArticleVerification("crash-cj0713")}
    </>;

    if (id === "identity-1404") return memoryRewriteActive ? <div className="memory-rewrite-console">
      <header><div><span>MEM-CONSISTENCY / 强制任务</span><h2>正在写入员工标准记忆</h2></div><strong>00:10</strong></header>
      <div className="memory-rewrite-progress"><i /><span>覆盖写入 73%</span></div>
      <section className="rewrite-diff"><article><span>REL-1404</span><b>原始字段已隔离</b><ins>标准关系模板写入中</ins></article><article><span>EMP-CJ0713</span><b>主体校验未通过</b><ins>在岗状态模板写入中</ins></article><article><span>ASSET-ZCLH</span><b>外部附件已脱钩</b><ins>设备分类模板写入中</ins></article></section>
      <aside><EyeMark /><div><strong>未经确认的内容将在退出前覆盖。</strong><p>物业后台记录本身已进入写入队列。选择三份仍可从物业系统之外核验的原始记录，按发生时间排列，建立不可覆盖的主体链。</p></div></aside>
      <div className="memory-anchor-grid">{memoryAnchorRecords.map((record) => {
        const order = memoryAnchors.indexOf(record.id);
        return <button key={record.id} type="button" className={order >= 0 ? "is-selected" : ""} onClick={() => appendMemoryAnchor(record.id)}><i>{order >= 0 ? order + 1 : "+"}</i><span>{record.time} · {record.source}</span><strong>{record.code}</strong><small>{record.text}</small></button>;
      })}</div>
      <div className="memory-rewrite-actions"><button type="button" onClick={() => setMemoryAnchors([])}>清空证据链</button><button type="button" disabled={memoryAnchors.length !== 3} onClick={resistMemoryRewrite}>用原始记录阻断覆盖写入</button></div>
    </div> : game.homeSolved ? <div className="memory-rewrite-resisted"><EyeMark /><span>MEM-CONSISTENCY / INTERRUPTED</span><h2>物业未能覆盖这段记忆。</h2><p>事故回执、殡仪馆转出单与1404原始回访音轨形成了系统外证据链。CJ-0713不是一个正常入职的物业员工编号，而是事故次日重新分配给同一主体的工作身份。</p><strong>当前中台权限：只读 / 00:10强制退出</strong></div> : <>
      <aside className="identity-audit-intro"><span>人工核验要求</span><p>不要判断人物关系。只从三份原始凭证中抄录可交叉核验的字段；系统将自行计算主体关联。</p></aside>
      <form className="archive-form archive-form--wide identity-source-form" onSubmit={submitIdentity}>
        <label>事故协查回执中的紧急联系人房号<input value={homeWoman} onChange={(event) => setHomeWoman(event.target.value)} placeholder="四位房号" inputMode="numeric" /></label>
        <label>CJ-0713账号的后台创建日期<input type="date" value={homeEmployee} onChange={(event) => setHomeEmployee(event.target.value)} /></label>
        <label>1404封存物附件凭证编号<input value={homeDevice} onChange={(event) => setHomeDevice(event.target.value)} placeholder="例：XX-0000" /></label>
        <button className="primary-button">提交原始字段核验</button>
      </form>
    </>;

    if (id === "clock-out") return <>
      <div className="final-question"><span>自然显现窗口剩余</span><strong>00:01:24</strong><h2>她仍然看得见你。</h2><blockquote>“这一次，你是回来下班，还是回来和我告别？”</blockquote></div>
      <div className="ending-options"><button disabled={!game.colleagueSolved || !game.cs046Solved} onClick={() => chooseEnding("expose")}><span>完整证据链</span><strong>向警方和业委会提交全部材料</strong><small>{game.colleagueSolved && game.cs046Solved ? "提交封存物、1104空腔、回访归档缺口与资金审批链" : !game.colleagueSolved ? "缺少1104工程与人事交叉证据；可继续搜索周明川" : "回访质检仍有未归档段落；可从客户回访目录补齐"}</small></button><button onClick={() => chooseEnding("loop")}><span>仅完成当前工单</span><strong>修正住户档案并重新打卡</strong><small>关闭本次异常账号，不继续追查恒目及历史内部转移</small></button></div>
    </>;

    if (id === "noise-elevator") return <><div className="callout"><strong>已排除</strong><p>00:04固件重启只影响轿厢显示屏，不影响12层摄像机、门磁或声学设备。</p></div><p>该记录与W-0713-019时间重合，但无法解释湿脚印和住户数量异常。</p></>;
    if (id === "noise-pipe") return <><p>1203空调排水管已更换。滴水为随机发生，不具有固定时间，也没有儿童声纹。</p><aside className="article-note">相似投诉不代表同一原因。注意核对房号。</aside></>;
    if (id === "noise-cat") return <><p>13层流浪猫脚印为四足掌印，集中在消防门外。监控中的潮湿痕迹为双足、约16厘米长。</p><div className="document-stamp">误报已关闭</div></>;
    if (id === "noise-alcohol") return <><p>1302住户争执与酒精有关，妻子确曾报警，但双方均无伤亡。该记录因关键词相似被自动关联。</p><aside className="article-note">自动关联可信度：12%</aside></>;
    return <p>记录正文缺失。</p>;
  };

  if (!game.started) {
    if (entryStage === "dream") {
      const memory = memoryScenes[memoryIndex];
      return <main className={`opening-dream opening-dream--${memoryIndex}`}>
        <section className="memory-scene" key={memory.src} aria-live="polite">
          <Image src={assetPath(memory.src)} alt={memory.alt} fill priority={memoryIndex === 0} sizes="100vw" unoptimized />
          <div className="memory-scene__veil" />
          <div className="memory-scene__copy">
            <span>记忆片段 / 无法确认日期</span>
            <h1>{memory.title}</h1>
            <p>{memory.copy}</p>
          </div>
        </section>
        <div className="memory-progress" aria-label={`记忆片段 ${memoryIndex + 1} / ${memoryScenes.length}`}>
          {memoryScenes.map((scene, index) => <i key={scene.src} className={index <= memoryIndex ? "is-active" : ""} />)}
        </div>
        <button className="opening-skip" onClick={() => { setEntryStage("wake"); writeAppRoute("/wake"); }}>跳过梦境</button>
      </main>;
    }

    if (entryStage === "wake") {
      return <main className="opening-wake">
        <div className="wake-noise" aria-hidden="true" />
        <section>
          <div className="wake-copy">
            <p className="wake-line">生命是一场轮回</p>
            <p className="wake-line">生命转瞬即逝</p>
            <h1 className="wake-line">不论如何，我需要醒来了</h1>
          </div>
          <button onClick={() => { setEntryStage("login"); writeAppRoute("/login"); }}>睁开眼</button>
        </section>
      </main>;
    }

    return <main className={`login-screen ${isLoggingIn ? "is-signing-in" : ""}`}>
      <section className="login-story" style={loginBackgroundStyle}>
        <div className="brand-lockup"><EyeMark /><span>澄江物业服务中心</span></div>
        <div className="login-eyes" aria-hidden="true">{Array.from({ length: 24 }).map((_, index) => <EyeMark key={index} />)}</div>
        <div className="login-copy"><p>综合物业管理平台 / SYSTEM 4.2</p><h1>员工身份认证</h1><span>请选择工牌或员工账号完成身份认证。</span></div>
        <span className="login-secret-hint" tabIndex={0}>不要按顺序读。按你怀疑的内容去找。</span>
        <div className="login-grid" />
      </section>
      <section className="login-card login-card--auth">
        <div><span>身份认证终端</span><strong>{loginMethod === "badge" ? "工牌登录" : "账号密码登录"}</strong></div>
        <div className="login-method-tabs" role="tablist" aria-label="登录方式">
          <button type="button" role="tab" aria-selected={loginMethod === "badge"} className={loginMethod === "badge" ? "is-active" : ""} onClick={() => { setLoginMethod("badge"); setSelectedAccount("CJ-0713"); setLoginError(""); }}>工牌登录</button>
          <button type="button" role="tab" aria-selected={loginMethod === "password"} className={loginMethod === "password" ? "is-active" : ""} onClick={() => { setLoginMethod("password"); setLoginError(""); }}>密码登录</button>
        </div>
        {loginMethod === "badge" ? <div className="badge-login-panel">
          <label>检测到的工牌<input value="CJ-0713" readOnly /></label>
          <label>岗位<input value="物业管理员" readOnly /></label>
          <button className="primary-button" disabled={isLoggingIn} onClick={() => enterSystem("CJ-0713")}>{isLoggingIn ? "身份同步中……" : "读取工牌并登录"}</button>
        </div> : <form className="password-login-panel" onSubmit={submitPasswordLogin}>
          <label>员工工号<input value={employeeIdInput} onChange={(event) => { setEmployeeIdInput(event.target.value); setLoginError(""); }} placeholder="输入员工工号" autoComplete="username" autoCapitalize="characters" spellCheck={false} disabled={isLoggingIn} /></label>
          <label>登录密码<input type="password" value={loginPassword} onChange={(event) => { setLoginPassword(event.target.value); setLoginError(""); }} placeholder="输入员工密码" autoComplete="current-password" disabled={isLoggingIn} /></label>
          <small>初始员工密码通常为工号后四位；注销账号须使用本地恢复凭据。</small>
          {loginError && <p className="login-error" role="alert">{loginError}</p>}
          <button className="primary-button" disabled={isLoggingIn}>{isLoggingIn ? "身份同步中……" : "登录系统"}</button>
        </form>}
        <div className="login-record-actions">
          <button className="text-button" disabled={isLoggingIn} onClick={() => enterSystem("CJ-0713", true)}>恢复本机调查记录</button>
          {!forgetConfirming ? <button className="text-button login-forget-button" disabled={isLoggingIn} onClick={() => setForgetConfirming(true)}>遗忘</button> : <div className="login-forget-confirm" role="alert">
            <p><strong>确认遗忘本机调查？</strong><span>档案阅读、解密进度和恢复账号将永久清除。</span></p>
            <div><button type="button" onClick={forgetInvestigation}>确认遗忘</button><button type="button" onClick={() => setForgetConfirming(false)}>保留记录</button></div>
          </div>}
        </div>
      </section>
      <div className="login-transition-flash" aria-hidden="true"><EyeMark /><span>IDENTITY ACCEPTED</span><b>{selectedAccount}</b></div>
    </main>;
  }

  if (game.activeAccount === MINGCHUAN_ACCOUNT && game.view === "legacy" && game.legacyAccountCollapsed && legacyBreachStage === "none") {
    return <main className="legacy-return-eyes" aria-label="周明川账号已崩溃，屏幕上不断浮现红色眼睛">
      <div aria-hidden="true">{Array.from({ length: 108 }).map((_, index) => <span className="legacy-return-eye" style={{ animationDelay: `${(index * 173) % 7200}ms` }} key={index}><EyeMark small /></span>)}</div>
      <section className="legacy-return-escape">
        <span>LOCAL SESSION / COLLAPSED</span>
        <button type="button" onClick={disconnectLegacyAccount}>快逃</button>
        <small>断开周明川账号并返回登录</small>
      </section>
    </main>;
  }

  if (game.activeAccount === MINGCHUAN_ACCOUNT && game.view === "legacy") {
    const legacyIsBreaching = legacyBreachStage === "question" || legacyBreachStage === "found" || legacyBreachStage === "eyes";
    return <main className={`archive-app legacy-console ${legacyIsBreaching ? "legacy-console--breaching" : ""}`}>
      <header className="archive-header">
        <button className="archive-brand" disabled><EyeMark small/><span>澄江物业</span><b>档案检索台</b></button>
        <form className="global-search" aria-label="服务器检索不可用"><span>⌕</span><input aria-label="搜索物业档案" value="" placeholder="服务器索引不可用" disabled readOnly/><button disabled>检索</button></form>
        <div className="header-actions"><button disabled>用户留言板</button><button disabled>证据 {game.legacyRead.length}</button><button className="account-switcher" disabled><span>{MINGCHUAN_ACCOUNT}</span><small>账号已注销 · 本地会话</small></button></div>
      </header>

      <div className="archive-layout">
        <aside className="archive-sidebar">
          <section><span>当前调查</span><strong>未同步证据复核</strong><small>仅本机缓存可用，其他业务权限已停用</small></section>
          <nav aria-label="已停用的系统导航"><button disabled>调查首页</button><button disabled>最近结果</button><button disabled>客户回访</button><button disabled>档案阅读</button><button disabled>真相推导</button><button className="is-active" disabled>证据台账</button><button disabled>用户留言板</button></nav>
          <div className="history-list"><span>检索历史</span><small>服务器索引未连接</small></div>
          <footer><span>服务器时间</span><strong>--:--:--</strong><small>LOCAL CACHE / OFFLINE</small></footer>
        </aside>

        <section className="archive-content">
          <div className="legacy-console-dashboard">
            <div className="dashboard-head"><div><span>工作台 / LOCAL SESSION</span><h1>物业管理系统</h1><p>当前会话属于已注销员工周明川。服务器业务模块均已停用，仅发现四份未同步的本地证据。</p></div><aside><span>当前账号</span><strong>{MINGCHUAN_ACCOUNT}</strong><small><i /> 本地会话仍在线</small></aside></div>
            <div className="dashboard-metrics"><article><span>本地证据</span><strong>{legacyFiles.length}</strong><small>未进入服务器索引</small></article><article><span>已阅读</span><strong>{game.legacyRead.length} / {legacyFiles.length}</strong><small>仅记录于本机</small></article><article><span>可用业务模块</span><strong>0</strong><small>账号已注销</small></article><article><span>远程会话</span><strong>1</strong><small>来源无法核验</small></article></div>
            <section className="legacy-evidence-panel">
              <header><div><span className="section-label">PRIVATE EVIDENCE</span><h2>本地证据</h2></div><small>唯一可访问模块 · {game.legacyRead.length} / {legacyFiles.length} 已阅</small></header>
              <div className="legacy-evidence-grid">{legacyFiles.map((file, index) => <button key={file.id} className={`${legacyFileId === file.id ? "is-active" : ""} ${game.legacyRead.includes(file.id) ? "is-read" : ""}`} onClick={() => openLegacyFile(file.id)}><i>{String(index + 1).padStart(2, "0")}</i><span>{file.code} / LOCAL ONLY</span><strong>{file.title}</strong><small>{game.legacyRead.includes(file.id) ? "已阅 · 再次打开" : "未读取 · 打开证据"}</small></button>)}</div>
            </section>
            <article className="legacy-document">{activeLegacyFile ? <>
              <header><span>{activeLegacyFile.code} / LOCAL ONLY</span><h2>{activeLegacyFile.title}</h2><p>{activeLegacyFile.summary}</p></header>
              <div>{activeLegacyFile.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <footer><EyeMark small/><span>该文件不在服务器索引中</span><b>阅读记录仍可能被监测</b></footer>
            </> : <div className="legacy-empty"><EyeMark /><span>选择一份证据</span><p>其他系统模块均不可访问。只有标记为“本地证据”的内容仍能打开。</p></div>}</article>
          </div>
        </section>

        <aside className="evidence-rail legacy-evidence-rail">
          <header><span>证据台账</span><strong>{game.legacyRead.length.toString().padStart(2, "0")}</strong></header>
          <p>当前账号只能读取以下本机证据，服务器不会生成关联结果。</p>
          <div>{legacyFiles.map((file, index) => <button key={file.id} className={legacyFileId === file.id ? "is-active" : ""} onClick={() => openLegacyFile(file.id)}><span>{String(index + 1).padStart(2, "0")}</span><p>{file.title}</p><small>{game.legacyRead.includes(file.id) ? "已阅" : "未读取"}</small></button>)}</div>
          <section className="coverage"><span>本地阅读覆盖</span><strong>{game.legacyRead.length} / {legacyFiles.length}</strong><i><b style={{ width: `${(game.legacyRead.length / legacyFiles.length) * 100}%` }} /></i></section>
        </aside>
      </div>
      {legacyCameraRequired && <div className="legacy-camera-gate" role="dialog" aria-modal="true" aria-labelledby="legacy-camera-title">
        <section className="legacy-camera-panel">
          <header><EyeMark /><div><span>LOCAL SESSION / IDENTITY CHECK</span><h2 id="legacy-camera-title">本机身份校验</h2></div><b>LOCAL</b></header>
          <div className={`legacy-camera-preview ${legacyCameraState === "active" ? "is-active" : ""} ${legacyCameraState === "fallback" ? "is-fallback" : ""}`}>
            {legacyCameraState === "active" ? <video ref={legacyCameraVideo} autoPlay muted playsInline aria-label="本机摄像头实时预览" /> : <div><EyeMark /><span>{legacyCameraState === "requesting" ? "正在等待浏览器授权……" : legacyCameraState === "fallback" ? "未检测到活体" : "等待本机画面"}</span></div>}
            <i aria-hidden="true" />
          </div>
          <div className="legacy-camera-copy">
            <span>检测到已注销账号正在读取未同步材料</span>
            <strong>{legacyCameraState === "active" ? "请看向镜头。画面核验完成后将自动继续。" : legacyCameraState === "fallback" ? "画面中没有人。正在改用历史身份特征。" : "继续访问前，需要完成一次本机身份校验。"}</strong>
            <p>摄像头画面只在当前设备预览，不会上传或保存；无可用画面时将继续执行离线校验。</p>
            {legacyCameraError && <p className="legacy-camera-error" role="alert">{legacyCameraError}</p>}
          </div>
          <footer>
            {legacyCameraState === "active" ? <div className="legacy-camera-accepted"><i /><span>摄像头已开启 · 正在核验</span></div> : legacyCameraState === "fallback" ? <div className="legacy-camera-accepted legacy-camera-accepted--fallback"><i /><span>无画面 · 正在比对历史身份</span></div> : <div><button className="legacy-camera-primary" onClick={() => void requestLegacyCamera()} disabled={legacyCameraState === "requesting"}>{legacyCameraState === "requesting" ? "等待授权……" : legacyCameraState === "error" ? "重新开启摄像头" : "开启摄像头"}</button><button className="legacy-camera-exit" onClick={() => continueLegacyWithoutCamera()}>无画面校验</button></div>}
            <small>{legacyCameraState === "active" ? "请保持画面稳定" : legacyCameraState === "fallback" ? "终端未检测到活体画面" : "设备不可用或拒绝授权时仍可继续"}</small>
          </footer>
        </section>
      </div>}
      {(legacyBreachStage === "question" || legacyBreachStage === "found") && <div className={`legacy-intrusion legacy-intrusion--${legacyBreachStage}`} role="alert"><EyeMark /><span>UNKNOWN REMOTE SESSION</span><strong>{legacyBreachStage === "question" ? "你是谁？" : "我发现你了"}</strong></div>}
      {legacyBreachStage === "eyes" && <div className="legacy-eye-collapse" role="alert">
        <div aria-hidden="true">{Array.from({ length: 88 }).map((_, index) => <EyeMark key={index} small />)}</div>
        <section><EyeMark /><span>OMNISIGHT / SESSION CAPTURED</span><strong>我发现你了</strong><button onClick={disconnectLegacyAccount}>强制断开连接</button></section>
      </div>}
    </main>;
  }

  if (game.view === "ending" && game.ending) {
    if (game.ending === "expose") {
      const departureScene = departureEndingScenes[endingStep - 1] ?? departureEndingScenes.at(-1)!;
      const epilogue = endingStep >= departureEndingScenes.length + 1;
      return <main className={`ending-performance ending-performance--step-${endingStep} ${epilogue ? "is-epilogue" : ""}`}>
        {endingStep === 0 ? <section className="ending-terminal-release" aria-live="polite">
          <div className="ending-terminal-release__status"><EyeMark small/><span>EXTERNAL EVIDENCE TRANSFER</span><b>100%</b></div>
          <p>事故回执、殡仪馆转出单、1104破拆记录与回访冷备份已离开物业内网。</p>
          <h1>证据已经出去。<br/>现在轮到你了。</h1>
          <dl><div><dt>当前账号</dt><dd>CJ-0713</dd></div><div><dt>终端权限</dt><dd>已撤销</dd></div><div><dt>自然显现窗口</dt><dd>00:00:03</dd></div></dl>
          <button type="button" onClick={() => setEndingStep(1)}>离开终端</button>
        </section> : <section className="ending-cinematic" aria-live="polite">
          <Image key={departureScene.src} src={assetPath(departureScene.src)} alt={departureScene.alt} fill priority sizes="100vw" unoptimized />
          <div className="ending-cinematic__veil" aria-hidden="true" />
          <header className="ending-cinematic__progress"><span>办理退房</span><b>{String(Math.min(endingStep, 3)).padStart(2, "0")} / 03</b></header>
          {!epilogue ? <article className="ending-cinematic__caption" key={departureScene.time}>
            <span>{departureScene.time}</span>
            <h1>{departureScene.title}</h1>
            <p>{departureScene.copy}</p>
            <blockquote>{departureScene.quote}</blockquote>
            <button type="button" onClick={() => setEndingStep((current) => current + 1)}>{departureScene.action}</button>
          </article> : <article className="ending-cinematic__caption ending-cinematic__caption--epilogue">
            <span>结局 / 办理退房</span>
            <h1>天亮以后，<br/>CJ-0713没有回来。</h1>
            <p>系统第一次记住了所有死者，也第一次无法重新调用你的名字。大楼恢复成一栋普通的房子，而你的灵魂沿着雨停后的街道继续向前。</p>
            <blockquote>“你这次回来，是为了好好离开。”</blockquote>
            <div className="ending-epilogue-actions"><a href={`${BASE_PATH}/truth/`}>查看全案真相</a><button type="button" onClick={restartGame}>从新的检索记录开始</button></div>
          </article>}
        </section>}
      </main>;
    }
    const loopScene = loopEndingScenes[endingStep - 1] ?? loopEndingScenes.at(-1)!;
    const loopEpilogue = endingStep >= loopEndingScenes.length + 1;
    return <main className={`ending-performance ending-performance--loop ending-performance--step-${endingStep} ${loopEpilogue ? "is-loop-epilogue" : ""}`}>
      {endingStep === 0 ? <section className="ending-terminal-release ending-terminal-release--loop" aria-live="polite">
        <div className="ending-terminal-release__status"><EyeMark small/><span>MEM-CONSISTENCY / SESSION CLOSED</span><b>100%</b></div>
        <p>本次异常仅按物业内部工单结案。事故主体、1404关系字段及恒目审批链未向外部提交。</p>
        <h1>关系字段已归零。<br/>下一班次可以开始。</h1>
        <dl><div><dt>当前账号</dt><dd>CJ-0713 / 在岗</dd></div><div><dt>1404关系</dt><dd>普通住户 / 首次接触</dd></div><div><dt>历史投诉</dt><dd>已归档 / 不继承至新会话</dd></div></dl>
        <button type="button" onClick={() => setEndingStep(1)}>进入下一班次</button>
      </section> : <section className="ending-cinematic ending-cinematic--loop" aria-live="polite">
        <Image key={loopScene.src} src={assetPath(loopScene.src)} alt={loopScene.alt} fill priority sizes="100vw" unoptimized />
        <div className="ending-cinematic__veil" aria-hidden="true" />
        <header className="ending-cinematic__progress"><span>记忆一致性校正</span><b>{String(Math.min(endingStep, 3)).padStart(2, "0")} / 03</b></header>
        {!loopEpilogue ? <article className="ending-cinematic__caption" key={loopScene.time}>
          <span>{loopScene.time}</span>
          <h1>{loopScene.title}</h1>
          <p>{loopScene.copy}</p>
          <blockquote>{loopScene.quote}</blockquote>
          <button type="button" onClick={() => setEndingStep((current) => current + 1)}>{loopScene.action}</button>
        </article> : <article className="ending-cinematic__caption ending-cinematic__caption--epilogue ending-cinematic__caption--loop">
          <span>结局 / 重新打卡</span>
          <h1>她终于不再等你想起来。</h1>
          <p>系统把这次回访登记为第224次“首次接触”。从这一天起，1404没有再提交固定回访人员重复上门的投诉。不是因为问题解决了，而是林若岚不再相信下一次会有所不同。</p>
          <blockquote>今日待办：处理1204夜间滴水投诉。</blockquote>
          <div className="ending-epilogue-actions"><a href={`${BASE_PATH}/truth/`}>查看全案真相</a><button type="button" onClick={restartGame}>从新的检索记录开始</button></div>
        </article>}
      </section>}
    </main>;
  }

  if (game.view === "denied" && currentArticle) {
    const deniedMessage = deniedMessages[currentArticle.id] ?? "这份记录存在，但它不承认当前账号有资格知道它为什么存在。";
    return <main className="access-denied-screen" style={deniedBackgroundStyle}>
      <div className="denied-eyes" aria-hidden="true">{Array.from({ length: 24 }).map((_, index) => <EyeMark key={index} small />)}</div>
      <section className="denied-terminal">
        <header><EyeMark /><div><span>CHENGJIANG ARCHIVE / ACCESS CONTROL</span><strong>档案权限校验失败</strong></div><b>403.04</b></header>
        <div className="denied-request"><span>请求档案</span><h1 className="broken-record-title" data-fragment={brokenTitleFor(currentArticle)}>{brokenTitleFor(currentArticle)}</h1><p>{currentArticle.section} · {currentArticle.date} · 内部索引已损坏</p></div>
        <div className="denied-message"><span>系统返回</span><p>{deniedMessage}</p></div>
        <dl><div><dt>当前账号</dt><dd>CJ-0713</dd></div><div><dt>权限状态</dt><dd>条件性拒绝</dd></div><div><dt>失败时间</dt><dd>00:04:00</dd></div><div><dt>注视记录</dt><dd className="denied-live">已写入</dd></div></dl>
        <div className="denied-redactions" aria-hidden="true"><i/><i/><i/><i/></div>
        <button onClick={goSearchResults}>← 返回检索结果</button>
      </section>
      <p className="denied-whisper" data-copy="你已经看见它了。">你已经看见它了。</p>
    </main>;
  }

  return <main className={`archive-app ${game.homeSolved ? "archive-app--aware" : ""} ${finalChapterStarted ? "archive-app--final" : ""} ${game.surveillanceEyes > 0 ? "archive-app--watched" : ""} archive-app--memory-${game.memoryRewriteStage}`}>
    {game.surveillanceEyes > 0 && <div className="surveillance-eye-field" aria-hidden="true">{Array.from({ length: game.surveillanceEyes }).map((_, index) => <i key={index} style={{ left: `${22 + ((index * 37) % 74)}%`, top: `${10 + ((index * 53) % 78)}%`, transform: `rotate(${(index * 29) % 41 - 20}deg) scale(${0.72 + ((index * 7) % 13) / 10})` }}><EyeMark /></i>)}</div>}
    <header className="archive-header">
      <button className="archive-brand" onClick={goHome}><EyeMark small/><span>澄江物业</span><b>档案检索台</b></button>
      <form className="global-search" onSubmit={submitSearch}><span>⌕</span><input aria-label="搜索物业档案" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入房号、人名、时间、设备编号或你怀疑的词……"/><button>检索</button></form>
      <div className="header-actions"><button onClick={openMessageBoard}>用户留言板{unreadBoardMessages.length > 0 && <i>{unreadBoardMessages.length}</i>}</button><button onClick={openLedger}>证据 {game.evidence.length}</button><button className="account-switcher" onClick={returnToLogin} title="切换登录账号"><span>{game.activeAccount}</span><small>{memoryRewriteActive ? "一致性校正中 · 禁止退出" : game.homeSolved ? "身份异常 · 切换账号" : "切换账号"}</small></button></div>
    </header>

    <div className="archive-layout">
      <aside className="archive-sidebar">
        <section><span>当前调查</span><strong>{objective}</strong><small>系统不会自动打开下一篇记录</small></section>
        <nav><button className={game.view === "home" ? "is-active" : ""} onClick={goHome}>调查首页</button><button className={game.view === "search" ? "is-active" : ""} onClick={goSearchResults}>最近结果</button><button className={`${game.view === "callbacks" ? "is-active" : ""} ${availableCallbacks.some((record) => !game.callbackRead.includes(record.id)) ? "has-alert" : ""}`} onClick={openCallbackCenter}>客户回访{availableCallbacks.some((record) => !game.callbackRead.includes(record.id)) && <i>{availableCallbacks.filter((record) => !game.callbackRead.includes(record.id)).length}条新记录</i>}</button><button onClick={openArchiveIndex}>档案阅读</button><button className={fatherDeductionUnlocked && !game.fatherResolved ? "has-alert" : ""} onClick={openDeductionDesk}>真相推导{fatherDeductionUnlocked && !game.fatherResolved && <i>可推导</i>}</button><button onClick={openLedger}>证据台账</button><button onClick={openMessageBoard}>用户留言板</button></nav>
        <div className="history-list"><span>检索历史</span>{game.searchHistory.length ? game.searchHistory.map((term) => <button key={term} onClick={() => searchFor(term)}>{term}</button>) : <small>尚无检索记录</small>}</div>
        <footer><span>服务器时间</span><strong>{memoryRewriteActive ? "00:09:42" : game.homeSolved ? "00:09:14" : "2026-07-13 08:43"}</strong><small>{memoryRewriteActive ? "覆盖写入进行中" : game.homeSolved ? "自然显现窗口" : "档案索引正常"}</small></footer>
      </aside>

      <section className="archive-content">
        {notice && <button className="notice-toast" onClick={() => setNotice("")}>{notice}</button>}

        {game.view === "home" && <div className="dashboard-home">
          <div className="dashboard-haunt" aria-hidden="true">{Array.from({ length: 8 }).map((_, index) => <EyeMark key={index} small />)}</div>

          <div className="dashboard-head"><div><span>{memoryRewriteActive ? "MEM-CONSISTENCY / EMPLOYEE SESSION" : finalChapterStarted ? "重点关怀 / 主体冲突复核" : "工作台 / 2026-07-13"}</span><h1>{memoryRewriteActive ? "员工记忆一致性校正" : "物业管理系统"}</h1><p>{memoryRewriteActive ? "当前中台已由员工一致性服务接管。系统正在以标准业务口径覆盖与1404及事故资料有关的本地记录。" : finalChapterStarted ? "W-0713-1404涉及当前处理人自指冲突。仅可按标准关怀话术处置，不得确认私人关系。" : "负责长期空置房巡检、住户回访及异常工单复核。业务记录可通过顶部全文检索关联查询。"}</p>{!finalChapterStarted && <span className="dashboard-secret-hint" tabIndex={0}>从一张工单开始。下一步由你搜索。</span>}</div><aside><span>{memoryRewriteActive ? "强制任务" : "当前班次"}</span><strong>{memoryRewriteActive ? "覆盖写入 73%" : "08:30—17:30"}</strong><small className="shift-status"><i /> CJ-0713 在线<b>{memoryRewriteActive ? "退出功能已锁定" : "未检测到离场记录"}</b></small></aside></div>

          {finalChapterStarted ? <div className="dashboard-metrics dashboard-metrics--memory"><article className="dashboard-metric--alert"><span>待校正记忆</span><strong>{game.homeSolved ? "0" : "3"}</strong><small>{game.homeSolved ? "写入已阻断" : "强制任务"}</small></article><article><span>终端一致率</span><strong>{memoryRewriteActive ? "73%" : game.homeSolved ? "冲突" : "41%"}</strong><small>T-04 / 当前会话</small></article><article><span>关联住户</span><strong>1404</strong><small>私人关系禁止确认</small></article><article><span>合规事件</span><strong>{game.memoryRewriteStage === "resisted" ? "2" : "1"}</strong><small>已上报恒目</small></article></div> : <div className="dashboard-metrics"><article className="dashboard-metric--alert"><span>待处理工单</span><strong>1</strong><small>较昨日 -2</small></article><article><span>今日巡检</span><strong>6 / 12</strong><small>完成率 50%</small></article><article className="dashboard-metric--vacant"><span>长期空置房</span><strong className="metric-haunted" data-ghost="18">17</strong><small>本月新增 1</small></article><article><span>未读用户留言</span><strong>{unreadBoardMessages.length}</strong><small>关联当前值班</small></article></div>}

          <section className={`work-panel ${finalChapterStarted ? "work-panel--final" : ""}`}>
            <header><div><span className="section-label">{memoryRewriteActive ? "强制合规任务" : "待办工单"}</span><h2>{game.homeSolved ? "本机记录保全" : "需要处理"}</h2></div><small>{game.homeSolved ? "只读状态" : "共 1 项 · 按优先级排序"}</small></header>
            {game.homeSolved
              ? <button className="urgent-order urgent-order--resisted" onClick={() => openRelatedArticle("identity-1404")}><div><span>校正中断 · MEM-CONSISTENCY</span><strong>外部原始记录已阻断覆盖写入</strong><p>当前账号将在00:10强制退出，本机证据仍可读取</p></div><b>查看保全记录 →</b></button>
              : finalChapterReady || finalChapterStarted
                ? <button className={`urgent-order urgent-order--1404 ${memoryRewriteActive ? "is-rewriting" : ""}`} onClick={() => openArticle(memoryRewriteActive ? articles.find((article) => article.id === "identity-1404")! : workorder1404)}><div><span>{memoryRewriteActive ? "强制任务 · MEM-CONSISTENCY" : "合规关注 · W-0713-1404"}</span><strong>{memoryRewriteActive ? "员工记忆一致性校正" : "1404 固定回访人员投诉"}</strong><p>{memoryRewriteActive ? "三个异常字段正在执行标准化，原始值已隔离" : "报事人：林若岚 · 当前处理人：CJ-0713"}</p></div><em className="work-order-ghost">{memoryRewriteActive ? "不要相信非标准记忆。" : "不要再让他明天重新来一次。"}</em><b>{memoryRewriteActive ? "阻止写入 →" : "进入工单 →"}</b></button>
                : game.fatherResolved
                  ? <button className="urgent-order" onClick={() => openArticle(internalReviewArticle)}><div><span>内部协查 · ZM-0602</span><strong>{internalReviewArticle.id === "employee-sync" ? "失联员工离线同步待复核" : internalReviewArticle.id === "room-1104" ? "1104工程与人事记录冲突" : "恒目复训与账号变更重合"}</strong><p>{internalReviewArticle.id === "employee-sync" ? "来源设备已停止联网 · 同步包未归档" : internalReviewArticle.id === "room-1104" ? "西墙复测值与竣工图不一致 · 转移单缺少签收" : "培训批次、终端重置及员工状态变更需要交叉核验"}</p></div><em className="work-order-ghost">调岗记录没有车辆、目的地和签收人。</em><b>进入协查 →</b></button>
                  : <button className="urgent-order" onClick={() => openArticle(articles[0])}><div><span>高优先级 · W-0713-019</span><strong>1204 夜间滴水投诉</strong><p>来源疑似1304 · 每日00:04开始 · 持续六分钟</p></div><em className="work-order-ghost">1304到底还有没有人住？</em><b>进入工单 →</b></button>}
          </section>

          {finalChapterStarted ? <div className={`memory-admin-home ${memoryRewriteActive ? "is-running" : ""}`}><section><span className="section-label">一致性任务字段</span><div className="memory-admin-table"><p><span>REL-1404</span><b>来源冲突 · 3</b><ins>{game.homeSolved ? "保全" : "等待标准化"}</ins></p><p><span>EMP-CJ0713</span><b>完整性校验失败</b><ins>{game.homeSolved ? "保全" : "禁止读取原值"}</ins></p><p><span>ASSET-ZCLH</span><b>外部附件未归一</b><ins>{game.homeSolved ? "保全" : "等待重新映射"}</ins></p></div></section><section><span className="section-label">一致性服务日志</span><div className="system-feed memory-system-feed"><p><i className="cold"/>08:33 检测到当前员工自指冲突</p><p><i/>08:34 一段历史回访音轨已加入复核</p><p className="device-sync"><i/><span>08:40 MEM-CONSISTENCY任务入队</span><b>{memoryRewriteActive ? "正在覆盖本次会话" : game.homeSolved ? "外部证据阻断" : "等待主体核验"}</b></p><p className="odd"><i/><span>退出策略：强制执行</span><b>本地记忆不得带离</b></p></div></section></div> : <div className="home-columns"><section><span className="section-label">今日巡检计划</span><div className="inspection-list"><article><i className="is-done">✓</i><div><strong>0906 · 水表数据复核</strong><span>工程巡检 · 08:30</span></div><b>已完成</b></article><article><i>02</i><div><strong>1401 · 空置房例行巡检</strong><span>房屋台账 · 10:30</span></div><b>待开始</b></article><article><i>03</i><div><strong>B2-17 · 设备间温湿度</strong><span>设施设备 · 14:00</span></div><b>未开始</b></article></div></section><section><span className="section-label">近期系统活动</span><div className="system-feed"><p><i className="ok"/>08:41 员工CJ-0713已打卡</p><p className="device-sync"><i/><span>08:40 ZC-LH标签同步完成</span><b>关联编号：CJ-0713</b></p><p><i className="cold"/>00:10 夜间监控恢复正常</p><p className="odd"><i/><span>00:04 门禁通行记录：0</span><b>门磁事件：1</b></p></div></section></div>}
        </div>}

        {game.view === "search" && <div className="search-page">
          <header><span>内部全文检索</span><h1>“{game.lastQuery || "尚未检索"}”</h1><p>{game.lastQuery ? `找到 ${searchResults.length} 条相关记录。标题相似不代表因果关系。` : "在顶部输入你从文章中发现的内容。"}</p></header>
          <div className="result-list">{searchResults.map((article) => {
            const available = article.available(game);
            const passwordLocked = available && isProtectedArticle(article.id) && !hasUnlockedArticle(game, article.id);
            const locked = !available || passwordLocked;
            const brokenTitle = brokenTitleFor(article);
            const lockedSnippet = passwordLocked
              ? "标题索引在加密迁移中碎裂。当前会话只能确认记录存在，正文内容不可预览。"
              : "索引字段遭权限策略覆盖。标题与摘要无法校验，需先完成前置材料。";
            return <button key={article.id} className={`search-result ${locked ? "is-locked" : ""} ${passwordLocked ? "is-password-locked" : ""} ${article.kind === "noise" ? "is-noise" : ""}`} onClick={() => openArticle(article)}><div><span>{article.section} · {article.date}</span><h2 className={locked ? "broken-record-title" : ""} data-fragment={locked ? brokenTitle : undefined}>{locked ? brokenTitle : article.title}</h2><p>{locked ? lockedSnippet : article.snippet}</p></div><aside><b>{available ? passwordLocked ? "口令" : game.visited.includes(article.id) ? "已阅" : "打开" : "受限"}</b><small>{available ? passwordLocked ? "加密档案" : article.kind === "noise" ? "自动关联" : "内部档案" : lockedReason(article)}</small></aside></button>;
          })}{game.lastQuery && searchResults.length === 0 && <div className="empty-search"><strong>没有找到完全匹配的记录</strong><p>尝试缩短词语，或核对文章中的姓名、数字与房号。系统不识别完整句子。</p></div>}</div>
        </div>}

        {game.view === "callbacks" && <div className="callback-center">
          <header className="callback-center-head"><div><span>CUSTOMER FOLLOW-UP / QUALITY ARCHIVE</span><h1>客户回访记录</h1><p>回访随关联档案逐步开放。录音转写只保留当前账号有权读取的版本。</p></div><aside><span>当前坐席索引</span><strong>CS-046</strong><small>{game.callbackRead.length} / {callbackRecords.length} 已阅</small></aside></header>
          <div className={`callback-workspace ${currentCallback ? "has-active-record" : ""}`}>
            <aside className="callback-record-list">
              <header><span>回访目录</span><strong>{availableCallbacks.length} 条可读取</strong></header>
              {callbackRecords.map((record, index) => {
                const available = record.available(game);
                const read = game.callbackRead.includes(record.id);
                return <button key={record.id} disabled={!available} className={`${game.activeCallback === record.id ? "is-active" : ""} ${read ? "is-read" : ""}`} onClick={() => openCallback(record)}><i>{String(index + 1).padStart(2, "0")}</i><span>{available ? record.code : "LOCKED / 关联档案不足"}</span><strong>{available ? record.title : "回访尚未归档"}</strong><small>{available ? read ? "已阅" : "新记录" : "继续调查后开放"}</small></button>;
              })}
            </aside>
            <article className="callback-record-detail">
              {currentCallback ? <>
                <button className="callback-detail-back" onClick={openCallbackCenter}>← 返回回访目录</button>
                <header><span>{currentCallback.code}</span><h2>{currentCallback.title}</h2><p>{currentCallback.related}</p></header>
                <dl><div><dt>回访时间</dt><dd>{currentCallback.time}</dd></div><div><dt>录音时长</dt><dd>{currentCallback.duration}</dd></div><div><dt>执行坐席</dt><dd>CS-046</dd></div><div><dt>质检状态</dt><dd>人工复核</dd></div></dl>
                <div className="callback-wave" aria-hidden="true">{Array.from({ length: 42 }).map((_, index) => <i key={index} style={{ height: `${8 + ((index * 11) % 34)}px` }} />)}</div>
                <div className="callback-transcript">{currentCallback.lines.map((line) => <p key={`${line.at}-${line.speaker}`} className={line.flagged ? "is-flagged" : ""}><time>{line.at}</time><b>{line.speaker}</b><span>{line.text}</span></p>)}</div>
                <aside className="callback-quality-note"><span>质检附注</span><p>{currentCallback.note}</p></aside>
              </> : <div className="callback-empty"><span>QUALITY PLAYBACK</span><h2>选择一条已开放回访</h2><p>目录中的质检序号连续，能够读取的录音正文却不连续。缺失段落没有删除记录。</p><div>{callbackRecords.map((record, index) => <i key={record.id} className={game.callbackRead.includes(record.id) ? "is-read" : ""}>{index + 1}</i>)}</div></div>}
            </article>
          </div>

          {finalChapterStarted && !callbackReviewReady && <aside className="callback-correlation-locked"><EyeMark small/><div><strong>1404投诉提到一个旧坐席编号</strong><p>该编号也出现在较早的回访目录中。补齐当前可读取音轨后，质检台允许附加一条未决备注。</p></div></aside>}

          {callbackReviewReady && <section className={`operator-correlation ${game.cs046Solved ? "is-solved" : ""}`}>
            <header><div><span>QUALITY TRACE / MANUAL NOTE</span><h2>回访归档缺口复核</h2></div><b>{game.cs046Solved ? "未决备注已附加" : "不生成身份归因"}</b></header>
            <div className="operator-match-grid"><section><span>历史目录字段</span><strong>CS-046</strong><small>客服中心 / 回访质检</small></section><i>?</i><section><span>本轮终端字段</span><strong>CJ-0713</strong><small>空置房管理 / 当前会话</small></section></div>
            <table><tbody><tr><th>终端导出</th><td>CS-046 / T-04</td><td>CJ-0713 / T-04-CJ-0713</td></tr><tr><th>音轨质检</th><td>三处呼吸停顿被标记</td><td>自动比对结果：已撤回</td></tr><tr><th>可见时序</th><td>末次回访：07-12 08:32</td><td>本轮打卡：07-13 08:41</td></tr><tr><th>夹层任务</th><td>MEM-CONSISTENCY / FILTER</td><td>结果字段：空</td></tr><tr><th>住户陈述</th><td>“又打来了” / “还是0713”</td><td>未被质检采信</td></tr></tbody></table>
            {game.cs046Solved ? <div className="operator-truth"><EyeMark /><div><span>UNRESOLVED TRACE</span><strong>系统拒绝填写“坐席归属”。</strong><p>两组编号之间只留下T-04、连续的质检序号，以及一项没有结果的后台任务。</p></div></div> : <form onSubmit={submitCallbackReview}>
              <label>质检目录中可以确认的状态<select value={callbackSequence} onChange={(event) => setCallbackSequence(event.target.value)}><option value="">选择记录字段</option><option value="complete">所有序号均有录音正文</option><option value="continuous-gap">质检序号连续，部分正文缺失</option><option value="renumbered">缺失文件已重新编号</option></select></label>
              <label>末次可见回访后的系统事件<select value={callbackSystemEvent} onChange={(event) => setCallbackSystemEvent(event.target.value)}><option value="">选择日志事件</option><option value="shift-close">坐席正常签退</option><option value="consistency-review">数据一致性复训</option><option value="ticket-close">1404工单关闭</option></select></label>
              <label>两组导出记录中重复出现的字段<select value={callbackTerminalField} onChange={(event) => setCallbackTerminalField(event.target.value)}><option value="">选择可比字段</option><option value="resident">住户房号1404</option><option value="t04">终端段T-04</option><option value="employee-name">员工实名字段</option></select></label>
              <button className="primary-button">附加未决质检备注</button>
            </form>}
          </section>}
        </div>}

        {game.view === "article" && currentArticle && <article className={`record-article record-article--${currentArticle.kind ?? "record"} ${uncannyArticleIds.has(currentArticle.id) ? "record-article--uncanny" : ""}`}>
          <button className="back-link" onClick={game.lastQuery ? goSearchResults : goHome}>← 返回{game.lastQuery ? "检索结果" : "调查首页"}</button>
          <header><div><span>{currentArticle.section}</span><small>{currentArticle.date} · 内部索引 {currentArticleIndex}</small></div><h1>{currentArticle.title}</h1><p>{currentArticle.snippet}</p></header>
          <div className="article-body">{renderArticleBody(currentArticle.id)}</div>
          {!(isProtectedArticle(currentArticle.id) && !hasUnlockedArticle(game, currentArticle.id)) && <footer><span>阅读完毕不代表调查完成</span><p>从正文中选择一个值得怀疑的词，回到顶部手动检索。不要只搜索标题。</p></footer>}
        </article>}
      </section>

      <aside className="evidence-rail">
        <header><span>调查台账</span><strong>{game.evidence.length.toString().padStart(2, "0")}</strong></header>
        <p>系统只记录已确认事实，不会替你生成下一次搜索。</p>
        <div>{game.evidence.length ? game.evidence.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{evidenceLabels[item]}</p></article>) : <small>核验原始附件或完成交叉复核后，证据会出现在这里。</small>}</div>
        <section className="coverage"><span>档案阅读覆盖</span><strong>{game.visited.length} / {articles.length}</strong><i><b style={{ width: `${Math.min(100, (game.visited.length / articles.length) * 100)}%` }} /></i><button onClick={openArchiveIndex}>查看全部档案 →</button></section>
      </aside>
    </div>

    {messagePopup && <aside className={`message-popup message-popup--${messagePopup.message.tone ?? "resident"}`} role="status" aria-live="polite">
      <header><div><span>新的用户留言</span><strong>{messagePopup.message.author === WIFE_NAME ? <MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /> : messagePopup.message.author} · {messagePopup.message.unit}</strong></div><time>{messagePopup.message.time}</time><button aria-label="关闭留言提示" onClick={dismissMessagePopup}>×</button></header>
      <button className="message-popup__body" onClick={openMessageBoard}><p>{messagePopup.message.text}</p><span>打开用户留言板{messagePopup.count > 1 ? ` · 另有${messagePopup.count - 1}条新留言` : ""} →</span></button>
    </aside>}

    <div className={`drawer-backdrop ${boardOpen || ledgerOpen || archiveIndexOpen || deductionOpen ? "is-open" : ""}`} onClick={() => { setBoardOpen(false); setLedgerOpen(false); setArchiveIndexOpen(false); setDeductionOpen(false); }} />
    <aside className={`side-drawer message-board ${boardOpen ? "is-open" : ""}`} aria-label="用户留言板">
      <header><div><span>PUBLIC MESSAGE BOARD</span><strong>用户留言板</strong></div><button aria-label="关闭用户留言板" onClick={() => setBoardOpen(false)}>×</button></header>
      <div className="board-notice"><div><strong>{visibleBoardMessages.length}</strong><span>条关联留言</span></div><p>内容由住户、访客及物业账号自行发布，未经核验。普通抱怨、误报与案件线索会同时出现。</p></div>
      <div className="message-list">{visibleBoardMessages.map((message) => <article key={message.id} className={`message-entry message-entry--${message.tone ?? "resident"} ${message.id === 107 && !game.fatherClosure ? "message-entry--active" : ""}`}>
        <header className="message-entry__meta"><i aria-hidden="true">{message.author === WIFE_NAME && !wifeNameRevealed ? "14" : message.author.slice(0, 2)}</i><div><strong>{message.author === WIFE_NAME ? <MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /> : message.author}</strong><span>{message.unit} · {message.badge}</span></div><time>{message.time}</time></header>
        <p>{message.text}</p>
        {message.id === 1 && !game.wifeReply && <div className="message-actions"><button onClick={() => setGame((current) => ({ ...current, wifeReply: "known" }))}>我们以前见过？</button><button onClick={() => setGame((current) => ({ ...current, wifeReply: "support" }))}>需要情绪支持吗？</button></div>}
        {message.id === 1 && game.wifeReply && <blockquote>{game.wifeReply === "known" ? "“见过。很多次。只是每次都是我记得。”" : "“谢谢。你还是只会说这一句。”"}</blockquote>}
        {message.id === 112 && (!game.missingChildReply.includes("last_seen") || !game.missingChildReply.includes("police_ref")) && <div className="message-actions">
          {!game.missingChildReply.includes("last_seen") && <button onClick={() => requestMissingChildDetail("last_seen")}>最后在哪里见到她？</button>}
          {!game.missingChildReply.includes("police_ref") && <button onClick={() => requestMissingChildDetail("police_ref")}>报警回执是什么？</button>}
        </div>}
        {message.id === 112 && game.missingChildReply.includes("last_seen") && <blockquote>“00:03她还在1204次卧，说门外有个衣服全湿的小姑娘。00:04入户门响了一次，再看时人已经不在了。”</blockquote>}
        {message.id === 112 && game.missingChildReply.includes("police_ref") && <blockquote>“接警回执是DL-0713-0041。民警正在赶来，让物业先封闭消防通道、保留原始录像，不要自行进入1304。”</blockquote>}
        {message.id === 107 && !game.fatherReply && <div className="message-actions message-actions--dark"><button onClick={() => replyToFather("death")}>引用公安协查回函</button><button onClick={() => replyToFather("evidence")}>引用门禁与会话审计</button></div>}
        {message.id === 107 && game.fatherReply && <div className="dialogue-thread"><p className="dialogue-player">{game.fatherReply === "death" ? "公安协查回函字段：死亡；时间2023-02-08 00:36；死因急性酒精中毒。" : "审计字段：本人门禁已停用；当前写入对象为MSG-1304留言令牌。"}</p><p className="dialogue-resident">{game.fatherReply === "death" ? "那为什么这个账号还能说话？你们以前没有查过吗？" : "所以你看到的不是我回家，只是系统还在替这个账号开门。"}</p></div>}
        {message.id === 107 && game.fatherReply && !game.fatherClosure && <div className="message-actions message-actions--dark"><button onClick={closeFatherChat}>附加事故回执，保全会话并停用令牌</button></div>}
        {message.id === 107 && game.fatherClosure && <div className="dialogue-thread dialogue-thread--closure"><p className="dialogue-player">已附加A-1304-0821联动回执。当前会话停止写入，原始内容转入审计保全。</p><p className="dialogue-resident">这不是第一次有人找到那张回执。你们一直都知道，对不对？</p><small>会话已转内部合规队列 · 留言令牌失效</small></div>}
      </article>)}</div>
    </aside>
    <aside className={`side-drawer ${ledgerOpen ? "is-open" : ""}`}><header><div><span>案件证据</span><strong>调查台账</strong></div><button onClick={() => setLedgerOpen(false)}>×</button></header><div className="drawer-evidence">{game.evidence.length ? game.evidence.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{evidenceLabels[item]}</p></article>) : <p>暂无已确认事实。</p>}</div></aside>
    <aside className={`side-drawer archive-index-drawer ${archiveIndexOpen ? "is-open" : ""}`} aria-label="档案阅读目录">
      <header><div><span>ARCHIVE READING INDEX</span><strong>档案阅读</strong></div><button aria-label="关闭档案阅读" onClick={() => setArchiveIndexOpen(false)}>×</button></header>
      <div className="archive-index-summary archive-index-summary--read"><div><strong>{readArticles.length}</strong><span>已阅读档案</span></div><div><strong>{readArticleSections}</strong><span>涉及分类</span></div></div>
      <div className="archive-index-note">这里只保留当前账号已经打开过的档案。首次阅读仍需通过关键词检索进入。</div>
      <div className="archive-index-list">{readArticles.length ? readArticles.map((article, index) => <button key={article.id} className={`is-read ${article.kind === "noise" ? "is-noise" : ""}`} onClick={() => reopenReadArticle(article)}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{article.section} · {article.date}</small><strong>{article.title}</strong></div><b>重新打开</b></button>) : <div className="archive-index-empty"><strong>暂无阅读记录</strong><p>从工单或检索结果打开档案后，它会出现在这里。</p></div>}</div>
    </aside>
    <aside className={`side-drawer deduction-drawer ${deductionOpen ? "is-open" : ""}`} aria-label="真相推导">
      <header><div><span>INFERENCE DESK</span><strong>真相推导</strong></div><button aria-label="关闭真相推导" onClick={() => setDeductionOpen(false)}>×</button></header>
      {!activeDeduction ? <div className="deduction-list">
        <div className="deduction-notice"><EyeMark small/><p>推导档案不会随调查进度自动开放。只有关键证据进入台账后，才能提交完整因果链。</p></div>
        <button className={`deduction-case ${game.childSaved ? "is-complete" : "is-locked"}`} disabled={!game.childSaved} onClick={() => setActiveDeduction("1204")}><span>CASE-01 · 1204</span><strong>空置房与失联儿童</strong><small>{game.childSaved ? "事实链已形成 · 查看结论" : "关键证据不足 · 档案锁定"}</small><b>{game.childSaved ? "已确认" : "— / 3"}</b></button>
        <button className={`deduction-case ${game.fatherResolved ? "is-complete" : fatherDeductionUnlocked ? "is-ready" : "is-locked"}`} disabled={!fatherDeductionUnlocked} onClick={() => setActiveDeduction("1304")}><span>CASE-02 · 1304</span><strong>主体状态与异常会话</strong><small>{game.fatherResolved ? "关联记录已归档 · 查看章节" : fatherDeductionUnlocked ? "客观记录齐全 · 重建时序" : "需要主体回函、儿童路径与会话审计"}</small><b>{fatherDeductionRequirements.filter((item) => game.evidence.includes(item)).length} / {fatherDeductionRequirements.length}</b></button>
        <button className={`deduction-case ${game.colleagueSolved ? "is-complete" : "is-locked"}`} disabled={!game.colleagueSolved} onClick={() => setActiveDeduction("1104")}><span>CASE-03 · 1104</span><strong>失联员工与异常墙体</strong><small>{game.colleagueSolved ? "事实链已形成 · 查看结论" : "关键证据不足 · 档案锁定"}</small><b>{game.colleagueSolved ? "已确认" : "— / 3"}</b></button>
        <button className={`deduction-case ${game.homeSolved ? "is-complete" : "is-locked"}`} disabled={!game.homeSolved} onClick={() => setActiveDeduction("1404")}><span>CASE-04 · 1404</span><strong>住户关系与驻场设备</strong><small>{game.homeSolved ? "事实链已形成 · 查看结论" : "关键证据不足 · 档案锁定"}</small><b>{game.homeSolved ? "已确认" : "— / 3"}</b></button>
      </div> : <div className="deduction-detail">
        <button className="deduction-back" onClick={() => setActiveDeduction(null)}>← 返回推导档案</button>
        {activeDeduction === "1204" && <section className="case-chapter-performance">
          <header data-chapter="01"><span>CHAPTER 01 / EMERGENCY TRACE</span><small>搜救结束 · 原始材料转入事件保全</small><h2>未登记的住户</h2></header>
          <ol className="case-chapter-facts">
            <li><time>2026-07-01</time><p>1204服务已终止，但门禁启用记录与巡检原图仍显示近期生活痕迹。此前台账没有触发实际占用复核。</p></li>
            <li><time>00:03—00:04</time><p>监护人最后确认许芷遥位于1204次卧；一分钟后入户门磁触发，公共区域没有匹配到成人门禁通行。</p></li>
            <li><time>00:07—00:13</time><p>消防楼梯影像与网关记录形成连续路径。民警和安保在1304门外前室找到许芷遥，第二个矮小轮廓未通过目标识别。</p></li>
          </ol>
          <blockquote className="case-chapter-voice"><span>RESCUE-0713 / 儿童原话摘录</span><p>“她说楼上一直有人等，所以带我走楼梯。她没有穿鞋，衣服一直往下滴水。”</p></blockquote>
          <p className="case-chapter-interpretation">搜救记录能够确认许芷遥的移动路线，不能确认引导者身份。她提到的姓名与1304旧事故附件重合，应作为待核信息保留，而不是写入住户身份。</p>
          <div className="case-chapter-policy"><EyeMark small/><div><span>历史巡检策略命中</span><strong>VACANT-CLOSE / 最近执行 2026-07-08 16:22</strong><p>生活痕迹已被自动归入“产权人临时存放物”。该规则使实际占用异常连续两次未进入人工复核。</p></div></div>
          <div className="truth-seal">搜救链已保全 · 引导者未核实</div>
        </section>}
        {activeDeduction === "1304" && <>
          <span>CASE-02 / {game.fatherResolved ? "记录归档" : "等待时序复核"}</span>
          <h2>重建1304关联记录的审计时序</h2>
          <div className="deduction-evidence">
            <p><i className={game.evidence.includes("childGuide") ? "is-found" : ""}/><span>RESCUE-0713：许芷遥在1304门外前室获救，陈述提及“顾小满”</span></p>
            <p><i className={game.evidence.includes("fatherDeath") ? "is-found" : ""}/><span>公安协查回函：顾长河死亡；本人门禁于当日停用</span></p>
            <p><i className={game.evidence.includes("fatherAware") ? "is-found" : ""}/><span>MSG-1304：注销账号留言会话已保全并停止写入</span></p>
          </div>
          {game.fatherResolved ? <section className="case-chapter-performance">
            <header data-chapter="02"><span>CHAPTER 02 / AUTO CORRELATION</span><small>关联完成 · 正在读取历史处置策略</small><h2>保持距离</h2></header>
            <ol className="case-chapter-facts">
              <li><time>2021-08-21</time><p><b>A-1304-0821 / 110附件</b>记载监护人涉嫌酒后暴力及看护失职；物业结单字段仅保留“浴室意外”。</p></li>
              <li><time>2023-02-08</time><p>公安回函记录顾长河死亡，物业于8小时44分钟后停用本人门禁。</p></li>
              <li><time>2026-07-13</time><p>许芷遥的获救陈述提及顾小满；同日仍在写入的是留言令牌，不是顾长河的门禁凭证。</p></li>
            </ol>
            <blockquote className="case-chapter-voice"><span>MSG-1304 / 最后一条缓存</span><p>“不是她把我留在这里。是我一直不肯承认，她死的时候我就在那扇门里。”</p></blockquote>
            <p className="case-chapter-interpretation">系统不能证明门外的呼唤是思念，也不能把它登记成宽恕。它能确认的是：事故附件、死亡主体和异常会话早已被物业放进同一条关联规则，却一直没有纠正前台档案。</p>
            <div className="case-chapter-policy"><EyeMark small/><div><span>历史策略自动命中</span><strong>1304-FAMILY-KEEP / 创建于 2023-02-08 09:24</strong><p>输入条件：死亡主体、未成年人事故附件、残留会话。处置：保持家庭成员关联；不向前台暴露状态冲突。</p></div></div>
            <div className="case-chapter-warning"><span>物业合规中心 / OPERATOR NOTICE</span><strong>CJ-0713，不得动用私情。</strong><p>当前权限仅允许写入主体状态并停用异常令牌。“团圆”“原谅”“赎罪”均不得作为档案结论，也不得以个人身份回应住户。</p></div>
          </section> : <>
            <p className="case-timeline-instruction">从八条记录中选出五条，按发生时间先后置入核验链。只保留能直接证明事故附件内容、主体状态变化、许芷遥与1304的关联，以及当前仍在活动的系统对象。</p>
            <div className="case-timeline-builder">
              <div className="case-timeline-slots">
                {caseTimeline.map((recordId, index) => {
                  const record = fatherCaseRecords.find((item) => item.id === recordId);
                  return record ? <span key={`${recordId}-${index}`}><i>{index + 1}</i><small>{record.time}</small><b>{record.code}</b></span> : null;
                })}
                {Array.from({ length: 5 - caseTimeline.length }).map((_, index) => <span className="is-empty" key={`empty-${index}`}><i>{caseTimeline.length + index + 1}</i><small>等待记录</small><b>—</b></span>)}
              </div>
              <div className="case-record-pool">{fatherCaseRecords.map((record) => <button type="button" key={record.id} disabled={caseTimeline.includes(record.id) || caseTimeline.length >= 5} onClick={() => appendCaseRecord(record.id)}><time>{record.time}</time><strong>{record.code}</strong><small>{record.text}</small></button>)}</div>
              <button type="button" className="case-timeline-reset" onClick={() => setCaseTimeline([])} disabled={!caseTimeline.length}>清空核验链</button>
            </div>
            <form className="deduction-form" onSubmit={submitFatherTruth}><button className="primary-button" disabled={caseTimeline.length !== 5}>锁定五条记录时序</button></form>
          </>}
        </>}
        {activeDeduction === "1104" && <section className="case-chapter-performance">
          <header data-chapter="03"><span>CHAPTER 03 / INTERNAL REVIEW</span><small>工程复测与人事材料交叉完成</small><h2>没有目的地的转移</h2></header>
          <ol className="case-chapter-facts">
            <li><time>2026-06-02 21:40</time><p>1104西墙现场净宽比竣工图少42厘米；空腔区域存在持续人体尺度回波，表面修补批次晚于交付日期。</p></li>
            <li><time>2026-06-02 22:03</time><p>周明川的“内部转移”状态写入人事系统。单据没有车辆、目的地、接收部门或签收人。</p></li>
            <li><time>警方破拆后</time><p>西墙空腔内发现的遗体经身份核验为周明川。其离线同步包和本机账号令牌仍保留在物业终端。</p></li>
          </ol>
          <blockquote className="case-chapter-voice"><span>ZM-0602 / 离线便笺</span><p>“先量墙，再查转移单。别用账号还在活动，证明我还活着。”</p></blockquote>
          <p className="case-chapter-interpretation">现有材料足以否定“正常调岗”和“人员失联”的内部口径。注销账号为何仍能调用本机缓存，不属于工程与人事复核可以证明的范围。</p>
          <div className="case-chapter-policy"><EyeMark small/><div><span>预生成处置记录</span><strong>EMP-TRANSFER-CLOSE / 2026-06-02 21:17</strong><p>该记录早于人事状态写入46分钟，也早于现场异常上报。执行人字段来自恒目驻场合规组。</p></div></div>
          <div className="truth-seal">遗体身份已确认 · 转移记录不成立</div>
        </section>}
        {activeDeduction === "1404" && <section className="case-chapter-performance">
          <header data-chapter="04"><span>CHAPTER 04 / SUBJECT COLLISION</span><small>跨系统原始记录已保全</small><h2>无法归一的员工主体</h2></header>
          <ol className="case-chapter-facts">
            <li><time>事故当日</time><p>死亡事故主体哈希与CJ-0713实名附件一致；紧急联系人材料指向1404，事故时间早于当前员工账号建档。</p></li>
            <li><time>事故次日</time><p>CJ-0713账号与ZC-LH封存标签由同一审批链生成。转出凭证将对应物品登记为殡葬寄存物，物业资产库随后改写了分类名称。</p></li>
            <li><time>本次值班前</time><p>1404关怀目录累计223次“首次接触”，固定接收员工始终为CJ-0713；相关回访音轨的终端字段均出现T-04。</p></li>
          </ol>
          <blockquote className="case-chapter-voice"><span>W-0713-1404 / 报事补充</span><p>“我不能证明每天回来的是同一个人。我只能证明，你们每次都让他忘记来过。”</p></blockquote>
          <p className="case-chapter-interpretation">记录支持当前账号继承了事故主体的身份附件、联系人关系和封存物标签，也支持物业长期重复重置接触记录。系统无法据此判断当前操作者的生命状态或意识来源。</p>
          <div className="case-chapter-warning"><span>员工一致性服务 / FORCED TASK</span><strong>主体关系核验已触发覆盖写入。</strong><p>强制校正并非在发现冲突后临时创建；任务模板与前三次1404投诉使用同一策略编号。</p></div>
          <div className="truth-seal truth-seal--red">主体冲突已保全 · 自动归因失败</div>
        </section>}
      </div>}
    </aside>
  </main>;
}
