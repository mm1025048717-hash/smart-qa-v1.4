import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Search,
  Target,
  Award,
  ChevronDown,
  FlaskConical,
  X,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  MapPin,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';

interface TestScenarioPanelProps {
  onQuestionSelect: (question: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface QuestionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description?: string;
  color?: string;
  questions: { id: string; text: string; desc?: string }[];
}

// 完整的测试用例集 - 覆盖所有TEST_CASES.md场景
const TEST_QUESTIONS: QuestionCategory[] = [
  {
    id: 'l1',
    name: 'L1 基础查询',
    icon: BarChart3,
    description: '单指标与多指标查询',
    color: 'blue',
    questions: [
      { id: 'L1-01', text: '今年销售额是多少', desc: '单指标+同比环比' },
      { id: 'L1-02', text: '本月订单量有多少', desc: '单指标+趋势标签' },
      { id: 'L1-03', text: '当前库存数值', desc: '简单数值展示' },
      { id: 'L1-04', text: '销售额和订单量', desc: '多指标并列' },
      { id: 'L1-05', text: '看一下营收以及利润', desc: '多指标对比' },
      { id: 'L1-06', text: '日活还有月活数据', desc: 'DAU/MAU展示' },
    ]
  },
  {
    id: 'l2-trend',
    name: 'L2 趋势与同环比',
    icon: TrendingUp,
    description: '时间维度分析',
    color: 'emerald',
    questions: [
      { id: 'L2-01', text: '近3个月销售额趋势', desc: '趋势折线图' },
      { id: 'L2-02', text: '今年销售额变化情况', desc: '月度走势' },
      { id: 'L2-03', text: '最近一周订单量波动', desc: '日粒度趋势' },
      { id: 'L2-04', text: '本月销售额比上月如何', desc: '环比分析' },
      { id: 'L2-05', text: '对比去年和今年营收', desc: '年度对比' },
      { id: 'L2-06', text: 'Q3销售额同比增长情况', desc: '季度增长' },
    ]
  },
  {
    id: 'l2-dim',
    name: 'L2 构成与分布',
    icon: PieChart,
    description: '维度与占比分析',
    color: 'violet',
    questions: [
      { id: 'L2-07', text: '销售渠道占比分析', desc: '饼图构成' },
      { id: 'L2-08', text: '各品类销售额构成', desc: '多品类分布' },
      { id: 'L2-09', text: '用户年龄分布比例', desc: '分段占比' },
      { id: 'L2-10', text: '各地区销售额对比', desc: '柱状图对比' },
      { id: 'L2-11', text: '分产品线看销量', desc: '产品排行' },
      { id: 'L2-12', text: '各渠道转化率哪个最好', desc: '渠道转化率' },
    ]
  },
  {
    id: 'l2-geo',
    name: 'L2 地域分布',
    icon: MapPin,
    description: '地图可视化',
    color: 'cyan',
    questions: [
      { id: 'L2-16', text: '各省份销售分布', desc: '省份热力图' },
      { id: 'L2-17', text: '用户地域分布情况', desc: '用户地图' },
      { id: 'L2-18', text: '各城市订单量热力图', desc: '城市热力' },
    ]
  },
  {
    id: 'l2-rank',
    name: 'L2 排名与评估',
    icon: Award,
    description: 'TopN与四象限',
    color: 'amber',
    questions: [
      { id: 'L2-19', text: 'TOP10销售城市', desc: '降序排列' },
      { id: 'L2-20', text: '销量最低的5个产品', desc: '升序排列' },
      { id: 'L2-21', text: '各门店业绩排名', desc: '门店排名' },
      { id: 'L2-13', text: '分析产品健康度', desc: '四象限分析' },
      { id: 'L2-14', text: '销售额和利润率的关系', desc: '相关性分析' },
      { id: 'L2-15', text: '同时看客单价和复购率', desc: '散点图分析' },
    ]
  },
  {
    id: 'l2-anomaly',
    name: 'L2 异常检测',
    icon: AlertTriangle,
    description: '异常发现与诊断',
    color: 'red',
    questions: [
      { id: 'L2-22', text: '找出异常交易数据', desc: '箱线图检测' },
      { id: 'L2-23', text: '昨天订单量突降原因', desc: '异常点归因' },
      { id: 'L2-24', text: '检测销售额不正常的区域', desc: '区域异常' },
    ]
  },
  {
    id: 'l2-attr',
    name: 'L2 原因分析',
    icon: Search,
    description: '归因与诊断',
    color: 'orange',
    questions: [
      { id: 'L2-25', text: '为什么销售额下降', desc: '多维归因' },
      { id: 'L2-26', text: '分析转化率偏低的原因', desc: '漏斗诊断' },
      { id: 'L2-27', text: '利润下滑的影响因素', desc: '因素权重' },
    ]
  },
  {
    id: 'l2-pred',
    name: 'L2 预测分析',
    icon: Activity,
    description: '趋势预测',
    color: 'teal',
    questions: [
      { id: 'L2-28', text: '预测下月销售额', desc: '置信区间' },
      { id: 'L2-29', text: '未来一周订单趋势预测', desc: '日粒度预测' },
      { id: 'L2-30', text: '预计Q4能完成多少营收', desc: '目标预测' },
    ]
  },
  {
    id: 'l3',
    name: 'L3 下钻探索',
    icon: Target,
    description: '上下文交互',
    color: 'indigo',
    questions: [
      { id: 'L3-01', text: '详细看看华东区数据', desc: '区域下钻' },
      { id: 'L3-02', text: '展开说说杭州的情况', desc: '城市下钻' },
      { id: 'L3-03', text: '具体到各门店分析', desc: '门店下钻' },
    ]
  },
  {
    id: 'narrative',
    name: '叙事与故事',
    icon: MessageSquare,
    description: '完整分析报告',
    color: 'purple',
    questions: [
      { id: 'S-01', text: '今年销售额是多少（故事版）', desc: '年度业绩报告' },
      { id: 'S-02', text: '近三个月销售额趋势怎么样', desc: '趋势叙事' },
      { id: 'S-03', text: '为什么11月销售额下降了', desc: '详细归因报告' },
      { id: 'S-04', text: '昨天订单量是不是有问题', desc: '异常诊断报告' },
      { id: 'P-01', text: '全面分析今年销售情况', desc: '分层渐进披露' },
      { id: 'G-01', text: '销售额下降了', desc: '智能引导追问' },
      { id: 'E2E-01', text: '今年业务怎么样', desc: '端到端分析' },
    ]
  },
  {
    id: 'edge',
    name: '边界条件',
    icon: HelpCircle,
    description: '异常输入处理',
    color: 'slate',
    questions: [
      { id: 'E-01', text: '2030年销售额趋势', desc: '无数据处理' },
      { id: 'E-03', text: '销售', desc: '模糊意图引导' },
      { id: 'E-04', text: '看看数据', desc: '泛泛询问' },
      { id: 'E-05', text: '帮我分析一下', desc: '通用引导' },
      { id: 'E-06', text: '分析2024年Q1-Q3各地区各产品线销售额同比环比变化趋势并找出异常', desc: '超长复杂问题' },
    ]
  },
];

// 颜色配置
const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200' },
  red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-200' },
};

