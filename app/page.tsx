"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type View = "home" | "search" | "article" | "denied" | "ending";
type Ending = "expose" | "loop" | null;

type GameState = {
  started: boolean;
  view: View;
  activeArticle: string | null;
  lastQuery: string;
  searchHistory: string[];
  visited: string[];
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

const SAVE_KEY = "chengjiang-search-arg-v1";
const WIFE_NAME = "林若岚";

const initialGame: GameState = {
  started: false,
  view: "home",
  activeArticle: null,
  lastQuery: "",
  searchHistory: [],
  visited: [],
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
  homeSolved: false,
  ending: null,
};

const always = () => true;
const hasVisited = (game: GameState, id: string) => game.visited.includes(id);

const articles: ArticleMeta[] = [
  {
    id: "workorder-1204",
    title: "1204 夜间滴水投诉复核",
    section: "客服工单",
    date: "2026-07-13",
    snippet: "投诉人称楼上每晚出现六分钟滴水声，但1304近24小时用水量为零。",
    terms: ["1204", "1304", "滴水", "投诉", "六分钟", "00:04", "00:10", "w-0713-019", "系统未匹配", "楼上的人是不是已经死了", "有效住户"],
    available: always,
  },
  {
    id: "vacancy-1204",
    title: "1204 长期空置房巡检记录",
    section: "房屋台账",
    date: "2026-07-09",
    snippet: "产权人境外失联，保洁服务已停费；近期门禁与生活用电却持续出现。",
    terms: ["1204", "空置房", "产权人", "保洁", "门禁", "许建国", "赵秀兰", "续费停止", "停了续费", "2026-04-03", "儿童床品", "童鞋"],
    available: always,
  },
  {
    id: "meter-1304",
    title: "1304 水表与顶面湿度联合检测",
    section: "工程运维",
    date: "2026-07-12",
    snippet: "水表无流量、楼下顶面干燥，声学传感器仍在固定时段采集到滴水。",
    terms: ["1304", "水表", "湿度", "滴水", "声纹", "声纹分轨", "00:04", "六分钟", "零用水", "浴室反射"],
    available: always,
  },
  {
    id: "cctv-1204",
    title: "12层夜间监控抽帧复核",
    section: "安防中心",
    date: "2026-07-13",
    snippet: "00:04—00:10期间住户数量与画面人物不一致，需要人工标记异常帧。",
    terms: ["00:04", "00:07", "00:10", "监控", "抽帧", "湿脚印", "地面", "消防楼梯", "cam-12f-02", "有效住户", "住户数量", "地面变化", "楼梯变化", "信号变化"],
    kind: "media",
    available: (game) => hasVisited(game, "workorder-1204"),
  },
  {
    id: "audio-1304",
    title: "1304 夜间声纹分轨报告",
    section: "安防中心",
    date: "2026-07-13",
    snippet: "六分钟音频包含管道、电视、浴缸滴水与儿童哼唱，需要排除无关声道。",
    terms: ["1304", "声纹", "声学", "滴水", "浴缸", "浴缸滴水", "儿童哼唱", "管道共振", "邻户电视", "六分钟"],
    kind: "media",
    available: (game) => hasVisited(game, "meter-1304"),
  },
  {
    id: "clinic-child",
    title: "拾获童鞋健康信息卡",
    section: "失物招领",
    date: "2026-07-06",
    snippet: "1204门外童鞋内发现儿童健康卡，姓名何芷遥，系统内无对应住户。",
    terms: ["童鞋", "未登记儿童", "何芷遥", "2020-04-12", "2026-04-03", "健康信息卡", "1204", "失物招领"],
    available: (game) => hasVisited(game, "vacancy-1204"),
  },
  {
    id: "register-child",
    title: "临时居住关系补录申请",
    section: "住户登记",
    date: "2026-07-13",
    snippet: "系统拒绝向未登记人员开放寻人流程。补全儿童身份、父母姓名及入住日期后可重新提交。",
    terms: ["未登记儿童", "何芷遥", "许建国", "赵秀兰", "父亲", "母亲", "监护人", "补录", "居住关系", "入住日期", "1204"],
    kind: "record",
    available: (game) => hasVisited(game, "clinic-child") && hasVisited(game, "vacancy-1204"),
  },
  {
    id: "rescue-route",
    title: "失联儿童楼内路径重建",
    section: "安防中心",
    date: "2026-07-13",
    snippet: "热成像无法捕捉引路者，只能根据潮湿痕迹与门磁记录复原路线。",
    terms: ["消防楼梯", "何芷遥", "失联儿童", "湿脚印", "衣服全湿", "湿衣小姑娘", "路径", "浴室", "儿童房"],
    kind: "media",
    available: (game) => game.surveillanceSolved && game.childRegistered,
  },
  {
    id: "resident-1304",
    title: "1304 住户顾长河重点回访记录",
    section: "住户关怀",
    date: "2026-06-28",
    snippet: "独居、长期酒精依赖。反复投诉前妻和楼下儿童‘穿门进入’，人体传感器无记录。",
    terms: ["1304", "顾长河", "酗酒", "前妻", "梁静宜", "穿门", "住户关怀"],
    available: always,
  },
  {
    id: "height-mark",
    title: "1304 墙面修补前影像记录",
    section: "工程运维",
    date: "2021-08-19",
    snippet: "浴室外墙保留儿童身高刻度，最低处写有‘小满五岁’。",
    terms: ["1304", "小满", "顾小满", "五岁", "身高刻度", "浴室", "墙面"],
    available: (game) => hasVisited(game, "resident-1304"),
  },
  {
    id: "accident-xiaoman",
    title: "顾小满意外死亡补充调查",
    section: "历史事故",
    date: "2021-08-21",
    snippet: "首报为浴室意外；急救记录与邻居证词显示事发前存在醉酒暴力行为。",
    terms: ["顾小满", "小满", "小姑娘", "爸爸", "浴缸", "溺水", "顾长河", "家暴", "男人骂孩子", "2021-08-19"],
    kind: "restricted",
    available: (game) => hasVisited(game, "height-mark") || game.childSaved,
  },
  {
    id: "alibi-liang",
    title: "梁静宜异地康复与门禁核验",
    section: "历史事故",
    date: "2023-02-11",
    snippet: "顾长河死亡当晚，前妻梁静宜在外省康复机构；门禁及交通记录互相印证。",
    terms: ["梁静宜", "前妻", "顾长河", "死亡", "康复", "不在场", "酒精中毒"],
    available: (game) => hasVisited(game, "resident-1304"),
  },
  {
    id: "case-correction",
    title: "1304 住户死亡状态复核",
    section: "住户核验",
    date: "2026-07-13",
    snippet: "门禁、警方记录与生命体征相互冲突。请先确认顾长河是否仍为实体住户。",
    terms: ["顾小满", "顾长河", "梁静宜", "死亡状态", "生命体征", "酒精中毒", "实体住户"],
    kind: "restricted",
    available: (game) => game.childSaved && game.audioSolved && hasVisited(game, "accident-xiaoman") && hasVisited(game, "alibi-liang"),
  },
  {
    id: "resident-separation-guide",
    title: "长期住户分离与退房条件说明",
    section: "住户关怀",
    date: "2024-04-04",
    snippet: "处理由强烈执念维持的长期住户时，知情状态与未结事项必须分别归零。",
    terms: ["思念", "原谅", "宽恕", "执念", "未完成心愿", "未结事项", "知晓自己", "退房", "长期住户"],
    kind: "restricted",
    available: (game) => game.childSaved,
  },
  {
    id: "employee-sync",
    title: "失联员工周明川手机同步摘要",
    section: "内部协作",
    date: "2026-06-05",
    snippet: "失联前最后同步内容仅保留一个房号与共享密码：11·04·2713。",
    terms: ["周明川", "失联员工", "1104", "11·04·2713", "共享密码", "手机同步", "公开留言", "留言被删"],
    kind: "restricted",
    available: (game) => game.fatherResolved,
  },
  {
    id: "room-1104",
    title: "1104 非标准墙体与内部转移单",
    section: "内部协作",
    date: "2026-06-02",
    snippet: "房间净宽与竣工图不符，西侧墙体后持续出现低强度生物降解信号。",
    terms: ["1104", "周明川", "42厘米", "西墙", "墙体", "内部转移", "灭口", "生物降解", "2713"],
    kind: "restricted",
    available: (game) => game.fatherResolved,
  },
  {
    id: "symbol-eye-record",
    title: "单眼标记图形备案相似项核验",
    section: "品牌资产中心",
    date: "2026-07-13",
    snippet: "眼白向下的单眼图形与恒目管理顾问旧版标识重合，外部来源字段已被合规策略覆盖。",
    terms: ["眼白向下的单眼标记", "眼白向下", "单眼标记", "单眼", "眼睛", "图形备案", "恒目", "全知", "全知教会", "不要深究", "监督之眼"],
    kind: "restricted",
    available: always,
  },
  {
    id: "vendor-hengmu-index",
    title: "恒目管理顾问供应商备案",
    section: "供应商中心",
    date: "2020-01-04",
    snippet: "物业实际管理顾问，负责员工一致性、驻场设备校准与异常住户处置。",
    terms: ["恒目", "全知", "全知教会", "眼睛", "眼白向下", "供应商", "管理顾问", "一致性", "物业服务费", "资金来源", "删除过去", "普通人类组织"],
    kind: "restricted",
    available: always,
  },
  {
    id: "church-compliance",
    title: "恒目管理顾问合规培训节选",
    section: "合规中心",
    date: "2025-11-03",
    snippet: "培训材料将记忆清除称为‘过滤’，并要求所有驻场设备接受统一校准。",
    terms: ["恒目", "全知", "眼睛", "教会", "合规", "过滤器", "记忆清除", "驻场设备"],
    kind: "restricted",
    available: (game) => game.colleagueSolved,
  },
  {
    id: "w04-directory",
    title: "1404行动不便住户关怀索引",
    section: "住户索引",
    date: "2026-07-13",
    snippet: "该住户存在长期哀伤反应，固定要求同一名员工每日回访。",
    terms: ["林若岚", "w-04", "w04", "重点关怀", "轮椅", "见过", "很多次", "我记得", "每天回来", "亡夫", "1404", "首次接触", "223", "固定接收员工"],
    kind: "restricted",
    available: always,
  },
  {
    id: "care-w04",
    title: "1404住户重点回访记录",
    section: "住户关怀",
    date: "2026-07-13",
    snippet: "住户坚持亡夫每晚回家。公司要求员工不得认同其身份描述。",
    terms: ["1404", "林若岚", "w-04", "轮椅", "亡夫", "重点关怀", "妻子", "每天回来"],
    available: (game) => game.fatherResolved,
  },
  {
    id: "night-shift-sugar",
    title: "夜班员工低血糖应急领取记录",
    section: "员工健康",
    date: "2026-07-11",
    snippet: "CJ-0713长期领取葡萄糖片与硬糖；林若岚曾连续多次代为签收。",
    terms: ["糖", "胃不好", "值夜班", "低血糖", "葡萄糖", "硬糖", "林若岚", "cj-0713", "w-04"],
    kind: "restricted",
    available: (game) => hasVisited(game, "care-w04"),
  },
  {
    id: "device-type-index",
    title: "资产类型：驻场设备",
    section: "资产索引",
    date: "2022-12-04",
    snippet: "无需供电、不得擅自移出保管房间，通常与长期空置房及外部打卡终端绑定。",
    terms: ["驻场设备", "设备", "设备同步", "外部打卡终端", "无功耗", "空置房", "资产类型", "校准", "zc-lh", "非授权感知", "移出条件", "知情状态", "未结事项", "设备不是设备"],
    kind: "restricted",
    available: always,
  },
  {
    id: "on-site-device",
    title: "1404 驻场设备保管登记",
    section: "资产管理",
    date: "2025-11-05",
    snippet: "设备编号CJ-0713，无功耗、无网络心跳；保管人拒绝移出房间。",
    terms: ["1404", "驻场设备", "cj-0713", "设备", "保管人", "无功耗", "骨灰"],
    kind: "restricted",
    available: (game) => hasVisited(game, "care-w04"),
  },
  {
    id: "employee-cj0713-index",
    title: "员工账号 CJ-0713 基础索引",
    section: "员工目录",
    date: "2026-07-13",
    snippet: "长期空置房管理员，账号保持在岗；系统未记录任何一次有效下班。",
    terms: ["cj-0713", "cj0713", "当前员工", "员工账号", "空置房管理员", "刷卡", "下班", "有效下班", "在岗", "2025-11-05", "紧急联系人", "连接中断", "员工仍在楼内", "从未下班"],
    kind: "restricted",
    available: always,
  },
  {
    id: "crash-cj0713",
    title: "CJ-0713 关联交通事故与账号创建记录",
    section: "内部审计",
    date: "2025-11-05",
    snippet: "员工死亡日期早于账号创建日期一天；事故幸存人为1404住户。",
    terms: ["cj-0713", "2025-11-04", "车祸", "员工死亡", "账号创建", "1404", "幸存者"],
    kind: "restricted",
    available: (game) => hasVisited(game, "on-site-device"),
  },
  {
    id: "identity-1404",
    title: "1404 住户关系人工校验",
    section: "内部审计",
    date: "2026-07-13",
    snippet: "系统检测到当前员工、重点关怀住户与驻场设备存在未登记亲属关系。",
    terms: ["1404", "林若岚", "w-04", "cj-0713", "住户关系", "妻子", "死亡", "骨灰"],
    kind: "restricted",
    available: (game) => hasVisited(game, "crash-cj0713") && hasVisited(game, "on-site-device"),
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

const evidenceLabels: Record<string, string> = {
  vacancyMismatch: "1204空置登记与实际居住冲突",
  zeroWater: "1304零用水与滴水声并存",
  wetFootprints: "00:04—00:10湿脚印与儿童影像",
  bathAudio: "浴缸滴水与儿童哼唱声纹",
  childIdentity: "未登记儿童何芷遥",
  childGuide: "顾小满引导何芷遥返回1204",
  fatherDeath: "顾长河已死亡且并非实体住户",
  fatherTruth: "顾小满死亡责任与父亲酒精中毒",
  fatherAware: "顾长河知晓自身死亡并承认责任",
  wifeAlibi: "梁静宜异地不在场记录",
  bodyWall: "1104墙后生物降解信号",
  internalTransfer: "周明川内部转移单",
  churchFlow: "恒目顾问过滤与资金流水",
  ashLedger: "驻场设备CJ-0713实际为骨灰",
  protagonistDead: "当前员工死亡日期早于账号创建",
  marriage: "林若岚与CJ-0713为夫妻",
};

const articleEvidence: Record<string, string[]> = {
  "vacancy-1204": ["vacancyMismatch"],
  "meter-1304": ["zeroWater"],
  "alibi-liang": ["wifeAlibi"],
  "on-site-device": ["ashLedger"],
  "crash-cj0713": ["protagonistDead"],
  "church-compliance": ["churchFlow"],
};

const boardMessages: BoardMessage[] = [
  { id: 1, sequence: 4, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 08:43", tone: "resident", visible: () => true, text: "今天还是你来处理吗？如果找不到入口，先查工单里最具体的时间。" },
  { id: 101, sequence: 3, author: "许建国", unit: "1204", badge: "住户认证异常", time: "今天 08:36", tone: "warning", visible: () => true, text: "报修三次了。那不是水管，水管不会每天只响六分钟。楼上不开门，你们就把工单关了？" },
  { id: 102, sequence: 2, author: "陈阿姨", unit: "0702", badge: "普通住户", time: "今天 07:58", tone: "resident", visible: () => true, text: "昨晚00:04电梯楼层又全灭了，维修师傅说是自动重启。你们查滴水的时候顺便看看，别什么都说正常。" },
  { id: 103, sequence: 1, author: "张志强", unit: "1302", badge: "普通住户", time: "昨天 23:41", tone: "resident", visible: () => true, text: "昨晚摔酒瓶的是我家，和1304没关系。谁再说听见男人骂孩子，先把房号看清楚。" },

  { id: 2, sequence: 6, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 09:02", tone: "resident", visible: (game) => hasVisited(game, "vacancy-1204"), text: "系统里没有那个孩子，不代表她不存在。门外那双童鞋里有东西。" },
  { id: 104, sequence: 5, author: "赵秀兰", unit: "1204", badge: "住户认证异常", time: "今天 08:57", tone: "warning", visible: (game) => hasVisited(game, "vacancy-1204"), text: "我们原本只是来打扫。房主停了续费，房子空着也是空着，孩子暂住几个月怎么了？别拿产权人的事吓唬我们。" },
  { id: 112, sequence: 7.5, author: "赵秀兰", unit: "1204", badge: "紧急求助", time: "刚刚", tone: "warning", visible: (game) => game.childMissingReported, text: "你们是不是已经开始查1304了？我女儿从昨晚00:04起就不见了。我们没敢报警——系统里根本没有她。她没穿鞋，门口那双童鞋还在。求你先帮我们找孩子。" },

  { id: 3, sequence: 8, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 00:04", tone: "resident", visible: (game) => hasVisited(game, "cctv-1204"), text: "别只看门口。看地面，再看消防楼梯。" },
  { id: 105, sequence: 7, author: "孙阿姨", unit: "1303", badge: "普通住户", time: "今天 00:02", tone: "resident", visible: (game) => hasVisited(game, "cctv-1204"), text: "消防门外的猫脚印我认得，但监控里那串不是猫留下的。猫爪不会一前一后，也不会一路滴着水。" },

  { id: 4, sequence: 10, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 00:11", tone: "resident", visible: (game) => game.childSaved, text: "小满只是想念父亲。思念不等于原谅，这两份档案不该合在一起。" },
  { id: 106, sequence: 9, author: "赵秀兰", unit: "1204", badge: "住户认证异常", time: "今天 00:10", tone: "warning", visible: (game) => game.childSaved, text: "芷遥回来了。她说是一个衣服全湿的小姑娘牵她下楼，还一直问‘爸爸是不是也在等我’。这句请别写进寻人记录。" },

  { id: 5, sequence: 13, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 08:17", tone: "resident", visible: (game) => Boolean(game.fatherClosure), text: "你手机里那个没用过的密码，我替你记着：11·04·2713。" },
  { id: 107, sequence: 12, author: "顾长河", unit: "1304", badge: "账号已注销 · 正在输入", time: "刚刚", tone: "system", visible: (game) => game.fatherConfirmedDead, text: "这条死亡结论是谁提交的？系统说1304已经没有活人。你既然看得见我，就告诉我——我到底是什么？" },
  { id: 108, sequence: 11, author: "周明川", unit: "物业员工", badge: "账号已注销", time: "2026-06-02 22:18", tone: "system", visible: (game) => hasVisited(game, "employee-sync"), text: "如果你也负责长期空置房：别先问设备是什么，先量1104西墙。公开留言很快会被删。" },

  { id: 6, sequence: 15, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 08:32", tone: "resident", visible: (game) => hasVisited(game, "care-w04"), text: "你以前胃不好，值夜班总带着糖。抱歉，我又把你当成他了。" },
  { id: 109, sequence: 14, author: "物业合规中心", unit: "系统", badge: "自动回复", time: "今天 08:33", tone: "system", visible: (game) => hasVisited(game, "care-w04"), text: "提醒：请勿向重点关怀住户确认亡者身份，请勿讨论房内驻场设备。重复违规将触发员工一致性校准。" },

  { id: 110, sequence: 16, author: "程启", unit: "物业员工", badge: "账号来源异常", time: "已删除 17次", tone: "system", visible: (game) => game.colleagueSolved, text: "他们把灭口叫‘内部转移’，把清除记忆叫‘过滤’。如果这条还在，搜索恒目。" },
  { id: 113, sequence: 16.5, author: "物业合规中心", unit: "SYSTEM", badge: "检索行为告警", time: "刚刚", tone: "system", visible: (game) => hasVisited(game, "symbol-eye-record"), text: "员工CJ-0713：你正在把一个普通供应商标记与不存在的宗教组织建立关联。停止搜索。返回当前工单。不要继续检索“恒目”“过滤”或“驻场设备”。" },
  { id: 7, sequence: 18, author: "林若岚", unit: "1404", badge: "认证住户", time: "今天 00:09", tone: "resident", visible: (game) => game.homeSolved, text: "这一次如果你真的想起来了，就搜索‘下班’。00:10以后不要再刷卡。" },
  { id: 111, sequence: 17, author: "留言板系统", unit: "SYSTEM", badge: "状态同步", time: "今天 00:09", tone: "system", visible: (game) => game.homeSolved, text: "当前在线账号：4。有效住户：0。员工CJ-0713留言权限将在00:10关闭。" },
];

const uncannyArticleIds = new Set([
  "resident-separation-guide",
  "symbol-eye-record",
  "vendor-hengmu-index",
  "w04-directory",
  "night-shift-sugar",
  "device-type-index",
  "employee-cj0713-index",
  "church-compliance",
  "crash-cj0713",
]);

const deniedMessages: Record<string, string> = {
  "cctv-1204": "画面里多出了一条移动轨迹。系统要求你先证明它属于某个住户。",
  "audio-1304": "请先证明你听见的真的是水。未经确认的声音不应当拥有来源。",
  "clinic-child": "系统无法为一个不存在于住户名册中的儿童显示身份材料。",
  "register-child": "没有姓名，就没有失踪。没有登记，就没有需要寻找的人。",
  "rescue-route": "热成像没有捕捉到引路者。你暂时无权知道是谁牵着她离开。",
  "case-correction": "1304正在等待一个有资格宣布住户死亡的人。当前账号不符合条件。",
  "employee-sync": "失联员工没有办理离场。请不要继续确认他去了哪里。",
  "room-1104": "墙体尺寸符合公司要求。请停止测量。",
  "care-w04": "她记得你。当前账号暂时不允许记得她。",
  "church-compliance": "你检索的管理机构不存在。重复查询将触发员工一致性校准。",
  "on-site-device": "当前账号与设备编号发生重叠。查阅人不能同时作为被保管对象。",
  "crash-cj0713": "该事故记录包含当前账号。系统拒绝建立查阅者与死者之间的对应关系。",
  "identity-1404": "住户关系已经被纠正过很多次。请不要再次恢复。",
  "clock-out": "系统尚未确认现在是谁在使用CJ-0713。下班权限已暂时撤回。",
};

function addUnique(items: string[], values: string[]) {
  return Array.from(new Set([...items, ...values]));
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[\s·•—_\-：:，,。.、/\\（）()《》〈〉]/g, "");
}

function rankArticle(article: ArticleMeta, rawQuery: string) {
  const query = normalizeText(rawQuery);
  if (!query) return 0;
  const title = normalizeText(article.title);
  const snippet = normalizeText(article.snippet);
  const terms = article.terms.map(normalizeText);
  let score = 0;
  if (title.includes(query)) score += 8;
  if (snippet.includes(query)) score += 3;
  for (const term of terms) {
    if (term === query) score += 10;
    else if (term.includes(query) || query.includes(term)) score += 4;
  }
  return score;
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
  const [query, setQuery] = useState("");
  const [boardOpen, setBoardOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [archiveIndexOpen, setArchiveIndexOpen] = useState(false);
  const [deductionOpen, setDeductionOpen] = useState(false);
  const [activeDeduction, setActiveDeduction] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [messagePopup, setMessagePopup] = useState<{ message: BoardMessage; count: number } | null>(null);
  const messageTimer = useRef<number | null>(null);
  const [childName, setChildName] = useState("");
  const [childBirthday, setChildBirthday] = useState("");
  const [childFather, setChildFather] = useState("");
  const [childMother, setChildMother] = useState("");
  const [childRelation, setChildRelation] = useState("");
  const [childStart, setChildStart] = useState("");
  const [caseCause, setCaseCause] = useState("");
  const [caseStatus, setCaseStatus] = useState("");
  const [caseDeath, setCaseDeath] = useState("");
  const [caseMeaning, setCaseMeaning] = useState("");
  const [caseResolution, setCaseResolution] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [wallWidth, setWallWidth] = useState("");
  const [wallSignal, setWallSignal] = useState("");
  const [wallArchive, setWallArchive] = useState("");
  const [homeWoman, setHomeWoman] = useState("");
  const [homeEmployee, setHomeEmployee] = useState("");
  const [homeDevice, setHomeDevice] = useState("");

  useEffect(() => {
    if (game.started) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game]);

  const currentArticle = articles.find((article) => article.id === game.activeArticle) ?? null;
  const currentArticleIndex = currentArticle?.id === "w04-directory"
    ? "RESIDENT-1404"
    : currentArticle?.id === "care-w04"
      ? "CARE-1404"
      : currentArticle?.id.toUpperCase();
  const wifeNameRevealed = hasVisited(game, "care-w04") || game.homeSolved;
  const visibleBoardMessages = boardMessages.filter((message) => message.visible(game)).sort((a, b) => b.sequence - a.sequence);
  const unreadBoardMessages = visibleBoardMessages.filter((message) => !game.wifeRead.includes(message.id));
  const fatherDeductionRequirements = ["childGuide", "fatherDeath", "fatherAware"];
  const fatherDeductionUnlocked = fatherDeductionRequirements.every((item) => game.evidence.includes(item));

  const searchResults = useMemo(() => {
    return articles
      .map((article) => ({ article, score: rankArticle(article, game.lastQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => Number(b.article.available(game)) - Number(a.article.available(game)) || b.score - a.score || a.article.date.localeCompare(b.article.date))
      .map(({ article }) => article);
  }, [game]);

  const objective = !hasVisited(game, "workorder-1204")
    ? "查明1204投诉来源"
    : game.childMissingReported && !game.childRegistered
      ? "确认1204失联儿童身份"
    : !game.surveillanceSolved
      ? "确认六分钟内的异常"
      : !game.childRegistered
        ? "找出系统中不存在的孩子"
        : !game.childSaved
          ? "重建失联儿童路径"
          : !game.fatherConfirmedDead
            ? "确认顾长河是否仍为活人"
            : !game.fatherClosure
              ? "回复1304注销账号"
              : !game.fatherResolved
                ? "在真相推导中纠正1304档案"
            : !game.homeSolved
              ? "确认1404住户关系"
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

  const announceMessages = (ids: number[]) => {
    const messages = ids.map((id) => boardMessages.find((item) => item.id === id)).filter((message): message is BoardMessage => Boolean(message));
    if (messages.length === 0) return;
    setMessagePopup({ message: messages[0], count: messages.length });
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => {
      setMessagePopup(null);
      messageTimer.current = null;
    }, 9000);
  };

  const startGame = () => {
    setGame({ ...initialGame, started: true });
    announceMessages([1, 101, 102, 103]);
  };

  const continueGame = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
      startGame();
      return;
    }
    try {
      const restored = JSON.parse(saved) as Partial<GameState>;
      setGame({ ...initialGame, ...restored, fatherConfirmedDead: restored.fatherConfirmedDead ?? restored.fatherResolved ?? false, started: true });
    } catch {
      startGame();
    }
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
  };

  const openArticle = (article: ArticleMeta) => {
    if (!article.available(game)) {
      setGame((current) => ({ ...current, view: "denied", activeArticle: article.id }));
      return;
    }
    const gained = articleEvidence[article.id] ?? [];
    const firstVisit = !game.visited.includes(article.id);
    const triggersMissingChild = !game.childMissingReported && ["meter-1304", "resident-1304"].includes(article.id);
    const messagesByArticle: Record<string, number[]> = {
      "vacancy-1204": [2, 104],
      "cctv-1204": [3, 105],
      "symbol-eye-record": [113],
      "employee-sync": [108],
      "care-w04": [6, 109],
    };
    setGame((current) => ({
      ...current,
      view: "article",
      activeArticle: article.id,
      visited: addUnique(current.visited, [article.id]),
      evidence: addUnique(current.evidence, gained),
      childMissingReported: current.childMissingReported || triggersMissingChild,
    }));
    if (triggersMissingChild) announceMessages([112]);
    else if (firstVisit && messagesByArticle[article.id]) announceMessages(messagesByArticle[article.id]);
  };

  const openRelatedArticle = (articleId: string) => {
    const relatedArticle = articles.find((article) => article.id === articleId);
    if (!relatedArticle) {
      flash("关联档案索引已失效");
      return;
    }
    openArticle(relatedArticle);
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

  const reopenReadArticle = (article: ArticleMeta) => {
    if (!game.visited.includes(article.id)) return;
    setArchiveIndexOpen(false);
    openArticle(article);
  };

  const toggleFrame = (time: string) => {
    setGame((current) => ({
      ...current,
      nightFrames: current.nightFrames.includes(time)
        ? current.nightFrames.filter((item) => item !== time)
        : [...current.nightFrames, time],
    }));
  };

  const submitFrames = () => {
    const expected = ["00:04", "00:07", "00:10"];
    const correct = game.nightFrames.length === 3 && expected.every((time) => game.nightFrames.includes(time));
    if (!correct) {
      flash("标记不准确：只选择发生异常的三个独立画面");
      return;
    }
    setGame((current) => ({ ...current, surveillanceSolved: true, evidence: addUnique(current.evidence, ["wetFootprints"]) }));
    flash("异常帧成立：湿脚印通往消防楼梯");
  };

  const toggleTrack = (track: string) => {
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
    const correctName = name === normalizeText("何芷遥") || name === "hezhiyao";
    const correctFather = normalizeText(childFather) === normalizeText("许建国");
    const correctMother = normalizeText(childMother) === normalizeText("赵秀兰");
    if (!correctName || !correctFather || !correctMother || childBirthday !== "2020-04-12" || childRelation !== "child" || childStart !== "2026-04-03") {
      flash("补录被退回：儿童身份、父母姓名或居住起始日期与现有材料不符");
      return;
    }
    setGame((current) => ({ ...current, childRegistered: true, evidence: addUnique(current.evidence, ["childIdentity"]) }));
    flash("何芷遥已临时登记，寻人权限开放");
  };

  const appendRoute = (place: string) => {
    setGame((current) => ({ ...current, route: [...current.route, place].slice(-5) }));
  };

  const submitRoute = () => {
    const expected = ["浴室", "儿童房", "客厅", "消防楼梯", "1204"];
    if (game.route.join("|") !== expected.join("|")) {
      setGame((current) => ({ ...current, route: [] }));
      flash("路径断裂，潮湿痕迹无法首尾相接");
      return;
    }
    setGame((current) => ({ ...current, childSaved: true, evidence: addUnique(current.evidence, ["childGuide"]), route: [] }));
    if (!game.childSaved) announceMessages([4, 106]);
    flash("何芷遥已返回1204；引路儿童留下姓名：顾小满");
  };

  const submitFatherStatus = (event: FormEvent) => {
    event.preventDefault();
    if (caseStatus !== "dead" || caseDeath !== "alcohol") {
      flash("状态核验失败：结论与门禁、警方记录或生命体征冲突");
      return;
    }
    setGame((current) => ({ ...current, fatherConfirmedDead: true, evidence: addUnique(current.evidence, ["fatherDeath"]) }));
    if (!game.fatherConfirmedDead) announceMessages([107]);
    flash("状态确认：顾长河已死亡；收到来自注销账号的连接请求");
  };

  const replyToFather = (reply: string) => {
    setGame((current) => ({ ...current, fatherReply: reply }));
  };

  const closeFatherChat = (closure: string) => {
    setGame((current) => ({
      ...current,
      fatherClosure: closure,
      evidence: addUnique(current.evidence, ["fatherAware"]),
    }));
    if (!game.fatherClosure) announceMessages([5]);
    flash("1304住户状态更新：已知晓自身死亡");
  };

  const submitFatherTruth = (event: FormEvent) => {
    event.preventDefault();
    if (!fatherDeductionUnlocked) {
      flash("关键证据不足，无法开启1304真相推导");
      return;
    }
    if (caseCause !== "father" || caseMeaning !== "longing" || caseResolution !== "separate") {
      flash("推导不成立：结论无法同时解释死亡责任、每日呼唤与住户执念");
      return;
    }
    setGame((current) => ({ ...current, fatherResolved: true, evidence: addUnique(current.evidence, ["fatherTruth"]) }));
    flash("真相成立：顾小满的思念不构成宽恕，父女档案已分离");
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
    flash("周明川并未失踪：遗体被封在1104墙后");
  };

  const submitIdentity = (event: FormEvent) => {
    event.preventDefault();
    if (homeWoman !== "wife" || homeEmployee !== "dead" || homeDevice !== "ashes") {
      flash("关系校验失败：仍有一项与事故及资产记录冲突");
      return;
    }
    setGame((current) => ({ ...current, homeSolved: true, evidence: addUnique(current.evidence, ["marriage"]) }));
    if (!game.homeSolved) announceMessages([7, 111]);
    flash("身份确认：当前员工为1404住户已故配偶");
  };

  const chooseEnding = (ending: Exclude<Ending, null>) => {
    setGame((current) => ({ ...current, ending, view: "ending", activeArticle: null }));
  };

  const lockedReason = (article: ArticleMeta) => {
    if (article.id === "cctv-1204") return "需要先阅读投诉工单";
    if (article.id === "audio-1304") return "需要先确认工程检测异常";
    if (article.id === "clinic-child") return "需要先确认1204登记冲突";
    if (article.id === "register-child") return "身份材料不足";
    if (article.id === "rescue-route") return "需要监控证据及儿童临时登记";
    if (["employee-sync", "room-1104", "care-w04"].includes(article.id)) return "当前案件尚未完成档案纠偏";
    if (article.id === "church-compliance") return "合规级别不足";
    if (article.id === "on-site-device") return "需要先建立1404住户上下文";
    if (article.id === "crash-cj0713") return "需要先取得设备编号";
    if (article.id === "identity-1404") return "事故及资产证据不完整";
    if (article.id === "clock-out") return "当前员工尚未完成身份确认";
    return "前置材料尚未满足";
  };

  const renderArticleBody = (id: string) => {
    if (id === "workorder-1204") return <>
      <div className="workorder-document">
        <header className="workorder-sheet-head"><div><span>澄江物业服务中心 / 客服工单</span><strong>夜间异常噪声投诉</strong><small>系统流水号：W-0713-019 · 第3次重新开启</small></div><aside><i>高优先级</i><b>待复核</b></aside></header>

        <dl className="workorder-meta-grid"><div><dt>受理渠道</dt><dd>住户端小程序</dd></div><div><dt>首次报事</dt><dd>2026-07-09 00:12</dd></div><div><dt>本次重开</dt><dd>2026-07-13 00:12</dd></div><div><dt>响应时限</dt><dd>4小时</dd></div><div><dt>服务区域</dt><dd>澄江公寓1号楼1204</dd></div><div><dt>疑似来源</dt><dd>澄江公寓1号楼1304</dd></div><div><dt>工单类型</dt><dd>噪声扰民 / 疑似漏水</dd></div><div><dt>责任班组</dt><dd>工程维修组 · 待复核</dd></div></dl>

        <section className="workorder-section"><header><b>01</b><div><h3>报事人及身份核验</h3><span>来源账号信息</span></div></header><div className="complainant-card"><dl><div><dt>报事人</dt><dd>许先生</dd></div><div><dt>联系电话</dt><dd>138 **** 2041</dd></div><div><dt>自述身份</dt><dd>1204住户</dd></div></dl><aside><span>系统核验</span><strong>未匹配</strong><p>产权人、承租人及家庭成员名册中均无对应记录。账号来源为已终止的历史服务授权。</p></aside></div></section>

        <section className="workorder-section"><header><b>02</b><div><h3>投诉内容</h3><span>客服原始录入，不代表现场结论</span></div></header><p className="workorder-description">报事人称，自7月9日起，1204北侧卧室顶面每日夜间出现连续滴水声。声音约在<mark>00:04</mark>开始，于<mark>00:10</mark>停止，持续约六分钟，期间频率稳定。顶面肉眼未见水渍，触摸无潮湿。报事人曾自行前往1304敲门，连续三晚无人应答，要求物业核查楼上用水及实际居住情况。</p><div className="workorder-tags"><span>重复发生</span><span>固定时段</span><span>无可见水迹</span><span>楼上无人应答</span></div></section>

        <section className="workorder-section"><header><b>03</b><div><h3>受理通话节选</h3><span>CALL-W0713-019-03 · 录音时长 02:16</span></div></header><div className="call-transcript"><p><time>00:34</time><b>客服 CS-046</b><span>请问您能确认声音来自楼上1304，而不是室内管道吗？</span></p><p><time>00:41</time><b>报事人</b><span>能。它就在卧室顶上，一滴一滴的，每天都是同一个时间。</span></p><p><time>01:08</time><b>客服 CS-046</b><span>白天复查没有发现漏水，工程人员会继续联系楼上住户。</span></p><p><time>01:17</time><b>报事人</b><span>那不是水管。水管不会每天只响六分钟。</span></p><p className="is-anomalous"><time>01:29</time><b>报事人</b><span>你们有没有确认过，楼上的人是不是已经死了？</span></p></div><small className="transcript-note">质检备注：末句后存在6秒静音；录音结束时间与客户端挂断时间相差00:04。</small></section>

        <section className="workorder-section"><header><b>04</b><div><h3>历次处理记录</h3><span>按系统写入时间排序</span></div></header><div className="workorder-history"><article><time>07-09 08:40</time><i className="is-done"/><div><strong>工程维修组 / 陈工</strong><p>1204顶面无水迹，现场湿度18%，管道压力正常。白天未复现异常声音，建议补查楼上水表。</p></div></article><article><time>07-09 09:05</time><i className="is-done"/><div><strong>客服中心 / CS-046</strong><p>电话联系1304登记号码，无人接听；上门按铃两次，无人应答。</p></div></article><article><time>07-12 15:26</time><i className="is-done"/><div><strong>工程维修组 / 陈工</strong><p>第二次复查结果与首次一致。投诉人拒绝撤单，要求在异常发生时段调取公共区域监控。</p></div></article><article className="is-current"><time>07-13 08:41</time><i/><div><strong>系统派单 / CJ-0713</strong><p>因相同时段连续三次报事，工单自动重新开启，并转长期空置房管理岗复核。</p></div></article></div></section>

        <section className="workorder-section"><header><b>05</b><div><h3>附件与关联材料</h3><span>点击关联材料可直接进入对应档案</span></div></header><div className="workorder-attachments"><div><i>WAV</i><p><strong>受理通话原始录音</strong><span>CALL-W0713-019-03 · 2.8 MB</span></p><b>已在本页转写</b></div><div><i>JPG</i><p><strong>1204卧室顶面现场照片</strong><span>3张 · 07-12 15:28上传</span></p><b>本工单附件</b></div><button type="button" className="is-related" onClick={() => openRelatedArticle("meter-1304")}><i>ENG</i><p><strong>1304水表与顶面湿度联合检测</strong><span>关联工程记录 · ENG-1304-0712</span></p><b>打开档案 →</b></button><button type="button" className="is-related" onClick={() => openRelatedArticle("cctv-1204")}><i>CAM</i><p><strong>12层夜间公共区域监控</strong><span>建议时段 00:04—00:10 · CAM-12F-02</span></p><b>打开档案 →</b></button></div></section>

        <aside className="workorder-audit"><div><span>系统审计提示 / OCCUPANCY CONFLICT</span><strong>报事账号与房屋状态存在冲突</strong><p>1204当前仍登记为“长期空置”。该冲突不影响紧急工单受理，但在结单前必须补充实际占用人与产权关系。</p></div><b>复核中</b></aside>
        <footer className="workorder-signoff"><span>当前处理人：CJ-0713</span><span>生成时间：2026-07-13 08:43</span><span>数据来源：客服、工程、门禁联合工单</span></footer>
      </div>
    </>;

    if (id === "vacancy-1204") return <>
      <table className="data-table"><tbody><tr><th>产权状态</th><td>产权人涉嫌经济犯罪，长期境外失联</td></tr><tr><th>授权服务</th><td>许建国、赵秀兰 · 每月两次保洁</td></tr><tr><th>服务终止</th><td>2026-03-31（续费停止）</td></tr><tr><th>异常门禁</th><td>2026-04-03起每日出现</td></tr><tr><th>登记儿童</th><td className="danger-text">0人</td></tr></tbody></table>
      <div className="shoe-evidence-photo">
        <Image src="/evidence/1204-child-shoes.png" alt="1204门外发现的儿童童鞋与潮湿脚印" fill sizes="(max-width: 900px) 100vw, 62vw" unoptimized />
        <div className="shoe-evidence-overlay"><span>现场巡检影像 / IMG-1204-0709-04</span><b>拍摄时间 2026-07-09 08:43</b></div>
        <aside><strong>证物 04</strong><p>儿童魔术贴运动鞋<br />鞋内发现卡片边角</p></aside>
      </div>
      <div className="evidence-photo-meta"><span>位置：1204入户门外</span><span>拍摄人：巡检员 Q-018</span><span>原始文件未修改</span></div>
      <p>巡检照片显示厨房存在新鲜食材，次卧出现儿童床品。门外<mark>童鞋</mark>约28码，未列入空置房清点单；鞋内卡片边角与门侧潮湿脚印需要单独调取。</p>
      <div className="document-stamp">空置状态未撤销</div>
    </>;

    if (id === "meter-1304") return <>
      <div className="metric-strip"><div><span>1304水表</span><strong>0.00 L</strong><small>过去24小时</small></div><div><span>1204顶面湿度</span><strong>18%</strong><small>正常干燥</small></div><div><span>异常声源</span><strong>6 min</strong><small>每日重复</small></div></div>
      <p>水表、湿度与管道压力均排除真实漏水。声学传感器却在同一窗口记录到稳定的浴室反射特征，建议调取<mark>声纹分轨</mark>。</p>
    </>;

    if (id === "cctv-1204") {
      const frame = game.nightFrames.at(-1)?.replace(":", "") || "2358";
      return <>
        <div className="camera-feed search-camera"><Image src={`/cctv/cam-${frame}.png`} alt="12层走廊夜间监控" fill sizes="(max-width: 900px) 100vw, 62vw" unoptimized/><div className="camera-overlay"><span>CAM-12F-02</span><span>有效住户：2</span><span>REC</span></div></div>
        <div className="frame-picker">{["23:58", "00:04", "00:07", "00:10", "00:12"].map((time) => <button key={time} className={game.nightFrames.includes(time) ? "is-selected" : ""} onClick={() => toggleFrame(time)}><i />{time}<small>{time === "00:04" ? "地面变化" : time === "00:07" ? "楼梯变化" : time === "00:10" ? "信号变化" : "画面稳定"}</small></button>)}</div>
        <div className="puzzle-submit"><p><strong>任务：</strong>标记所有出现异常、且仅出现异常的三个独立时间点。</p><button className="primary-button" onClick={submitFrames}>{game.surveillanceSolved ? "异常帧已确认" : "提交标记"}</button></div>
      </>;
    }

    if (id === "audio-1304") return <>
      <p>点击声道可静音。保留能够证明声源位置与人物关系的内容。</p>
      <div className="audio-tracks">{[
        ["pipe", "A-01", "管道共振", "低频连续"],
        ["tv", "A-02", "邻户电视", "对白片段"],
        ["bath", "A-03", "浴缸滴水", "六分钟循环"],
        ["child", "A-04", "儿童哼唱", "距离声源0.8m"],
      ].map(([key, code, name, note]) => <button key={key} className={game.mutedTracks.includes(key) ? "is-muted" : ""} onClick={() => toggleTrack(key)}><span>{code}</span><div className="waveform">{Array.from({ length: 18 }).map((_, index) => <i key={index} style={{ height: `${8 + ((index * 13) % 28)}px` }} />)}</div><strong>{name}</strong><small>{game.mutedTracks.includes(key) ? "已静音" : note}</small></button>)}</div>
      <button className="primary-button" onClick={submitAudio}>{game.audioSolved ? "关键声道已保存" : "保存净化声纹"}</button>
    </>;

    if (id === "clinic-child") return <>
      <div className="child-health-record">
        <header><div><span>东临妇幼保健中心</span><strong>儿童健康信息卡</strong></div><b>拾获物证复印件</b></header>
        <div className="child-health-body">
          <div className="child-health-photo"><Image src="/evidence/he-zhiyao-health-photo.png" alt="何芷遥健康档案照片" fill sizes="185px" unoptimized /><span>拍摄：2025-10-12</span></div>
          <section><strong>何芷遥</strong><small>档案号：DL-2020-0412-██</small><dl><div><dt>性别</dt><dd>女</dd></div><div><dt>出生日期</dt><dd>2020-04-12</dd></div><div><dt>监护人</dt><dd>许建国、赵秀兰</dd></div><div><dt>监护关系</dt><dd>婚生子女</dd></div><div><dt>最后登记住址</dt><dd>外区集体宿舍</dd></div><div><dt>本楼住户登记</dt><dd className="danger-text">无记录</dd></div></dl></section>
        </div>
        <footer><span>拾获位置：1204门外左侧童鞋内</span><span>卡片状态：轻微受潮</span></footer>
      </div>
      <p>童鞋购买小票日期为2026-04-03，与1204首次异常门禁同日。住户系统中没有何芷遥的入住记录。</p>
    </>;

    if (id === "register-child") return <>
      <div className="callout"><strong>家庭成员关系核验</strong><p>申请对象为未成年人。父母姓名须与监护材料及1204实际占用人员记录一致，缺少任一字段将退回申请。</p></div>
      <form className="archive-form" onSubmit={submitChild} autoComplete="off">
        <label>儿童姓名<input value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="输入中文姓名" /></label>
        <label>出生日期<input type="date" value={childBirthday} onChange={(event) => setChildBirthday(event.target.value)} /></label>
        <label>父亲姓名<input value={childFather} onChange={(event) => setChildFather(event.target.value)} placeholder="按监护材料填写" /></label>
        <label>母亲姓名<input value={childMother} onChange={(event) => setChildMother(event.target.value)} placeholder="按监护材料填写" /></label>
        <label>与1204占用人关系<select value={childRelation} onChange={(event) => setChildRelation(event.target.value)}><option value="">选择</option><option value="child">婚生子女</option><option value="relative">其他亲属</option><option value="unknown">无关系</option></select></label>
        <label>居住起始日<input type="date" value={childStart} onChange={(event) => setChildStart(event.target.value)} /></label>
        <button className="primary-button">{game.childRegistered ? "临时登记已生效" : "提交补录"}</button>
      </form>
    </>;

    if (id === "rescue-route") return <>
      <div className="route-map"><div className="route-sequence">{game.route.length ? game.route.map((place, index) => <span key={`${place}-${index}`}>{index + 1}. {place}</span>) : <em>尚未建立路径</em>}</div><div className="route-options">{["浴室", "儿童房", "客厅", "1304门外", "电梯", "消防楼梯", "1204"].map((place) => <button key={place} onClick={() => appendRoute(place)}>{place}</button>)}</div></div>
      <table className="data-table"><tbody><tr><th>00:04</th><td>1304浴室声学事件</td></tr><tr><th>00:05</th><td>儿童房旧玩具传感器启动</td></tr><tr><th>00:06</th><td>客厅门磁出现无实体开合</td></tr><tr><th>00:07</th><td>消防楼梯门开启</td></tr><tr><th>00:10</th><td>1204儿童手环恢复在线</td></tr></tbody></table>
      <div className="callout"><strong>门磁与潮湿痕迹</strong><p>引路者从1304内部出现，但人体传感器始终为0。何芷遥的手环信号跟随其移动。</p></div>
      <button className="primary-button" onClick={submitRoute}>{game.childSaved ? "儿童已返回1204" : "提交五段路径"}</button>
    </>;

    if (id === "resident-1304") return <>
      <div className="resident-profile"><div><span>住户状态</span><strong>顾长河</strong><small>独居 · 无有效生命体征记录</small></div><blockquote>“我妻子已经离开很多年了。最近有个长得和她一样的女人会穿门进来。楼下那个孩子也不是人。”</blockquote></div>
      <table className="data-table"><tbody><tr><th>酒精依赖史</th><td>11年</td></tr><tr><th>前妻</th><td>梁静宜 · 2021年迁出</td></tr><tr><th>家庭成员</th><td>历史记录损坏</td></tr><tr><th>最后一次实体门禁</th><td>2023-02-07</td></tr></tbody></table>
    </>;

    if (id === "height-mark") return <>
      <div className="photo-placeholder height-photo"><span>工程影像 / IMG_1304_0819</span><div className="height-line"><i /><b>小满 五岁</b></div></div>
      <p>身高刻度位于浴室门外，后续修补申请要求“不要覆盖名字”。申请人签名为<mark>梁静宜</mark>。</p>
    </>;

    if (id === "accident-xiaoman") return <>
      <div className="redacted-title">历史事故编号 A-1304-0821</div>
      <p>顾小满，女，5岁。急救人员在浴缸内发现溺水儿童。父亲顾长河血液酒精浓度严重超标，邻居在事发前记录到摔砸与哭喊声。</p>
      <p>原结论“普通浴室意外”由物业法务代填。原始笔录写明：<mark>醉酒家暴后的过失致死</mark>。</p>
      <aside className="article-note article-note--dark">附件中的六分钟录音并非当天留下。它每天都在同一时间重新发生。</aside>
    </>;

    if (id === "alibi-liang") return <>
      <div className="timeline-list"><div><time>2023-02-07 18:11</time><p>梁静宜在东临康复中心办理入住</p></div><div><time>2023-02-08 00:36</time><p>顾长河急性酒精中毒死亡</p></div><div><time>2023-02-08 09:20</time><p>梁静宜接到警方通知</p></div></div>
      <p>交通、支付与康复中心录像互相印证。她不可能返回1304，也没有下毒。顾长河死亡后，1304实体门禁再无记录。</p>
    </>;

    if (id === "case-correction") return <form className="archive-form archive-form--wide" onSubmit={submitFatherStatus}>
      <div className="status-review"><span>系统冲突</span><strong>顾长河仍在提交住户留言</strong><p>警方死亡记录：2023-02-08<br/>最后实体门禁：2023-02-07<br/>当前生命体征：0</p></div>
      <label>顾长河当前状态<select value={caseStatus} onChange={(event) => setCaseStatus(event.target.value)}><option value="">选择结论</option><option value="alive">在世但拒绝出门</option><option value="missing">失踪且账号被冒用</option><option value="dead">已经死亡，当前并非实体住户</option></select></label>
      <label>顾长河死亡原因<select value={caseDeath} onChange={(event) => setCaseDeath(event.target.value)}><option value="">选择结论</option><option value="poison">前妻下毒</option><option value="alcohol">独自饮酒过量</option><option value="ghost">女儿主动杀害</option></select></label>
      <button className="primary-button">{game.fatherConfirmedDead ? "死亡状态已确认" : "提交状态核验"}</button>
    </form>;

    if (id === "resident-separation-guide") return <>
      <div className="uncanny-rule"><span>规程编号 / RS-04</span><h2>长期住户不是因死亡而留下。</h2><p>系统认为，真正阻止住户离开的，是对自身状态的错误认知，以及仍被反复执行的未结事项。</p></div>
      <table className="data-table"><tbody><tr><th>条件一</th><td>住户必须知晓自己的真实状态</td></tr><tr><th>条件二</th><td>未结事项数量必须归零</td></tr><tr><th>禁止操作</th><td>不得用“团圆”替代责任认定，不得将思念自动判定为宽恕</td></tr></tbody></table>
      <p className="corrupted-copy" data-copy="他们以为门外的人才是鬼。">他们以为门外的人才是鬼。</p>
    </>;

    if (id === "employee-sync") return <>
      <div className="phone-sync"><span>最后同步 · 周明川</span><p>“如果我明天没来，别信‘外派’。我把原件留在自己房间。”</p><strong>11 · 04 · 2713</strong><small>共享密码 · 来源设备已离线38天</small></div>
      <p>周明川的员工状态在“失联”与“内部转移”之间被修改过17次。公司没有报警记录。</p>
    </>;

    if (id === "room-1104") return !game.colleagueAccess ? <form className="password-gate" onSubmit={submitRoomPassword}><EyeMark /><span>内部记录需要共享密码</span><input value={roomPassword} onChange={(event) => setRoomPassword(event.target.value)} placeholder="输入数字密码" autoComplete="off"/><button className="primary-button">解密1104</button></form> : <form className="archive-form archive-form--wide" onSubmit={submitWall}>
      <div className="wall-visual"><span>竣工图净宽 4.80m</span><div className="wall-gap"><i /><b>实测净宽 4.38m</b></div></div>
      <label>缺失墙体厚度<select value={wallWidth} onChange={(event) => setWallWidth(event.target.value)}><option value="">选择</option><option value="18">18厘米</option><option value="42">42厘米</option><option value="80">80厘米</option></select></label>
      <label>墙后信号判断<select value={wallSignal} onChange={(event) => setWallSignal(event.target.value)}><option value="">选择</option><option value="pipe">老化管道</option><option value="hidden">封闭空间内生物降解</option><option value="animal">小型动物</option></select></label>
      <label>流程字段真实含义<select value={wallArchive} onChange={(event) => setWallArchive(event.target.value)}><option value="">选择</option><option value="travel">外派出差</option><option value="transfer">员工灭口后的内部转移</option><option value="resign">主动离职</option></select></label>
      <button className="primary-button">{game.colleagueSolved ? "1104证据已恢复" : "恢复转移单"}</button>
    </form>;

    if (id === "symbol-eye-record") return <>
      <div className="symbol-dossier">
        <div className="symbol-eye-field" aria-hidden="true">{Array.from({ length: 15 }).map((_, index) => <EyeMark key={index} small />)}</div>
        <header><EyeMark /><div><span>图形相似项 / HMO-EYE-04</span><strong>眼白向下的单眼标记</strong><small>匹配度 98.7% · 自动核验已被上级策略中止</small></div></header>
        <dl><div><dt>当前备案主体</dt><dd>恒目管理顾问有限公司</dd></div><div><dt>物业使用范围</dt><dd>员工证、外部终端、驻场设备封签</dd></div><div><dt>对外释义</dt><dd>设施全时监督</dd></div><div><dt>最早图形记录</dt><dd>2018-04-04 · 早于企业成立</dd></div><div><dt>相似来源</dt><dd className="symbol-redacted">未登记互助组织 / 字段已删除</dd></div><div><dt>内部文字别名</dt><dd>OMNISIGHT / 全知██</dd></div></dl>
      </div>
      <p>工商图形库未发现更早的企业备案，但物业内部旧档中，该标记曾被称为“监督之眼”。一份未完成的数据迁移记录将其来源指向某个<mark>未登记宗教组织</mark>，随后该字段被恒目合规策略覆盖。</p>
      <div className="search-surveillance"><span>检索组合已记录</span><strong>“眼白向下” + “全知” + “恒目”</strong><p>该组合不属于当前工单的必要查询范围。账号CJ-0713已进入检索行为复核。</p></div>
      <aside className="compliance-threat"><EyeMark /><div><span>物业合规中心 / 自动告警</span><h2>不要再深究。</h2><p>此前查询该图形来源的17名员工均已完成一致性校准，其检索记录、私人备忘及相关记忆已恢复至标准状态。</p><strong>请返回1204投诉工单。不要继续搜索“恒目”“过滤”或“驻场设备”。</strong></div></aside>
    </>;

    if (id === "vendor-hengmu-index") return <>
      <div className="compliance-banner compliance-banner--index"><EyeMark /><div><strong>恒目管理顾问</strong><span>OMNISIGHT MANAGEMENT</span></div></div>
      <dl className="record-grid"><div><dt>合作性质</dt><dd>物业实际管理顾问</dd></div><div><dt>服务范围</dt><dd>员工一致性与异常住户处置</dd></div><div><dt>图形备案</dt><dd>眼白向下的单眼标记</dd></div><div><dt>资金来源</dt><dd>物业服务费专项科目</dd></div></dl>
      <p>该机构登记为普通人类组织，没有宗教团体备案。企业介绍中反复出现一句不属于工商材料的话：</p>
      <p className="corrupted-copy corrupted-copy--red" data-copy="我们不预测未来。我们只删除你已经看见的过去。">我们不预测未来。我们只删除你已经看见的过去。</p>
    </>;

    if (id === "church-compliance") return <>
      <div className="compliance-banner"><EyeMark /><div><strong>恒目管理顾问</strong><span>看见 · 纠正 · 保持一致</span></div></div>
      <p>培训材料将不服从管理的员工归类为“噪点”，将记忆清除称为<mark>过滤</mark>。所有骨灰寄存费用经物业费科目转入恒目文化基金。</p>
      <table className="data-table"><tbody><tr><th>驻场设备</th><td>强执念灵体的可见性介质</td></tr><tr><th>外部终端</th><td>员工刷卡后获得短时实体识别</td></tr><tr><th>离场流程</th><td>清除本轮案件记忆</td></tr><tr><th>创办人目标</th><td>尝试复活意外死亡的家人</td></tr></tbody></table>
      <p className="muted-copy">文件末尾注明：恒目组织仍在正常运营。本次证据不足以定位其全部成员。</p>
    </>;

    if (id === "w04-directory") return <>
      <div className="w04-index-card"><div className="w04-index-photo"><Image src="/residents/w-04.png" alt="1404住户索引影像" fill sizes="260px" unoptimized/></div><section><span>住户关怀索引</span><strong><MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /></strong><dl><div><dt>房号</dt><dd>1404</dd></div><div><dt>行动状态</dt><dd>需使用轮椅</dd></div><div><dt>关怀原因</dt><dd>配偶死亡后的长期哀伤</dd></div><div><dt>固定接收员工</dt><dd className="glitch-field">CJ-0713</dd></div></dl></section></div>
      <p>住户坚持由同一名员工每日回访，并声称双方已经“见过很多次”。系统却将每次会面都登记为<mark>首次接触</mark>。</p>
      <div className="uncanny-counter"><span>本年度首次接触次数</span><strong>223</strong><small>计数逻辑错误 / 无法修复</small></div>
    </>;

    if (id === "care-w04") return <>
      <div className="wife-evidence"><Image src="/residents/w-04.png" alt="1404住户坐在轮椅上等待" fill sizes="(max-width: 900px) 100vw, 58vw" unoptimized/><div><blockquote>“我丈夫每天都会回来。只是每次回来，都比以前更不认识我。”</blockquote><small>1404住户 · <MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /></small></div></div>
      <div className="callout"><strong>公司沟通要求</strong><p>不得认同其关于亡夫的描述；不得询问房内<mark>驻场设备</mark>；住户保持沉默即可维持每日会面。</p></div>
    </>;

    if (id === "night-shift-sugar") return <>
      <div className="receipt-stack"><span>员工健康物资领取 / CJ-0713</span>{["2026-07-11 23:52", "2026-07-10 23:48", "2026-07-09 23:51", "2026-07-08 23:49"].map((time) => <p key={time}><time>{time}</time><b>葡萄糖硬糖 × 1</b><i>代签：林若岚</i></p>)}</div>
      <p>健康档案没有低血糖诊断。备注由林若岚手写：“他胃不舒服的时候不肯吃饭，只肯含一颗糖。”</p>
      <aside className="article-note article-note--dark">系统无法解释：住户为什么知道当前员工尚未录入的生活习惯。</aside>
    </>;

    if (id === "device-type-index") return <>
      <div className="device-classification"><EyeMark /><span>资产分类 ZC-LH</span><strong>驻场设备</strong><p>无需供电 · 无网络心跳 · 与外部打卡终端绑定</p></div>
      <table className="data-table"><tbody><tr><th>适用房屋</th><td>长期空置房、特殊保管房</td></tr><tr><th>识别时段</th><td>每日00:04—00:10可出现非授权感知</td></tr><tr><th>移出条件</th><td><span className="redacted-field">知情状态 / 未结事项</span></td></tr><tr><th>管理要求</th><td>不得向设备解释其分类依据</td></tr></tbody></table>
      <p className="corrupted-copy" data-copy="设备不是设备。驻场不是在岗。">设备不是设备。驻场不是在岗。</p>
    </>;

    if (id === "on-site-device") return <>
      <div className="device-record"><EyeMark /><span>资产编号</span><strong>CJ-0713</strong><dl><div><dt>登记名称</dt><dd>驻场设备</dd></div><div><dt>实际内容物</dt><dd>人类骨灰</dd></div><div><dt>保管地址</dt><dd>1404</dd></div><div><dt>外部终端</dt><dd>在岗可见性校准</dd></div></dl></div>
      <p>保管人林若岚拒绝将骨灰盒移出房间。物业向她承诺，只要不向员工说明真相，丈夫每晚都会回来。</p>
    </>;

    if (id === "employee-cj0713-index") return <>
      <div className="employee-index"><section><span>当前账号</span><strong>CJ-0713</strong><small>长期空置房管理员</small></section><dl><div><dt>账号状态</dt><dd>在岗</dd></div><div><dt>首次入职</dt><dd>2025-11-05</dd></div><div><dt>有效打卡</dt><dd>251次</dd></div><div><dt>有效下班</dt><dd className="glitch-field">0次</dd></div><div><dt>紧急联系人</dt><dd><MosaicText value={WIFE_NAME} revealed={wifeNameRevealed} /></dd></div></dl></div>
      <div className="access-loop"><span>最近三次登录</span><p>08:41 打卡成功　→　00:10 连接中断</p><p>08:41 打卡成功　→　00:10 连接中断</p><p>08:41 打卡成功　→　<span>员工仍在楼内</span></p></div>
      <p className="corrupted-copy corrupted-copy--red" data-copy="如果你从未下班，今天为什么还需要重新打卡？">如果你从未下班，今天为什么还需要重新打卡？</p>
    </>;

    if (id === "crash-cj0713") return <>
      <div className="split-record"><section><span>交通事故</span><strong>2025-11-04</strong><p>死亡：当前员工档案姓名<br/>幸存：配偶，下肢重伤</p></section><section><span>员工账号</span><strong>CJ-0713</strong><p>创建：2025-11-05<br/>首次打卡：2025-11-05</p></section></div>
      <p>事故前，死者正在调查恒目顾问。行车记录中出现无法对应实体的敲窗声与人影，车辆随后失控。</p>
    </>;

    if (id === "identity-1404") return <form className="archive-form archive-form--wide" onSubmit={submitIdentity}>
      <label>林若岚与当前员工关系<select value={homeWoman} onChange={(event) => setHomeWoman(event.target.value)}><option value="">选择</option><option value="client">普通关怀住户</option><option value="wife">妻子</option><option value="family">前同事家属</option></select></label>
      <label>当前员工状态<select value={homeEmployee} onChange={(event) => setHomeEmployee(event.target.value)}><option value="">选择</option><option value="alive">在职活人</option><option value="missing">失踪</option><option value="dead">已经死亡</option></select></label>
      <label>驻场设备内容<select value={homeDevice} onChange={(event) => setHomeDevice(event.target.value)}><option value="">选择</option><option value="terminal">打卡终端</option><option value="ashes">当前员工骨灰</option><option value="files">案件备份</option></select></label>
      <button className="primary-button">{game.homeSolved ? "身份关系已确认" : "提交人工校验"}</button>
    </form>;

    if (id === "clock-out") return <>
      <div className="final-question"><span>自然显现窗口剩余</span><strong>00:01:24</strong><h2>她仍然看得见你。</h2><blockquote>“这一次，你是回来下班，还是回来和我告别？”</blockquote></div>
      <div className="ending-options"><button disabled={!game.colleagueSolved} onClick={() => chooseEnding("expose")}><span>完整证据链</span><strong>曝光物业并办理退房</strong><small>{game.colleagueSolved ? "公开骨灰寄存、员工灭口与资金流水" : "缺少1104内部转移证据；可继续搜索周明川"}</small></button><button onClick={() => chooseEnding("loop")}><span>保留物业秘密</span><strong>修正部分档案并重新打卡</strong><small>帮助部分灵体离开，接受下一次记忆清除</small></button></div>
    </>;

    if (id === "noise-elevator") return <><div className="callout"><strong>已排除</strong><p>00:04固件重启只影响轿厢显示屏，不影响12层摄像机、门磁或声学设备。</p></div><p>该记录与W-0713-019时间重合，但无法解释湿脚印和住户数量异常。</p></>;
    if (id === "noise-pipe") return <><p>1203空调排水管已更换。滴水为随机发生，不具有固定时间，也没有儿童声纹。</p><aside className="article-note">相似投诉不代表同一原因。注意核对房号。</aside></>;
    if (id === "noise-cat") return <><p>13层流浪猫脚印为四足掌印，集中在消防门外。监控中的潮湿痕迹为双足、约16厘米长。</p><div className="document-stamp">误报已关闭</div></>;
    if (id === "noise-alcohol") return <><p>1302住户争执与酒精有关，妻子确曾报警，但双方均无伤亡。该记录因关键词相似被自动关联。</p><aside className="article-note">自动关联可信度：12%</aside></>;
    return <p>记录正文缺失。</p>;
  };

  if (!game.started) {
    return <main className="login-screen">
      <section className="login-story">
        <div className="brand-lockup"><EyeMark /><span>澄江物业服务中心</span></div>
        <div className="login-eyes" aria-hidden="true">{Array.from({ length: 24 }).map((_, index) => <EyeMark key={index} />)}</div>
        <div className="login-copy"><p>内部档案检索平台 / ARCHIVE 4.2</p><h1>不要按顺序读。<br/>按你怀疑的内容去找。</h1><span>今日待办：调查一张来自“空置房”的夜间滴水投诉。</span></div>
        <span className="login-secret-hint" tabIndex={0}>提示：记录文章中的人名、时间、房号和设备编号，并自行检索。</span>
        <div className="login-grid" />
      </section>
      <section className="login-card"><div><span>外部打卡终端</span><strong>CJ-0713</strong></div><label>员工账号<input value="CJ-0713" readOnly /></label><label>岗位<input value="长期空置房管理" readOnly /></label><button className="primary-button" onClick={startGame}>刷卡并开始值班</button><button className="text-button" onClick={continueGame}>恢复本机调查记录</button></section>
    </main>;
  }

  if (game.view === "ending" && game.ending) {
    return <main className={`ending-screen ending-screen--${game.ending}`}>
      <div className="ending-mark"><EyeMark /></div>
      {game.ending === "expose" ? <><span>结局 / 办理退房</span><h1>系统第一次<br/>记住了所有死者。</h1><p>骨灰寄存、周明川的遗体与物业资金流水被同时公开。妻子终于能说出你的名字。00:10到来时，你没有再去刷卡。</p><blockquote>“你这次回来，是为了好好离开。”</blockquote></> : <><span>结局 / 重新打卡</span><h1>早上好，<br/>CJ-0713。</h1><p>何芷遥获救，顾小满独自退房，其他档案重新归档。你选择保守秘密。外部终端亮起时，你再次忘记1404是谁的家。</p><blockquote>今日待办：处理1204夜间滴水投诉。</blockquote></>}
      <button onClick={() => { localStorage.removeItem(SAVE_KEY); setGame({ ...initialGame, started: true }); }}>从新的检索记录开始</button>
    </main>;
  }

  if (game.view === "denied" && currentArticle) {
    const deniedMessage = deniedMessages[currentArticle.id] ?? "这份记录存在，但它不承认当前账号有资格知道它为什么存在。";
    return <main className="access-denied-screen">
      <div className="denied-eyes" aria-hidden="true">{Array.from({ length: 24 }).map((_, index) => <EyeMark key={index} small />)}</div>
      <section className="denied-terminal">
        <header><EyeMark /><div><span>CHENGJIANG ARCHIVE / ACCESS CONTROL</span><strong>档案权限校验失败</strong></div><b>403.04</b></header>
        <div className="denied-request"><span>请求档案</span><h1>{currentArticle.title}</h1><p>{currentArticle.section} · {currentArticle.date} · 内部索引 {currentArticle.id.toUpperCase()}</p></div>
        <div className="denied-message"><span>系统返回</span><p>{deniedMessage}</p></div>
        <dl><div><dt>当前账号</dt><dd>CJ-0713</dd></div><div><dt>权限状态</dt><dd>条件性拒绝</dd></div><div><dt>失败时间</dt><dd>00:04:00</dd></div><div><dt>注视记录</dt><dd className="denied-live">已写入</dd></div></dl>
        <div className="denied-redactions" aria-hidden="true"><i/><i/><i/><i/></div>
        <button onClick={() => setGame((current) => ({ ...current, view: "search", activeArticle: null }))}>← 返回检索结果</button>
      </section>
      <p className="denied-whisper" data-copy="你已经看见它了。">你已经看见它了。</p>
    </main>;
  }

  return <main className={`archive-app ${game.homeSolved ? "archive-app--aware" : ""}`}>
    <header className="archive-header">
      <button className="archive-brand" onClick={() => setGame((current) => ({ ...current, view: "home", activeArticle: null }))}><EyeMark small/><span>澄江物业</span><b>档案检索台</b></button>
      <form className="global-search" onSubmit={submitSearch}><span>⌕</span><input aria-label="搜索物业档案" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入房号、人名、时间、设备编号或你怀疑的词……"/><button>检索</button></form>
      <div className="header-actions"><button onClick={openMessageBoard}>用户留言板{unreadBoardMessages.length > 0 && <i>{unreadBoardMessages.length}</i>}</button><button onClick={openLedger}>证据 {game.evidence.length}</button><div><span>CJ-0713</span><small>{game.homeSolved ? "身份异常" : "值班中"}</small></div></div>
    </header>

    <div className="archive-layout">
      <aside className="archive-sidebar">
        <section><span>当前调查</span><strong>{objective}</strong><small>系统不会自动打开下一篇记录</small></section>
        <nav><button className={game.view === "home" ? "is-active" : ""} onClick={() => setGame((current) => ({ ...current, view: "home", activeArticle: null }))}>调查首页</button><button className={game.view === "search" ? "is-active" : ""} onClick={() => setGame((current) => ({ ...current, view: "search", activeArticle: null }))}>最近结果</button><button onClick={openArchiveIndex}>档案阅读</button><button className={fatherDeductionUnlocked && !game.fatherResolved ? "has-alert" : ""} onClick={openDeductionDesk}>真相推导{fatherDeductionUnlocked && !game.fatherResolved && <i>可推导</i>}</button><button onClick={openLedger}>证据台账</button><button onClick={openMessageBoard}>用户留言板</button></nav>
        <div className="history-list"><span>检索历史</span>{game.searchHistory.length ? game.searchHistory.map((term) => <button key={term} onClick={() => searchFor(term)}>{term}</button>) : <small>尚无检索记录</small>}</div>
        <footer><span>服务器时间</span><strong>{game.homeSolved ? "00:09:14" : "2026-07-13 08:43"}</strong><small>{game.homeSolved ? "自然显现窗口" : "档案索引正常"}</small></footer>
      </aside>

      <section className="archive-content">
        {notice && <button className="notice-toast" onClick={() => setNotice("")}>{notice}</button>}

        {game.view === "home" && <div className="dashboard-home">
          <div className="dashboard-haunt" aria-hidden="true">{Array.from({ length: 8 }).map((_, index) => <EyeMark key={index} small />)}</div>

          <div className="dashboard-head"><div><span>工作台 / 2026-07-13</span><h1>空置房管理工作台</h1><p>负责长期空置房巡检、住户回访及异常工单复核。业务记录可通过顶部全文检索关联查询。</p><span className="dashboard-secret-hint" tabIndex={0}>从一张工单开始。下一步由你搜索。</span></div><aside><span>当前班次</span><strong>08:30—17:30</strong><small className="shift-status"><i /> CJ-0713 在线<b>未检测到离场记录</b></small></aside></div>

          <div className="dashboard-metrics"><article className="dashboard-metric--alert"><span>待处理工单</span><strong>1</strong><small>较昨日 -2</small></article><article><span>今日巡检</span><strong>6 / 12</strong><small>完成率 50%</small></article><article className="dashboard-metric--vacant"><span>长期空置房</span><strong className="metric-haunted" data-ghost="18">17</strong><small>本月新增 1</small></article><article><span>未读用户留言</span><strong>{unreadBoardMessages.length}</strong><small>关联当前值班</small></article></div>

          <section className="work-panel"><header><div><span className="section-label">待办工单</span><h2>需要处理</h2></div><small>共 1 项 · 按优先级排序</small></header><button className="urgent-order" onClick={() => openArticle(articles[0])}><div><span>高优先级 · W-0713-019</span><strong>1204 夜间滴水投诉</strong><p>来源疑似1304 · 每日00:04开始 · 持续六分钟</p></div><em className="work-order-ghost">楼上的人是不是已经死了？</em><b>进入工单 →</b></button></section>

          <div className="home-columns"><section><span className="section-label">今日巡检计划</span><div className="inspection-list"><article><i className="is-done">✓</i><div><strong>0906 · 水表数据复核</strong><span>工程巡检 · 08:30</span></div><b>已完成</b></article><article><i>02</i><div><strong>1401 · 空置房例行巡检</strong><span>房屋台账 · 10:30</span></div><b>待开始</b></article><article><i>03</i><div><strong>B2-17 · 设备间温湿度</strong><span>设施设备 · 14:00</span></div><b>未开始</b></article></div></section><section><span className="section-label">近期系统活动</span><div className="system-feed"><p><i className="ok"/>08:41 员工CJ-0713已打卡</p><p className="device-sync"><i/><span>08:40 驻场设备同步完成</span><b>同步对象：CJ-0713</b></p><p><i className="cold"/>00:10 夜间监控恢复正常</p><p className="odd"><i/><span>00:04 有效住户数量：—</span><b>生命体征：0</b></p></div></section></div>
        </div>}

        {game.view === "search" && <div className="search-page">
          <header><span>内部全文检索</span><h1>“{game.lastQuery || "尚未检索"}”</h1><p>{game.lastQuery ? `找到 ${searchResults.length} 条相关记录。标题相似不代表因果关系。` : "在顶部输入你从文章中发现的内容。"}</p></header>
          <div className="result-list">{searchResults.map((article) => {
            const available = article.available(game);
            return <button key={article.id} className={`search-result ${available ? "" : "is-locked"} ${article.kind === "noise" ? "is-noise" : ""}`} onClick={() => openArticle(article)}><div><span>{article.section} · {article.date}</span><h2>{article.title}</h2><p>{article.snippet}</p></div><aside><b>{available ? (game.visited.includes(article.id) ? "已阅" : "打开") : "受限"}</b><small>{available ? article.kind === "noise" ? "自动关联" : "内部档案" : lockedReason(article)}</small></aside></button>;
          })}{game.lastQuery && searchResults.length === 0 && <div className="empty-search"><strong>没有找到完全匹配的记录</strong><p>尝试缩短词语，或核对文章中的姓名、数字与房号。系统不识别完整句子。</p></div>}</div>
        </div>}

        {game.view === "article" && currentArticle && <article className={`record-article record-article--${currentArticle.kind ?? "record"} ${uncannyArticleIds.has(currentArticle.id) ? "record-article--uncanny" : ""}`}>
          <button className="back-link" onClick={() => setGame((current) => ({ ...current, view: current.lastQuery ? "search" : "home", activeArticle: null }))}>← 返回{game.lastQuery ? "检索结果" : "调查首页"}</button>
          <header><div><span>{currentArticle.section}</span><small>{currentArticle.date} · 内部索引 {currentArticleIndex}</small></div><h1>{currentArticle.title}</h1><p>{currentArticle.snippet}</p></header>
          <div className="article-body">{renderArticleBody(currentArticle.id)}</div>
          <footer><span>阅读完毕不代表调查完成</span><p>从正文中选择一个值得怀疑的词，回到顶部手动检索。不要只搜索标题。</p></footer>
        </article>}
      </section>

      <aside className="evidence-rail">
        <header><span>调查台账</span><strong>{game.evidence.length.toString().padStart(2, "0")}</strong></header>
        <p>系统只记录已确认事实，不会替你生成下一次搜索。</p>
        <div>{game.evidence.length ? game.evidence.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{evidenceLabels[item]}</p></article>) : <small>阅读记录或完成复核后，证据会出现在这里。</small>}</div>
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
        {message.id === 112 && !game.missingChildReply && <div className="message-actions"><button onClick={() => setGame((current) => ({ ...current, missingChildReply: "last_seen" }))}>最后在哪里见到她？</button><button onClick={() => setGame((current) => ({ ...current, missingChildReply: "no_report" }))}>为什么没有报警？</button></div>}
        {message.id === 112 && game.missingChildReply && <blockquote>{game.missingChildReply === "last_seen" ? "“昨晚00:04，她还在次卧，说楼上有个衣服全湿的小姑娘叫她出去。00:10滴水停了，人也没了。”" : "“这房子不是我们的，孩子也没登记。许建国怕事情闹大。她的健康卡可能还在门口那双童鞋里。”"}</blockquote>}
        {message.id === 107 && !game.fatherReply && <div className="message-actions message-actions--dark"><button onClick={() => replyToFather("death")}>顾长河，你已经死了。</button><button onClick={() => replyToFather("evidence")}>你没有生命体征，也没有实体门禁。</button></div>}
        {message.id === 107 && game.fatherReply && <div className="dialogue-thread"><p className="dialogue-player">{game.fatherReply === "death" ? "顾长河，你在2023年2月8日死于酒精中毒。现在的你不是活人。" : "1304三年没有生命体征，你也从未通过实体门禁。能穿过门的不是他们，是你。"}</p><p className="dialogue-resident">{game.fatherReply === "death" ? "胡说。我只是很久没出门……可梁静宜每次回来，为什么从来不回答我？" : "所以不是他们穿过门。是我碰不到门，也碰不到她。"}</p></div>}
        {message.id === 107 && game.fatherReply && !game.fatherClosure && <div className="message-actions message-actions--dark"><button onClick={() => closeFatherChat("child")}>小满每天都在门外叫你。</button><button onClick={() => closeFatherChat("guilt")}>你不肯承认，是你害死了她。</button></div>}
        {message.id === 107 && game.fatherClosure && <div className="dialogue-thread dialogue-thread--closure"><p className="dialogue-player">{game.fatherClosure === "child" ? "小满每天都在门外叫你。她想念你，但这不代表她原谅你。" : "不是小满把你留在这里。是你不肯承认，是你害死了她。"}</p><p className="dialogue-resident">{game.fatherClosure === "child" ? "别让她进来。我想听她叫爸爸，可我没有资格把那当成原谅。告诉她，是我做错了。" : "……原来不是小满把我留住。是我一直不敢承认她死在我手里。别让她再因为我等下去。"}</p><small>对方已离线 · 1304有效住户数量重新计算中</small></div>}
      </article>)}</div>
    </aside>
    <aside className={`side-drawer ${ledgerOpen ? "is-open" : ""}`}><header><div><span>案件证据</span><strong>调查台账</strong></div><button onClick={() => setLedgerOpen(false)}>×</button></header><div className="drawer-evidence">{game.evidence.length ? game.evidence.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{evidenceLabels[item]}</p></article>) : <p>暂无已确认事实。</p>}</div></aside>
    <aside className={`side-drawer archive-index-drawer ${archiveIndexOpen ? "is-open" : ""}`} aria-label="档案阅读目录">
      <header><div><span>ARCHIVE READING INDEX</span><strong>档案阅读</strong></div><button aria-label="关闭档案阅读" onClick={() => setArchiveIndexOpen(false)}>×</button></header>
      <div className="archive-index-summary"><div><strong>{articles.length}</strong><span>全部文章</span></div><div><strong>{game.visited.length}</strong><span>已阅读</span></div><div><strong>{articles.filter((article) => !article.available(game)).length}</strong><span>权限受限</span></div></div>
      <div className="archive-index-note">目录显示系统内全部档案。为保留检索审计记录，尚未阅读的档案仍需通过关键词搜索首次打开。</div>
      <div className="archive-index-list">{articles.map((article, index) => {
        const visited = game.visited.includes(article.id);
        const available = article.available(game);
        return <button key={article.id} className={`${visited ? "is-read" : available ? "is-unread" : "is-restricted"} ${article.kind === "noise" ? "is-noise" : ""}`} disabled={!visited} onClick={() => reopenReadArticle(article)}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{article.section} · {article.date}</small><strong>{article.title}</strong></div><b>{visited ? "重新打开" : available ? "需检索定位" : "权限受限"}</b></button>;
      })}</div>
    </aside>
    <aside className={`side-drawer deduction-drawer ${deductionOpen ? "is-open" : ""}`} aria-label="真相推导">
      <header><div><span>INFERENCE DESK</span><strong>真相推导</strong></div><button aria-label="关闭真相推导" onClick={() => setDeductionOpen(false)}>×</button></header>
      {!activeDeduction ? <div className="deduction-list">
        <div className="deduction-notice"><EyeMark small/><p>推导档案不会随调查进度自动开放。只有关键证据进入台账后，才能提交完整因果链。</p></div>
        <button className={`deduction-case ${game.childSaved ? "is-complete" : "is-locked"}`} disabled={!game.childSaved} onClick={() => setActiveDeduction("1204")}><span>CASE-01 · 1204</span><strong>空置房与失联儿童</strong><small>{game.childSaved ? "事实链已形成 · 查看结论" : "关键证据不足 · 档案锁定"}</small><b>{game.childSaved ? "已确认" : "— / 3"}</b></button>
        <button className={`deduction-case ${game.fatherResolved ? "is-complete" : fatherDeductionUnlocked ? "is-ready" : "is-locked"}`} disabled={!fatherDeductionUnlocked} onClick={() => setActiveDeduction("1304")}><span>CASE-02 · 1304</span><strong>顾长河与浴室呼唤</strong><small>{game.fatherResolved ? "真相已成立 · 查看结论" : fatherDeductionUnlocked ? "关键证据齐全 · 可以推导" : "需要死亡确认、儿童路径与顾长河对话"}</small><b>{fatherDeductionRequirements.filter((item) => game.evidence.includes(item)).length} / {fatherDeductionRequirements.length}</b></button>
        <button className={`deduction-case ${game.colleagueSolved ? "is-complete" : "is-locked"}`} disabled={!game.colleagueSolved} onClick={() => setActiveDeduction("1104")}><span>CASE-03 · 1104</span><strong>失联员工与异常墙体</strong><small>{game.colleagueSolved ? "事实链已形成 · 查看结论" : "关键证据不足 · 档案锁定"}</small><b>{game.colleagueSolved ? "已确认" : "— / 3"}</b></button>
        <button className={`deduction-case ${game.homeSolved ? "is-complete" : "is-locked"}`} disabled={!game.homeSolved} onClick={() => setActiveDeduction("1404")}><span>CASE-04 · 1404</span><strong>住户关系与驻场设备</strong><small>{game.homeSolved ? "事实链已形成 · 查看结论" : "关键证据不足 · 档案锁定"}</small><b>{game.homeSolved ? "已确认" : "— / 3"}</b></button>
      </div> : <div className="deduction-detail">
        <button className="deduction-back" onClick={() => setActiveDeduction(null)}>← 返回推导档案</button>
        {activeDeduction === "1204" && <><span>CASE-01 / 已确认</span><h2>空置房里住的是活人，敲门的未必是鬼。</h2><p>许建国、赵秀兰在续费停止后非法占用1204；何芷遥并非系统住户。真正引她回家的，是从1304出现的顾小满。</p><div className="truth-seal">事实链成立</div></>}
        {activeDeduction === "1304" && <><span>CASE-02 / {game.fatherResolved ? "已确认" : "等待推导"}</span><h2>谁制造了死亡，谁又制造了“团圆”？</h2><div className="deduction-evidence"><p><i className={game.evidence.includes("childGuide") ? "is-found" : ""}/><span>顾小满引导何芷遥返回1204</span></p><p><i className={game.evidence.includes("fatherDeath") ? "is-found" : ""}/><span>顾长河已经死亡，并非实体住户</span></p><p><i className={game.evidence.includes("fatherAware") ? "is-found" : ""}/><span>顾长河在对话中知晓死亡并承认责任</span></p></div>{game.fatherResolved ? <><p>顾小满死于父亲醉酒暴力后的过失。每日呼唤来自孩子的思念，却不构成宽恕；将父女作为“团圆家庭”合并只会延长两人的执念。</p><div className="truth-seal">真相成立 · 父女档案已分离</div></> : <form className="deduction-form" onSubmit={submitFatherTruth}><label>顾小满死亡责任<select value={caseCause} onChange={(event) => setCaseCause(event.target.value)}><option value="">选择结论</option><option value="accident">普通浴室意外</option><option value="father">父亲醉酒暴力后的过失</option><option value="mother">母亲照看失职</option></select></label><label>每日呼唤的含义<select value={caseMeaning} onChange={(event) => setCaseMeaning(event.target.value)}><option value="">选择结论</option><option value="forgive">女儿已经原谅</option><option value="revenge">女儿寻求复仇</option><option value="longing">儿童思念，不构成宽恕</option></select></label><label>住户档案处理<select value={caseResolution} onChange={(event) => setCaseResolution(event.target.value)}><option value="">选择处理</option><option value="merge">合并父女家庭档案</option><option value="separate">分离父女档案</option></select></label><button className="primary-button">提交完整因果链</button></form>}</>}
        {activeDeduction === "1104" && <><span>CASE-03 / 已确认</span><h2>周明川没有失踪，也从未被调走。</h2><p>“内部转移”是公司对灭口流程的伪装。周明川的遗体被封入1104西墙，其灵体仍通过已注销的员工账号留下信息。</p><div className="truth-seal">事实链成立</div></>}
        {activeDeduction === "1404" && <><span>CASE-04 / 已确认</span><h2>CJ-0713不是物业员工的名字。</h2><p>当前操作者已经死于车祸，是1404住户林若岚的丈夫。所谓驻场设备是其骨灰，刷卡只是在短时间内让活人能够看见他。</p><div className="truth-seal truth-seal--red">当前操作者不具备生命体征</div></>}
      </div>}
    </aside>
  </main>;
}
