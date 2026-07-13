"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Stage =
  | "intro"
  | "dashboard"
  | "vacancy"
  | "leak"
  | "night"
  | "upstairs"
  | "timeline"
  | "audio"
  | "register"
  | "route"
  | "resolution"
  | "branch"
  | "colleague"
  | "wall"
  | "archive"
  | "home"
  | "memory"
  | "final"
  | "ending";

type Ending = "expose" | "loop" | null;

interface GameState {
  started: boolean;
  stage: Stage;
  milestones: string[];
  inspected: string[];
  evidence: string[];
  wifeRead: number[];
  wifeReply: string;
  nightFrames: string[];
  timeline: string[];
  mutedTracks: string[];
  route: string[];
  resolution: "separate" | "merge" | null;
  colleagueSolved: boolean;
  returnAfterColleague: boolean;
  ending: Ending;
}

const initialGame: GameState = {
  started: false,
  stage: "intro",
  milestones: [],
  inspected: [],
  evidence: [],
  wifeRead: [],
  wifeReply: "",
  nightFrames: [],
  timeline: [],
  mutedTracks: [],
  route: [],
  resolution: null,
  colleagueSolved: false,
  returnAfterColleague: false,
  ending: null,
};

const chapterStages: Stage[][] = [
  ["dashboard"],
  ["vacancy", "leak"],
  ["night"],
  ["upstairs", "timeline", "audio", "register", "route", "resolution"],
  ["branch", "colleague", "wall", "archive"],
  ["home", "memory", "final", "ending"],
];

const chapters = [
  ["00", "今日工作台"],
  ["01", "空房来电"],
  ["02", "凌晨 00:04"],
  ["03", "楼上的住户"],
  ["04", "已完成调任"],
  ["05", "返回住处"],
];

const evidenceNames: Record<string, string> = {
  expiredCode: "过期家政密码仍在使用",
  noWater: "零用水量下的滴水声",
  unregisteredChild: "系统拒绝识别第三名住户",
  wetFootprints: "通往1304的湿脚印",
  deadFather: "已注销的投诉人档案",
  wifeAlibi: "妻子的异地康复记录",
  bathtubAudio: "来自浴缸的历史声纹",
  childRegistered: "何知遥的临时住户身份",
  daughterReleased: "已分离的父女住户档案",
  daughterTrapped: "合并的父女住户档案",
  hiddenWall: "1104缺失的42厘米",
  internalTransfer: "员工内部转移流程",
  ashLedger: "驻场设备与骨灰寄存清单",
  churchFlow: "流向关联企业的物业费",
  marriage: "1404住户的结婚照",
  deathRecord: "当前员工的死亡证明",
  ownAshes: "编号CJ-0713的驻场设备",
};

const wifeMessages = [
  {
    id: 1,
    milestone: "clocked",
    time: "08:41",
    text: "今天还是你来处理吗？",
    raw: "今天还是你来处理吗？",
  },
  {
    id: 2,
    milestone: "vacancy_checked",
    time: "09:26",
    text: "声音不是整晚都有。看看它什么时候开始，又在什么时候结束。",
    raw: "声音不是整晚都有。看看它什么时候开始，又在什么时候结束。你以前就是这样找到那六分钟的。",
  },
  {
    id: 3,
    milestone: "leak_checked",
    time: "10:04",
    text: "系统里没有名字，不代表这个人不存在。",
    raw: "系统里没有名字，不代表这个人不存在。你以前也这样说过。",
  },
  {
    id: 4,
    milestone: "child_missing",
    time: "00:11",
    text: "不要先找门。先让这栋楼承认孩子住在这里。",
    raw: "不要先找门。先让这栋楼承认孩子住在这里。楼上的孩子会帮你。",
  },
  {
    id: 5,
    milestone: "father_found",
    time: "00:18",
    text: "想见一个人，不一定代表原谅了他。",
    raw: "想见一个人，不一定代表原谅了他。想留下一个人，也不一定是爱。",
  },
  {
    id: 6,
    milestone: "child_saved",
    time: "00:37",
    text: "如果手机上出现一个不认识的密码，请记下来。这一次别删。",
    raw: "如果手机上出现1104的密码，请记下来。这一次别像上次那样删掉。",
  },
  {
    id: 7,
    milestone: "password_seen",
    time: "00:42",
    text: "夜班别喝太甜的东西。你以前胃不好。",
    raw: "夜班别喝太甜的东西。你以前胃不好。你总说死了以后就不疼了，但还是会皱眉。",
  },
  {
    id: 8,
    milestone: "home_found",
    time: "00:03",
    text: "请合理安排调查时间，下班前检查未结工单。",
    raw: "00:10以前不要刷卡。你每次下班以后都会忘记我。",
  },
];

const timelineEvents = [
  { id: "fight", label: "妻子与丈夫争吵" },
  { id: "leave", label: "妻子离开公寓" },
  { id: "rehab", label: "妻子在异地接受康复治疗" },
  { id: "voice", label: "父亲听见女儿的声音" },
  { id: "drink", label: "父亲大量饮酒" },
  { id: "death", label: "房门从内部反锁，父亲死亡" },
];

const correctTimeline = ["fight", "leave", "rehab", "voice", "drink", "death"];
const correctRoute = ["浴室", "儿童房", "客厅", "消防楼梯", "1204"];

function addUnique(items: string[], values: string[]) {
  return Array.from(new Set([...items, ...values]));
}

function EyeMark({ small = false }: { small?: boolean }) {
  return <span className={`eye-mark ${small ? "eye-mark--small" : ""}`} aria-hidden="true"><i /></span>;
}

function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "ok" | "warn" | "danger" }) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

function SectionHead({ code, title, text }: { code: string; title: string; text: string }) {
  return (
    <div className="section-head">
      <div><span>{code}</span><h1>{title}</h1></div>
      <p>{text}</p>
    </div>
  );
}

function Metric({ label, value, note, tone = "normal" }: { label: string; value: string; note: string; tone?: "normal" | "warn" | "cold" }) {
  return (
    <article className={`metric metric--${tone}`}>
      <span>{label}</span><strong>{value}</strong><small>{note}</small>
    </article>
  );
}

