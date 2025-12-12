import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';

// 筛选条件类型
export interface FilterCondition {
  id: string;
  type: 'datasource' | 'groupby' | 'filter' | 'date' | 'metric_gte' | 'metric_lte' | 'metric_yoy';
  label: string;
  value: string;
  operator?: string;
  removable?: boolean;
  options?: string[];
}

interface DataVisualizerProps {
  conditions: FilterCondition[];
  onConditionChange?: (id: string, value: string) => void;
  onConditionRemove?: (id: string) => void;
  onFilterApply?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  className?: string;
}

// 预设选项
const FILTER_OPTIONS: Record<string, string[]> = {
  datasource: ['销售流水', '订单表', '用户表', '库存表', '财务流水', '门店销售'],
  groupby: ['产品 分组', '时间 按日', '时间 按月', '渠道 分组', '地区 分组', '品类 分组'],
  date: ['今天', '昨天', '本周', '本月', '上月', '近7天', '近30天', '2024年', '2023年'],
  filter: ['不为空', '为空', '包含', '等于', '华东', '华南', '华北'],
  metric_gte: ['>=100', '>=500', '>=1000', '>=5000', '>=10000'],
  metric_lte: ['<=100', '<=500', '<=1000', '<=-0.1', '<=-0.2'],
};

// 简约筛选标签
const FilterTag = ({ 
  condition, 
  onRemove,
  onChange,
}: { 
  condition: FilterCondition;
  onRemove?: () => void;
  onChange?: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = condition.options || FILTER_OPTIONS[condition.type] || [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px]',
          'bg-white border transition-colors',
          open ? 'border-[#007AFF] text-[#007AFF]' : 'border-[#d2d2d7] text-[#1d1d1f] hover:border-[#86868b]'
        )}
      >
        <span className="text-[#86868b]">{condition.label}</span>
        <span className="font-medium">{condition.value}</span>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-[#86868b]', open && 'rotate-180')} />
        
        {condition.removable !== false && onRemove && (
          <X 
            className="w-3.5 h-3.5 text-[#86868b] hover:text-[#1d1d1f] ml-0.5"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          />
        )}
      </button>

      {open && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-[#d2d2d7] min-w-[120px] py-1 max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange?.(opt); setOpen(false); }}
              className={clsx(
                'w-full px-3 py-1.5 text-left text-[13px]',
                opt === condition.value ? 'text-[#007AFF] bg-[#007AFF]/5' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 主组件
export const DataVisualizer = ({ 
  conditions: initialConditions, 
  onConditionChange,
  onConditionRemove,
  onFilterApply,
  className 
}: DataVisualizerProps) => {
  const [conditions, setConditions] = useState(initialConditions);

  useEffect(() => {
    setConditions(initialConditions);
  }, [initialConditions]);

  const handleChange = (id: string, value: string) => {
    const changed = conditions.find(c => c.id === id);
    const newConditions = conditions.map(c => c.id === id ? { ...c, value } : c);
    setConditions(newConditions);
    onConditionChange?.(id, value);
    onFilterApply?.(newConditions, changed?.type, value);
  };

  const handleRemove = (id: string) => {
    const newConditions = conditions.filter(c => c.id !== id);
    setConditions(newConditions);
    onConditionRemove?.(id);
    onFilterApply?.(newConditions);
  };

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      {conditions.map((c) => (
        <FilterTag
          key={c.id}
          condition={c}
          onRemove={c.removable !== false ? () => handleRemove(c.id) : undefined}
          onChange={(v) => handleChange(c.id, v)}
        />
      ))}
    </div>
  );
};

// 条件生成器
export const createConditions = {
  datasource: (value: string): FilterCondition => ({ id: `ds_${Date.now()}`, type: 'datasource', label: '数据源', value, removable: false }),
  groupby: (field: string, method = '分组'): FilterCondition => ({ id: `gb_${Date.now()}`, type: 'groupby', label: '按', value: `${field} ${method}` }),
  filter: (field: string, value: string): FilterCondition => ({ id: `ft_${Date.now()}`, type: 'filter', label: field, value }),
  date: (value: string): FilterCondition => ({ id: `dt_${Date.now()}`, type: 'date', label: '日期', value }),
  metricGte: (metric: string, value: string): FilterCondition => ({ id: `mgte_${Date.now()}`, type: 'metric_gte', label: metric, value: `>=${value}`, operator: '>=' }),
  metricLte: (metric: string, value: string): FilterCondition => ({ id: `mlte_${Date.now()}`, type: 'metric_lte', label: metric, value: `<=${value}`, operator: '<=' }),
  metricYoy: (metric: string, value: string): FilterCondition => ({ id: `myoy_${Date.now()}`, type: 'metric_yoy', label: metric, value, operator: value.startsWith('>=') ? '>=' : '<=' }),
};

export const sampleVisualizerConditions: FilterCondition[] = [
  { id: 'ds_1', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
  { id: 'gb_1', type: 'groupby', label: '按', value: '产品 分组' },
  { id: 'ft_1', type: 'filter', label: '产品', value: '不为空' },
  { id: 'dt_1', type: 'date', label: '日期', value: '2024年' },
];

export default DataVisualizer;