const CategoryItem = ({
  category,
  isExpanded,
  onToggle,
  onSelect,
}: {
  category: QuestionCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (text: string) => void;
}) => {
  const Icon = category.icon;
  const colors = colorClasses[category.color || 'blue'];

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
          isExpanded ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-black/5'
        )}
      >
        <div className={clsx(
          'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
          isExpanded ? `${colors.bg} text-white` : 'bg-white text-slate-500 border border-slate-200'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-apple-text">{category.name}</div>
          <div className="text-xs text-apple-gray">{category.description}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {category.questions.length}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-apple-gray transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-3 pl-12 pr-2 space-y-1">
              {category.questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelect(q.text)}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-all group",
                    "hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100",
                    "flex items-start justify-between gap-2"
                  )}
                >
                  <div className="min-w-0">
                    <div className={clsx(
                      "text-sm text-apple-text transition-colors",
                      `group-hover:${colors.text}`
                    )}>
                      {q.text}
                    </div>
                    <div className="text-[10px] text-apple-gray mt-0.5 flex items-center gap-1">
                      <span className={clsx(
                        "px-1 py-0.5 rounded text-[9px] font-medium",
                        isExpanded ? `bg-${category.color}-50 ${colors.text}` : 'bg-slate-100 text-slate-500'
                      )}>
                        {q.id}
                      </span>
                      <span>{q.desc}</span>
                    </div>
                  </div>
                  <CheckCircle2 className={clsx(
                    "w-4 h-4 flex-shrink-0 mt-0.5",
                    colors.text,
                    "opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                  )} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CollapsedToggle = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onClick}
    className="fixed right-6 top-24 z-40 w-10 h-10 bg-white shadow-apple rounded-full flex items-center justify-center text-primary-500 hover:scale-110 transition-all"
  >
    <FlaskConical className="w-5 h-5" />
  </motion.button>
);

export const TestScenarioPanel = ({ onQuestionSelect, isOpen, onToggle }: TestScenarioPanelProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('l1');
  
  const totalQuestions = TEST_QUESTIONS.reduce((acc, cat) => acc + cat.questions.length, 0);

  if (!isOpen) return <CollapsedToggle onClick={onToggle} />;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 360, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="h-full bg-[#F5F5F7] border-l border-black/5 flex flex-col flex-shrink-0"
    >
      {/* 头部 */}
      <div className="p-5 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-apple-text text-sm">全量测试用例</h3>
            <p className="text-[10px] text-apple-gray">覆盖 PRD V3.0 所有场景</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-black/5 rounded-full text-apple-gray transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2 bg-white/30">
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <div className="text-lg font-bold text-primary-600">{totalQuestions}</div>
          <div className="text-[10px] text-slate-500">测试用例</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <div className="text-lg font-bold text-emerald-600">{TEST_QUESTIONS.length}</div>
          <div className="text-[10px] text-slate-500">场景分类</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg shadow-sm">
          <div className="text-lg font-bold text-purple-600">100%</div>
          <div className="text-[10px] text-slate-500">独立响应</div>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
        {TEST_QUESTIONS.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggle={() =>
              setExpandedCategory(expandedCategory === category.id ? null : category.id)
            }
            onSelect={onQuestionSelect}
          />
        ))}
        
        <div className="h-8" /> {/* 底部留白 */}
      </div>
      
      {/* 底部状态栏 */}
      <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-t border-black/5">
        <div className="flex items-center justify-between text-[10px] text-apple-gray">
          <span>每个问题对应唯一响应</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            精确匹配模式
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TestScenarioPanel;
