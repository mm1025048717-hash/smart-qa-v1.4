/**
 * 叙事文本组件 - 蓝白简约风格
 */

import { motion } from 'framer-motion';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChoiceSelector, QuickActions, RatingSelector, SwitchAgentButton, parseInteractiveContent } from './InteractiveComponents';
import { SmartChart } from './Charts';
import { TypewriterText } from './TypewriterText';

/**
 * 生成下钻查询字符串
 * 根据图表数据和下钻数据生成查询
 */
function generateDrillDownQuery(chartData: any, drillData: any): string {
  if (!drillData) {
    return '查看详细数据';
  }

  // 如果 drillData 是字符串，直接返回
  if (typeof drillData === 'string') {
    return drillData;
  }

  // 如果 drillData 是对象，尝试提取有意义的信息
  if (typeof drillData === 'object') {
    const parts: string[] = [];
    
    // 提取维度信息
    if (drillData.name) {
      parts.push(`查看${drillData.name}的详细数据`);
    } else if (drillData.x) {
      parts.push(`查看${drillData.x}的详细数据`);
    } else if (drillData.category) {
      parts.push(`查看${drillData.category}的详细数据`);
    } else if (chartData.xKey && drillData[chartData.xKey]) {
      parts.push(`查看${drillData[chartData.xKey]}的详细数据`);
    } else {
      parts.push('查看详细数据');
    }

    // 添加时间范围（如果有）
    if (drillData.date || drillData.time) {
      parts.push(`时间：${drillData.date || drillData.time}`);
    }

    return parts.join('，');
  }

  return '查看详细数据';
}

interface NarrativeTextProps {
  content: string;
  delay?: number;
  onInteraction?: (value: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  isStreaming?: boolean; // 是否正在流式输出
}

// 预处理：将伪复选框格式转换为真正的交互组件
const preprocessContent = (text: string): string => {
  // 匹配伪复选框格式：☐ 选项1 ☐ 选项2 或 □ 选项1 □ 选项2
  const checkboxPattern = /[☐☑□■]\s*([^☐☑□■\n]+)/g;
  const matches = text.match(checkboxPattern);
  
  if (matches && matches.length >= 2) {
    // 提取选项
    const options = matches.map(m => m.replace(/^[☐☑□■]\s*/, '').trim()).filter(Boolean);
    if (options.length > 0) {
      // 找到包含复选框的那一行，替换为 choices 组件
      const lines = text.split('\n');
      const newLines = lines.map(line => {
        if (line.match(/[☐☑□■]/)) {
          // 这行包含复选框，替换为 choices
          return `请选择：[choices:${options.join('|')}]`;
        }
        return line;
      });
      return newLines.join('\n');
    }
  }
  
  // 清理单独的复选框字符
  return text.replace(/[☐☑□■]/g, '•');
};

// 主组件 - 使用打字机效果渲染文本
export const NarrativeText = ({ content, delay = 0, onInteraction, onAgentSwitch, isStreaming = false }: NarrativeTextProps) => {
  // 确保 content 是字符串
  let textContent: string;
  if (typeof content === 'string') {
    textContent = content;
  } else if (content && typeof content === 'object') {
    // 如果是对象，尝试提取有意义的内容
    if ('text' in content) {
      textContent = String(content.text || '');
    } else if ('content' in content) {
      textContent = String(content.content || '');
    } else {
      textContent = JSON.stringify(content);
    }
    // 清理 [object Object]
    textContent = textContent.replace(/\[object Object\]/g, '').trim();
  } else {
    textContent = String(content || '');
  }
  // 再次清理，确保没有残留的对象字符串
  textContent = textContent.replace(/\[object Object\]/g, '').trim();
  if (!textContent) return null;
  
  // 预处理内容，转换伪复选框
  const processedContent = preprocessContent(textContent);
  
  // 检测是否包含交互组件标记（包括简单格式 [选项1|选项2]）
  const hasInteractive = processedContent.includes('[choices:') || 
    processedContent.includes('[actions:') || 
    processedContent.includes('[rating:') || 
    processedContent.includes('[switch:') || 
    processedContent.includes('[query:') || 
    processedContent.includes('[chart:') ||
    processedContent.includes('[kpi:') ||
    /\[[^\]]+\|[^\]]+\]/.test(processedContent); // 检测简单格式 [选项1|选项2]
  
  // 如果包含交互组件，解析并渲染
  if (hasInteractive) {
    const parsed = parseInteractiveContent(processedContent);
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.2, delay }}
        className="space-y-0"
      >
        {parsed.map((item, index) => {
          switch (item.type) {
            case 'choices':
              return (
                <ChoiceSelector
                  key={index}
                  options={item.data.options}
                  onSelect={(value) => onInteraction?.(value)}
                />
              );
            case 'actions':
              return (
                <QuickActions
                  key={index}
                  actions={item.data.actions}
                  onAction={(query) => onInteraction?.(query)}
                />
              );
            case 'rating':
              return (
                <RatingSelector
                  key={index}
                  question={item.data.question}
                  onRate={(rating) => onInteraction?.(`评分: ${rating}星`)}
                />
              );
            case 'query':
              return (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F3FF] text-[#007AFF] text-sm rounded-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
                  <span>正在查询: {item.data.query}</span>
                </div>
              );
            case 'switch':
              // 确保 agentName 是字符串，处理可能的对象情况
              let agentName = typeof item.data?.agentName === 'string' 
                ? item.data.agentName 
                : (item.data?.agentName?.name || String(item.data?.agentName || ''));
              // 清理可能的额外字符（如闭合括号、换行等）
              agentName = agentName.replace(/\]/g, '').trim();
              if (!agentName) {
                // 如果没有有效的 agentName，跳过渲染
                return null;
              }
              return (
                <SwitchAgentButton
                  key={index}
                  agentName={agentName}
                  onSwitch={(name) => onAgentSwitch?.(name)}
                />
              );
            case 'chart':
              // 确保 chartData 有效
              if (!item.data || !item.data.type || !item.data.data) {
                return (
                  <div key={index} className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
                    <p className="text-[13px] text-[#FF3B30]">图表数据格式错误</p>
                  </div>
                );
              }
              return (
                <div key={index} className="my-0">
                  <SmartChart 
                    chartData={item.data} 
                    delay={delay + index * 0.1}
                    onDrillDown={(data) => {
                      // 生成下钻查询
                      const drillQuery = generateDrillDownQuery(item.data, data);
                      onInteraction?.(drillQuery);
                    }}
                  />
                </div>
              );
            case 'text':
            default:
              // 确保 content 是字符串
              let textContent: string;
              if (typeof item.content === 'string') {
                textContent = item.content;
              } else if (item.content && typeof item.content === 'object') {
                // 如果是对象，尝试提取有意义的内容
                if ('text' in item.content) {
                  textContent = String(item.content.text || '');
                } else if ('content' in item.content) {
                  textContent = String(item.content.content || '');
                } else {
                  textContent = JSON.stringify(item.content);
                }
                // 清理 [object Object]
                textContent = textContent.replace(/\[object Object\]/g, '').trim();
              } else {
                textContent = String(item.content || '');
              }
              // 再次清理，确保没有残留的对象字符串
              textContent = textContent.replace(/\[object Object\]/g, '').trim();
              if (!textContent) return null;
              return (
                <div key={index} className="text-[15px] text-[#1d1d1f] leading-relaxed my-0">
                  <MarkdownRenderer content={textContent} onAgentSwitch={onAgentSwitch} />
                </div>
              );
          }
        })}
      </motion.div>
    );
  }

  // 普通文本，使用打字机效果 - 极致体验
  return (
    <div className="relative">
      <TypewriterText
        content={processedContent}
        speed={15} // 15ms每个字符，非常流畅
        delay={delay}
        isStreaming={isStreaming}
        onAgentSwitch={onAgentSwitch}
      />
    </div>
  );
};

