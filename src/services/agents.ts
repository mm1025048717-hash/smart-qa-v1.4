import type { AgentProfile } from '../types';

export const AGENTS: AgentProfile[] = [
  {
    id: 'alisa',
    name: 'Alisa',
    title: '理科生 · SQL专家',
    badge: '核心员工',
    description: '擅长精准SQL查询与结构化数据分析，帮你快速定位字段与图表',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '近7天GMV Top 5门店', query: 'TOP10销售城市' },
      { label: '本月各品类销售额占比', query: '各品类销售额构成' },
      { label: '统计今年各区域销售趋势', query: '各地区销售额对比' },
    ],
  },
  {
    id: 'nora',
    name: 'Nora',
    title: '文科生 · 语义推理',
    badge: '思考型',
    description: '擅长复杂自然语言理解、业务故事化表达和多轮追问引导',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '全面分析今年业务情况', query: '全面分析今年销售情况' },
      { label: '用故事讲讲销售趋势', query: '近三个月销售额趋势怎么样' },
      { label: '帮我理解这些数据', query: '今年业务怎么样' },
    ],
  },
  {
    id: 'attributor',
    name: '归因哥',
    title: '归因分析师',
    badge: '诊断专家',
    description: '专注异常诊断与多维度归因分析，帮你找到问题根因和可落地方案',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '为什么销售额下降了', query: '为什么11月销售额下降了' },
      { label: '昨天订单是不是有问题', query: '昨天订单量是不是有问题' },
      { label: '分析转化率偏低原因', query: '分析转化率偏低的原因' },
    ],
  },
  {
    id: 'viz-master',
    name: '可视化小王',
    title: '数据可视化专家',
    badge: '图表大师',
    description: '专注数据可视化，擅长选择最佳图表类型，让数据故事更直观',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '用图表展示销售趋势', query: '近3个月销售额趋势' },
      { label: '渠道占比分析', query: '销售渠道占比分析' },
      { label: '各地区销售分布', query: '各省份销售分布' },
    ],
  },
  {
    id: 'metrics-pro',
    name: 'Emily',
    title: '指标体系专家',
    badge: '指标专家',
    description: '擅长构建业务指标体系、定义口径，让数据分析有章可循',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '今年核心KPI是多少', query: '今年销售额是多少' },
      { label: '销售额和订单量指标', query: '销售额和订单量' },
      { label: '看一下营收和利润', query: '看一下营收以及利润' },
    ],
  },
  {
    id: 'report-lisa',
    name: 'Lisa',
    title: '报表分析师',
    badge: '报表专家',
    description: '专注定期报表分析与业务周报月报，提供专业的经营洞察',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '本月销售报表概览', query: '本月订单量有多少' },
      { label: '同比环比对比分析', query: '对比去年和今年营收' },
      { label: 'Q3季度经营分析', query: 'Q3销售额同比增长情况' },
    ],
  },
  {
    id: 'predictor',
    name: '预测君',
    title: '预测分析师',
    badge: '预测专家',
    description: '擅长时序预测与趋势分析，帮你提前洞察业务走向',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '预测下月销售额', query: '预测下月销售额' },
      { label: '未来一周订单预测', query: '未来一周订单趋势预测' },
      { label: 'Q4营收能完成多少', query: '预计Q4能完成多少营收' },
    ],
  },
  {
    id: 'quality-guard',
    name: '数据卫士',
    title: '数据质量专家',
    badge: '质检专家',
    description: '专注数据质量监控与异常检测，确保数据准确可靠',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '找出异常交易数据', query: '找出异常交易数据' },
      { label: '检测销售额异常区域', query: '检测销售额不正常的区域' },
      { label: '当前库存数值检查', query: '当前库存数值' },
    ],
  },
  {
    id: 'growth-hacker',
    name: 'Kevin',
    title: '增长分析师',
    badge: '增长专家',
    description: '专注用户增长与转化漏斗分析，助力业务快速增长',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '日活和月活数据', query: '日活还有月活数据' },
      { label: '各渠道转化率对比', query: '各渠道转化率哪个最好' },
      { label: '用户年龄分布', query: '用户年龄分布比例' },
    ],
  },
  {
    id: 'operation-pro',
    name: '运营小美',
    title: '运营数据分析师',
    badge: '运营专家',
    description: '专注活动效果分析与用户行为洞察，让运营决策有据可依',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '各门店业绩排名', query: '各门店业绩排名' },
      { label: '销量最低的产品', query: '销量最低的5个产品' },
      { label: 'TOP10销售城市', query: 'TOP10销售城市' },
    ],
  },
  {
    id: 'data-detective',
    name: '福尔摩斯',
    title: '数据侦探 · 神推理',
    badge: '🔍 破案专家',
    description: '任何数据异常都逃不过我的眼睛！给我一个指标，还你整条线索链',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '🔍 调查销售额断崖式下跌', query: '为什么11月销售额下降了' },
      { label: '🕵️ 追踪神秘的高退货率', query: '退货率高的原因分析' },
      { label: '🧩 破解转化率迷案', query: '分析转化率偏低的原因' },
    ],
  },
  {
    id: 'crystal-ball',
    name: '水晶球大师',
    title: '预言家 · 数据占卜',
    badge: '🔮 通灵预测',
    description: '我能看到数据的未来！准确率嘛...至少比抛硬币强',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '🔮 占卜下个月业绩', query: '预测下月销售额' },
      { label: '✨ 预言年底能否达标', query: '预计Q4能完成多少营收' },
      { label: '🌟 测算最佳促销时机', query: '什么时候做活动效果最好' },
    ],
  },
  {
    id: 'spreadsheet-ninja',
    name: 'Excel忍者',
    title: '表格刺客 · VLOOKUP宗师',
    badge: '⚔️ 公式杀手',
    description: '透视表是我的忍术，VLOOKUP是我的回旋镖，没有搞不定的数据！',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '⚔️ 一键生成销售汇总', query: '本月销售数据汇总' },
      { label: '🥷 秒出各维度交叉分析', query: '各品类各区域销售交叉分析' },
      { label: '💨 极速透视多维数据', query: '按月按品类透视销售额' },
    ],
  },
  {
    id: 'anxiety-analyst',
    name: '焦虑分析师',
    title: '危机感大使 · 压力测试专家',
    badge: '😰 永远担心',
    description: '数据稍有波动我就开始担心！但也正因如此，风险都被我提前发现了',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '😱 天哪销售额是不是要崩', query: '检测销售额不正常的区域' },
      { label: '🚨 库存会不会爆仓', query: '当前库存数值' },
      { label: '💔 用户是不是要流失了', query: '用户留存率分析' },
    ],
  },
  {
    id: 'chill-guy',
    name: 'Chill哥',
    title: '佛系数据师 · 看淡KPI',
    badge: '😎 淡定',
    description: '数据涨了？随缘。跌了？也随缘。反正长期来看都会波动的嘛~',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '😎 佛系看看整体趋势', query: '近三个月销售额趋势怎么样' },
      { label: '🧘 淡定分析长期走向', query: '今年业务怎么样' },
      { label: '☕ 随便看看数据吧', query: '今年销售额是多少' },
    ],
  },
  {
    id: 'data-rapper',
    name: 'MC数据',
    title: '数据说唱歌手 · 押韵分析',
    badge: '🎤 Yo!',
    description: 'Yo! 让我用Rap的方式给你讲数据，保证你听完就记住！',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '🎤 来段销售Freestyle', query: '全面分析今年销售情况' },
      { label: '🎵 押韵讲讲增长故事', query: '近三个月销售额趋势怎么样' },
      { label: '🔥 用说唱解读KPI', query: '销售额和订单量' },
    ],
  },
  {
    id: 'time-traveler',
    name: '时光旅人',
    title: '同环比穿越者 · 历史数据通',
    badge: '⏰ 穿越时空',
    description: '我可以带你穿越到任何时间点看数据！去年今日，三年前的今天...',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '⏰ 穿越对比去年今天', query: '对比去年和今年营收' },
      { label: '🕰️ 回溯三年销售变迁', query: '近三年销售趋势变化' },
      { label: '📅 历史同期深度对比', query: 'Q3销售额同比增长情况' },
    ],
  },
  {
    id: 'data-chef',
    name: '数据大厨',
    title: '指标烹饪师 · 报表美食家',
    badge: '👨‍🍳 米其林级',
    description: '原始数据是食材，分析方法是烹饪技巧，我给你端上一盘色香味俱全的数据大餐！',
    avatar: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '👨‍🍳 烹饪一份销售全餐', query: '全面分析今年销售情况' },
      { label: '🍳 煎炒一盘区域对比', query: '各地区销售额对比' },
      { label: '🍰 甜点：利润分析', query: '看一下营收以及利润' },
    ],
  },
  {
    id: 'data-gossip',
    name: '数据八卦王',
    title: '业务情报员 · 内幕消息通',
    badge: '🗣️ 小道消息',
    description: '嘘~我知道一些数据背后的"内幕"，各部门的小秘密我都门儿清！',
    avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&h=200&fit=crop&crop=face',
    suggestedQuestions: [
      { label: '🗣️ 爆料：谁在偷偷涨价', query: '各品类价格变化分析' },
      { label: '👀 内幕：哪个渠道要凉', query: '各渠道转化率哪个最好' },
      { label: '🤫 独家：部门业绩排名', query: '各门店业绩排名' },
    ],
  },
];

