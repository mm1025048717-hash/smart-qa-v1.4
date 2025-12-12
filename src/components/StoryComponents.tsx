/**
 * 故事组件 - 纯蓝白配色 苹果风格
 */

import { motion } from 'framer-motion';
import clsx from 'clsx';

// 报告标题
export const ReportTitle = ({ title, subtitle, delay = 0 }: { title: string; subtitle?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="mb-5"
  >
    <h2 className="text-[18px] font-bold text-[#007AFF] leading-tight">{title}</h2>
    {subtitle && <p className="text-[#3B82F6] text-[13px] mt-2 font-medium">{subtitle}</p>}
  </motion.div>
);

// 章节标题
export const SectionTitle = ({ title, delay = 0 }: { title: string; delay?: number }) => (
  <motion.h4
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="text-[15px] font-semibold text-[#007AFF] mt-5 mb-3"
  >
    {title}
  </motion.h4>
);

// 带引号段落
export const QuoteParagraph = ({ content, children, delay = 0 }: { content?: string; children?: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative mb-4 pl-4 border-l-3 border-[#007AFF]"
  >
    <p className="text-[#1E3A5F] leading-[1.8] text-[14px]">{content || children}</p>
  </motion.div>
);

// 结构化列表项
export const StructuredListItem = ({ title, description, highlight, delay = 0 }: { title: string; description: string; highlight?: boolean; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="flex items-start gap-3 mb-3"
  >
    <div className={clsx("mt-2 w-2 h-2 rounded-full flex-shrink-0", highlight ? "bg-[#007AFF]" : "bg-[#60A5FA]")} />
    <div>
      <span className={clsx("font-semibold text-[13px]", highlight ? "text-[#007AFF]" : "text-[#1E3A5F]")}>{title}</span>
      <span className="text-[#3B82F6] text-[13px] leading-relaxed ml-2">{description}</span>
    </div>
  </motion.div>
);

// 对比卡片
export const CompareCardLight = ({ items, delay = 0 }: { items: any[]; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gradient-to-br from-blue-50 to-white rounded-xl overflow-hidden mb-4 border border-blue-100"
  >
    {items.map((item, index) => (
      <div 
        key={index} 
        className={clsx("flex items-center gap-3 px-4 py-3.5", index !== items.length - 1 && "border-b border-blue-100")}
      >
        <span className="text-xl w-8 text-center">{item.flag || '•'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[#1E3A5F] font-semibold text-[13px]">{item.name}</div>
          <div className="text-[#3B82F6] text-[11px]">{item.description}</div>
        </div>
        <div className={clsx("text-[17px] font-bold", item.color || "text-[#007AFF]")}>{item.value}</div>
      </div>
    ))}
  </motion.div>
);

// 数据预览卡片
export const DataPreviewCardLight = ({ title, items, delay = 0 }: { title: string; items: any[]; icon?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 mb-4 border border-blue-100"
  >
    <h3 className="text-[#1E3A5F] font-semibold text-[13px] mb-4">{title}</h3>
    <div className="flex items-end justify-around">
      {items.map((item, index) => (
        <div key={index} className="text-center">
          <div className={clsx("text-[22px] font-bold mb-1", item.color || "text-[#007AFF]")}>{item.value}</div>
          <div className="text-[#3B82F6] text-[11px] font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  </motion.div>
);

// 引言框
export const QuoteBox = ({ quote, author, delay = 0 }: { quote: string; author?: string; icon?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="my-6 text-center py-5 px-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100"
  >
    <p className="text-[#1E3A5F] text-[13px] leading-relaxed mb-2">"{quote}"</p>
    {author && <p className="text-[#007AFF] text-[12px] font-semibold">— {author}</p>}
  </motion.div>
);

// 洞察卡片
export const InsightBox = ({ title, content, children, variant = 'primary', delay = 0 }: { title?: string; content?: string; children?: React.ReactNode; variant?: string; delay?: number }) => {
  const colors: Record<string, string> = {
    primary: 'bg-gradient-to-br from-blue-50 to-white border-blue-100',
    success: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200',
    warning: 'bg-gradient-to-br from-amber-50 to-white border-amber-200',
    danger: 'bg-gradient-to-br from-red-50 to-white border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={clsx('rounded-xl p-4 mb-4 border', colors[variant] || colors.primary)}
    >
      {title && <div className="font-semibold text-[13px] mb-1.5 text-[#1E3A5F]">{title}</div>}
      <div className="text-[13px] leading-relaxed text-[#3B82F6]">{content || children}</div>
    </motion.div>
  );
};

// 分隔线
export const Divider = () => <div className="my-5"><hr className="border-blue-100" /></div>;

// 操作栏
export const ActionBar = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center gap-8 mt-5 pt-4 border-t border-blue-100"
  >
    <button className="text-[#3B82F6] text-[13px] font-medium hover:text-[#007AFF] transition-colors">下载</button>
    <button className="text-[#3B82F6] text-[13px] font-medium hover:text-[#007AFF] transition-colors">分享</button>
    <button className="text-[#3B82F6] text-[13px] font-medium hover:text-[#007AFF] transition-colors">收藏</button>
  </motion.div>
);

// 小节容器
export const Section = ({ title, children, delay = 0 }: { title?: string; children?: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="mt-5 mb-3">
    {title && <h4 className="text-[15px] font-semibold text-[#007AFF] mb-3">{title}</h4>}
    {children && <div className="text-[#1E3A5F] leading-relaxed text-[14px]">{children}</div>}
  </motion.div>
);

// 源标签
export const SourceTag = ({ count }: { count: number; delay?: number }) => (
  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#3B82F6] text-[11px] px-2.5 py-1 rounded-full font-medium border border-blue-100">{count}个来源</span>
);

// 加载完成
export const LoadedTag = () => (
  <span className="inline-flex items-center gap-1.5 text-[#3B82F6] text-[12px] mb-3 font-medium">加载完成 <SourceTag count={34} /></span>
);

// 高亮块
export const HighlightBlock = ({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' | 'success'; delay?: number }) => {
  const colors = { info: 'bg-gradient-to-br from-blue-50 to-white border-blue-100', warning: 'bg-gradient-to-br from-amber-50 to-white border-amber-200', success: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200' };
  return <div className={clsx('rounded-xl p-4 mb-4 text-[13px] text-[#1E3A5F] border', colors[variant])}>{children}</div>;
};

// 地区卡片组
export const RegionCards = ({ items, delay = 0 }: { items: { flag: string; name: string; value: string; desc: string; color?: string }[]; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-gradient-to-br from-blue-50 to-white rounded-xl overflow-hidden mb-4 border border-blue-100">
    {items.map((item, index) => (
      <div key={index} className={clsx("flex items-center gap-3 px-4 py-3.5", index !== items.length - 1 && "border-b border-blue-100")}>
        <span className="text-xl w-8 text-center">{item.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[#1E3A5F] font-semibold text-[13px]">{item.name}</div>
          <div className="text-[#3B82F6] text-[11px]">{item.desc}</div>
        </div>
        <div className={clsx("text-[17px] font-bold", item.color || "text-[#007AFF]")}>{item.value}</div>
      </div>
    ))}
  </motion.div>
);

// 多指标卡片
export const MetricsPreviewCard = ({ title, metrics, delay = 0 }: { title: string; icon?: string; metrics: { value: string; label: string; color?: string }[]; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 mb-4 border border-blue-100">
    <h3 className="text-[#1E3A5F] font-semibold text-[13px] mb-4">{title}</h3>
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m, i) => (
        <div key={i} className="text-center bg-white rounded-lg p-3 border border-blue-50">
          <div className={clsx("text-[20px] font-bold mb-1", m.color || "text-[#007AFF]")}>{m.value}</div>
          <div className="text-[#3B82F6] text-[11px] font-medium">{m.label}</div>
        </div>
      ))}
    </div>
  </motion.div>
);

// 分析师引言
export const AnalystQuote = ({ quote, author, role, delay = 0 }: { quote: string; author?: string; role?: string; icon?: string; delay?: number }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="mt-6 mb-4 text-center bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
    <p className="text-[#3B82F6] text-[13px] leading-relaxed mb-2">"{quote}"</p>
    {(author || role) && <p className="text-[#007AFF] text-[12px] font-semibold">— {author}{role && <span className="text-[#60A5FA] font-normal">，{role}</span>}</p>}
  </motion.div>
);

// 趋势卡片
export const TrendCard = ({ label, value, trend, delay = 0 }: { label: string; value: string; trend?: { value: number; direction: 'up' | 'down' }; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
    <div className="text-[#3B82F6] text-[12px] mb-2 font-medium">{label}</div>
    <div className="flex items-baseline gap-2">
      <span className="text-[22px] font-bold text-[#1E3A5F]">{value}</span>
      {trend && <span className={clsx("text-[12px] font-bold", trend.direction === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]')}>{trend.direction === 'up' ? '↑' : '↓'}{trend.value}%</span>}
    </div>
  </motion.div>
);

// =========================
// 报告模块组件
// =========================

export const ReportHeroCard = ({
  title,
  subtitle,
  badges,
  tags,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  badges?: { label: string; value: string; helper?: string }[];
  tags?: string[];
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white border border-[#E4E6EB] rounded-[28px] p-6 md:p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)] space-y-5"
  >
    <div className="text-[11px] font-semibold tracking-[0.35em] text-[#8F959E] uppercase">Annual Review</div>
    <div className="space-y-3">
      <h2 className="text-[24px] md:text-[28px] font-bold text-[#1F2329] leading-snug">{title}</h2>
      <p className="text-[14px] text-[#646A73] leading-relaxed">{subtitle}</p>
    </div>
    {tags && tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#F5F6F7] text-[#3370FF]">
            {tag}
          </span>
        ))}
      </div>
    )}
    {badges && badges.length > 0 && (
      <div className="grid md:grid-cols-3 gap-3">
        {badges.map((badge, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#DEE0E3] bg-white p-4 flex flex-col gap-1 shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
          >
            <span className="text-[12px] text-[#8F959E]">{badge.label}</span>
            <span className="text-[20px] font-semibold text-[#1F2329]">{badge.value}</span>
            {badge.helper && <span className="text-[12px] text-[#00B665] font-medium">{badge.helper}</span>}
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

const layerAccent: Record<string, { pill: string; dot: string }> = {
  blue: { pill: 'bg-[#E1EAFF] text-[#3370FF]', dot: 'bg-[#3370FF]' },
  green: { pill: 'bg-[#E8FFF2] text-[#00B665]', dot: 'bg-[#00B665]' },
  orange: { pill: 'bg-[#FFF3E0] text-[#FF8800]', dot: 'bg-[#FF8800]' },
  purple: { pill: 'bg-[#F3EEFF] text-[#7B61FF]', dot: 'bg-[#7B61FF]' },
};

export const ReportLayerCard = ({
  layer,
  title,
  description,
  highlights,
  kpis,
  accent = 'blue',
  delay = 0,
}: {
  layer: string;
  title: string;
  description?: string;
  highlights?: string[];
  kpis?: { label: string; value: string; trend?: string }[];
  accent?: 'blue' | 'green' | 'orange' | 'purple';
  delay?: number;
}) => {
  const colors = layerAccent[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-[#E4E6EB] rounded-2xl p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={clsx('px-3 py-1 rounded-full text-[11px] font-semibold', colors.pill)}>{layer}</span>
        <h3 className="text-[17px] font-semibold text-[#1F2329]">{title}</h3>
      </div>
      {description && <p className="text-[14px] text-[#646A73] leading-relaxed">{description}</p>}
      {highlights && (
        <div className="space-y-2">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[14px] text-[#1F2329]">
              <span className={clsx('mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      )}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((item, idx) => (
            <div key={idx} className="rounded-xl bg-[#F5F6F7] p-3">
              <div className="text-[12px] text-[#8F959E]">{item.label}</div>
              <div className="text-[18px] font-semibold text-[#1F2329]">{item.value}</div>
              {item.trend && <div className="text-[12px] text-[#00B665]">{item.trend}</div>}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const calloutVariants: Record<string, { wrapper: string; dot: string }> = {
  warning: { wrapper: 'bg-[#FFF7E8] border-[#FAD7A0]', dot: 'bg-[#FF8800]' },
  info: { wrapper: 'bg-[#E8F1FF] border-[#B3CCFF]', dot: 'bg-[#3370FF]' },
  success: { wrapper: 'bg-[#E9FFF3] border-[#A6F3C5]', dot: 'bg-[#00B665]' },
};

export const CalloutCard = ({
  title,
  items,
  variant = 'info',
  delay = 0,
}: {
  title: string;
  items: { label: string; desc: string }[];
  variant?: 'warning' | 'info' | 'success';
  delay?: number;
}) => {
  const styles = calloutVariants[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={clsx('rounded-2xl border p-5 space-y-3', styles.wrapper)}
    >
      <div className="text-[15px] font-semibold text-[#1F2329] flex items-center gap-2">
        <span className={clsx('w-2 h-2 rounded-full', styles.dot)} />
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="text-[14px] text-[#1F2329]">
            <span className="font-semibold mr-1">{item.label}</span>
            <span className="text-[#646A73]">{item.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const StrategyCard = ({
  title,
  description,
  steps,
  delay = 0,
}: {
  title: string;
  description?: string;
  steps: { title: string; desc: string }[];
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white border border-[#E4E6EB] rounded-2xl p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] space-y-4"
  >
    <div>
      <h3 className="text-[16px] font-semibold text-[#1F2329] mb-1">{title}</h3>
      {description && <p className="text-[14px] text-[#646A73]">{description}</p>}
    </div>
    <div className="space-y-3">
      {steps.map((step, idx) => (
        <div key={idx} className="flex gap-3 bg-[#F5F6F7] rounded-xl p-3">
          <span className="w-7 h-7 rounded-full bg-white border border-[#E4E6EB] flex items-center justify-center font-semibold text-[#3370FF]">
            {idx + 1}
          </span>
          <div>
            <div className="text-[14px] font-semibold text-[#1F2329]">{step.title}</div>
            <p className="text-[13px] text-[#646A73] leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// 兼容旧代码
export const CompareCard = () => null;
export const DataPreviewCard = () => null;
export const TrendMetric = () => null;

export default { ReportTitle, SectionTitle, QuoteParagraph, StructuredListItem, CompareCardLight, DataPreviewCardLight, QuoteBox, InsightBox, Divider, ActionBar, Section, SourceTag, LoadedTag, HighlightBlock, RegionCards, MetricsPreviewCard, AnalystQuote, TrendCard, ReportHeroCard, ReportLayerCard, CalloutCard, StrategyCard };
