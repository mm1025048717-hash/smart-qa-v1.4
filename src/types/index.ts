// 意图类型定义
export type IntentLevel = 'L1' | 'L2' | 'L3';

export type IntentType = 
  | 'single_metric'      // 单指标查询
  | 'multi_metric'       // 多指标并列
  | 'trend_analysis'     // 时间趋势
  | 'yoy_mom'           // 同比环比
  | 'composition'       // 构成分析
  | 'dimension_compare' // 维度对比
  | 'ranking'           // 排名排序
  | 'anomaly'           // 异常检测
  | 'attribution'       // 原因分析
  | 'drill_down'        // 下钻探索
  | 'prediction';       // 预测请求

// KPI数据结构
export interface KPIData {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  prefix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  subMetrics?: SubMetric[];
  isPrimary?: boolean;
}

export interface SubMetric {
  label: string;
  value: number | string;
  unit?: string;
}

// 图表数据结构
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'funnel' | 'map';
  title?: string;
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string | string[];
  colors?: string[];
  showLegend?: boolean;
  annotations?: ChartAnnotation[];
}

export interface ChartAnnotation {
  type: 'point' | 'line' | 'area';
  position: unknown;
  label?: string;
  style?: 'normal' | 'warning' | 'danger';
}

// 消息组件类型
export type ComponentType = 
  | 'text'
  | 'heading'
  | 'kpi'
  | 'kpi-group'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'scatter-chart'
  | 'quadrant-chart'
  | 'map-chart'
  | 'funnel-chart'
  | 'box-plot'
  | 'chart'          // 智能图表（实时渲染）
  | 'table'          // 表格（实时渲染）
  | 'gantt'          // 甘特图（实时渲染）
  | 'action-buttons'
  | 'drill-area'
  | 'control-bar'
  | 'channel-data'   // 渠道数据卡片
  | 'suggestions'    // 建议列表
  // 故事叙事组件
  | 'report-title'   // 报告标题
  | 'quote-paragraph' // 带引号段落
  | 'structured-list' // 结构化列表
  | 'compare-card'   // 对比卡片
  | 'data-preview'   // 数据速览
  | 'quote-box'      // 引用框
  | 'insight-box'    // 洞察卡片
  | 'divider'        // 分隔线
  | 'action-bar'     // 操作栏
  | 'section'        // 段落小节
  | 'region-cards'   // 地区/国家对比卡片
  | 'metrics-preview' // 多指标速览
  | 'analyst-quote' // 分析师引言
  | 'visualizer';   // 数据可视化筛选条件

// 消息内容块
export interface ContentBlock {
  id: string;
  type: ComponentType;
  data: unknown;
  rendered?: boolean;
}

// 消息结构
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
  timestamp: Date;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  intent?: IntentType;
  // 可选：当前消息由哪个数字员工产生
  agentId?: string;
}

// 追问按钮
export interface ActionButton {
  id: string;
  label: string;
  query: string;
  icon?: string;
}

// 意图识别结果
export interface IntentResult {
  type: IntentType;
  level: IntentLevel;
  confidence: number;
  entities: {
    metrics?: string[];
    dimensions?: string[];
    timeRange?: string;
    filters?: Record<string, unknown>;
  };
  suggestedComponents: ComponentType[];
  followUpQuestions: ActionButton[];
}

// 分析场景配置
export interface AnalysisScenario {
  id: string;
  name: string;
  description: string;
  triggerKeywords: string[];
  componentSequence: ComponentType[];
  narrativeTemplate: string;
}

// 数字员工（Agent）配置
export interface AgentProfile {
  id: string;
  name: string;
  title: string;          // 例如：理科生 · SQL 专家
  tag?: string;           // 例如：核心 / 推荐
  badge?: string;         // 小徽章标签
  avatar?: string;        // 可选头像
  description?: string;   // 简短角色介绍
  suggestedQuestions?: {  // 专属快捷提问
    icon?: string;        // emoji 图标
    label: string;        // 按钮文字
    query: string;        // 实际查询
  }[];
}

// ============================================
// Agent 切换意图识别相关类型
// ============================================

// Agent 切换意图识别结果
export interface AgentSwitchIntent {
  shouldSwitch: boolean;           // 是否应该切换
  targetAgentId: string | null;    // 目标 Agent ID
  targetAgent: AgentProfile | null; // 目标 Agent 完整信息
  confidence: number;              // 置信度 0-1
  matchType: AgentSwitchMatchType | null;  // 匹配类型
  matchedKeywords: string[];       // 匹配到的关键词
  reason: string;                  // 识别理由
  alternatives?: AgentProfile[];   // 备选 Agent
}

// Agent 切换匹配类型
export type AgentSwitchMatchType = 
  | 'name'         // 名字匹配（最精确）
  | 'capability'   // 能力匹配（根据需求能力）
  | 'scenario'     // 场景匹配（根据业务场景）
  | 'personality'; // 性格匹配（根据风格偏好）

// Agent 特征定义
export interface AgentFeatures {
  id: string;
  nameVariants: string[];    // 名字的各种形式
  capabilities: string[];    // 能力关键词
  scenarios: string[];       // 擅长场景
  personality: string[];     // 性格风格
  domains: string[];         // 专业领域
}


