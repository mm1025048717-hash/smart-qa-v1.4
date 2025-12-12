/**
 * 消息气泡组件 - 蓝白简约设计
 * Apple/飞书风格
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Message, ContentBlock, KPIData } from '../types';
import { PrimaryKPICard, KPIGroup } from './KPICard';
import { GanttChart } from './GanttChart';
import { 
  LineChartComponent, 
  BarChartComponent, 
  PieChartComponent, 
  YearComparisonChart,
  ScatterChartComponent,
  FunnelChartComponent,
  BoxPlotComponent,
  MapChartComponent,
  QuadrantChartComponent,
  SmartChart,
} from './Charts';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ActionButtonGroup } from './ActionButtons';
import { NarrativeText, ChannelDataDisplay, SuggestionList } from './NarrativeText';
import {
  ReportTitle,
  QuoteParagraph,
  StructuredListItem,
  CompareCardLight,
  DataPreviewCardLight,
  QuoteBox,
  InsightBox,
  Divider,
  ActionBar,
  Section,
  RegionCards,
  MetricsPreviewCard,
  AnalystQuote,
  ReportHeroCard,
  ReportLayerCard,
  CalloutCard,
  StrategyCard,
} from './StoryComponents';
import { DataVisualizer, FilterCondition } from './DataVisualizer';
import { getAgentById } from '../services/agents';

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

interface MessageBubbleProps {
  message: Message;
  onActionSelect?: (query: string) => void;
  onFilterChange?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  isSearching?: boolean; // 是否正在联网搜索
}

// 用户消息 - 蓝色气泡
const UserBubble = ({ content }: { content: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="flex justify-end mb-6"
  >
    <div className="message-user">
      {content}
    </div>
  </motion.div>
);

// 加载状态 - 蓝色动画，支持搜索提示
const LoadingIndicator = ({ isSearching = false }: { isSearching?: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-3 ml-12 mb-6"
  >
    <div className="bg-white px-5 py-4 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center gap-3">
      <div className="loading-dots">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      {isSearching ? (
        <div className="flex items-center gap-2">
          <svg 
            className="w-4 h-4 text-[#007AFF]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[13px] text-[#86868b]">正在搜索网页...</span>
        </div>
      ) : (
        <span className="text-[13px] text-[#86868b]">正在分析...</span>
      )}
    </div>
  </motion.div>
);

const ContentBlockRenderer = ({ 
  block, 
  index, 
  onActionSelect,
  onFilterApply,
  onAgentSwitch,
  isStreaming = false,
}: { 
  block: ContentBlock; 
  index: number; 
  onActionSelect?: (query: string) => void;
  onFilterApply?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  isStreaming?: boolean;
}) => {
  const delay = index * 0.03;

  switch (block.type) {
    case 'text': {
      // 确保 content 是字符串，处理可能的对象
      let textContent: string;
      if (typeof block.data === 'string') {
        textContent = block.data;
      } else if (block.data && typeof block.data === 'object') {
        // 如果是对象，尝试提取有意义的内容或转换为字符串
        if (block.data && 'text' in block.data) {
          textContent = String(block.data.text || '');
        } else if (block.data && 'content' in block.data) {
          textContent = String(block.data.content || '');
        } else {
          textContent = JSON.stringify(block.data);
        }
        // 清理 [object Object]
        textContent = textContent.replace(/\[object Object\]/g, '').trim();
      } else {
        textContent = String(block.data || '');
      }
      // 再次清理，确保没有残留的对象字符串
      textContent = textContent.replace(/\[object Object\]/g, '').trim();
      if (!textContent) return null;
      return <NarrativeText content={textContent} delay={delay} onInteraction={onActionSelect} onAgentSwitch={onAgentSwitch} isStreaming={isStreaming} />;
    }
    case 'heading':
      return (
        <motion.h3
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay }}
          className="text-[16px] font-bold text-[#1d1d1f] mt-4 mb-3"
        >
          {block.data as string}
        </motion.h3>
      );
    case 'kpi': return <PrimaryKPICard data={block.data as KPIData} delay={delay} />;
    case 'kpi-group': return <KPIGroup items={block.data as KPIData[]} delay={delay} />;
    case 'gantt': {
      const ganttData = block.data as { title?: string; data: any[] };
      return <GanttChart title={ganttData.title} data={ganttData.data} delay={delay} />;
    }
    
    case 'line-chart': {
      const chartData = block.data as any;
      if (chartData.type === 'year-comparison') {
        return <YearComparisonChart {...chartData} delay={delay} />;
      }
      return <LineChartComponent {...chartData} delay={delay} onDrillDown={(data) => {
        // 生成下钻查询
        const drillQuery = generateDrillDownQuery(chartData, data);
        onActionSelect?.(drillQuery);
      }} />;
    }
    case 'bar-chart': return <BarChartComponent {...(block.data as any)} delay={delay} onDrillDown={(data) => {
      // 生成下钻查询
      const drillQuery = generateDrillDownQuery(block.data as any, data);
      onActionSelect?.(drillQuery);
    }} />;
    case 'pie-chart': return <PieChartComponent {...(block.data as any)} delay={delay} />;
    case 'scatter-chart': return <ScatterChartComponent {...(block.data as any)} delay={delay} />;
    case 'funnel-chart': return <FunnelChartComponent {...(block.data as any)} delay={delay} />;
    case 'box-plot': return <BoxPlotComponent {...(block.data as any)} delay={delay} />;
    case 'map-chart': return <MapChartComponent {...(block.data as any)} delay={delay} />;
    case 'quadrant-chart': return <QuadrantChartComponent {...(block.data as any)} delay={delay} />;
    
    case 'table': {
      const tableData = block.data as { headers: string[]; rows: string[][] };
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay }}
          className="my-2"
        >
          {/* 表格蓝白配色 */}
          <div className="overflow-x-auto rounded-lg border border-[#E5E5EA]">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[#1a73e8] text-white">
                  {tableData.headers.map((header, i) => (
                    <th 
                      key={i} 
                      className="px-5 py-3 text-left font-medium first:rounded-tl-lg last:rounded-tr-lg"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8ED]">
                {tableData.rows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF] transition-colors duration-150`}
                  >
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className="px-5 py-3 text-[#374151] leading-relaxed"
                      >
                        <MarkdownRenderer content={cell} onAgentSwitch={onAgentSwitch} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      );
    }
    case 'chart': {
      const chartData = block.data as any;
      
      // 数据验证
      if (!chartData) {
        console.warn('Chart block has no data:', block);
        return null;
      }
      
      if (!chartData.data || !Array.isArray(chartData.data) || chartData.data.length === 0) {
        console.warn('Chart data is invalid:', chartData);
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay }}
            className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl"
          >
            <p className="text-[13px] text-[#FF3B30]">图表数据格式错误或为空</p>
            <p className="text-[11px] text-[#86868b] mt-1">数据: {JSON.stringify(chartData).substring(0, 100)}</p>
          </motion.div>
        );
      }
      
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay }}
          className="my-0"
        >
          <SmartChart 
            chartData={chartData} 
            delay={delay}
            onDrillDown={(data) => {
              // 生成下钻查询
              const drillQuery = `详细分析${JSON.stringify(data)}的数据`;
              onActionSelect?.(drillQuery);
            }}
          />
        </motion.div>
      );
    }
    case 'channel-data': return <ChannelDataDisplay channels={(block.data as any).channels} />;
    case 'suggestions': return <SuggestionList suggestions={(block.data as any).items} />;
    
    case 'report-title': return <ReportTitle {...(block.data as any)} delay={delay} />;
    case 'quote-paragraph': return <QuoteParagraph {...(block.data as any)} delay={delay} />;
    case 'structured-list': 
      return (
        <div className="space-y-2">
          {(block.data as any).items.map((item: any, i: number) => (
            <StructuredListItem key={i} {...item} delay={delay + i * 0.03} />
          ))}
        </div>
      );
    case 'compare-card': return <CompareCardLight items={(block.data as any).items} delay={delay} />;
    case 'data-preview': return <DataPreviewCardLight {...(block.data as any)} delay={delay} />;
    case 'quote-box': return <QuoteBox {...(block.data as any)} delay={delay} />;
    case 'insight-box': return <InsightBox {...(block.data as any)} delay={delay} />;
    case 'divider': return <Divider style={(block.data as any)?.style} />;
    case 'action-bar': return <ActionBar />;
    case 'section': {
      const sectionData = block.data;
      if (typeof sectionData === 'string') {
        return <Section title={sectionData} delay={delay} />;
      }
      return <Section {...(sectionData as any)} delay={delay} />;
    }
    case 'region-cards': return <RegionCards items={block.data as any} delay={delay} />;
    case 'metrics-preview': return <MetricsPreviewCard {...(block.data as any)} delay={delay} />;
    case 'analyst-quote': return <AnalystQuote {...(block.data as any)} delay={delay} />;
    case 'report-hero': return <ReportHeroCard {...(block.data as any)} delay={delay} />;
    case 'report-layer': return <ReportLayerCard {...(block.data as any)} delay={delay} />;
    case 'callout-card': return <CalloutCard {...(block.data as any)} delay={delay} />;
    case 'strategy-card': return <StrategyCard {...(block.data as any)} delay={delay} />;
    
    case 'visualizer': 
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay }}
        >
          <DataVisualizer 
            conditions={block.data as FilterCondition[]} 
            onFilterApply={onFilterApply}
          />
        </motion.div>
      );
    
    case 'action-buttons':
      return <ActionButtonGroup buttons={block.data as any} onSelect={onActionSelect!} delay={delay} />;

    default: return null;
  }
};

const SystemBubble = ({ 
  content, 
  status, 
  onActionSelect,
  onFilterApply,
  onAgentSwitch,
  agentId,
  isSearching,
}: { 
  content: ContentBlock[]; 
  status?: string; 
  onActionSelect?: (query: string) => void;
  onFilterApply?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  agentId?: string;
  isSearching?: boolean;
}) => {
  const handleFilterApply = useCallback((conditions: FilterCondition[], changedType?: string, changedValue?: string) => {
    onFilterApply?.(conditions, changedType, changedValue);
  }, [onFilterApply]);

  const agent = getAgentById(agentId);
  const contentKey = content.map(b => b.id).join('-');

  // 流式输出时显示带内容的加载状态
  const isStreaming = status === 'streaming';
  const hasContent = content.some(b => b.data && (typeof b.data === 'string' ? b.data.length > 0 : true));

  // 如果是流式输出但还没有内容，显示加载动画（支持搜索提示）
  if (isStreaming && !hasContent) {
    return <LoadingIndicator isSearching={isSearching} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-6"
    >
      {/* Agent 信息栏 - 蓝色主题 */}
      <div className="flex items-center gap-3 mb-3">
        {agent.avatar ? (
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="agent-avatar">
            {agent.name.slice(0, 1)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="agent-name">{agent.name}</span>
          <span className="agent-title">{agent.title}</span>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-pulse" />
            <span className="text-[11px] text-[#86868b]">输出中</span>
          </div>
        )}
      </div>

      {/* 内容卡片 - 蓝白简约风格 */}
      <div 
        key={contentKey}
        className="message-system ml-12"
      >
        <div className="space-y-0">
          {content.map((block, index) => {
            // 检查上一个和下一个 block 的类型
            const prevBlock = content[index - 1];
            const nextBlock = content[index + 1];
            
            // 图表类型列表
            const chartTypes = ['chart', 'table', 'kpi', 'kpi-group', 'gantt', 'line-chart', 'bar-chart', 'pie-chart', 'scatter-chart', 'funnel-chart', 'box-plot', 'map-chart', 'quadrant-chart'];
            const isChartType = (type: string) => chartTypes.includes(type);
            
            // 判断是否是文本后接图表，或图表后接文本
            const isTextFollowedByChart = block.type === 'text' && nextBlock && isChartType(nextBlock.type);
            const isChartAfterText = isChartType(block.type) && prevBlock?.type === 'text';
            const isChartFollowedByText = isChartType(block.type) && nextBlock?.type === 'text';
            
            // 文本和图表紧密结合，减少间距实现整合展示
            let spacingClass = '';
            if (isTextFollowedByChart) {
              spacingClass = 'mb-2'; // 文本后接图表，小间距
            } else if (isChartAfterText) {
              spacingClass = 'mt-2'; // 图表紧跟文本，小间距
            } else if (isChartFollowedByText) {
              spacingClass = 'mb-3'; // 图表后接文本，适当间距
            } else if (block.type === 'text' && prevBlock?.type === 'text') {
              spacingClass = 'mt-2'; // 连续文本之间需要小间距
            } else if (isChartType(block.type) && prevBlock && isChartType(prevBlock.type)) {
              spacingClass = 'mt-4'; // 图表之间适当间距
            } else if (block.type === 'text' && !prevBlock) {
              spacingClass = ''; // 第一个文本块无上间距
            } else if (block.type === 'text' && prevBlock && isChartType(prevBlock.type)) {
              spacingClass = 'mt-3'; // 文本在图表后，适当间距
            } else {
              spacingClass = 'mt-3'; // 其他情况保持间距
            }
            
            return (
              <div key={block.id} className={spacingClass}>
                <ContentBlockRenderer 
                  block={block} 
                  index={index}
                  onActionSelect={onActionSelect}
                  onFilterApply={handleFilterApply}
                  onAgentSwitch={onAgentSwitch}
                  isStreaming={isStreaming}
                />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export const MessageBubble = ({ message, onActionSelect, onFilterChange, onAgentSwitch, isSearching = false }: MessageBubbleProps) => {
  if (message.role === 'user') {
    return <UserBubble content={message.content as string} />;
  }
  return (
    <SystemBubble 
      content={message.content as ContentBlock[]} 
      status={message.status} 
      onActionSelect={onActionSelect}
      onFilterApply={onFilterChange}
      onAgentSwitch={onAgentSwitch}
      agentId={message.agentId}
      isSearching={isSearching}
    />
  );
};

export default MessageBubble;
