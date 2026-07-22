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
    detail: "2025年11月4日车祸死亡。事故次日，他的员工账号被建立，工号为CJ-0713；在后续轮岗周期中，他也曾使用编号CS-046担任客服工作。每天的任务与身份会被重建，私人记忆则被定时清除、过滤。",
  },
  {
    name: "林若岚",
    role: "1404住户 · 主角的妻子",
    detail: "车祸幸存者，下肢重伤后使用轮椅。她把丈夫的骨灰带回1404，也是在每次“寻访”中始终认得主角的人。她被困在无尽的悲伤和怀念中，却受恒目的压迫难以道出真相，只能利用规则不断引导主角去探索、发现，在折磨与思念中与失去记忆的TA反复重逢。",
  },
  {
    name: "周明川",
    role: "ZM-0602 · 失联员工",
    detail: "发现17名员工的异常转移、物业资金流和生死循环规律后被计划清除，遗体最终在1104西墙空腔中找到；但他死前账号里留下的四份本地证据成为揭开恒目真面目的关键。",
  },
  {
    name: "顾小满",
    role: "1304历史家庭成员",
    detail: "2021年浴室事件中意外死亡的孩童，她的死是一起家庭悲剧。她留下的身高刻度、哼唱与六分钟滴水声被系统压成了“维修附件”。故事真相中，正是她把许芷遥从1204引到1304门外，本意只是孩子在房间困了太久，渴望认识朋友。",
  },
  {
    name: "顾长河",
    role: "1304注销住户 · 顾小满父亲",
    detail: "事故当晚醉酒并涉嫌暴力与看护失职，间接造成了亲生女儿的死亡。本人也在2023年死于急性酒精中毒。那之后，他的灵魂被困在1304，和同样成为灵魂的女儿共处，认为这里就是他们的家，而偶尔造访的前妻是那个闯入者。困住他的或许不是恒目组织，而是残破的家庭关系、对于生前行径的悔恨、和他暴戾的性格中。",
  },
  {
    name: "梁静宜",
    role: "顾长河前妻 · 已迁出住户",
    detail: "2021年后迁出，仍要求维修时保留小满的身高刻度作为为数不多的纪念。顾长河死亡时她有充分的不在场证明。",
  },
  {
    name: "许建国、赵秀兰与许芷遥",
    role: "1204实际使用者 · 未登记家庭",
    detail: "许建国和赵秀兰原本只是1204的定时家政，服务终止后发现1204实际房主已经失去联系，便利用门禁卡暂住1204。女儿许芷遥被登记在他们的员工宿舍。",
  },
  {
    name: "陈大国",
    role: "1204产权登记人",
    detail: "证件尾号、住址与公开经侦通报中的陈某国一致。2024年出境后被列为在逃人员并停止家政续费，因此失联。",
  },
] as const;

