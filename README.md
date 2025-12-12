# 智能数据问答界面 2.0

基于 PRD 《智能问答界面重构专项》开发的动态分析叙事系统。

## 🚀 功能特性

### 核心功能
- **自然语言问答**: 支持多种问答意图识别
- **动态分析叙事**: 流式渲染图文并茂的分析报告
- **智能组件调用**: 根据意图自动选择合适的可视化组件

### 支持的查询类型
| 类型 | 示例问题 | 组件 |
|------|---------|------|
| 单指标查询 | "今年销售额是多少" | KPI卡片 |
| 趋势分析 | "近3个月销售趋势" | 折线图 |
| 维度对比 | "各地区销售额对比" | 柱状图 |
| 构成分析 | "销售渠道占比" | 饼图 |
| 异常检测 | "分析销售额异常原因" | 多图表组合 |
| 预测分析 | "预测下月销售额" | 预测线图 |

### 组件库
- **KPI卡片**: 主指标卡片、次要指标卡片、指标组
- **图表组件**: 折线图、柱状图、饼图、年度对比图
- **交互组件**: 追问按钮、快速问题入口
- **布局组件**: 侧边栏、消息气泡、输入框

## 📦 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式系统
- **Framer Motion** - 动画效果
- **Recharts** - 图表库
- **Lucide React** - 图标库
- **Vite** - 构建工具

## 🛠️ 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
smart-qa/
├── src/
│   ├── components/        # UI组件
│   │   ├── KPICard.tsx       # KPI卡片组件
│   │   ├── Charts.tsx        # 图表组件
│   │   ├── MessageBubble.tsx # 消息气泡
│   │   ├── ChatInput.tsx     # 输入框
│   │   ├── ActionButtons.tsx # 追问按钮
│   │   └── Sidebar.tsx       # 侧边栏
│   ├── services/          # 业务逻辑
│   │   ├── intentEngine.ts   # 意图识别引擎
│   │   └── mockData.ts       # 模拟数据
│   ├── types/             # 类型定义
│   │   └── index.ts
│   ├── App.tsx            # 主应用
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── public/
├── package.json
└── README.md
```

## 🎨 设计规范

### 色彩系统
- **主色**: #3b82f6 (Primary Blue)
- **成功**: #10b981 (Success Green)
- **警告**: #f59e0b (Warning Orange)
- **危险**: #ef4444 (Danger Red)

### 组件层级
- **L1 意图**: 简单查询 → KPI卡片
- **L2 意图**: 分析查询 → 图表 + 文字叙事
- **L3 意图**: 深度分析 → 多图表组合

## 🔄 意图识别映射

系统会根据用户问题中的关键词自动识别意图并选择合适的可视化组件：

```typescript
// 示例：用户输入 "今年销售额是多少"
// 意图识别结果:
{
  type: 'single_metric',
  level: 'L1',
  suggestedComponents: ['kpi', 'kpi-group', 'line-chart']
}
```

## 📝 License

MIT


