import type { Metadata } from "next";
import Image from "next/image";
import styles from "./truth.module.css";

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const assetPath = (path: string) => `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

export const metadata: Metadata = {
  title: "全案真相档案 | 不存在的住户",
  description: "澄江公寓四起案件、人物关系、恒目计划、解密答案与双结局的完整真相。",
};

const people = [
  {
    name: "陈峻 / CJ-0713 / CS-046",
    role: "主角 · 被重复分配岗位的死亡主体",
    detail: "2025年11月4日车祸死亡。事故次日，同一实名哈希被建立为CJ-0713；在更早的清除周期中，他也曾使用客服编号CS-046。每天的任务与身份会被重建，私人记忆则被过滤。",
  },
  {
    name: "林若岚",
    role: "1404住户 · 主角的妻子",
    detail: "车祸幸存者，下肢重伤后使用轮椅。她把丈夫的骨灰带回1404，也是在223次“首次接触”中始终认得主角的人。她并非认错工作人员，而是在与失去记忆的丈夫反复重逢。",
  },
  {
    name: "周明川",
    role: "ZM-0602 · 失联员工",
    detail: "发现17名员工的异常转移、物业资金流和ZC-LH标签规律后被清除。遗体最终在1104西墙空腔中找到；他的账号、手机便笺与四份本地证据成为揭开恒目的关键。",
  },
  {
    name: "顾小满",
    role: "1304历史家庭成员 · 5岁",
    detail: "2021年浴室事件中的死亡儿童。她留下的身高刻度、哼唱与六分钟滴水声被系统压成“维修附件”。故事真相中，正是她把许芷遥从1204引到1304门外，避免了另一次儿童伤亡。",
  },
  {
    name: "顾长河",
    role: "1304注销住户 · 顾小满父亲",
    detail: "事故当晚醉酒并涉嫌暴力与看护失职，2023年死于急性酒精中毒。门禁凭证已经停用，留言令牌却继续活动；他被困在否认、悔恨和系统未关闭的家庭关系中。",
  },
  {
    name: "梁静宜",
    role: "顾长河前妻 · 已迁出住户",
    detail: "2021年后迁出，仍要求维修时保留小满的身高刻度。顾长河死亡时她在286公里外的康复机构，门禁、交通、支付和巡房记录共同排除了她当夜返回1304的可能。",
  },
  {
    name: "许建国、赵秀兰与许芷遥",
    role: "1204实际使用者 · 未登记家庭",
    detail: "许建国和赵秀兰原本只以定时服务联系人出现在系统中，服务终止后关联卡仍每日进入。女儿许芷遥没有住户登记，却长期生活在被标为空置的1204。三人与产权人之间的法律关系没有留档。",
  },
  {
    name: "陈大国",
    role: "1204产权登记人",
    detail: "证件尾号、住址与公开经侦通报中的陈某国一致。2024年出境后被列为在逃人员并停止家政续费，因此失联；这解释产权人缺席，却不能替代对实际居住人的核验。",
  },
] as const;

const caseFiles = [
  {
    id: "case-1204",
    number: "01",
    unit: "1204",
    title: "空置房里的未登记儿童",
    verdict: "许芷遥确实住在1204。物业的“空置”只是没有被纠正的台账状态；真正把她引出房间、带到1304门外的是顾小满。",
    image: "/rescue-route/02-1204-corridor.jpg",
    imageAlt: "1204门外的潮湿脚印与孩童影子",
    facts: [
      "产权人陈大国长期失联，1204仍维持空置标签；巡检却发现新鲜食物、儿童床品、28码童鞋和持续门禁。",
      "许建国、赵秀兰的保洁服务在3月31日终止，关联卡从4月3日起几乎每日通行，没有配套工单或钥匙借用。",
      "许芷遥的健康卡藏在童鞋中，鞋盒小票与异常门禁都指向4月3日；她在住户系统中的登记人数仍为0。",
      "00:04至00:10的滴水并非1304正常用水：水表零变化，1204顶面无渗漏；净化声轨保留了浴缸滴水和孩童哼唱。",
      "搜救路线由门磁、双足潮湿痕迹、手环网关和公共区域画面闭合：1204儿童房—门外—消防楼梯—13层前室—1304门外。",
    ],
    truth: [
      "故事层面的引导者是顾小满。她以湿衣、赤脚和领先一个转角的影子出现，把另一个女孩带离了危险房间。",
      "许芷遥没有进入1304室内。1304无开锁记录，她最终在门外相邻消防前室被民警与安保找到。",
      "许家为何借用历史服务身份入住、与陈大国是什么关系，现有材料没有答案；这部分故意不被补成租赁或亲属结论。",
    ],
    coverup: "VACANT-CLOSE策略把生活痕迹自动解释成“产权人临时存放物”，连续两次跳过实际占用复核。物业不是看不见异常，而是让规则替它决定不用看。",
    evidence: [
      ["Q-018", "空置巡检", "食物、床品、童鞋证明近期生活状态"],
      ["SERVICE-1204", "服务排班", "历史联系人、终止日期与异常门禁闭合"],
      ["CAM-12F-02", "事件回放", "00:07门磁、00:10丢帧、00:12重复序列"],
      ["FR-0713-0004", "声纹分轨", "排除电视与管道背景，保留浴缸滴水和儿童哼唱"],
      ["DL-0713-0041", "儿童协查", "身份、监护关系与五点搜救路线"],
    ],
  },
  {
    id: "case-1304",
    number: "02",
    unit: "1304",
    title: "被压成“浴室意外”的家庭悲剧",
    verdict: "顾小满死于顾长河醉酒状态下的暴力与看护失职。顾长河死后仍通过残留会话追问女儿，而物业早已知道父女均已死亡。",
    image: "/rescue-route/05-1304-door.jpg",
    imageAlt: "1304门外水迹与孩童影子",
    facts: [
      "2021年8月21日，110联动附件记录未成年人看护风险及疑似家庭暴力；物业前台只留下“浴室意外”。",
      "顾长河当晚明显醉酒并被民警带离。墙面上“小满 五岁”的身高刻度和梁静宜要求保留名字的申请证明她曾真实生活在1304。",
      "2023年2月8日00:36，顾长河死于急性酒精中毒；09:20物业停用本人门禁，时间差为8小时44分钟。",
      "2026年7月13日仍在活动的不是顾长河门禁，而是MSG-1304留言令牌。令牌能写入、电话能接通，却没有任何实体进出。",
      "许芷遥获救后主动提到“顾小满”，把本次儿童路径与2021年事故附件连接起来。",
    ],
    truth: [
      "顾长河并非被前妻害死。梁静宜在外省的四类记录形成完整不在场证明。",
      "顾长河的异常账号承载着未结的悔恨。他最后承认，小满死亡时自己就在门内；关闭令牌只是停止系统写入，不等于替他获得宽恕。",
      "顾小满救下许芷遥，并不是为父亲洗清责任。她的行动与顾长河的赎罪是两件事，档案也拒绝把它们合并成“团圆”。",
    ],
    coverup: "1304-FAMILY-KEEP在顾长河死亡当天建立：只要命中死亡主体、儿童事故附件和残留会话，就保持家庭关联、不向前台暴露冲突。物业甚至警告CJ-0713“不得动用私情”。",
    evidence: [
      ["A-1304-0821", "110联动附件", "酒后暴力、看护失职与浴室现场"],
      ["IMG-1304-0819", "墙面影像", "顾小满的家庭成员痕迹"],
      ["公安协查回函", "主体状态", "顾长河死亡时间、死因与门禁停用"],
      ["RESCUE-0713", "儿童陈述", "许芷遥在1304门外获救并提到顾小满"],
      ["MSG-1304", "异常会话", "注销账号继续写入及最终令牌停用"],
    ],
  },
  {
    id: "case-1104",
    number: "03",
    unit: "1104",
    title: "没有目的地的内部转移",
    verdict: "周明川没有调岗，也没有主动失联。他因追查恒目与物业的异常项目被灭口，遗体被封在1104少掉的42厘米西墙空腔内。",
    image: "/backgrounds/access-denied-corridor.png",
    imageAlt: "物业档案中的封闭走廊",
    facts: [
      "1104竣工图净宽4.80米，现场三次实测均为4.38米；插座孔附近高温、氨类与TVOC读数提示封闭空腔内存在有机来源。",
      "周明川的“内部转移”单没有车辆、目的地、接收部门、签收人或本人签字，人事状态在三天内被HMO-ADMIN改写17次。",
      "EMP-TRANSFER-CLOSE在21:17预生成，早于人事状态写入，也早于现场异常上报，说明清除流程事先存在。",
      "警方破拆后，工牌与DNA确认墙内遗体为周明川；物业此前既未报警，也无法提供合法离场材料。",
      "他的本地账号仍保存四份未同步证据。读完后，远程会话启动身份校验并显示“你是谁”“我发现你了”，随后以血红眼睛占满终端。",
    ],
    truth: [
      "故事真相指向恒目驻场合规体系实施灭口和封墙；档案能够证明预谋清除链，却没有留下具体执行人的姓名。",
      "周明川预见系统会用“账号仍在线”伪造生存感，因此留下提醒：先量墙，再查转移单，不要把活动令牌当作活人。",
      "他不是第一个受害者。17份无目的地转移对应17名查到异常后被外派、离职或失联的员工，其中6人的最后门禁靠近后来封闭施工的房屋。",
    ],
    coverup: "物业、人事、工程与恒目管理员共用同一套清除词汇：把人写成“内部转移”，把原始材料写成“噪点”，把删除与令牌重建写成“过滤”。",
    evidence: [
      ["1991-09-17", "周明川出生日期", "去掉分隔符后打开1104工程与人事联合复核"],
      ["GAP 42cm", "工程复测", "竣工尺寸与现场空腔不符"],
      ["REVISION 17", "人事审计", "HMO-ADMIN反复改写状态"],
      ["1104-A", "公安破拆", "墙内遗体、工牌与DNA确认"],
      ["ZM-EVID-01—04", "本地目录", "失踪人员、资金、标签与恒目通讯的完整交叉证据"],
    ],
  },
  {
    id: "case-1404",
    number: "04",
    unit: "1404",
    title: "主角是谁，以及妻子为什么一直认得他",
    verdict: "主角是林若岚已故的丈夫。CJ-0713与CS-046只是同一死亡意识在不同清除周期里被分配的员工编号，1404里的骨灰则是他与这栋楼的锚点。",
    image: "/residents/w-04.png",
    imageAlt: "1404住户林若岚坐在轮椅上等待固定回访人员",
    facts: [
      "2025年11月4日22:31，车祸造成一人当场死亡、一人下肢重伤；死者哈希与CJ-0713实名哈希完全一致，紧急联系人指向1404。",
      "11月5日08:12，HMO-ADMIN批量创建CJ-0713，没有劳动合同、面试、体检或入职审批；首次打卡来自1404关联外部终端。",
      "林若岚将丈夫骨灰从殡仪馆转出并留在1404。恒目次日把无电源、无芯片的封存物贴为ZC-LH/CJ-0713，并绑定员工打卡。",
      "CJ-0713有251次有效打卡、0次有效下班；每天08:41重新出现，00:10连接中断。1404则累计223次“首次接触”。",
      "糖、轮椅脚踏高度、说谎前的呼吸和厨房记忆不是住户妄想，而是夫妻共同生活留下的细节。林若岚一直在等待丈夫自己想起来。",
    ],
    truth: [
      "CS-046就是被更早一次记忆清除后的主角。四段回访中相同的问话顺序、质检连续号和T-04终端字段，把046与0713连接为同一操作者。",
      "恒目利用封存物、外部终端和未结关系，让死者意识在“自然显现窗口”中回返，再用物业岗位、任务队列与记忆校正把他固定成可重复观察的员工。",
      "玩家开场看见的日常生活并非别人的梦，而是主角与林若岚的真实记忆正在从过滤层下恢复。",
    ],
    coverup: "MEM-CONSISTENCY会在00:10清除上一轮关系与检索，把林若岚重新标成普通住户，把同一个丈夫重新派成第一次上门的物业管理员。1404投诉甚至被自动转派给被投诉的CJ-0713本人。",
    evidence: [
      ["DL-JJ-1104-27", "事故协查", "死亡主体、紧急联系人与1404"],
      ["DL-1105", "殡仪馆转出单", "封存物、妻子与原址保管链"],
      ["EMP-CJ-0713", "员工主数据", "事故次日无劳动合同建号"],
      ["CARE-1404-R17", "回访冷备份", "223次首次接触与重复生活细节"],
      ["CALL系列", "CS-046质检", "T-04、连续编号与被过滤正文"],
    ],
  },
] as const;

const timeline = [
  ["2021-08-19", "1304墙面影像保留“小满 五岁”的身高刻度。"],
  ["2021-08-21", "顾小满浴室事故；110附件记录疑似家庭暴力与看护失职，物业摘要改写为“浴室意外”。"],
  ["2023-02-08", "顾长河死于急性酒精中毒；物业停用门禁并创建1304-FAMILY-KEEP。"],
  ["2024-11", "1204产权人陈大国出境后被列入经侦协查，房屋失去正常产权人联络。"],
  ["2025-11-04", "主角在车祸中死亡，林若岚下肢重伤；同日恒目批次开始执行终端清理。"],
  ["2025-11-05", "骨灰转入1404，CJ-0713账号与ZC-LH标签由同一审批链建立。"],
  ["2026-04-03", "许家历史服务卡重新进入1204；许芷遥的鞋盒购买日期也落在当天。"],
  ["2026-06-02", "周明川复测1104西墙后被改写为“内部转移”，随后遇害。"],
  ["2026-07-09", "1204投诉第三次开启；CS-046式重复回访与六分钟声响再次出现。"],
  ["2026-07-13", "本次值班：救出许芷遥、关闭顾长河令牌、发现周明川、解开1404并选择是否离开循环。"],
] as const;

const passwords = [
  ["1104内部记录", "19910917", "搜索周明川打开员工基本信息，取出生日期1991-09-17并去掉分隔符。"],
  ["周明川账号", "hengmurecyclezm0602", "按终端备注拼接HENGMU、RECYCLE与员工工号ZM-0602，并去掉分隔符。"],
  ["1404住户索引", "LINRUOLAN", "投诉工单中的报事人姓名林若岚，转为不带声调和空格的完整拼音。"],
  ["1404回访冷备份", "CHENJUN", "从CJ-0713基础索引取得DL-JJ-1104-27，搜索事故报道得到死者姓名陈峻，再转为无声调全拼。"],
  ["1404特殊保管物", "1404", "当前回访对象与封存物共同指向的四位房号。"],
  ["CJ-0713事故协查", "IMISSYOU", "解开特殊保管物后，留言板出现I MISS YOU；去掉空格和标点。"],
] as const;

export default function TruthPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a href={`${BASE_PATH}/`} className={styles.backLink}>返回游戏</a>
        <span>澄江物业 / 结案后阅览</span>
        <b>FULL DISCLOSURE</b>
      </header>

      <section className={styles.hero}>
        <Image src={assetPath("/endings/02-outside-threshold.png")} alt="主角的灵魂离开澄江公寓" fill priority sizes="100vw" unoptimized />
        <div className={styles.heroVeil} />
        <div className={styles.heroCopy}>
          <span>完整剧透 · 创作真相与档案边界</span>
          <h1>全案真相档案</h1>
          <p>四个房号不是四起互不相干的怪事。它们共同指向一个真相：恒目操纵下的澄江物业正在滞留死者的灵魂、把无法离开的意识收编、并抹除知晓了真相的目击者。</p>
          <div><b>04</b><span>核心案件</span><b>17</b><span>异常转移员工</span><b>223</b><span>重复的第一次回访</span></div>
        </div>
      </section>

      <nav className={styles.indexNav} aria-label="全案真相目录">
        <a href="#overview">核心真相</a>
        <a href="#people">人物关系</a>
        <a href="#case-1204">1204</a>
        <a href="#case-1304">1304</a>
        <a href="#case-1104">1104</a>
        <a href="#case-1404">1404</a>
        <a href="#hengmu">恒目计划</a>
        <a href="#timeline">时间线</a>
        <a href="#codes">解密答案</a>
        <a href="#endings">结局</a>
      </nav>

      <section className={`${styles.band} ${styles.overview}`} id="overview">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>00</span><b>CORE TRUTH</b></div>
          <div className={styles.overviewGrid}>
            <div>
              <p className={styles.kicker}>一句话总论</p>
              <h2>主角不是什么传奇调查员。<br />他只是被收编的特殊员工。</h2>
              <p className={styles.lead}>恒目发现，意外死亡者的遗物、生者与往生者纠缠的执念和严谨闭环的信息系统可以形成“回返窗口”。物业被改造成一座观察设施：骨灰盒是锚点，员工账号是容器，工单是唤醒路径，记忆清除则保证实验每天可以重新开始。</p>
            </div>
            <aside className={styles.boundary}>
              <strong>这页如何陈述真相</strong>
              <p><i className={styles.canon} />故事真相：创作设定中实际发生的事。</p>
              <p><i className={styles.proven} />档案证实：玩家可用系统材料闭合的事实。</p>
              <p><i className={styles.open} />故意留白：现有证据无法替角色作出的判断。</p>
            </aside>
          </div>
          <div className={styles.coreFindings}>
            <article><span>主体</span><strong>主角已经死亡</strong><p>事故哈希、骨灰转出单、账号创建时间与1404关系材料指向同一个人。</p></article>
            <article><span>机制</span><strong>系统在制造轮回</strong><p>每天重建身份、任务与首次接触，00:10统一中断并清除记忆连续性。</p></article>
            <article><span>共谋</span><strong>物业一直知情</strong><p>预生成结案策略、遮蔽字段、资金审批和警告文案证明这不是系统故障。</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.peopleBand}`} id="people">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>01</span><b>IDENTITIES</b></div>
          <div className={styles.sectionHeading}><div><p>人物关系</p><h2>谁活着，谁死了，谁仍被系统当作“在岗”</h2></div><p>人物档案中的“账号活动”不等于存活，“身份注销”也不等于意识消失。这是全案最重要的阅读规则。</p></div>
          <div className={styles.memoryStrip}>
            <figure><Image src={assetPath("/memories/kitchen-evening.png")} alt="主角与林若岚在厨房准备晚饭" fill sizes="33vw" unoptimized /><figcaption>车祸以前 / 共同生活</figcaption></figure>
            <figure><Image src={assetPath("/memories/rainy-morning.png")} alt="主角与林若岚在雨中等车" fill sizes="33vw" unoptimized /><figcaption>2025-11-04以前 / 真实记忆</figcaption></figure>
            <figure><Image src={assetPath("/memories/weekend-laundry.png")} alt="主角与林若岚在家整理衣物" fill sizes="33vw" unoptimized /><figcaption>被过滤但未消失的日常</figcaption></figure>
          </div>
          <div className={styles.peopleGrid}>{people.map((person) => <article key={person.name}><span>{person.role}</span><h3>{person.name}</h3><p>{person.detail}</p></article>)}</div>
        </div>
      </section>

      {caseFiles.map((caseFile) => <section className={`${styles.band} ${styles.caseBand}`} id={caseFile.id} key={caseFile.id}>
        <div className={styles.inner}>
          <header className={styles.caseHeader}>
            <div><span>CASE {caseFile.number} / UNIT {caseFile.unit}</span><h2>{caseFile.title}</h2></div>
            <b>事实链已闭合</b>
          </header>
          <figure className={styles.caseImage}><Image src={assetPath(caseFile.image)} alt={caseFile.imageAlt} fill sizes="(max-width: 900px) 100vw, 1180px" unoptimized /><figcaption>{caseFile.unit} / 档案关联影像</figcaption></figure>
          <blockquote className={styles.verdict}><span>最终结论</span><p>{caseFile.verdict}</p></blockquote>
          <div className={styles.caseColumns}>
            <section><span>档案可以证实</span>{caseFile.facts.map((fact, index) => <p key={fact}><i>{String(index + 1).padStart(2, "0")}</i>{fact}</p>)}</section>
            <section className={styles.canonicalTruth}><span>故事实际发生</span>{caseFile.truth.map((truth) => <p key={truth}>{truth}</p>)}</section>
          </div>
          <aside className={styles.coverup}><span>物业知情点</span><p>{caseFile.coverup}</p></aside>
          <div className={styles.evidenceTable} role="table" aria-label={`${caseFile.unit}证据索引`}>
            <header role="row"><span>档案编号</span><span>材料</span><span>证明内容</span></header>
            {caseFile.evidence.map(([code, label, detail]) => <div role="row" key={code}><code>{code}</code><strong>{label}</strong><p>{detail}</p></div>)}
          </div>
        </div>
      </section>)}

      <section className={`${styles.band} ${styles.hengmuBand}`} id="hengmu">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>06</span><b>OMNISIGHT</b></div>
          <div className={styles.sectionHeading}><div><p>幕后组织</p><h2>恒目不是普通外包商</h2></div><p>它是全知教会进入物业、人事、殡葬寄存和数据合规系统的企业化执行层。</p></div>
          <div className={styles.hengmuStatement}><span aria-hidden="true">◉</span><blockquote>“异常不是错误。异常只是尚未完成校准的记录。”</blockquote></div>
          <div className={styles.operationGrid}>
            <article><b>01</b><h3>选择观察对象</h3><p>优先接收意外死亡者家属的特殊保管委托，把骨灰盒、遗物箱和未结服务登记为ZC-LH。</p></article>
            <article><b>02</b><h3>建立回返容器</h3><p>用外部终端与死亡主体生成员工账号，让无法离开的意识通过打卡、客服和工单获得可操作身份。</p></article>
            <article><b>03</b><h3>维持可重复实验</h3><p>以“复训”“过滤”“一致性校正”删除记忆和前台记录，每天重建任务，使同一意识重复第一次接触。</p></article>
            <article><b>04</b><h3>清除调查者</h3><p>把发现异常的员工写成内部转移，清理门禁、工单与缓存；周明川和至少16名员工进入这条链。</p></article>
          </div>
          <div className={styles.moneyTrail}><div><span>资金路径</span><strong>物业服务费</strong></div><i>→</i><div><span>虚构科目</span><strong>特殊保管 / 终端校准 / 数据过滤</strong></div><i>→</i><div><span>最终归集</span><strong>恒目关联文化基金</strong></div></div>
          <aside className={styles.unresolved}><strong>仍然没有被解释的部分</strong><p>无电源、无芯片的标签为什么会产生在线记录；意识回返究竟是超自然现象，还是恒目只会利用却无法理解的机制；红眼背后是否存在一个真实的“观察者”。故事确认恒目在利用这些现象，但不把教会的全部能力解释成技术说明书。</p></aside>
        </div>
      </section>

      <section className={`${styles.band} ${styles.timelineBand}`} id="timeline">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>07</span><b>MASTER TIMELINE</b></div>
          <div className={styles.sectionHeading}><div><p>完整时间线</p><h2>从顾小满事故到主角离开大楼</h2></div><p>这条时间线把四案放回同一条因果关系中。</p></div>
          <ol className={styles.timeline}>{timeline.map(([date, event], index) => <li key={`${date}-${index}`}><time>{date}</time><i /><p>{event}</p></li>)}</ol>
        </div>
      </section>

      <section className={`${styles.band} ${styles.codesBand}`} id="codes">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>08</span><b>ARG SOLUTIONS</b></div>
          <div className={styles.sectionHeading}><div><p>解密附录</p><h2>全部口令与推导方式</h2></div><p>这些答案会直接跳过游戏推理，适合通关后核对。</p></div>
          <div className={styles.passwordTable} role="table" aria-label="全部解密口令">
            <header role="row"><span>目标档案</span><span>正确口令</span><span>推导</span></header>
            {passwords.map(([target, password, clue]) => <div role="row" key={target}><strong>{target}</strong><code>{password}</code><p>{clue}</p></div>)}
          </div>
          <div className={styles.csLine}>
            <div><span>暗线 / CS-046</span><h3>为什么说046就是主角？</h3></div>
            <p>四段回访分别覆盖1204、1304、1104和1404。住户都指出坐席在重复同一套话术；质检编号连续，正文却被过滤；周明川明确说“明天他们会给你换一个编号”；林若岚同时使用046和0713称呼他。系统最后拒绝自动填写身份归因，但T-04终端字段把两组编号落在同一台记忆清除终端上。</p>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.endingsBand}`} id="endings">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>09</span><b>ENDINGS</b></div>
          <div className={styles.sectionHeading}><div><p>双结局含义</p><h2>主角真正要完成的不是工单，而是下班</h2></div><p>选择决定证据是否离开物业内网，也决定林若岚是否还要等下一次。</p></div>
          <div className={styles.endingGrid}>
            <article>
              <figure><Image src={assetPath("/endings/01-lobby-farewell.png")} alt="主角走向大楼出口，林若岚在门内送别" fill sizes="50vw" unoptimized /></figure>
              <span>完整证据链 / 办理退房</span><h3>好结局：终于下班</h3>
              <p>事故回执、骨灰转出单、1104破拆、回访冷备份与资金链被提交给警方和业委会。外部证据使MEM-CONSISTENCY无法继续覆盖主体关系，主角也不再依赖CJ-0713维持存在。</p>
              <p>他以灵魂状态越过物业边界，系统第一次无法重新调用他的名字。林若岚看着丈夫真正离开；这次失去很痛，却不再是每天重复的失去。</p>
            </article>
            <article className={styles.badEnding}>
              <figure><Image src={assetPath("/endings/04-loop-sugar-box.png")} alt="林若岚独自收起为丈夫准备的糖盒" fill sizes="50vw" unoptimized /></figure>
              <span>仅完成工单 / 重新打卡</span><h3>坏结局：第224次第一次见面</h3>
              <p>玩家只修正当前档案，没有把恒目、1104和CS-046证据送出内网。系统把1404关系归零，主角第二天仍以物业管理员身份第一次上门。</p>
              <p>林若岚不再纠正他，也不再投诉。她收起为丈夫准备的糖，不是因为放下，而是终于相信下一次仍会被清空。循环因此变得更稳定，也更绝望。</p>
            </article>
          </div>
          <footer className={styles.finalNote}>
            <span>FINAL NOTE</span>
            <p>好结局不是“战胜死亡”。主角早已无法回到日常。它只是让真相被活人保留，让死者不必再以岗位和账号证明自己仍存在。</p>
            <a href={`${BASE_PATH}/`}>返回澄江物业登录终端</a>
          </footer>
        </div>
      </section>
    </main>
  );
}