const caseFiles = [
  {
    id: "case-1204",
    number: "01",
    unit: "1204",
    title: "空置房间的幽灵孩子",
    verdict: "许芷遥确实住在1204。物业的“空置”只是没有被纠正的台账状态；真正把她引出房间、带到1304门外的是顾小满。",
    image: "/rescue-route/02-1204-corridor.jpg",
    imageAlt: "1204门外的潮湿脚印与孩童影子",
    facts: [
      "产权人陈大国因违法长期失联，1204仍维持空置、待法拍状态；巡检却发现新鲜食物、儿童床品、28码童鞋和持续门禁。",
      "许建国、赵秀兰的保洁服务在3月31日终止，关联卡从4月3日起几乎每日通行，没有产权转出迹象。",
      "许芷遥的健康卡藏在童鞋中，鞋盒小票与异常门禁都指向4月3日；她在住户系统中未登记。",
      "午夜的滴水声并非1304正常用水：水表零变化，1204顶面无渗漏；净化声轨保留了浴缸滴水和孩童哼唱，说明1304有异样情况出现。",
      "搜救路线由监控画面中的双足潮湿痕迹、和公共区域画面中孩童的影子闭合，孩童移动路线为 1204儿童房—门外—消防楼梯—13层前室—1304门外。",
    ],
    truth: [
      "故事层面的引导者是顾小满。她以湿衣、赤脚和若隐若现的影子形象出现，也许孩子能看到不一样的事物，把另一个女孩带离了居住的1204，在孩子的世界里，这只是和朋友要一起玩。",
      "许芷遥没有进入1304室内，因为这里还住着别的灵魂，她最终在门外相邻消防前室被民警与安保找到。",
      "许家只是借用历史服务身份入住，这座城市租金太高，一对依靠家政服务谋生的夫妻想用这样的方法降低生活成本。",
    ],
    coverup: "VACANT-CLOSE策略把生活痕迹自动解释成“产权人临时存放物”，连续跳过实际占用复核流程。物业不是看不见异常，而是现实里的约束并不高于这栋楼的规则，替主角决定不用看到所有细节。",
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
    title: "以“浴室意外”为起点的家庭悲剧",
    verdict: "顾小满死于顾长河醉酒状态下的暴力与看护失职。顾长河死后和女儿仍存在1304内，而物业早已知道父女均已死亡。",
    image: "/rescue-route/05-1304-door.jpg",
    imageAlt: "1304门外水迹与孩童影子",
    facts: [
      "2021年8月21日，110联动附件记录未成年人看护风险及疑似家庭暴力；物业前台只留下“浴室意外”的回函。",
      "顾长河当晚明显醉酒并被民警带离。墙面上“小满 五岁”的身高刻度和梁静宜要求保留名字的细节，证明她曾真实生活在1304。",
      "2023年2月8日00:36，顾长河死于急性酒精中毒；09:20物业停用本人门禁。",
      "2026年7月13日仍在活动的不再是顾长河门禁，而是MSG-1304留言令牌。令牌能写入、电话能接通，却再没有相关人进出这栋大楼。",
      "许芷遥获救后主动提到“顾小满”，一个她无从得知的名字，把本次儿童失踪事件与2021年事故附件连接起来。",
    ],
    truth: [
      "顾长河并非被前妻害死。梁静宜在外省的记录形成完整不在场证明。",
      "顾长河的异常账号承载着未结的悔恨。他最后才有勇气承认，小满死亡时自己就在屋子里，他并不是一个称职的父亲；关闭令牌只是停止系统写入，帮助他获得往生的自由，不等于替他获得了妻儿的宽恕。",
      "顾小满见许芷遥，并不是什么邪恶行为，她仍然是那个渴望玩耍和友谊的孩子，又或者她逐渐感受到这栋大楼的怪异，想帮助这个和自己“同龄”的意外闯入者。",
      "风波结束，顾长河的赎罪并未完成，可能他永远得不到妻子、女儿的谅解，档案也拒绝把它们合并成“团圆”。",
    ],
    coverup: "1304-FAMILY-KEEP在顾长河死亡当天建立：只要命中死亡主体、儿童事故附件和残留会话，就保持家庭关联、不向前台暴露冲突。察觉到主角觉醒了残留的善念，物业甚至警告CJ-0713“不得动用私情”。",
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
    verdict: "周明川没有调岗，也绝非主动失联。他因追查恒目与物业的异常项目被灭口，遗体就封存在1104留存的西墙空腔内。",
    image: "/backgrounds/access-denied-corridor.png",
    imageAlt: "物业档案中的封闭走廊",
    facts: [
      "1104竣工图净宽4.80米，现场三次实测均为4.38米；插座孔附近高温、氨类与TVOC读数提示封闭空腔内存在有机来源。",
      "周明川的“内部转移”单没有车辆、目的地、接收部门、签收人或本人签字，人事状态在三天内被HMO-ADMIN改写。",
      "EMP-TRANSFER-CLOSE在21:17预生成，早于人事状态写入，也早于现场异常上报，说明清除流程事先预设。",
      "警方破拆墙面后，通过DNA比对确认墙内遗体为周明川；物业此前既未报警，也无法提供不知情证据。",
      "他的本地账号仍保存四份未同步证据。由玩家掌握后，恒目将追查的下一对象设定为触犯了员工制度的主角。",
    ],
    truth: [
      "故事真相指向恒目驻场合规体系实施灭口和封墙；档案能够证明这是有预谋的谋杀。",
      "周明川预见系统会用“账号仍在线”伪造生存感，因此为后来的探索者留下提醒，这份提醒给到了他之前执行过回访的1404户主，也就是主角的妻子那里。",
      "他不是第一个受害者。17份无目的地转移对应17名查到异常后被外派、离职或失联的员工，其中6人的最后门禁靠近后来封闭施工的房屋，说明这栋大楼隐藏了更多不为人知的罪恶。",
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
    title: "I MISS YOU",
    verdict: "主角是林若岚已故的丈夫。CJ-0713与CS-046只是同一死亡意识在不同清除周期里被分配的员工编号，1404里的骨灰则是他与这栋楼的锚点。",
    image: "/residents/w-04.png",
    imageAlt: "1404住户林若岚坐在轮椅上等待固定回访人员",
    facts: [
      "2025年11月4日22:31，车祸造成一人当场死亡、一人下肢重伤；死者与CJ-0713实名完全一致，紧急联系人指向1404当前住户林若岚。",
      "11月5日08:12，HMO-ADMIN批量创建CJ-XXXX，没有劳动合同、面试、体检或入职审批；打卡来自1404关联外部终端机。",
      "林若岚将丈夫骨灰从殡仪馆转出并留在1404。恒目次日把无电源、无芯片的封存物贴为ZC-LH/CJ-0713，并绑定员工CJ-0713打卡。",
      "CJ-0713有251次有效打卡、0次有效下班；每天08:41重新出现，00:10连接中断。1404则累计223次“首次接触”。",
      "1404中留下的种种、以及林若岚对主角的关心、领取的糖都侧面印证着不是住户妄想，而是夫妻共同生活留下的细节。林若岚一直在等待丈夫想起自己、认出自己，能得到解放。",
    ],
    truth: [
      "CS-046就是被更早一次记忆清除后的主角。四段回访中相同的问话顺序、质检连续号和T-04终端字段，把046与0713连接为同一操作者。",
      "恒目利用封存物、外部终端和未结关系，让死者意识在“自然显现窗口”中回返，再用物业岗位、任务队列与记忆校正把他固定成可重复观察、替恒目工作的员工。",
      "玩家开场看见的日常生活并非别人的梦，而是主角与林若岚的真实记忆正在从过滤层下恢复。",
    ],
    coverup: "MEM-CONSISTENCY会在00:10清除上一轮关系与检索，把林若岚重新标成普通住户，把她日夜思念的丈夫重新派成第一次上门的物业管理员。在这一次，1404的投诉被自动转派给被投诉的CJ-0713本人。",
    evidence: [
      ["DL-JJ-1104-27", "事故协查", "死亡主体、紧急联系人与1404"],
      ["DL-1105", "殡仪馆转出单", "封存物、妻子与原址保管链"],
      ["EMP-CJ-0713", "员工主数据", "事故次日无劳动合同建号"],
      ["CARE-1404-R17", "回访冷备份", "223次首次接触与重复生活细节"],
      ["CALL系列", "CS-046 与 CJ-0713 核验", "T-04、连续编号与被过滤正文"],
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
  ["2026-04-03", "许家利用旧门禁卡重新进入1204；许芷遥的鞋盒购买日期也落在当天。"],
  ["2026-06-02", "周明川失联，后被改写为“内部转移”，在当周遇害。"],
  ["2026-07-09", "1204投诉工单开启；CS-046客服记录回访与1304水滴声响再次出现。"],
  ["2026-07-13", "本次值班：寻找许芷遥、释放顾长河令牌、发现周明川的真相、解开关于主角自己的秘密并选择是否离开循环。"],
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
            <article><span>主体</span><strong>主角已经死亡</strong><p>事故报道、遗物转出单、账号创建时间与员工关系材料指向同一个人。</p></article>
            <article><span>机制</span><strong>系统在制造轮回</strong><p>每天重建身份、任务，与执念纠缠，统一中断并清除记忆。</p></article>
            <article><span>共谋</span><strong>物业一直知情</strong><p>预生成了应对策略、遮蔽信息字段、警告文案说明并非系统故障。</p></article>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.peopleBand}`} id="people">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>01</span><b>IDENTITIES</b></div>
          <div className={styles.sectionHeading}><div><p>人物关系</p><h2>谁生，谁死，谁仍“在岗”，谁有话没说完</h2></div><p>人物档案中的“账号活动”不等于存活，“身份注销”也不等于意识消失。这是全案最重要的阅读规则。</p></div>
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
          <div className={styles.sectionHeading}><div><p>幕后组织</p><h2>恒目不是普通外包商</h2></div><p>它是？？教会（世界观待补全）进入物业、人事、殡葬寄存和数据合规系统的企业化执行层。</p></div>
          <div className={styles.hengmuStatement}><span aria-hidden="true">◉</span><blockquote>“异常不是错误。异常只是尚未完成校准的记录。”</blockquote></div>
          <div className={styles.operationGrid}>
            <article><b>01</b><h3>选择观察对象</h3><p>优先接收意外死亡者家属的特殊保管委托，把骨灰盒、遗物箱和未结服务登记为ZC-LH。</p></article>
            <article><b>02</b><h3>建立回返容器</h3><p>用外部终端与死亡主体生成员工账号，让无法离开的意识通过打卡、客服和工单获得可操作身份。</p></article>
            <article><b>03</b><h3>维持可重复实验</h3><p>以“复训”“过滤”“一致性校正”删除记忆和前台记录，每天重建任务，使同一意识重复接触生前记忆片段，筛选可以作为长期存在的合格员工。</p></article>
            <article><b>04</b><h3>清除调查者</h3><p>把发现异常的员工按内部转移流程处理，清理门禁、工单与缓存；周明川和至少16名员工进入这条链。</p></article>
          </div>
          <div className={styles.moneyTrail}><div><span>资金路径</span><strong>物业服务费</strong></div><i>→</i><div><span>虚构科目</span><strong>特殊保管 / 终端校准 / 数据过滤</strong></div><i>→</i><div><span>最终归集</span><strong>恒目关联文化基金</strong></div></div>
          <aside className={styles.unresolved}><strong>仍然没有被解释的部分</strong><p>无电源、无芯片的标签为什么会产生在线记录；意识回返究竟是超自然现象，还是恒目只会利用却无法理解的机制；红眼背后是否存在一个真实的“观察者”。故事确认恒目在利用这些现象，但？？教会的全部能力仍未被理解和说明，也许会在之后的作品中做更多呈现。</p></aside>
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
            <div><span>暗线 / CS-046</span><h3>为什么说CS-046、CJ-0713都是主角？</h3></div>
            <p>四段回访分别覆盖1204、1304、1104和1404。住户都指出客服在重复同一套话术，而主角登陆CJ-0713后也继承了这些客服记录；质检编号连续，正文却被过滤；周明川明确说过“明天他们会给你换一个编号”。系统最后拒绝自动填写身份归因，但T-04终端字段把两组编号落在同一台记忆清除终端上。</p>
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.endingsBand}`} id="endings">
        <div className={styles.inner}>
          <div className={styles.sectionLabel}><span>09</span><b>ENDINGS</b></div>
          <div className={styles.sectionHeading}><div><p>双结局含义</p><h2>主角真正要完成的不是工单，而是选择这样存在，还是释怀</h2></div><p>选择决定一切是否离开物业内网，也决定林若岚是否苦苦等待在这栋大楼里。</p></div>
          <div className={styles.endingGrid}>
            <article>
              <figure><Image src={assetPath("/endings/01-lobby-farewell.png")} alt="主角走向大楼出口，林若岚在门内送别" fill sizes="50vw" unoptimized /></figure>
              <span>完整证据链 / 办理退房</span><h3>好结局：雨过天晴</h3>
              <p>事故回执、骨灰转出单、1104破拆、回访冷备份与资金链被提交给警方和业委会。外部证据使MEM-CONSISTENCY无法继续覆盖主体关系，主角也不再依赖CJ-0713维持存在。</p>
              <p>他以灵魂状态越过物业边界，系统第一次无法重新调用他的名字。林若岚看着丈夫真正离开；失去从来不是轻松的事情，但总好过相见不相识的陌生，好过生死循环的折磨，总有回忆会替两人记得。</p>
            </article>
            <article className={styles.badEnding}>
              <figure><Image src={assetPath("/endings/04-loop-sugar-box.png")} alt="林若岚独自收起为丈夫准备的糖盒" fill sizes="50vw" unoptimized /></figure>
              <span>仅完成工单 / 重新打卡</span><h3>坏结局：第一次见，Again</h3>
              <p>玩家只修正当前档案，没有把恒目、1104和CS-046证据送出内网。系统把收集到的关系归零，主角第二天仍以物业管理员身份上门回访。</p>
              <p>林若岚不再等待，但也不是放下，而是终于相信恒目的强大势力，循环正在变得更稳定、更缜密，破绽更难出现，在更深重的绝望里，林若岚选择解救独留人间的自己。</p>
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