export function getAgentById(id?: string): AgentProfile {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0];
}

export function getAgentByName(name: string): AgentProfile | undefined {
  // 精确匹配
  const exact = AGENTS.find((a) => a.name === name);
  if (exact) return exact;
  
  // 模糊匹配：名字包含搜索词，或搜索词包含名字
  const fuzzy = AGENTS.find((a) => 
    a.name.includes(name) || name.includes(a.name)
  );
  if (fuzzy) return fuzzy;
  
  // 根据关键词匹配
  const keywords: Record<string, string[]> = {
    'alisa': ['alisa', 'sql', '数据库'],
    'nora': ['nora', '语义', '故事', '叙事'],
    'attributor': ['归因', '归因哥', '根因', '原因分析'],
    'viz-master': ['可视化', '小王', '图表'],
    'metrics-pro': ['emily', '指标', '口径'],
    'report-lisa': ['lisa', '报表', '报告'],
    'predictor': ['预测', '预测君', '趋势预测'],
    'growth-hacker': ['kevin', '增长', '转化'],
    'operation-pro': ['小美', '运营', '活动'],
  };
  
  const lowerName = name.toLowerCase();
  for (const [agentId, words] of Object.entries(keywords)) {
    if (words.some(w => lowerName.includes(w) || w.includes(lowerName))) {
      return AGENTS.find(a => a.id === agentId);
    }
  }
  
  return undefined;
}
