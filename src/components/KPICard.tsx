/**
 * KPI卡片组件 - 字节风极简配色
 */

import { motion } from 'framer-motion';
import { KPIData } from '../types';
import clsx from 'clsx';

interface KPICardProps {
  data: KPIData;
  delay?: number;
}

// 格式化数值
const formatValue = (value: number | string): string => {
  if (typeof value === 'string') return value;
  
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  } else if (value >= 10000) {
    return (value / 10000).toFixed(0) + '万';
  } else if (value >= 1000) {
    return value.toLocaleString();
  }
  return value.toString();
};

// 主KPI卡片 - 融入式设计，无独立边框
export const PrimaryKPICard = ({ data, delay = 0 }: KPICardProps) => {
  const { label, value, unit, prefix, trend, subMetrics } = data;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="my-2"
    >
      {/* 标题和趋势 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[14px] text-[#86868b] font-medium">{label}</span>
        {trend && (
          <span className={clsx(
            'text-[13px] font-semibold',
            trend.direction === 'up' ? 'text-[#34C759]' : 
            trend.direction === 'down' ? 'text-[#FF3B30]' : 
            'text-[#86868b]'
          )}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '−'} {trend.value}%
            {trend.label && <span className="opacity-80 ml-1 text-[12px]">{trend.label}</span>}
          </span>
        )}
      </div>
      
      {/* 主数值 */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[28px] font-bold text-[#1d1d1f] tracking-tight leading-none">
          {prefix}{formatValue(value)}
        </span>
        {unit && <span className="text-[14px] text-[#86868b] font-medium">{unit}</span>}
      </div>
      
      {/* 子指标 */}
      {subMetrics && subMetrics.length > 0 && (
        <div className="grid grid-cols-4 gap-4 pt-3 border-t border-[#E5E5EA]">
          {subMetrics.map((sub, index) => (
            <div key={index}>
              <div className="text-[12px] text-[#86868b] mb-0.5">{sub.label}</div>
              <div className="text-[14px] font-semibold text-[#1d1d1f]">
                {typeof sub.value === 'number' ? formatValue(sub.value) : sub.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// 次要KPI卡片 - 融入式设计，浅色背景
export const SecondaryKPICard = ({ data, delay = 0 }: KPICardProps) => {
  const { label, value, unit, prefix, trend } = data;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="bg-[#F9F9FB] rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-[#86868b]">{label}</span>
        {trend && (
          <span className={clsx(
            'text-[12px] font-semibold',
            trend.direction === 'up' ? 'text-[#34C759]' : 
            trend.direction === 'down' ? 'text-[#FF3B30]' : 
            'text-[#86868b]'
          )}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '−'} {trend.value}%
          </span>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-[20px] font-bold text-[#1d1d1f] tracking-tight">
          {prefix}{formatValue(value)}
        </span>
        {unit && <span className="text-[12px] text-[#86868b]">{unit}</span>}
      </div>
    </motion.div>
  );
};

// KPI组 - 横向排列，融入内容
interface KPIGroupProps {
  items: KPIData[];
  delay?: number;
}

export const KPIGroup = ({ items, delay = 0 }: KPIGroupProps) => {
  return (
    <div className="flex flex-wrap gap-3 my-2">
      {items.map((item, index) => (
        <div key={item.id || index} className="flex-1 min-w-[160px] max-w-[240px]">
          <SecondaryKPICard 
            data={item} 
            delay={delay + 0.03 * index} 
          />
        </div>
      ))}
    </div>
  );
};

export default { PrimaryKPICard, SecondaryKPICard, KPIGroup };