// 渠道数据
export const ChannelDataDisplay = ({ channels }: { channels: { name: string; percent: number; growth: number; isTop?: boolean }[] }) => (
  <div className="space-y-2.5">
    {channels.map((channel, index) => (
      <motion.div 
        key={channel.name} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.2, delay: index * 0.05 }} 
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          channel.isTop 
            ? 'bg-[#E8F3FF]/30 border-[#007AFF]/30' 
            : 'bg-white border-[#E5E5EA]'
        }`}
      >
        <div className={`w-6 h-6 rounded flex items-center justify-center text-[12px] font-bold ${
          channel.isTop 
            ? 'bg-[#007AFF] text-white' 
            : 'bg-[#F5F5F7] text-[#86868b]'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-[14px] font-medium ${channel.isTop ? 'text-[#007AFF]' : 'text-[#1d1d1f]'}`}>
            {channel.name}
          </span>
          {channel.isTop && (
            <span className="ml-2 px-1.5 py-0.5 bg-[#007AFF]/10 text-[#007AFF] text-[10px] rounded font-medium">
              核心
            </span>
          )}
        </div>
        <div className={`text-[16px] font-bold font-mono ${channel.isTop ? 'text-[#007AFF]' : 'text-[#1d1d1f]'}`}>
          {channel.percent}%
        </div>
        <div className={`text-[12px] font-medium min-w-[50px] text-right ${
          channel.growth > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
        }`}>
          {channel.growth > 0 ? '↑' : '↓'}{Math.abs(channel.growth)}%
        </div>
      </motion.div>
    ))}
  </div>
);

// 建议列表
export const SuggestionList = ({ suggestions }: { suggestions: string[] }) => (
  <div className="bg-[#F5F5F7] rounded-lg p-4 border border-[#E5E5EA]">
    <div className="font-bold text-[13px] text-[#1d1d1f] mb-3 flex items-center gap-2">
      <span className="w-1 h-3 bg-[#007AFF] rounded-full"></span>
      策略建议
    </div>
    <div className="space-y-2">
      {suggestions.map((suggestion, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.2, delay: index * 0.05 }} 
          className="flex items-start gap-3 bg-white rounded p-3 border border-[#E5E5EA]/50"
        >
          <div className="w-5 h-5 rounded-full bg-[#E8F3FF] text-[#007AFF] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
            {index + 1}
          </div>
          <span className="text-[14px] text-[#1d1d1f] leading-relaxed flex-1">{suggestion}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

// 关键指标高亮
export const HighlightMetric = ({ label, value, trend, unit }: { label: string; value: string | number; trend?: { value: number; direction: 'up' | 'down' }; unit?: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F7] rounded-md border border-[#E5E5EA]">
    <span className="text-[12px] text-[#86868b] font-medium">{label}:</span>
    <span className="font-bold text-[14px] text-[#1d1d1f]">{value}{unit}</span>
    {trend && (
      <span className={`text-[12px] font-medium ${trend.direction === 'up' ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
        {trend.direction === 'up' ? '↑' : '↓'}{trend.value}%
      </span>
    )}
  </div>
);

export default NarrativeText;