export default function Home() {
  const [game, setGame] = useState<GameState>(initialGame);
  const [wifeOpen, setWifeOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [vacancyAnswer, setVacancyAnswer] = useState("");
  const [valveTest, setValveTest] = useState(false);
  const [leakAnswer, setLeakAnswer] = useState("");
  const [childName, setChildName] = useState("");
  const [childBirthday, setChildBirthday] = useState("");
  const [childRelation, setChildRelation] = useState("");
  const [childStart, setChildStart] = useState("");
  const [caseCause, setCaseCause] = useState("");
  const [caseWife, setCaseWife] = useState("");
  const [caseMeaning, setCaseMeaning] = useState("");
  const [wallAnswer, setWallAnswer] = useState("");
  const [transferAnswer, setTransferAnswer] = useState("");
  const [deviceAnswer, setDeviceAnswer] = useState("");
  const [homeWoman, setHomeWoman] = useState("");
  const [homeEmployee, setHomeEmployee] = useState("");
  const [homeDevice, setHomeDevice] = useState("");
  const [memoryFacts, setMemoryFacts] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const patchGame = (patch: Partial<GameState>) => setGame((current) => ({ ...current, ...patch }));

  const advance = (stage: Stage, milestone?: string, evidence: string[] = []) => {
    setError("");
    setGame((current) => ({
      ...current,
      stage,
      milestones: milestone ? addUnique(current.milestones, [milestone]) : current.milestones,
      evidence: addUnique(current.evidence, evidence),
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (milestone && wifeMessages.some((message) => message.milestone === milestone)) {
      setToast("收到一条新的住户留言");
      window.setTimeout(() => setToast(""), 3600);
    }
  };

  const inspect = (key: string) => {
    setGame((current) => ({ ...current, inspected: addUnique(current.inspected, [key]) }));
  };

  useEffect(() => {
    if (!game.started) return;
    window.localStorage.setItem("chengjiang-arg-save-v2", JSON.stringify(game));
  }, [game]);

  useEffect(() => () => { void audioContextRef.current?.close(); }, []);

  const chapterIndex = useMemo(() => {
    const index = chapterStages.findIndex((stages) => stages.includes(game.stage));
    return index < 0 ? 0 : index;
  }, [game.stage]);

  const progress = Math.round((chapterIndex / (chapters.length - 1)) * 100);
  const unlockedMessages = wifeMessages.filter((message) => game.milestones.includes(message.milestone));
  const unreadMessages = unlockedMessages.filter((message) => !game.wifeRead.includes(message.id));
  const anomaly = ["night", "audio", "route", "final"].includes(game.stage);
  const compliance = ["colleague", "wall", "archive"].includes(game.stage);

  const startNewGame = () => {
    const next = { ...initialGame, started: true, stage: "dashboard" as Stage, milestones: ["clocked"] };
    setGame(next);
    setError("");
    setToast("员工可见性已启用");
    window.setTimeout(() => setToast(""), 3200);
  };

  const continueGame = () => {
    const saved = window.localStorage.getItem("chengjiang-arg-save-v2");
    if (!saved) {
      setError("没有找到上一次调查记录。可以开始新的轮班。");
      return;
    }
    try {
      const parsed = JSON.parse(saved) as GameState;
      setGame({ ...initialGame, ...parsed, started: true });
      setError("");
    } catch {
      setError("调查记录已损坏，请开始新的轮班。");
    }
  };

  const openWife = () => {
    setWifeOpen(true);
    patchGame({ wifeRead: addUnique(game.wifeRead.map(String), unlockedMessages.map((message) => String(message.id))).map(Number) });
  };

  const playAudio = () => {
    if (audioPlaying) return;
    setAudioPlaying(true);
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const context = new AudioCtor();
    audioContextRef.current = context;
    const master = context.createGain();
    master.gain.value = 0.08;
    master.connect(context.destination);
    [0.2, 0.62, 1.04, 2.4, 2.82].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = index < 3 ? 86 : 53;
      gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.7, context.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.18);
      oscillator.connect(gain); gain.connect(master);
      oscillator.start(context.currentTime + offset); oscillator.stop(context.currentTime + offset + 0.2);
    });
    window.setTimeout(() => setAudioPlaying(false), 3400);
  };

  const submitVacancy = (event: FormEvent) => {
    event.preventDefault();
    if (vacancyAnswer !== "cleaners") return setError("该结论无法同时解释门锁、订单和水电记录。再核对临时密码的使用人。 ");
    advance("leak", "vacancy_checked", ["expiredCode"]);
  };

  const submitLeak = (event: FormEvent) => {
    event.preventDefault();
    if (!valveTest) return setError("需要先执行一次远程关阀测试。 ");
    if (leakAnswer !== "acoustic") return setError("水表与湿度均为零，现有证据不支持实体漏水。 ");
    advance("night", "leak_checked", ["noWater"]);
  };

  const toggleNightFrame = (frame: string) => {
    patchGame({ nightFrames: game.nightFrames.includes(frame) ? game.nightFrames.filter((item) => item !== frame) : [...game.nightFrames, frame] });
  };

  const submitNight = () => {
    const correct = ["00:04", "00:07", "00:10"].every((frame) => game.nightFrames.includes(frame)) && game.nightFrames.length === 3;
    if (!correct) return setError("标记所有出现异常、且仅出现异常的时间点。 ");
    advance("upstairs", "child_missing", ["unregisteredChild", "wetFootprints"]);
  };

  const submitTimeline = () => {
    if (game.timeline.join(",") !== correctTimeline.join(",")) return setError("时间线存在矛盾。妻子的康复签到发生在父亲死亡之前。 ");
    advance("audio", "wife_cleared", ["wifeAlibi"]);
  };

  const submitAudio = () => {
    const correct = game.mutedTracks.includes("pipe") && game.mutedTracks.includes("bottle") && !game.mutedTracks.includes("drain") && !game.mutedTracks.includes("voice");
    if (!correct) return setError("目标是移除管道低频和酒瓶碰撞，同时保留浴缸排水与人声。 ");
    advance("register", "audio_restored", ["bathtubAudio"]);
  };

  const submitRegistration = (event: FormEvent) => {
    event.preventDefault();
    if (childName !== "hezhiyao" || childBirthday !== "2020-04-12" || childRelation !== "child" || childStart !== "2026-04-03") {
      return setError("登记未通过。请使用学校通知、药品标签和首次开锁日期中的真实资料。 ");
    }
    advance("route", "child_registered", ["childRegistered"]);
  };

  const chooseRoute = (point: string) => {
    const next = [...game.route, point];
    const expected = correctRoute[next.length - 1];
    if (point !== expected) {
      patchGame({ route: [] });
      setError("走廊重新回到了浴室。儿童画上的箭头从有床的房间开始。 ");
      return;
    }
    patchGame({ route: next });
    setError("");
  };

  const finishRoute = () => {
    if (game.route.join(",") !== correctRoute.join(",")) return setError("孩子还没有走到1204。 ");
    advance("resolution", "child_saved");
  };

  const submitResolution = (event: FormEvent) => {
    event.preventDefault();
    if (caseCause !== "father" || caseWife !== "innocent" || caseMeaning !== "longing") {
      return setError("事故报告仍把思念误写成了宽恕，或没有确认真正责任。 ");
    }
    if (!game.resolution) return setError("请选择父女档案的处理方式。 ");
    const released = game.resolution === "separate";
    advance("branch", "password_seen", [released ? "daughterReleased" : "daughterTrapped"]);
  };

  const submitColleague = (event: FormEvent) => {
    event.preventDefault();
    if (wallAnswer !== "42") return setError("原始图纸与室内测绘之间相差42厘米。 ");
    advance("wall", "wall_measured", ["hiddenWall"]);
  };

  const submitArchive = (event: FormEvent) => {
    event.preventDefault();
    if (transferAnswer !== "murder" || deviceAnswer !== "remains") return setError("“调任”和“设备”仍使用了公司提供的解释。 ");
    setGame((current) => ({
      ...current,
      colleagueSolved: true,
      stage: current.returnAfterColleague ? "final" : "home",
      milestones: addUnique(current.milestones, ["archive_restored", "home_found"]),
      evidence: addUnique(current.evidence, ["internalTransfer", "ashLedger", "churchFlow"]),
      returnAfterColleague: false,
    }));
    setError("");
  };

  const submitHome = (event: FormEvent) => {
    event.preventDefault();
    if (homeWoman !== "wife" || homeEmployee !== "dead" || homeDevice !== "ashes") {
      return setError("身份关系仍未闭合。核对结婚照、车祸日期与员工账号创建日期。 ");
    }
    advance("memory", "home_found", ["marriage", "deathRecord", "ownAshes"]);
  };

  const requiredMemory = ["longing", "unregistered", "alive"];
  const submitMemory = () => {
    if (!requiredMemory.every((fact) => memoryFacts.includes(fact))) return setError("仍有被公司术语掩盖的事实没有确认。 ");
    advance("final", "memory_restored");
  };

  const chooseEnding = (ending: Exclude<Ending, null>) => {
    if (ending === "expose" && !game.colleagueSolved) return;
    patchGame({ ending, stage: "ending" });
    window.localStorage.removeItem("chengjiang-arg-save-v2");
  };

  const resetGame = () => {
    window.localStorage.removeItem("chengjiang-arg-save-v2");
    setGame(initialGame);
    setError("");
    setWifeOpen(false);
    setLedgerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!game.started || game.stage === "intro") {
    return (
      <main className="login-page">
        <div className="login-grid" aria-hidden="true" />
        <section className="login-brand">
          <div className="login-logo"><EyeMark /><span>CJ PROPERTY</span></div>
          <p>澄江人居服务有限公司</p>
          <h1>综合运营<br />管理平台</h1>
          <div className="login-stats"><span>13号楼</span><span>今日工单 17</span><span>设备在线 96.4%</span></div>
        </section>
        <section className="login-panel">
          <div className="login-panel__top"><span>员工登录</span><Tag tone="ok">内网环境</Tag></div>
          <label>员工编号<input value="CJ-0713" readOnly /></label>
          <label>驻场项目<input value="澄江公寓 · 13号楼" readOnly /></label>
          <div className="clock-terminal">
            <div><EyeMark small /><span>外部打卡终端</span></div>
            <strong>请刷员工证开始轮班</strong>
            <small>刷卡后将同步门禁权限与人员可见性</small>
          </div>
          <button className="button button--primary button--wide" onClick={startNewGame}>刷卡上班</button>
          <button className="button button--ghost button--wide" onClick={continueGame}>继续上次调查</button>
          {error && <p className="inline-error">{error}</p>}
          <p className="fiction-note">虚构互动故事 · 不收集真实信息 · 建议开启声音</p>
        </section>
      </main>
    );
  }

  if (game.stage === "ending") {
    const exposed = game.ending === "expose";
    return (
      <main className={`final-ending final-ending--${exposed ? "expose" : "loop"}`}>
        <div className="ending-orbit" aria-hidden="true"><EyeMark /></div>
        <section>
          <p className="kicker">{exposed ? "END 01 / 办理退房" : "END 02 / 优秀员工"}</p>
          <h1>{exposed ? "00:10。\n她看不见你了。" : "早上好，CJ-0713。"}</h1>
          {exposed ? (
            <>
              <p>妻子带着全部档案离开公寓。物业公司的骨灰寄存、员工转移与资金流水在当天被公开。</p>
              <div className="news-card"><span>突发</span><strong>澄江人居服务有限公司接受联合调查</strong><small>实际控制企业家表示“对此完全不知情”——他的领口别着一枚向下凝视的眼睛。</small></div>
              <blockquote>“这一次，不用再回来找我了。”</blockquote>
            </>
          ) : (
            <>
              <p>部分住户档案已修正。未提交的证据将在下班后自动清除。</p>
              <div className="reset-log"><span>记忆同步</span><b>0%</b><i /><span>新工单已分配：1204 夜间异常滴水</span></div>
              <blockquote>门外有个人说自己是物业调查员。可是他看起来没有影子。</blockquote>
            </>
          )}
          <button className="ending-restart" onClick={resetGame}>重新开始轮班</button>
        </section>
      </main>
    );
  }

  const vacancyInspected = ["contract", "service", "access", "usage"].filter((key) => game.inspected.includes(key)).length;
  const leakInspected = ["water", "humidity", "acoustic"].filter((key) => game.inspected.includes(key)).length;
  const upstairsInspected = ["owner", "sensor", "history", "doorlog"].filter((key) => game.inspected.includes(key)).length;
  const homeInspected = ["photo", "crash", "account", "device"].filter((key) => game.inspected.includes(key)).length;

  return (
    <div className={`console ${anomaly ? "console--anomaly" : ""} ${compliance ? "console--compliance" : ""}`}>
      <header className="console-topbar">
        <div className="console-brand"><EyeMark small /><strong>澄江物业</strong><span>综合运营管理平台</span></div>
        <div className="console-project"><span>驻场项目</span><b>澄江公寓 · 13号楼</b></div>
        <div className="console-actions">
          <button onClick={() => setLedgerOpen(true)}>证据台账 <i>{game.evidence.length}</i></button>
          <button onClick={openWife}>住户留言 {unreadMessages.length > 0 && <i>{unreadMessages.length}</i>}</button>
          <div className="employee"><span>CJ-0713</span><Tag tone="ok">在岗可见</Tag></div>
        </div>
      </header>

      <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
      <div className="console-layout">
        <aside className="console-sidebar">
          <p>工作空间</p>
          {chapters.map(([number, label], index) => {
            const locked = index > chapterIndex + 1;
            const active = index === chapterIndex;
            return <div key={number} className={`nav-item ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}`}><span>{number}</span><b>{label}</b>{index < chapterIndex && <i>完成</i>}</div>;
          })}
          <div className="sidebar-foot"><span>系统时间</span><strong>{anomaly ? "00:04:13" : "2026-07-13 08:41"}</strong><small>{anomaly ? "自然显现窗口已开启" : "服务器连接正常"}</small></div>
        </aside>

        <main className="console-main">
          {toast && <button className="toast" onClick={openWife}>{toast}<span>查看 →</span></button>}
          {error && <div className="error-banner" role="alert"><strong>校验未通过</strong><span>{error}</span><button onClick={() => setError("")}>×</button></div>}

          {game.stage === "dashboard" && (
            <>
              <SectionHead code="今日工作台" title="早上好，CJ-0713" text="今日驻场工单已同步。请优先处理夜间安全与空置房异常。" />
              <div className="metrics-row"><Metric label="待办工单" value="17" note="较昨日 +3" /><Metric label="空置房" value="26" note="本周待巡检 4" /><Metric label="住户满意度" value="96.4%" note="统计对象 138" /><Metric label="驻场设备" value="9" note="全部在线" tone="cold" /></div>
              <div className="dashboard-grid">
                <section className="panel"><div className="panel-title"><div><span>优先工单</span><h2>待处理事项</h2></div><Tag tone="warn">1项超时</Tag></div>
                  <button className="work-order" onClick={() => advance("vacancy")}><span className="work-order__code">WO-1204-0713</span><div><strong>夜间持续滴水，楼上敲门无人回应</strong><p>投诉房屋：1204 · 工单来源：住户网页</p></div><Tag tone="danger">高优先级</Tag><b>处理 →</b></button>
                  <div className="work-order work-order--muted"><span className="work-order__code">WO-0902-0712</span><div><strong>公共区域照明闪烁</strong><p>投诉房屋：0902 · 已安排工程人员</p></div><Tag>处理中</Tag></div>
                </section>
                <section className="panel activity"><div className="panel-title"><div><span>系统动态</span><h2>最近记录</h2></div></div>
                  <p><i className="dot dot--green" /><span>08:41</span>员工 CJ-0713 已打卡</p><p><i className="dot" /><span>08:40</span>驻场设备同步完成</p><p><i className="dot dot--blue" /><span>00:10</span>夜间监控恢复正常</p><p className="activity__odd"><i className="dot dot--red" /><span>00:04</span>有效住户数量：—</p>
                </section>
              </div>
            </>
          )}

          {game.stage === "vacancy" && (
            <>
              <SectionHead code="工单 WO-1204-0713" title="谁住在空房里？" text="1204登记为长期空置，投诉人却声称受业主委托居住。核对四类记录后提交调查结论。" />
              <div className="case-layout"><section className="panel evidence-browser"><div className="evidence-tabs">
                {[["contract","空置合同"],["service","家政订单"],["access","门锁记录"],["usage","水电用量"]].map(([key,label]) => <button key={key} className={game.inspected.includes(key) ? "is-seen" : ""} onClick={() => inspect(key)}>{label}<i /></button>)}
              </div>
                {!game.inspected.some((key) => ["contract","service","access","usage"].includes(key)) && <div className="empty-state"><span>04</span><p>选择一类记录开始核验</p></div>}
                {game.inspected.includes("contract") && <div className="document-block"><h3>长期空置房管理协议</h3><dl><div><dt>房屋</dt><dd>13栋1204</dd></div><div><dt>业主</dt><dd>罗启东</dd></div><div><dt>状态</dt><dd>境外 · 涉案限制入境</dd></div><div><dt>允许居住</dt><dd>否</dd></div></dl><p>物业仅获授权进行每月通风及基础清洁。</p></div>}
                {game.inspected.includes("service") && <div className="table-wrap"><table><thead><tr><th>服务日期</th><th>人员</th><th>状态</th></tr></thead><tbody><tr><td>2026-03-27</td><td>何芳 / 王兵</td><td>正常完成</td></tr><tr><td>2026-04-03</td><td>何芳 / 王兵</td><td>合同终止</td></tr><tr className="row-warn"><td>2026-04-10</td><td>—</td><td>无订单进入</td></tr></tbody></table></div>}
                {game.inspected.includes("access") && <div className="table-wrap"><table><thead><tr><th>日期</th><th>凭证</th><th>次数</th></tr></thead><tbody><tr><td>04-03前</td><td>家政临时码 HF-27</td><td>8</td></tr><tr className="row-warn"><td>04-03后</td><td>已过期临时码 HF-27</td><td>91</td></tr></tbody></table><p className="data-note">该密码未被业主重新授权。</p></div>}
                {game.inspected.includes("usage") && <div className="chart-card"><div className="bars">{[8,7,5,6,9,38,46,51,49,55].map((height,index)=><i key={index} style={{height:`${height}%`}} />)}</div><p>04月03日后，水电用量恢复至三人家庭平均值。</p></div>}
              </section>
              <aside className="case-aside"><div className="complaint-card"><span>投诉人留言</span><blockquote>“我们只是替业主看房。滴水声每晚都会出现，孩子已经睡不好了。”</blockquote><small>提交人：何女士 · 网页端</small></div><div className="check-count"><strong>{vacancyInspected}/4</strong><span>类记录已核对</span></div></aside></div>
              {vacancyInspected === 4 && <form className="decision-bar" onSubmit={submitVacancy}><label>提交入住情况结论<select value={vacancyAnswer} onChange={(event)=>setVacancyAnswer(event.target.value)}><option value="">选择最符合证据的结论</option><option value="owner">业主授权亲属暂住</option><option value="cleaners">原家政人员利用旧密码占住</option><option value="remote">境外业主远程操控房屋</option></select></label><button className="button button--primary">确认并继续排查滴水</button></form>}
            </>
          )}

          {game.stage === "leak" && (
            <>
              <SectionHead code="工程复核 / 1204" title="不存在的漏水" text="关闭水阀不能终止声音。核对楼上水表、天花板湿度与声学传感器。" />
              <div className="metrics-row metrics-row--three"><button className="metric-button" onClick={()=>inspect("water")}><Metric label="1304水表" value="0.00 L" note="过去24小时无流量" /></button><button className="metric-button" onClick={()=>inspect("humidity")}><Metric label="1204顶面湿度" value="18%" note="正常干燥范围" /></button><button className="metric-button" onClick={()=>inspect("acoustic")}><Metric label="异常声源" value="6 min" note="00:04—00:10" tone="cold" /></button></div>
              <section className="panel valve-panel"><div><span>远程控制</span><h2>13栋供水总阀</h2><p>执行关阀将中断该楼层全部生活用水，请仅用于紧急排查。</p></div><div className={`valve ${valveTest ? "is-off" : ""}`}><i /><strong>{valveTest ? "已关闭" : "已开启"}</strong></div><button className="button button--secondary" onClick={()=>setValveTest(true)} disabled={valveTest}>{valveTest ? "关阀完成 · 声音仍在" : "执行60秒关阀测试"}</button></section>
              {leakInspected === 3 && <form className="decision-bar" onSubmit={submitLeak}><label>工程初步结论<select value={leakAnswer} onChange={(event)=>setLeakAnswer(event.target.value)}><option value="">选择处理方向</option><option value="pipe">楼上暗管破损</option><option value="owner">业主远程开启水阀</option><option value="acoustic">非实体漏水，转夜间声源复核</option></select></label><button className="button button--primary">进入夜间异常回放</button></form>}
            </>
          )}

          {game.stage === "night" && (
            <>
              <SectionHead code="夜间回放 / 13栋12层" title="系统不承认第三个人" text="标记所有出现异常、且仅出现异常的时间点。画面中的人数与有效住户识别并不一致。" />
              <div className="surveillance"><div className="camera-feed"><div className={`camera-scene camera-scene--${game.nightFrames.at(-1)?.replace(":","") || "2358"}`}><span className="cam-door">1204</span><i className="adult adult--one"/><i className="adult adult--two"/><i className="child"/><div className="wet-steps">•• •• ••</div></div><div className="camera-overlay"><span>CAM-12F-02</span><span>有效住户：2</span><span>REC</span></div></div>
                <div className="timeline-picker">{["23:58","00:04","00:07","00:10","00:12"].map((time)=><button key={time} onClick={()=>toggleNightFrame(time)} className={game.nightFrames.includes(time)?"is-selected":""}><i />{time}<small>{time==="00:04"?"出现湿脚印":time==="00:07"?"孩子上楼":time==="00:10"?"画面缺失1帧":"无异常"}</small></button>)}</div>
              </div>
              <button className="button button--cold button--right" onClick={submitNight}>提交异常帧标记</button>
            </>
          )}

          {game.stage === "upstairs" && (
            <>
              <SectionHead code="关联工单 / 1304" title="楼上的投诉人" text="1304有人回应敲门，并投诉一个陌生孩子闯入。但物业档案显示该房屋当前无人居住。" />
              <div className="case-layout"><section className="panel evidence-browser"><div className="evidence-tabs">{[["owner","当前产权"],["sensor","人体传感"],["history","历史住户"],["doorlog","门禁记录"]].map(([key,label])=><button key={key} className={game.inspected.includes(key)?"is-seen":""} onClick={()=>inspect(key)}>{label}<i /></button>)}</div>
                {game.inspected.includes("owner") && <div className="document-block"><h3>1304产权信息</h3><dl><div><dt>所有权人</dt><dd>许琴</dd></div><div><dt>居住状态</dt><dd>偶尔返屋 · 无常住登记</dd></div><div><dt>前配偶</dt><dd>顾承海（已注销）</dd></div></dl></div>}
                {game.inspected.includes("sensor") && <div className="sensor-zero"><span>房间实时人体数量</span><strong>0</strong><small>对话通道仍处于连接状态</small></div>}
                {game.inspected.includes("history") && <div className="table-wrap"><table><thead><tr><th>姓名</th><th>关系</th><th>状态</th></tr></thead><tbody><tr><td>许琴</td><td>产权人</td><td>非居住</td></tr><tr className="row-warn"><td>顾承海</td><td>前配偶</td><td>2024-11-13 注销</td></tr><tr className="row-cold"><td>顾小满（5岁）</td><td>女儿</td><td>2022-11-04 注销</td></tr></tbody></table></div>}
                {game.inspected.includes("doorlog") && <div className="chart-card"><h3>近一年门禁记录</h3><p>仅许琴在04月12日与11月04日进入。顾承海无任何开门记录。</p><div className="date-marks"><i>04/12</i><i>11/04</i></div></div>}
              </section><aside className="case-aside ghost-chat"><span>现场对话 · 顾先生</span><p>“我妻子已经离开很多年了。最近有个长得和她一样的女人会穿门进来。”</p><p>“楼下那个孩子也不是人。他没有登记，肯定是鬼。”</p><small>人体传感器：0</small></aside></div>
              {upstairsInspected===4 && <button className="button button--cold button--right" onClick={()=>advance("timeline","father_found",["deadFather"])}>恢复顾承海注销档案</button>}
            </>
          )}

          {game.stage === "timeline" && (
            <>
              <SectionHead code="死亡复核 / 顾承海" title="妻子是不是凶手？" text="按发生顺序排列六项记录。点击下方事件加入时间线，再提交校验。" />
              <div className="timeline-workspace"><section className="event-pool"><span>待排序记录</span>{timelineEvents.filter((event)=>!game.timeline.includes(event.id)).map((event)=><button key={event.id} onClick={()=>patchGame({timeline:[...game.timeline,event.id]})}>{event.label}<b>＋</b></button>)}</section><section className="ordered-events"><div><span>已建立时间线</span><button onClick={()=>patchGame({timeline:[]})}>清空重排</button></div>{game.timeline.map((id,index)=><article key={id}><i>{String(index+1).padStart(2,"0")}</i><strong>{timelineEvents.find((event)=>event.id===id)?.label}</strong></article>)}{game.timeline.length===0&&<p>尚未添加记录</p>}</section></div>
              <button className="button button--primary button--right" onClick={submitTimeline} disabled={game.timeline.length!==6}>提交死亡时间线</button>
            </>
          )}

          {game.stage === "audio" && (
            <>
              <SectionHead code="声纹复核 / 00:04—00:10" title="水声来自哪里？" text="移除无关声道，保留能够证明声源与人物关系的内容。" />
              <div className="audio-lab"><div className={`wave ${audioPlaying?"is-playing":""}`}>{Array.from({length:56}).map((_,index)=><i key={index}/>)}</div><button className="audio-play" onClick={playAudio}>{audioPlaying?"播放中…":"▶ 播放合成录音"}</button>
                <div className="track-list">{[["pipe","管道低频","48 Hz"],["bottle","酒瓶碰撞","2.3 kHz"],["drain","浴缸排水","历史匹配"],["voice","儿童声音","低可信度"]].map(([id,label,note])=>{const muted=game.mutedTracks.includes(id);return <button key={id} className={muted?"is-muted":""} onClick={()=>patchGame({mutedTracks:muted?game.mutedTracks.filter((item)=>item!==id):[...game.mutedTracks,id]})}><span>{muted?"MUTED":"ACTIVE"}</span><strong>{label}</strong><small>{note}</small></button>})}</div>
                {game.mutedTracks.includes("pipe")&&game.mutedTracks.includes("bottle")&&!game.mutedTracks.includes("drain")&&!game.mutedTracks.includes("voice")&&<blockquote className="audio-transcript"><time>00:05.42</time>“爸爸，你什么时候回来？”</blockquote>}
              </div>
              <button className="button button--cold button--right" onClick={submitAudio}>与历史报警录音比对</button>
            </>
          )}

          {game.stage === "register" && (
            <>
              <SectionHead code="紧急住户登记" title="把孩子写回系统" text="夫妻已经承认非法入住，并提供了三份真实资料。系统只有承认孩子存在，才能为他生成返程路径。" />
              <div className="register-layout"><section className="source-docs"><article><span>学校接送通知</span><strong>何知遥</strong><p>监护人：何芳</p></article><article><span>儿童药品标签</span><strong>2020-04-12</strong><p>用量：每次5ml</p></article><article><span>首次共同入住</span><strong>2026-04-03</strong><p>门锁凭证 HF-27</p></article></section>
                <form className="resident-form" onSubmit={submitRegistration}><label>真实姓名<select value={childName} onChange={(event)=>setChildName(event.target.value)}><option value="">选择</option><option value="hezhiyuan">何知远</option><option value="hezhiyao">何知遥</option><option value="luoqidong">罗启东</option></select></label><label>出生日期<select value={childBirthday} onChange={(event)=>setChildBirthday(event.target.value)}><option value="">选择</option><option>2020-04-12</option><option>2021-11-04</option><option>2019-04-03</option></select></label><label>身份关系<select value={childRelation} onChange={(event)=>setChildRelation(event.target.value)}><option value="">选择</option><option value="visitor">临时访客</option><option value="child">共同居住子女</option><option value="owner">产权人亲属</option></select></label><label>入住日期<select value={childStart} onChange={(event)=>setChildStart(event.target.value)}><option value="">选择</option><option>2026-04-03</option><option>2026-07-13</option><option>2026-03-27</option></select></label><button className="button button--primary button--wide">生成紧急住户身份</button></form></div>
            </>
          )}

          {game.stage === "route" && (
            <>
              <SectionHead code="跨层对讲 / 剩余显现 04:31" title="带他走出浴室" text="顾小满留下了五个地点。按儿童画中的箭头选择返程路线；走错的门会回到浴室。" />
              <div className="route-layout"><div className="child-drawing"><div className="drawing-tub">水</div><div className="drawing-bed">床</div><div className="drawing-sofa">沙发</div><div className="drawing-stairs">↘<br/>楼梯</div><div className="drawing-door">1204</div><span>不要坐电梯</span></div><div className="route-console"><div className="route-current">{game.route.length===0?<span>等待选择起点</span>:game.route.map((point,index)=><span key={`${point}-${index}`}>{point}{index<game.route.length-1&&" → "}</span>)}</div><div className="route-buttons">{["浴室","厨房","儿童房","客厅","电梯","消防楼梯","1204","1304"].map((point)=><button key={point} disabled={game.route.includes(point)} onClick={()=>chooseRoute(point)}>{point}</button>)}</div><button className="button button--cold button--wide" onClick={finishRoute}>呼叫1204并确认返程</button></div></div>
            </>
          )}

          {game.stage === "resolution" && (
            <>
              <SectionHead code="事故责任复核" title="思念不是宽恕" text="这份报告会决定父女是否继续被登记为同一组住户。请选择能够被全部证据支持的事实。" />
              <form className="resolution-form" onSubmit={submitResolution}><label><span>女儿死亡责任</span><select value={caseCause} onChange={(event)=>setCaseCause(event.target.value)}><option value="">选择</option><option value="accident">普通浴室意外</option><option value="father">父亲醉酒家暴后的过失</option><option value="wife">母亲照看失职</option></select></label><label><span>父亲死亡原因</span><select value={caseWife} onChange={(event)=>setCaseWife(event.target.value)}><option value="">选择</option><option value="murder">妻子下毒</option><option value="innocent">独自饮酒过量，妻子不在场</option><option value="ghost">女儿主动杀害父亲</option></select></label><label><span>女儿呼唤的含义</span><select value={caseMeaning} onChange={(event)=>setCaseMeaning(event.target.value)}><option value="">选择</option><option value="forgive">原谅父亲</option><option value="revenge">向父亲复仇</option><option value="longing">儿童对父亲的思念，不构成宽恕</option></select></label><fieldset><legend>住户档案处理</legend><button type="button" className={game.resolution==="merge"?"is-selected":""} onClick={()=>patchGame({resolution:"merge"})}><strong>合并为家庭住户</strong><small>保留父女共同登记</small></button><button type="button" className={game.resolution==="separate"?"is-selected":""} onClick={()=>patchGame({resolution:"separate"})}><strong>分离父女档案</strong><small>允许顾小满单独办理退房</small></button></fieldset><button className="button button--primary button--wide">提交事故报告</button></form>
            </>
          )}

          {game.stage === "branch" && (
            <>
              <SectionHead code="本次主要工单已处理" title="手机里多了一个密码" text="密码管理器显示它由失踪同事周明川共享，对应平面图中不存在的1104。系统没有生成任务。" />
              <div className="branch-choice"><article className="password-card"><span>共享密码</span><strong>11 · 04 · 2713</strong><p>来源：周明川 · 最后同步于失踪当日</p><i>未识别的房间</i></article><div><h2>这不属于当前工单。</h2><p>你可以按要求返回1404完成本日最后一次关怀回访，也可以主动调查同事留下的房间。</p><button className="button button--danger" onClick={()=>advance("colleague")}>尝试打开1104</button><button className="button button--ghost" onClick={()=>advance("home","home_found")}>暂不处理 · 返回关怀住户</button></div></div>
            </>
          )}

          {game.stage === "colleague" && (
            <>
              <SectionHead code="隐藏房间 / 1104" title="消失的42厘米" text="公司将1104标记为设备间。原始建筑图和当前室内测绘存在一段无法解释的误差。" />
              <div className="plan-compare"><article><span>原始竣工图</span><div className="plan plan--original"><i>6.80m</i><b>卧室</b><b>客厅</b></div><small>建筑内墙线：完整</small></article><article><span>当前测绘</span><div className="plan plan--current"><i>6.38m</i><b>卧室</b><b>客厅</b><em>?</em></div><small>西侧墙体增厚</small></article></div>
              <form className="decision-bar" onSubmit={submitColleague}><label>缺失宽度<select value={wallAnswer} onChange={(event)=>setWallAnswer(event.target.value)}><option value="">选择测算结果</option><option value="24">24厘米</option><option value="42">42厘米</option><option value="68">68厘米</option></select></label><button className="button button--danger">定位异常墙体</button></form>
            </>
          )}

          {game.stage === "wall" && (
            <>
              <SectionHead code="信号检测 / 1104西墙" title="墙后有一台员工设备" text="周明川的手机号仍处于在线状态。调用寻机服务，确认信号是否来自缺失空间。" />
              <div className="wall-scene"><div className="false-wall"><span>42cm</span><i /><div className="phone-vibration">BUZZ</div></div><section><Tag tone="danger">信号强度 -12 dBm</Tag><h2>设备距离：0.31m</h2><p>门禁记录显示周明川进入1104后从未离开。HR的异地调任通知在两天后补发。</p><button className="button button--danger" onClick={()=>advance("archive")}>恢复“内部转移”文件</button></section></div>
            </>
          )}

          {game.stage === "archive" && (
            <>
              <SectionHead code="合规文件恢复 / 权限异常" title="已完成调任" text="不要使用公司术语。根据门禁、遗体位置和工单内容重新解释两个字段。" />
              <div className="classified"><div className="classified__head"><EyeMark small/><span>全知资产管理顾问委员会</span><Tag tone="danger">绝密</Tag></div><dl><div><dt>处理对象</dt><dd>周明川 / 知情员工</dd></div><div><dt>处理方式</dt><dd>内部转移</dd></div><div><dt>遗体锚定</dt><dd>1104 / 已完成</dd></div><div><dt>灵体稳定</dt><dd>等待员工确认</dd></div></dl></div>
              <form className="archive-form" onSubmit={submitArchive}><label>“内部转移”的实际含义<select value={transferAnswer} onChange={(event)=>setTransferAnswer(event.target.value)}><option value="">选择</option><option value="transfer">调往境外项目</option><option value="murder">灭口并伪造离职</option><option value="protect">证人保护</option></select></label><label>“驻场设备”的实际内容<select value={deviceAnswer} onChange={(event)=>setDeviceAnswer(event.target.value)}><option value="">选择</option><option value="terminal">门禁终端</option><option value="server">物业服务器</option><option value="remains">骨灰或遗体锚点</option></select></label><button className="button button--danger button--wide">导出永久住户清单</button></form>
            </>
          )}

          {game.stage === "home" && (
            <>
              <SectionHead code="重点关怀回访 / 1404" title="她在等谁？" text="系统建议避免认同住户关于亡夫的错误描述。房间中的资料却与当前员工产生了直接关联。" />
              <div className="home-layout"><section className="wife-room"><div className="window-light"/><div className="wheelchair"><i/><b/></div><blockquote>“我丈夫每天都会回来。只是每次回来，都比以前更不认识我。”</blockquote><small>重点关怀住户 W-04</small></section><section className="panel evidence-browser"><div className="evidence-tabs">{[["photo","结婚照"],["crash","车祸档案"],["account","员工账号"],["device","驻场设备"]].map(([key,label])=><button key={key} className={game.inspected.includes(key)?"is-seen":""} onClick={()=>inspect(key)}>{label}<i /></button>)}</div>{game.inspected.includes("photo")&&<div className="document-block"><h3>2019年结婚照</h3><p>新郎面部与员工 CJ-0713 档案照片相似度：99.8%</p></div>}{game.inspected.includes("crash")&&<div className="table-wrap"><table><tbody><tr><th>事故日期</th><td>2025-11-04</td></tr><tr><th>死亡人员</th><td>当前员工档案姓名</td></tr><tr><th>幸存人员</th><td>配偶 · 下肢重伤</td></tr></tbody></table></div>}{game.inspected.includes("account")&&<div className="document-block"><h3>员工账号 CJ-0713</h3><dl><div><dt>创建日期</dt><dd>2025-11-05</dd></div><div><dt>死亡日期</dt><dd>2025-11-04</dd></div><div><dt>可见性</dt><dd>工牌介质</dd></div></dl></div>}{game.inspected.includes("device")&&<div className="device-box"><EyeMark small/><span>驻场设备 CJ-0713</span><strong>内容物：骨灰</strong><small>保管地址：1404</small></div>}</section></div>
              {homeInspected===4&&<form className="home-form" onSubmit={submitHome}><label>女人与当前员工的关系<select value={homeWoman} onChange={(event)=>setHomeWoman(event.target.value)}><option value="">选择</option><option value="client">普通关怀住户</option><option value="wife">妻子</option><option value="colleague">前同事家属</option></select></label><label>当前员工状态<select value={homeEmployee} onChange={(event)=>setHomeEmployee(event.target.value)}><option value="">选择</option><option value="alive">在职活人</option><option value="missing">失踪</option><option value="dead">已经死亡</option></select></label><label>驻场设备内容<select value={homeDevice} onChange={(event)=>setHomeDevice(event.target.value)}><option value="">选择</option><option value="terminal">打卡终端</option><option value="ashes">主角骨灰</option><option value="files">调查档案</option></select></label><button className="button button--primary button--wide">确认1404住户关系</button></form>}
            </>
          )}

          {game.stage === "memory" && (
            <>
              <SectionHead code="原始留言恢复 / 记忆复核" title="她一直在对你说真话" text="物业系统修改了妻子的留言。确认三项已经被案件证明、却被公司术语掩盖的事实。" />
              <div className="raw-messages">{unlockedMessages.map((message)=><article key={message.id}><div><span>合规显示</span><p>{message.text}</p></div><div><span>原始留言</span><p>{message.raw}</p></div></article>)}</div>
              <div className="memory-facts">{[["longing","思念不是宽恕"],["unregistered","未登记不代表不存在"],["transfer","调任不代表离开"],["alive","上班不代表活着"]].map(([id,label])=>{const locked=id==="transfer"&&!game.colleagueSolved;return <button key={id} disabled={locked} className={memoryFacts.includes(id)?"is-selected":""} onClick={()=>setMemoryFacts((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id])}><span>{locked?"未恢复":"事实确认"}</span><strong>{label}</strong></button>})}</div>
              <button className="button button--primary button--right" onClick={submitMemory}>摘下员工证</button>
            </>
          )}

          {game.stage === "final" && (
            <>
              <div className="final-clock"><span>自然显现窗口</span><strong>00:04</strong><i>—</i><strong>00:10</strong><small>阅读文件时倒计时暂停</small></div>
              <section className="final-choice"><p className="kicker">员工可见性介质已移除</p><h1>她仍然看得见你。</h1><blockquote>“这一次，你是回来下班，还是回来和我告别？”</blockquote><div className="final-options"><button className="expose-option" disabled={!game.colleagueSolved} onClick={()=>chooseEnding("expose")}><span>证据完整度 {game.colleagueSolved?"100%":"58%"}</span><strong>曝光物业并办理退房</strong><small>{game.colleagueSolved?"公开骨灰寄存、员工灭口与资金流水":"缺少1104内部转移及资金证据"}</small></button><button className="loop-option" onClick={()=>chooseEnding("loop")}><span>可修正部分住户档案</span><strong>保守秘密并重新打卡</strong><small>帮助部分住户离开，接受下一次记忆清除</small></button></div>{!game.colleagueSolved&&<button className="return-clue" onClick={()=>setGame((current)=>({...current,returnAfterColleague:true,stage:"colleague"}))}>手机里还有一个没有使用的1104密码 →</button>}</section>
            </>
          )}
        </main>
      </div>

      <div className={`drawer-backdrop ${wifeOpen||ledgerOpen?"is-open":""}`} onClick={()=>{setWifeOpen(false);setLedgerOpen(false)}} />
      <aside className={`drawer ${wifeOpen?"is-open":""}`} aria-label="住户留言"><div className="drawer-head"><div><span>重点关怀住户</span><strong>W-04</strong></div><button onClick={()=>setWifeOpen(false)}>×</button></div><div className="care-warning"><strong>沟通建议</strong><p>该住户存在长期哀伤反应。请勿认同其关于亡夫的错误身份描述。</p></div><div className="message-list">{unlockedMessages.map((message)=><article key={message.id}><span>{message.time}</span><p>{message.text}</p>{message.id===1&&!game.wifeReply&&<div><button onClick={()=>patchGame({wifeReply:"known"})}>我们以前见过？</button><button onClick={()=>patchGame({wifeReply:"support"})}>需要情绪支持吗？</button></div>}{message.id===1&&game.wifeReply&&<blockquote>{game.wifeReply==="known"?"“见过。很多次。只是每次都是我记得。”":"“谢谢。你还是只会说这一句。”"}</blockquote>}</article>)}</div>{unlockedMessages.length===0&&<p className="drawer-empty">暂无住户留言</p>}<div className="drawer-compose"><input placeholder="回复住户（当前工单只读）" disabled/><button disabled>发送</button></div></aside>
      <aside className={`drawer ${ledgerOpen?"is-open":""}`} aria-label="证据台账"><div className="drawer-head"><div><span>调查材料</span><strong>证据台账</strong></div><button onClick={()=>setLedgerOpen(false)}>×</button></div><div className="ledger-list">{game.evidence.map((item,index)=><article key={item}><i>{String(index+1).padStart(2,"0")}</i><div><strong>{evidenceNames[item]}</strong><span>{item.includes("church")||item.includes("Transfer")?"内部合规文件":"工单关联证据"}</span></div></article>)}{game.evidence.length===0&&<p className="drawer-empty">完成核验后，证据会自动归入台账。</p>}</div></aside>
    </div>
  );
}
