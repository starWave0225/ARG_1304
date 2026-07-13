"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Stage =
  | "notice"
  | "investigate"
  | "archive"
  | "audio"
  | "reconstruct"
  | "choice"
  | "ending";

type Evidence = "delivery" | "directory" | "chat";
type Ending = "erase" | "confirm" | null;

const evidenceLabels: Record<Evidence, string> = {
  delivery: "配送记录",
  directory: "楼层名录",
  chat: "住户群聊",
};

const stageOrder: Stage[] = [
  "notice",
  "investigate",
  "archive",
  "audio",
  "reconstruct",
  "choice",
  "ending",
];

function HallwayPhoto({ small = false }: { small?: boolean }) {
  return (
    <div className={`hallway ${small ? "hallway--small" : ""}`} aria-label="昏暗走廊的配送照片，尽头门牌写着1304">
      <div className="hallway__ceiling" />
      <div className="hallway__wall hallway__wall--left" />
      <div className="hallway__wall hallway__wall--right" />
      <div className="hallway__door">
        <span className="hallway__plate">1304</span>
        <span className="hallway__handle" />
      </div>
      <div className="hallway__figure" />
      <div className="hallway__stamp">23:04:13</div>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("notice");
  const [activeEvidence, setActiveEvidence] = useState<Evidence>("delivery");
  const [discovered, setDiscovered] = useState<Evidence[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [audioStarted, setAudioStarted] = useState(false);
  const [transcriptReady, setTranscriptReady] = useState(false);
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [ending, setEnding] = useState<Ending>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const progress = useMemo(() => {
    const current = stageOrder.indexOf(stage);
    return Math.max(4, Math.round((current / (stageOrder.length - 1)) * 100));
  }, [stage]);

  const inspectEvidence = (item: Evidence) => {
    setActiveEvidence(item);
    setDiscovered((current) =>
      current.includes(item) ? current : [...current, item],
    );
  };

  const queryResident = (event: FormEvent) => {
    event.preventDefault();
    const normalized = name.replace(/\s/g, "").toLowerCase();
    if (["林弥", "林彌", "linmi", "linyi"].includes(normalized)) {
      setError("");
      setStage("archive");
      return;
    }
    setError("无匹配住户。请从配送标签与群聊中确认姓名。 ");
  };

  const playRecording = () => {
    if (audioStarted) return;
    setAudioStarted(true);

    const AudioCtor = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (AudioCtor) {
      const context = new AudioCtor();
      audioContextRef.current = context;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.4);
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 7.8);
      master.connect(context.destination);

      const noise = context.createBuffer(1, context.sampleRate * 8, context.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (0.25 + Math.sin(i / 3700) * 0.08);
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 920;
      source.buffer = noise;
      source.connect(filter);
      filter.connect(master);
      source.start();

      [1.35, 1.62, 4.8, 5.15, 5.5].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = index < 2 ? 78 : 61;
        gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.4, context.currentTime + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.22);
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.25);
      });
    }

    window.setTimeout(() => setTranscriptReady(true), 3600);
  };

  const submitAddress = (event: FormEvent) => {
    event.preventDefault();
    if (street === "44" && building === "13" && room === "1304") {
      setError("");
      setStage("choice");
    } else {
      setError("校验失败：地址与现有残片不一致。重新核对录音及配送记录。 ");
    }
  };

  const chooseEnding = (value: Exclude<Ending, null>) => {
    setEnding(value);
    setStage("ending");
  };

  const resetGame = () => {
    setStage("notice");
    setActiveEvidence("delivery");
    setDiscovered([]);
    setName("");
    setError("");
    setAudioStarted(false);
    setTranscriptReady(false);
    setStreet("");
    setBuilding("");
    setRoom("");
    setEnding(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (stage === "ending") {
    return (
      <main className={`ending ending--${ending}`}>
        <div className="noise" aria-hidden="true" />
        {ending === "erase" ? (
          <section className="ending__content">
            <p className="eyebrow">档案操作完成</p>
            <h1>1304不存在。</h1>
            <p className="ending__lead">相关记录已删除。该楼层恢复为三户。</p>
            <div className="system-log">
              <span>23:13:04</span>
              <span>配送状态更新</span>
              <strong>包裹已放在你家门口。</strong>
              <span className="system-log__late">当前门牌：1304</span>
            </div>
            <p className="ending__code">结局 A · 空室</p>
            <button className="text-button" onClick={resetGame}>重新调查</button>
          </section>
        ) : (
          <section className="ending__content ending__content--door">
            <p className="eyebrow">住户登记完成</p>
            <div className="final-door" aria-hidden="true">
              <span>1304</span>
              <i />
            </div>
            <h1>欢迎回家。</h1>
            <p className="ending__lead">住户姓名已补录：见证人</p>
            <p className="ending__whisper">门外有人正在替你签收下一个包裹。</p>
            <p className="ending__code">结局 B · 新住户</p>
            <button className="text-button" onClick={resetGame}>重新调查</button>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="noise" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">CJM</span>
          <span>澄江物业档案终端</span>
        </div>
        <div className="case-status">
          <span>CASE 13—04</span>
          <span className="case-status__live">异常记录</span>
        </div>
      </header>

      <div className="progress" aria-label={`调查进度 ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {stage === "notice" && (
        <section className="scene scene--notice">
          <div className="notice-copy">
            <p className="eyebrow">一条不属于你的配送通知</p>
            <h1><span>1304</span><br />不存在的住户</h1>
            <p className="lede">
              包裹送到了另一座城市。签收照片里，有人在一扇不存在的门前等你。
            </p>
            <div className="content-note">
              虚构互动悬疑体验 · 约 10 分钟 · 建议佩戴耳机
            </div>
            <button className="primary-button" onClick={() => setStage("investigate")}>
              打开配送记录 <span>↗</span>
            </button>
          </div>
          <article className="delivery-notice">
            <div className="delivery-notice__head">
              <span>即达配送</span>
              <span>23:04</span>
            </div>
            <strong>您的包裹已送达</strong>
            <p>澄江市枕河路44号 · 13栋1304室</p>
            <HallwayPhoto />
            <div className="delivery-notice__meta">
              <span>签收人：L.M.</span>
              <span>距离你 1,846 km</span>
            </div>
          </article>
        </section>
      )}

      {stage === "investigate" && (
        <section className="workspace">
          <aside className="workspace__rail">
            <p className="rail-label">证据目录</p>
            {(Object.keys(evidenceLabels) as Evidence[]).map((item, index) => (
              <button
                key={item}
                className={`evidence-link ${activeEvidence === item ? "is-active" : ""}`}
                onClick={() => inspectEvidence(item)}
              >
                <span>0{index + 1}</span>
                {evidenceLabels[item]}
                {discovered.includes(item) && <i>已读</i>}
              </button>
            ))}
            <div className="rail-progress">
              <span>{discovered.length}/3 份证据已核对</span>
              <div><i style={{ width: `${(discovered.length / 3) * 100}%` }} /></div>
            </div>
          </aside>

          <section className="evidence-panel">
            <div className="panel-heading">
              <p className="eyebrow">异常签收申诉 / 2026-07-13</p>
              <h2>{evidenceLabels[activeEvidence]}</h2>
            </div>

            {activeEvidence === "delivery" && (
              <div className="evidence-grid">
                <HallwayPhoto small />
                <div className="record-table">
                  <div><span>运单编号</span><b>CJ-4413-1304</b></div>
                  <div><span>送达时间</span><b>23:04:13</b></div>
                  <div><span>收件地址</span><b>枕河路44号 13栋1304</b></div>
                  <div><span>签收标记</span><b>L.M.</b></div>
                  <p className="margin-note">照片经纬度有效。地址经三次校验，无误。</p>
                </div>
              </div>
            )}

            {activeEvidence === "directory" && (
              <div className="directory-sheet">
                <div className="directory-sheet__title">
                  <span>13栋 · 标准层住户表</span>
                  <span>物业内部资料 / REV.07</span>
                </div>
                {[15, 14, 13, 12, 11].map((floor) => (
                  <div className={`floor-row ${floor === 13 ? "floor-row--marked" : ""}`} key={floor}>
                    <b>{floor}F</b>
                    <span>{floor}01</span><span>{floor}02</span><span>{floor}03</span>
                    {floor === 13 && <em>消防井</em>}
                  </div>
                ))}
                <p className="hand-note">“这一层从来只有三户。”——管理员 07/12</p>
              </div>
            )}

            {activeEvidence === "chat" && (
              <div className="chat-log">
                <div className="chat-log__date">昨晚 23:07</div>
                <div className="bubble"><b>1302 周姨</b><p>谁又在走廊敲门？已经第三晚了。</p></div>
                <div className="bubble bubble--right"><b>管理员</b><p>监控没有拍到人，请各位不要开门。</p></div>
                <div className="bubble"><b>1301 陈先生</b><p>林弥是不是还没搬走？我看见她门口有个包裹。</p></div>
                <div className="bubble bubble--deleted"><b>未知成员</b><p>“别再叫我的名字。门会听见。”</p></div>
                <div className="chat-log__system">成员“林弥”已被移出群聊</div>
              </div>
            )}

            {discovered.length === 3 && (
              <form className="resident-query" onSubmit={queryResident}>
                <div>
                  <label htmlFor="resident-name">查询被删除的住户</label>
                  <p>输入配送签收人 L.M. 的中文姓名</p>
                </div>
                <div className="query-control">
                  <input
                    id="resident-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="住户姓名"
                    autoComplete="off"
                  />
                  <button type="submit">检索档案</button>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
              </form>
            )}
          </section>
        </section>
      )}

      {stage === "archive" && (
        <section className="scene scene--document">
          <div className="document-intro">
            <p className="eyebrow">已恢复一份删除记录</p>
            <h2>住户档案<br />林弥</h2>
            <p>删除时间早于入住时间四个月。系统无法解释这一冲突。</p>
          </div>
          <article className="resident-file">
            <div className="resident-file__stamp">已注销</div>
            <div className="file-header">
              <div className="portrait"><span /></div>
              <div>
                <p>姓名 / NAME</p><strong>林弥</strong>
                <p>登记单元 / UNIT</p><strong>13—04</strong>
              </div>
            </div>
            <div className="file-lines">
              <p><span>入住日期</span><b>2026.03.04</b></p>
              <p><span>注销日期</span><b>2025.11.13</b></p>
              <p><span>紧急联系人</span><b className="redacted">已抹除</b></p>
              <p><span>附加材料</span><b>损坏的语音备忘录 × 1</b></p>
            </div>
            <button className="file-action" onClick={() => setStage("audio")}>
              恢复附件 13-04.m4a <span>→</span>
            </button>
          </article>
        </section>
      )}

      {stage === "audio" && (
        <section className="audio-room">
          <div className="audio-room__header">
            <p className="eyebrow">附件恢复 / 信号完整度 31%</p>
            <h2>13-04.m4a</h2>
          </div>
          <div className={`waveform ${audioStarted ? "is-playing" : ""}`} aria-hidden="true">
            {Array.from({ length: 48 }).map((_, index) => <i key={index} />)}
            <span className="waveform__cursor" />
          </div>
          <div className="audio-controls">
            <button className="round-button" onClick={playRecording} disabled={audioStarted} aria-label="播放录音">
              {audioStarted ? "···" : "▶"}
            </button>
            <div><strong>{audioStarted ? (transcriptReady ? "00:08 / 00:08" : "播放中") : "00:00 / 00:08"}</strong><span>建议开启声音</span></div>
          </div>
          {!transcriptReady ? (
            <button className="transcript-skip" onClick={() => setTranscriptReady(true)}>
              无法播放？查看修复文本
            </button>
          ) : (
            <div className="transcript">
              <p><time>00:01</time> 他们说这一层只有三户。</p>
              <p><time>00:03</time> 可每当有人念出门牌，墙后面就会多一声呼吸。</p>
              <p><time>00:05</time> 如果你找到这个，别把地址拼完整。尤其不要——</p>
              <p className="transcript__whisper"><time>00:07</time> 枕河路四十四号，十三栋，一三零……</p>
              <button className="primary-button" onClick={() => setStage("reconstruct")}>
                检查地址残片 <span>→</span>
              </button>
            </div>
          )}
        </section>
      )}

      {stage === "reconstruct" && (
        <section className="reconstruction">
          <div className="reconstruction__copy">
            <p className="eyebrow">地址校验程序</p>
            <h2>补全缺失字段</h2>
            <p>录音在最后一个数字前中断。配送记录中留有完整地址。</p>
            <div className="warning-box">警告：系统会将你提交的地址视为真实记录。</div>
          </div>
          <form className="address-form" onSubmit={submitAddress}>
            <label>
              <span>街道</span>
              <select value={street} onChange={(event) => setStreet(event.target.value)} required>
                <option value="">选择地址残片</option>
                <option value="14">临河路14号</option>
                <option value="44">枕河路44号</option>
                <option value="40">枕河路40号</option>
              </select>
            </label>
            <label>
              <span>楼栋</span>
              <select value={building} onChange={(event) => setBuilding(event.target.value)} required>
                <option value="">选择楼栋</option>
                <option value="31">31栋</option>
                <option value="13">13栋</option>
                <option value="3">3栋</option>
              </select>
            </label>
            <label>
              <span>房号</span>
              <select value={room} onChange={(event) => setRoom(event.target.value)} required>
                <option value="">选择门牌</option>
                <option value="1303">1303室</option>
                <option value="1314">1314室</option>
                <option value="1304">1304室</option>
              </select>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="danger-button" type="submit">提交地址记录</button>
          </form>
        </section>
      )}

      {stage === "choice" && (
        <section className="choice-room">
          <div className="choice-room__scan" aria-hidden="true" />
          <p className="eyebrow">地址已补全 / 实体索引建立中</p>
          <h2>你让1304<br />变得可以被找到。</h2>
          <div className="confirmation-card">
            <div><span>地址</span><strong>枕河路44号 · 13栋1304室</strong></div>
            <div><span>登记状态</span><strong className="status-pulse">等待见证人确认</strong></div>
          </div>
          <p className="choice-question">最后一项：你确认这间房存在吗？</p>
          <div className="choice-actions">
            <button onClick={() => chooseEnding("erase")} className="choice-button choice-button--quiet">
              删除全部记录 <small>让它重新消失</small>
            </button>
            <button onClick={() => chooseEnding("confirm")} className="choice-button choice-button--red">
              确认1304存在 <small>成为它的见证人</small>
            </button>
          </div>
        </section>
      )}

      <footer className="footer">
        <span>FICTIONAL ARCHIVE / 不会收集任何真实信息</span>
        <button onClick={resetGame}>重置调查</button>
      </footer>
    </main>
  );
}
