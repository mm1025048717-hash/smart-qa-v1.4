/**
 * AI 回复中的交互组件 - 蓝白简约风格
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { getAgentByName } from '../services/agents';

// 选择题组件
interface ChoiceOption {
  id: string;
  label: string;
  value: string;
}

export const ChoiceSelector = ({ 
  question,
  options, 
  onSelect,
  multiple = false,
}: { 
  question?: string;
  options: ChoiceOption[];
  onSelect: (value: string) => void;
  multiple?: boolean;
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (option: ChoiceOption) => {
    if (multiple) {
      const newSelected = selected.includes(option.id)
        ? selected.filter(id => id !== option.id)
        : [...selected, option.id];
      setSelected(newSelected);
    } else {
      setSelected([option.id]);
      onSelect(option.value);
    }
  };

  return (
    <div className="mt-3">
      {question && (
        <p className="text-[13px] text-[#86868b] mb-2">{question}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-all border
              ${selected.includes(option.id)
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white text-[#007AFF] border-[#007AFF]/30 hover:border-[#007AFF] hover:bg-[#007AFF]/5'
              }
            `}
          >
            {selected.includes(option.id) && <Check className="w-3 h-3" />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// 快捷操作按钮组 - 统一空心蓝边样式
export const QuickActions = ({ 
  actions,
  onAction,
}: { 
  actions: { id: string; label: string; query: string; icon?: string }[];
  onAction: (query: string) => void;
}) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.query)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px]
            bg-white text-[#007AFF] border border-[#007AFF]/30 hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-all"
        >
          {action.icon && <span>{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
};

// 评分组件
export const RatingSelector = ({
  question,
  onRate,
  max = 5,
}: {
  question?: string;
  onRate: (rating: number) => void;
  max?: number;
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleRate = (value: number) => {
    setRating(value);
    onRate(value);
  };

  return (
    <div className="my-3">
      {question && (
        <p className="text-sm text-[#1d1d1f] mb-2">{question}</p>
      )}
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-colors"
          >
            {star <= (hover || rating) ? '★' : '☆'}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// 确认框
export const ConfirmBox = ({
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
    >
      <p className="text-sm text-amber-800 mb-3">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 bg-[#007AFF] text-white text-sm rounded-lg hover:bg-[#0066CC] transition-colors"
        >
          {confirmText}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 bg-white text-[#1d1d1f] text-sm rounded-lg border border-[#d2d2d7] hover:bg-[#F5F5F7] transition-colors"
        >
          {cancelText}
        </button>
      </div>
    </motion.div>
  );
};

// 进度指示器
export const ProgressSteps = ({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) => {
  return (
    <div className="my-3 flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${index < current 
              ? 'bg-[#34C759] text-white' 
              : index === current 
                ? 'bg-[#007AFF] text-white' 
                : 'bg-[#E5E5EA] text-[#86868b]'
            }
          `}>
            {index < current ? '✓' : index + 1}
          </div>
          <span className={`
            ml-2 text-sm
            ${index <= current ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}
          `}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`
              w-8 h-0.5 mx-2
              ${index < current ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
};

// 切换同事按钮组件 - 精美卡片样式
export const SwitchAgentButton = ({
  agentName,
  onSwitch,
}: {
  agentName: string;
  onSwitch: (agentName: string) => void;
}) => {
  // 确保 agentName 是字符串，不是对象
  const name = typeof agentName === 'string' ? agentName : (agentName as any)?.name || String(agentName);
  
  // 获取完整 Agent 信息
  const agent = getAgentByName(name);
  
  if (!agent) {
    // 如果找不到 Agent，显示简单按钮
    return (
      <button
        onClick={() => onSwitch(name)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F3FF] text-[#007AFF] text-[13px] font-medium rounded-lg hover:bg-[#007AFF] hover:text-white transition-all cursor-pointer border border-[#007AFF]/20 shadow-sm hover:shadow-md"
      >
        <span className="text-[11px]">@</span>
        <span>{name}</span>
      </button>
    );
  }
  
  // 显示完整的 Agent 卡片
  return (
    <button
      onClick={() => onSwitch(agent.name)}
      className="inline-flex items-center gap-2.5 px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl hover:border-[#007AFF] hover:bg-[#F0F7FF] transition-all cursor-pointer shadow-sm hover:shadow-md group"
    >
      {agent.avatar ? (
        <img 
          src={agent.avatar} 
          alt={agent.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white group-hover:ring-[#007AFF]/20 transition-all"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white text-xs font-semibold">
          {agent.name.slice(0, 1)}
        </div>
      )}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#1d1d1f] group-hover:text-[#007AFF] transition-colors">
            {agent.name}
          </span>
          {agent.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#007AFF]/10 text-[#007AFF] rounded">
              {agent.badge}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#86868b] group-hover:text-[#007AFF]/80 transition-colors">
          {agent.title}
        </span>
      </div>
      <svg className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

// 解析 AI 回复中的交互组件标记
export interface ParsedContent {
  type: 'text' | 'choices' | 'actions' | 'rating' | 'confirm' | 'query' | 'switch' | 'chart' | 'kpi';
  content?: string;
  data?: any;
}

export function parseInteractiveContent(text: string): ParsedContent[] {
  const result: ParsedContent[] = [];
  
  // 清理不规范的格式 - 移除所有"[XXX说]:"格式（但保留switch标记）
  let remaining = text.replace(/\[([^\]]+?)说\]:\s*/g, '');
  remaining = remaining.replace(/\[([^\]]+?)说\]/g, '');
  
  while (remaining.length > 0) {
    // 查找下一个 [ 标记
    const bracketIdx = remaining.indexOf('[');
    
    if (bracketIdx === -1) {
      // 没有更多标记，添加剩余文本
      if (remaining.trim()) {
        const text = String(remaining.trim()).replace(/\[object Object\]/g, '').trim();
        if (text) {
          result.push({ type: 'text', content: text });
        }
      }
      break;
    }
    
    // 添加标记前的文本
    if (bracketIdx > 0) {
      const beforeText = remaining.slice(0, bracketIdx).trim();
      if (beforeText) {
        const text = String(beforeText).replace(/\[object Object\]/g, '').trim();
        if (text) {
          result.push({ type: 'text', content: text });
        }
      }
    }
    
    // 检查是否是 [chart: 开头（需要特殊处理 JSON）
    if (remaining.slice(bracketIdx).startsWith('[chart:{')) {
      const startIdx = bracketIdx + 7; // 跳过 "[chart:"
      let braceCount = 1;
      let endIdx = startIdx + 1; // 跳过第一个 {
      
      // 找到匹配的闭合 }
      while (endIdx < remaining.length && braceCount > 0) {
        if (remaining[endIdx] === '{') braceCount++;
        if (remaining[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      // 检查是否有闭合的 ]
      if (endIdx < remaining.length && remaining[endIdx] === ']') {
        const jsonStr = remaining.slice(startIdx, endIdx);
        try {
          const chartData = JSON.parse(jsonStr);
          if (chartData && chartData.data) {
            result.push({ type: 'chart', data: chartData });
          }
        } catch (e) {
          // JSON 解析失败，显示为文本
          const text = String(remaining.slice(bracketIdx, endIdx + 1)).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
        }
        remaining = remaining.slice(endIdx + 1);
        continue;
      }
    }
    
    // 检查是否是 [kpi: 开头（KPI卡片 JSON）
    if (remaining.slice(bracketIdx).startsWith('[kpi:{')) {
      const startIdx = bracketIdx + 5; // 跳过 "[kpi:"
      let braceCount = 1;
      let endIdx = startIdx + 1; // 跳过第一个 {
      
      // 找到匹配的闭合 }
      while (endIdx < remaining.length && braceCount > 0) {
        if (remaining[endIdx] === '{') braceCount++;
        if (remaining[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      // 检查是否有闭合的 ]
      if (endIdx < remaining.length && remaining[endIdx] === ']') {
        const jsonStr = remaining.slice(startIdx, endIdx);
        try {
          const kpiData = JSON.parse(jsonStr);
          if (kpiData && kpiData.label !== undefined && kpiData.value !== undefined) {
            // 生成唯一ID
            kpiData.id = kpiData.id || `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            result.push({ type: 'kpi', data: kpiData });
          }
        } catch (e) {
          // JSON 解析失败，显示为文本
          const text = String(remaining.slice(bracketIdx, endIdx + 1)).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
        }
        remaining = remaining.slice(endIdx + 1);
        continue;
      }
    }
    
    // 处理其他标准格式 [type:content] 或简单的 [选项1|选项2|选项3] 格式
    // 先尝试标准格式 [type:content]，使用非贪婪匹配确保找到第一个闭合的 ]
    const simpleMatch = remaining.slice(bracketIdx).match(/^\[(\w+):([^\]]+?)\]/s);
    if (simpleMatch) {
      const [fullMatch, type, dataStr] = simpleMatch;
      
      switch (type.toLowerCase()) {
        case 'choices':
        case 'choice':
          const options = dataStr.split('|').map((opt, i) => ({
            id: `opt_${i}`,
            label: opt.trim(),
            value: opt.trim(),
          }));
          result.push({ type: 'choices', data: { options } });
          break;
        
        case 'actions':
        case 'action':
          const actions = dataStr.split('|').map((act, i) => ({
            id: `act_${i}`,
            label: act.trim(),
            query: act.trim(),
          }));
          result.push({ type: 'actions', data: { actions } });
          break;
        
        case 'rating':
          result.push({ type: 'rating', data: { question: dataStr.trim() } });
          break;
        
        case 'query':
          result.push({ type: 'query', data: { query: dataStr.trim() } });
          break;
        
        case 'switch':
          // 确保 agentName 是字符串，清理可能的额外字符
          let agentNameStr = typeof dataStr === 'string' ? dataStr.trim() : String(dataStr);
          // 移除可能存在的闭合括号或其他字符
          agentNameStr = agentNameStr.replace(/\]/g, '').trim();
          if (agentNameStr) {
            result.push({ type: 'switch', data: { agentName: agentNameStr } });
          }
          break;
        
        default:
          // 未知类型，当作文本
          const text = String(fullMatch).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
      }
      
      remaining = remaining.slice(bracketIdx + fullMatch.length);
      continue;
    }
    
    // 处理未闭合的 [switch: 标记（如 [switch:可视化小王 后面没有]）
    // 或者 switch 后面跟着其他内容的情况
    const unclosedSwitchMatch = remaining.slice(bracketIdx).match(/^\[switch:([^\]]+?)(?:\]|$)/);
    if (unclosedSwitchMatch) {
      const [fullMatch, agentNameStr] = unclosedSwitchMatch;
      const cleanedName = agentNameStr.replace(/\]/g, '').trim();
      if (cleanedName) {
        result.push({ type: 'switch', data: { agentName: cleanedName } });
      }
      // 移除已处理的部分，包括可能的尾随 ]
      remaining = remaining.slice(bracketIdx + fullMatch.length);
      continue;
    }
    
    // 尝试简单格式 [选项1|选项2|选项3]（没有type前缀）
    // 改进：支持跨行的选项，找到第一个闭合的 ]
    const simpleOptionsMatch = remaining.slice(bracketIdx).match(/^\[([^\]]+?)\]/);
    if (simpleOptionsMatch) {
      const [fullMatch, optionsStr] = simpleOptionsMatch;
      // 检查是否包含 | 分隔符，如果有则认为是选项列表
      if (optionsStr.includes('|')) {
        const options = optionsStr.split('|').map((opt, i) => ({
          id: `opt_${i}`,
          label: opt.trim(),
          value: opt.trim(),
        }));
        result.push({ type: 'choices', data: { options } });
        remaining = remaining.slice(bracketIdx + fullMatch.length);
        continue;
      }
    }
    
    // 处理特殊情况：文本中可能包含未闭合的标记，尝试找到下一个 ] 或行尾
    // 例如："将本看板分享给[switch:可视化小王制作交互式图表|对比加入安徽后的长三角完整数据]"
    // 这种情况应该解析为：文本 + switch + choices
    const mixedFormatMatch = remaining.slice(bracketIdx).match(/^\[switch:([^\]]+?)([^\]]*?)\]/);
    if (mixedFormatMatch) {
      const [fullMatch, agentNameStr, trailingContent] = mixedFormatMatch;
      const cleanedName = agentNameStr.replace(/\]/g, '').trim();
      
      // 如果 switch 后面有内容且包含 |，则解析为 choices
      if (trailingContent && trailingContent.includes('|')) {
        if (cleanedName) {
          result.push({ type: 'switch', data: { agentName: cleanedName } });
        }
        const options = trailingContent.split('|').map((opt, i) => ({
          id: `opt_${i}`,
          label: opt.trim(),
          value: opt.trim(),
        }));
        if (options.length > 0) {
          result.push({ type: 'choices', data: { options } });
        }
        remaining = remaining.slice(bracketIdx + fullMatch.length);
        continue;
      } else if (cleanedName) {
        // 只有 switch，没有后续选项
        result.push({ type: 'switch', data: { agentName: cleanedName } });
        remaining = remaining.slice(bracketIdx + fullMatch.length);
        continue;
      }
    }
    
    // 没有匹配到任何格式，跳过这个 [ 字符
    const nextPart = String(remaining.slice(bracketIdx, bracketIdx + 1)).replace(/\[object Object\]/g, '');
    if (nextPart) {
      if (result.length > 0 && result[result.length - 1].type === 'text') {
        result[result.length - 1].content = String(result[result.length - 1].content || '') + nextPart;
      } else {
        result.push({ type: 'text', content: nextPart });
      }
    }
    remaining = remaining.slice(bracketIdx + 1);
  }

  // 如果没有解析到任何内容，返回原文本
  if (result.length === 0) {
    const text = String(text).replace(/\[object Object\]/g, '').trim();
    if (text) {
      result.push({ type: 'text', content: text });
    }
  }
  
  // 最后清理所有 text 类型的 content，确保都是字符串且没有 [object Object]
  result.forEach(item => {
    if (item.type === 'text' && item.content) {
      if (typeof item.content !== 'string') {
        item.content = String(item.content).replace(/\[object Object\]/g, '').trim();
      } else {
        item.content = item.content.replace(/\[object Object\]/g, '').trim();
      }
    }
  });

  return result;
}

// 检查文本是否包含数据查询触发
export function extractQueryTrigger(text: string): string | null {
  const match = text.match(/\[query:(.*?)\]/);
  return match ? match[1].trim() : null;
}

