import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, AgentProfile } from './types';
import type { BusinessScenario } from './types/workflow';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TestScenarioPanel } from './components/TestScenarioPanel';
import { ScenarioPanel } from './components/ScenarioPanel';
import { MobileTestPage } from './pages/MobileTestPage';
import { GestureControlPage } from './pages/GestureControlPage';
import { 
  createUserMessage,
  generateNarrativeResponse,
  createSystemMessage,
  hasMatchedScenario,
} from './services/narrativeGenerator';
import { extractQueryTrigger } from './components/InteractiveComponents';
import { RefreshCw, Smartphone, Workflow } from 'lucide-react';
import { AGENTS, getAgentById, getAgentByName } from './services/agents';
import { detectAgentSwitch } from './services/agentSwitchDetector';
import { chatCompletionStream, ChatMessage } from './services/deepseekApi';
import { getScenarioById } from './services/businessScenarios';
import { shouldEnableWebSearch } from './services/webSearchDetector';
import { parseRealtimeContent } from './utils/realtimeParser';
import { loadUserMemory, learnFromQuery, generateMemoryPrompt, getRecommendedQuestions, UserMemory } from './services/userMemory';

// 上下文管理
interface ConversationContext {
  lastTopic?: string;
  lastMetric?: string;
  lastDimension?: string;
  drillPath: string[];
}

// 蓝白风格欢迎屏幕 - Apple 风格
const WelcomeScreen = ({ 
  onQuestionSelect,
  agent,
  userMemory,
}: { 
  onQuestionSelect: (q: string) => void;
  agent: AgentProfile;
  userMemory?: UserMemory;
}) => {
  // 根据用户记忆生成个性化推荐
  const recommendedQuestions = userMemory ? getRecommendedQuestions(userMemory) : [];
  const hasMemory = userMemory && (userMemory.focusMetrics.length > 0 || userMemory.frequentQueries.length > 0);
  
  const suggestedQuestions = hasMemory && recommendedQuestions.length > 0
    ? recommendedQuestions.map(q => ({ label: q, query: q }))
    : agent.suggestedQuestions || [
        { label: '今年销售额是多少', query: '今年销售额是多少' },
        { label: '近3个月销售趋势', query: '近3个月销售额趋势' },
        { label: '分析销售下降原因', query: '为什么11月销售额下降了' },
      ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* 头像 - 蓝色渐变背景 */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          {agent.avatar ? (
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="w-28 h-28 mx-auto rounded-full object-cover shadow-[0_8px_30px_rgba(0,122,255,0.15)]"
            />
          ) : (
            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white text-3xl font-semibold shadow-[0_8px_30px_rgba(0,122,255,0.25)]">
              {agent.name.slice(0, 1)}
            </div>
          )}
        </motion.div>

        {/* 名称 */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-[2rem] font-semibold text-[#1d1d1f] tracking-tight mb-1"
        >
          {agent.name}
        </motion.h1>

        {/* 职位 - 蓝色 */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-base text-[#007AFF] mb-10"
        >
          {agent.title}
        </motion.p>

        {/* 分隔提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[13px] text-[#86868b] mb-5"
        >
          {hasMemory ? '根据您的偏好推荐' : '试试这样问我'}
        </motion.p>

        {/* 快捷提问 - 蓝色悬停按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto"
        >
          {suggestedQuestions.map((q, index) => (
            <motion.button
              key={q.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.06, duration: 0.4 }}
              onClick={() => onQuestionSelect(q.query)}
              className="px-5 py-2.5 text-[14px] font-normal text-[#1d1d1f] bg-white rounded-full border border-[#d2d2d7] hover:border-[#007AFF] hover:text-[#007AFF] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {q.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

function App() {
  // 所有 hooks 必须在任何条件 return 之前声明
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // 是否正在联网搜索
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [testPanelOpen, setTestPanelOpen] = useState(true);
  const [context, setContext] = useState<ConversationContext>({ drillPath: [] });
  const [userMemory, setUserMemory] = useState<UserMemory>(() => loadUserMemory());
  const abortControllerRef = useRef<AbortController | null>(null);
  // 业务场景相关状态
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false);
  const [, setActiveScenario] = useState<BusinessScenario | null>(null);
  const [currentPage] = useState<'main' | 'mobile' | 'gesture'>(() => {
    // 初始化时检查URL参数
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'mobile') return 'mobile';
    if (page === 'gesture') return 'gesture';
    return 'main';
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string>(AGENTS[0].id);
  const currentAgent = getAgentById(currentAgentId);

  // 切换 Agent - 新员工主动打招呼
  const handleAgentChange = async (newAgentId: string) => {
    if (newAgentId !== currentAgentId) {
      const newAgent = getAgentById(newAgentId);
      setCurrentAgentId(newAgentId);
      
      // 新员工主动打招呼
      const greetingMessageId = `msg_${Date.now()}_greeting`;
      const greetingBlockId = `block_greeting`;
      const greetingMessage: Message = {
        id: greetingMessageId,
        role: 'assistant',
        content: [{
          id: greetingBlockId,
          type: 'text',
          data: '',
        }],
        timestamp: new Date(),
        agentId: newAgentId,
        status: 'streaming',
      };
      setMessages(prev => [...prev, greetingMessage]);

      // 调用 DeepSeek 生成个性化招呼
      const greetingPrompt = `用户刚叫你过来帮忙。请用你独特的性格和说话方式打个招呼（2-3句话），要有温度、有个性，让用户感受到你的专业和热情。

要求：
1. 展现你的性格特点（可以傲娇/热情/温柔/幽默等）
2. 简单说明你能帮什么忙
3. 主动问问用户需要什么帮助
4. 不要使用emoji
5. 不要太正式，像朋友聊天一样`;
      
      let greetingContent = '';
      await chatCompletionStream(
        [{ role: 'user', content: greetingPrompt }],
        newAgentId,
        newAgent.name,
        newAgent.title,
        (chunk: string) => {
          greetingContent += chunk;
          setMessages(prev => prev.map(m => 
            m.id === greetingMessageId 
              ? { ...m, content: [{ id: greetingBlockId, type: 'text' as const, data: greetingContent }] }
              : m
          ));
        },
        () => {
          setMessages(prev => prev.map(m => 
            m.id === greetingMessageId ? { ...m, status: 'complete' as const } : m
          ));
        },
        () => {
          // 错误时使用默认招呼
          setMessages(prev => prev.map(m => 
            m.id === greetingMessageId 
              ? { ...m, content: [{ id: greetingBlockId, type: 'text' as const, data: `你好，我是${newAgent.name}，${newAgent.title}。有什么可以帮你的？` }], status: 'complete' as const }
              : m
          ));
        }
      );
    }
  };

  // 通过名字切换 Agent（用于同事推荐）
  const handleAgentSwitchByName = async (agentName: string) => {
    const agent = getAgentByName(agentName);
    if (agent && agent.id !== currentAgentId) {
      await handleAgentChange(agent.id);
    }
  };

  // 滚动到底部（仅在用户发送消息时调用）
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 停止输出
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    
    // 标记当前正在输出的消息为完成状态
    setMessages(prev => prev.map(m => 
      m.status === 'streaming' ? { ...m, status: 'complete' as const } : m
    ));
  };

  // 构建对话历史（用于多轮对话，包含跨员工记忆）
  const buildChatHistory = (currentMessages: Message[]): ChatMessage[] => {
    return currentMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-15) // 保留最近15条消息作为上下文
      .map(m => {
        let content = typeof m.content === 'string' 
          ? m.content 
          : m.content?.map(b => (b.data as string) || '').join('\n') || '';
        
        // 清理可能暴露AI身份的内容，保持角色一致性
        content = content
          .replace(/我是DeepSeek/gi, `我是${currentAgent.name}`)
          .replace(/我是AI助手/gi, `我是${currentAgent.name}`)
          .replace(/由深度求索公司创造/gi, '')
          .replace(/我是一个AI/gi, `我是${currentAgent.name}`)
          .replace(/我是语言模型/gi, `我是${currentAgent.name}`)
          .replace(/作为AI/gi, `作为${currentAgent.name}`)
          .replace(/作为AI助手/gi, `作为${currentAgent.name}`);
        
        // 如果是其他员工的回复，标注是谁说的
        if (m.role === 'assistant' && m.agentId && m.agentId !== currentAgentId) {
          const otherAgent = getAgentById(m.agentId);
          return {
            role: 'assistant' as const,
            content: `[${otherAgent.name}说]: ${content}`
          };
        }
        
        return {
          role: m.role as 'user' | 'assistant',
          content
        };
      });
  };

  // 检测是否是工作流/场景调用意图
  const isWorkflowIntent = (text: string): boolean => {
    const workflowKeywords = [
      '调用工作流', '启动工作流', '运行工作流', '执行工作流',
      '启动场景', '运行场景', '执行场景', '打开场景',
      '业务场景', '场景分析', '协作分析', '多Agent',
      '让多个员工', '协同工作', '自动化分析'
    ];
    return workflowKeywords.some(keyword => text.includes(keyword));
  };

  // 🔥 增强版：检测切换 Agent 的意图 - 使用强大的意图识别引擎
  const detectAgentSwitchIntent = (text: string): { 
    agentId: string | null; 
    confidence: number;
    reason: string;
    matchType: string | null;
  } => {
    const result = detectAgentSwitch(text, currentAgentId);
    
    // 调试日志
    console.log('🎯 Agent切换意图识别:', {
      query: text,
      shouldSwitch: result.shouldSwitch,
      targetAgent: result.targetAgent?.name,
      confidence: result.confidence,
      matchType: result.matchType,
      reason: result.reason,
    });
    
    if (result.shouldSwitch && result.confidence > 0.5) {
      return {
        agentId: result.targetAgentId,
        confidence: result.confidence,
        reason: result.reason,
        matchType: result.matchType,
      };
    }
    
    return {
      agentId: null,
      confidence: 0,
      reason: result.reason,
      matchType: null,
    };
  };

  // 处理发送消息
  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;

    // 🔥 优先检测切换 Agent 意图（使用增强版意图识别引擎）
    const switchResult = detectAgentSwitchIntent(query);
    if (switchResult.agentId && switchResult.agentId !== currentAgentId) {
      // 添加用户消息
      const userMessage = createUserMessage(query, currentAgentId);
      setMessages((prev) => [...prev, userMessage]);
      
      // 高置信度直接切换
      if (switchResult.confidence > 0.7) {
        await handleAgentChange(switchResult.agentId);
        return;
      }
      
      // 中等置信度：显示确认消息后切换
      if (switchResult.confidence > 0.5) {
        const targetAgent = getAgentById(switchResult.agentId);
        const confirmMessage: Message = {
          id: `msg_${Date.now()}_confirm`,
          role: 'assistant',
          content: [{
            id: `block_confirm`,
            type: 'text',
            data: `好的，我帮你找 **${targetAgent.name}**（${targetAgent.title}）来帮忙~`,
          }],
          timestamp: new Date(),
          agentId: currentAgentId,
          status: 'complete',
        };
        setMessages((prev) => [...prev, confirmMessage]);
        
        // 延迟后切换
        setTimeout(async () => {
          await handleAgentChange(switchResult.agentId!);
        }, 500);
        return;
      }
    }

    // 检测工作流调用意图
    if (isWorkflowIntent(query)) {
      const userMessage = createUserMessage(query, currentAgentId);
      setMessages((prev) => [...prev, userMessage]);
      
      // 添加引导消息
      setTimeout(() => {
        const guideMessage: Message = {
          id: `msg_${Date.now()}_workflow`,
          role: 'assistant',
          content: [
            {
              id: `block_${Date.now()}_text`,
              type: 'text',
              data: '好的，我来帮你启动业务场景工作流。\n\n业务场景可以让多个数字员工协作完成复杂的分析任务。请选择你需要的场景：',
            },
            {
              id: `block_${Date.now()}_actions`,
              type: 'action-buttons',
              data: [
                { id: 'scenario_sales', label: '销售概览分析', query: '@@OPEN_SCENARIO@@sales_overview' },
                { id: 'scenario_anomaly', label: '异常诊断分析', query: '@@OPEN_SCENARIO@@anomaly_diagnosis' },
                { id: 'scenario_user', label: '用户行为分析', query: '@@OPEN_SCENARIO@@user_analysis' },
                { id: 'scenario_forecast', label: '销售预测规划', query: '@@OPEN_SCENARIO@@forecast_planning' },
                { id: 'scenario_all', label: '查看全部场景', query: '@@OPEN_SCENARIO_PANEL@@' },
              ],
            },
          ],
          timestamp: new Date(),
          agentId: currentAgentId,
        };
        setMessages((prev) => [...prev, guideMessage]);
      }, 300);
      return;
    }

    // 处理场景快捷入口 - 直接在对话中执行
    if (query.startsWith('@@OPEN_SCENARIO@@')) {
      const scenarioId = query.replace('@@OPEN_SCENARIO@@', 'scenario_');
      const scenario = getScenarioById(scenarioId);
      if (scenario) {
        handleScenarioStart(scenario);
      }
      return;
    }

    if (query === '@@OPEN_SCENARIO_PANEL@@') {
      // 在对话中显示所有场景列表
      const allScenariosMessage: Message = {
        id: `msg_${Date.now()}_scenarios`,
        role: 'assistant',
        content: [
          {
            id: `block_${Date.now()}_title`,
            type: 'heading',
            data: '全部业务场景',
          },
          {
            id: `block_${Date.now()}_text`,
            type: 'text',
            data: '以下是所有可用的业务场景，点击即可启动：',
          },
          {
            id: `block_${Date.now()}_actions`,
            type: 'action-buttons',
            data: [
              { id: 's1', label: '销售概览分析', query: '@@OPEN_SCENARIO@@sales_overview' },
              { id: 's2', label: '异常诊断分析', query: '@@OPEN_SCENARIO@@anomaly_diagnosis' },
              { id: 's3', label: '用户行为分析', query: '@@OPEN_SCENARIO@@user_analysis' },
              { id: 's4', label: '销售预测规划', query: '@@OPEN_SCENARIO@@forecast_planning' },
              { id: 's5', label: '运营实时监控', query: '@@OPEN_SCENARIO@@operation_monitor' },
              { id: 's6', label: '财务报表分析', query: '@@OPEN_SCENARIO@@financial_report' },
            ],
          },
        ],
        timestamp: new Date(),
        agentId: currentAgentId,
      };
      setMessages(prev => [...prev, allScenariosMessage]);
      return;
    }

    const userMessage = createUserMessage(query, currentAgentId);
    setMessages((prev) => [...prev, userMessage]);
    
    // 用户发送消息后滚动到底部
    setTimeout(() => scrollToBottom(), 100);

    // 学习用户偏好
    const updatedMemory = learnFromQuery(userMemory, query);
    setUserMemory(updatedMemory);

    setIsLoading(true);

    // 【重要】所有用户问题都必须先经过大模型理解，不再直接触发预设场景
    // 预设场景仅作为大模型回复中的 [query:...] 触发时使用
    // if (hasMatchedScenario(query)) {
    //   await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    //   const presetResponse = generateNarrativeResponse(query);
    //   const systemMessage = createSystemMessage(presetResponse, currentAgentId);
    //   setMessages((prev) => [...prev, systemMessage]);
    //   updateContext(query);
    //   setIsLoading(false);
    //   return;
    // }

    // 【已禁用】不再自动触发工作流，所有问题都先经过大模型理解
    // const workflowExecuted = await detectAndExecuteWorkflow(query);
    // if (workflowExecuted) {
    //   setIsLoading(false);
    //   return;
    // }

    // 所有问题都经过 AI 理解和回答
    const assistantMessageId = `msg_${Date.now()}_assistant`;
    const blockId = `block_${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: [{
        id: blockId,
        type: 'text',
        data: '',
      }],
      timestamp: new Date(),
      agentId: currentAgentId,
      status: 'streaming',
    };
    
    setMessages((prev) => [...prev, assistantMessage]);

    // 构建对话历史
    const chatHistory = buildChatHistory(messages);
    chatHistory.push({ role: 'user', content: query });

    // 流式调用 DeepSeek API（带用户记忆）
    let fullContent = '';
    const memoryPrompt = generateMemoryPrompt(updatedMemory);
    
    // 创建 AbortController 用于停止输出
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    
    // 根据用户查询意图判断是否需要联网搜索
    const enableWebSearch = shouldEnableWebSearch(query);
    
    // 如果启用联网搜索，显示搜索提示
    if (enableWebSearch) {
      setIsSearching(true);
    }
    
    await chatCompletionStream(
      chatHistory,
      currentAgentId,
      currentAgent.name,
      currentAgent.title,
      // onChunk - 每收到一个 chunk 立即更新消息（优化响应速度）
      (chunk: string) => {
        fullContent += chunk;
        
        // 使用节流：每100ms或每10个chunk才更新一次UI，减少渲染频率
        const shouldUpdate = fullContent.length % 50 === 0 || chunk.length > 20;
        
        if (!shouldUpdate && fullContent.length < 200) {
          // 内容还很少时，直接更新文本，不做复杂解析
          setMessages((prev) => 
            prev.map(m => 
              m.id === assistantMessageId 
                ? {
                    ...m,
                    content: [{
                      id: blockId,
                      type: 'text' as const,
                      data: fullContent,
                    }],
                  }
                : m
            )
          );
          return;
        }
        
        // 快速清理（减少处理时间）- 使用更高效的正则
        const cleanedContent = fullContent
          .replace(/\[([^\]]+?)说\]:\s*/g, '')
          .replace(/\[([^\]]+?)说\]/g, '')
          .replace(/我是(DeepSeek|AI助手|语言模型)/gi, `我是${currentAgent.name}`)
          .replace(/由深度求索公司创造/gi, '')
          .replace(/作为AI(助手)?/gi, `作为${currentAgent.name}`)
          .replace(/纯文本模型/gi, '')
          .replace(/AI助手/gi, currentAgent.name);
        
        // 实时解析图表和表格
        const parsed = parseRealtimeContent(cleanedContent);
        const contentBlocks: any[] = [];
        
        // 简化处理：直接使用 parsed.blocks
        if (parsed.blocks && parsed.blocks.length > 0) {
          // 使用 Set 去重，基于内容哈希
          const seenHashes = new Set<string>();
          
          parsed.blocks.forEach((block, index) => {
            // 生成内容哈希用于去重
            const contentHash = block.type === 'text' 
              ? `text_${((block as any).text || '').substring(0, 50)}`
              : `${block.type}_${JSON.stringify(block.data).substring(0, 100)}`;
            
            if (seenHashes.has(contentHash)) return;
            seenHashes.add(contentHash);
            
            if (block.type === 'text') {
              const textContent = (block as any).text || '';
              if (textContent.trim()) {
                contentBlocks.push({
                  id: `${blockId}_text_${index}`,
                  type: 'text',
                  data: textContent,
                });
              }
            } else if (block.type === 'chart' && block.data?.data?.length > 0) {
              contentBlocks.push({
                id: `${blockId}_chart_${index}`,
                type: 'chart',
                data: block.data,
              });
            } else if (block.type === 'table' && block.data?.headers && block.data?.rows?.length > 0) {
              contentBlocks.push({
                id: `${blockId}_table_${index}`,
                type: 'table',
                data: block.data,
              });
            } else if (block.type === 'kpi' && block.data?.label) {
              contentBlocks.push({
                id: `${blockId}_kpi_${index}`,
                type: 'kpi',
                data: block.data,
              });
            } else if (block.type === 'gantt' && block.data?.data?.length > 0) {
              contentBlocks.push({
                id: `${blockId}_gantt_${index}`,
                type: 'gantt',
                data: block.data,
              });
            }
          });
        }
        
        // 如果没有解析到块，使用纯文本
        if (contentBlocks.length === 0 && cleanedContent.trim()) {
          contentBlocks.push({
            id: `${blockId}_text`,
            type: 'text',
            data: cleanedContent,
          });
        }
        
        // 立即更新消息（减少延迟）
        setMessages((prev) => 
          prev.map(m => 
            m.id === assistantMessageId 
              ? {
                  ...m,
                  content: contentBlocks.length > 0 ? contentBlocks : [{
                    id: blockId,
                    type: 'text' as const,
                    data: cleanedContent,
                  }],
                }
              : m
          )
        );
      },
      // onComplete - 保持流式输出的内容顺序，只更新状态
      () => {
        setIsStreaming(false);
        setIsSearching(false);
        abortControllerRef.current = null;
        
        // 只更新消息状态为完成，不重新解析内容（保持流式输出时的顺序）
        setMessages((prev) => 
          prev.map(m => 
            m.id === assistantMessageId 
              ? { ...m, status: 'complete' as const }
              : m
          )
        );
        
        // 【已禁用】不再自动触发预设场景，让大模型完全自主理解和回复
        // const queryTrigger = extractQueryTrigger(fullContent);
        // if (queryTrigger && hasMatchedScenario(queryTrigger)) {
        //   const visualResponse = generateNarrativeResponse(queryTrigger);
        //   const visualMessage = createSystemMessage(visualResponse, currentAgentId);
        //   setMessages((prev) => [...prev, visualMessage]);
        // }
        
        updateContext(query);
        setIsLoading(false);
      },
      // onError
      (error: Error) => {
        setIsStreaming(false);
        setIsSearching(false); // 搜索失败，关闭搜索提示
        abortControllerRef.current = null;
        
        console.error('DeepSeek API Error:', error);
        setMessages((prev) => 
          prev.map(m => 
            m.id === assistantMessageId 
              ? {
                  ...m,
                  status: 'error' as const,
                  content: [{
                    id: blockId,
                    type: 'text' as const,
                    data: `抱歉，出现了错误：${error.message}`,
                  }],
                }
              : m
          )
        );
        setIsLoading(false);
      },
      memoryPrompt,  // 传入用户记忆
      enableWebSearch  // 传入联网搜索开关
    );
  };

  // 更新上下文
  const updateContext = (query: string) => {
    const newContext = { ...context };
    if (query.includes('销售额')) newContext.lastMetric = 'sales';
    if (query.includes('订单')) newContext.lastMetric = 'orders';
    if (query.includes('地区') || query.includes('华东')) newContext.lastDimension = 'region';
    if (query.includes('渠道')) newContext.lastDimension = 'channel';
    if (query.includes('详细') || query.includes('下钻') || query.includes('展开')) {
      newContext.drillPath.push(query);
    }
    setContext(newContext);
  };

  // 处理追问按钮点击
  const handleActionSelect = (query: string) => {
    handleSend(query);
  };

  // 新对话
  const handleNewChat = () => {
    setMessages([]);
    setContext({ drillPath: [] });
  };

  // 智能识别业务场景并执行工作流
  const detectAndExecuteWorkflow = async (userQuery: string): Promise<boolean> => {
    // 场景关键词映射
    const scenarioKeywords: Record<string, string[]> = {
      'scenario_sales_overview': ['销售', '营收', '业绩', '收入', 'GMV', '销量', '卖了多少'],
      'scenario_anomaly_diagnosis': ['异常', '下降', '问题', '为什么', '怎么回事', '出了什么', '不正常'],
      'scenario_user_analysis': ['用户', '留存', '活跃', '日活', '月活', 'DAU', 'MAU', '转化'],
      'scenario_forecast_planning': ['预测', '预估', '未来', '下个月', '下季度', '趋势', '会怎样'],
    };

    // 检测用户意图
    let matchedScenarioId: string | null = null;
    let maxMatches = 0;
    
    for (const [scenarioId, keywords] of Object.entries(scenarioKeywords)) {
      const matches = keywords.filter(kw => userQuery.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedScenarioId = scenarioId;
      }
    }

    // 如果匹配到场景且匹配度足够高，自动执行工作流
    if (matchedScenarioId && maxMatches >= 1) {
      const scenario = getScenarioById(matchedScenarioId);
      if (scenario) {
        await executeIntelligentWorkflow(scenario, userQuery);
        return true;
      }
    }
    return false;
  };

  // 执行智能工作流 - 多 Agent 协作会议模式
  const executeIntelligentWorkflow = async (scenario: BusinessScenario, userQuery: string) => {
    setActiveScenario(scenario);
    
    // 获取参与的 Agent 列表
    const participantAgents = scenario.requiredAgents.map(ra => getAgentById(ra.agentId));
    const leadAgent = participantAgents[0];
    
    // Agent 角色分配
    const agentRoles: Record<string, string> = {
      'alisa': '会议主席，负责协调流程和总结',
      'nora': '业务分析师，负责语义解读和洞察',
      'metrics-pro': '数据分析师，负责指标计算和数据呈现',
      'attributor': '归因专家，负责问题定位和根因分析',
      'predictor': '预测分析师，负责趋势预测和建议',
      'viz-master': '可视化专家，负责图表呈现',
      'growth-hacker': '增长分析师，负责增长策略',
      'report-lisa': '报表专家，负责数据汇总',
    };

    // 1. 会议开场 - 主持人介绍
    const openingMessageId = `msg_${Date.now()}_opening`;
    const openingBlockId = `block_opening`;
    const openingMessage: Message = {
      id: openingMessageId,
      role: 'assistant',
      content: [{
        id: openingBlockId,
        type: 'text',
        data: '',
      }],
      timestamp: new Date(),
      agentId: leadAgent.id,
      status: 'streaming',
    };
    setMessages(prev => [...prev, openingMessage]);

    const openingPrompt = `你是${leadAgent.name}，作为本次「${scenario.name}」分析会议的主持人。

用户问题：「${userQuery}」

请用专业但亲切的语气开场（约80字）：
1. 简要说明会议目标
2. 介绍参会的团队成员及其角色：${participantAgents.map(a => `${a.name}(${agentRoles[a.id] || a.title})`).join('、')}
3. 宣布会议开始

不要使用emoji，用**加粗**标注重点。`;

    let openingContent = '';
    await chatCompletionStream(
      [{ role: 'user', content: openingPrompt }],
      leadAgent.id, leadAgent.name, leadAgent.title,
      (chunk) => {
        openingContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === openingMessageId 
            ? { ...m, content: [{ id: openingBlockId, type: 'text' as const, data: openingContent }] }
            : m
        ));
      },
      () => setMessages(prev => prev.map(m => m.id === openingMessageId ? { ...m, status: 'complete' as const } : m)),
      () => {}
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. 数据呈现 - 展示可视化图表
    const visualQueries: Record<string, string[]> = {
      'scenario_sales_overview': ['今年销售额是多少', '近3个月销售额趋势'],
      'scenario_anomaly_diagnosis': ['为什么11月销售额下降了'],
      'scenario_user_analysis': ['日活还有月活数据', '各渠道转化率哪个最好'],
      'scenario_forecast_planning': ['预测下月销售额'],
      'scenario_operation_monitor': ['本月订单量有多少'],
      'scenario_financial_report': ['看一下营收以及利润'],
    };

    const queries = visualQueries[scenario.id] || ['今年销售额是多少'];
    for (const query of queries) {
      if (hasMatchedScenario(query)) {
        const visualResponse = generateNarrativeResponse(query);
        const dataAgent = participantAgents.find(a => a.id === 'metrics-pro' || a.id === 'viz-master') || participantAgents[1] || leadAgent;
        const visualMessage = createSystemMessage(visualResponse, dataAgent.id);
        setMessages(prev => [...prev, visualMessage]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // 3. 各 Agent 依次发言分析
    for (let i = 1; i < Math.min(participantAgents.length, 3); i++) {
      const agent = participantAgents[i];
      const role = agentRoles[agent.id] || agent.title;
      
      const agentMessageId = `msg_${Date.now()}_agent_${i}`;
      const agentBlockId = `block_agent_${i}`;
      const agentMessage: Message = {
        id: agentMessageId,
        role: 'assistant',
        content: [{ id: agentBlockId, type: 'text', data: '' }],
        timestamp: new Date(),
        agentId: agent.id,
        status: 'streaming',
      };
      setMessages(prev => [...prev, agentMessage]);

      const agentPrompt = `你是${agent.name}，${role}。

在「${scenario.name}」分析会议中，针对用户问题「${userQuery}」，请从你的专业角度给出分析（约150字）：

1. 你的专业观点和发现（包含具体数据）
2. 你注意到的关键问题或机会
3. 你的建议

请用专业的语气，像在会议中发言一样自然。用**加粗**标注关键数据和结论。不要使用emoji。`;

      let agentContent = '';
      await chatCompletionStream(
        [{ role: 'user', content: agentPrompt }],
        agent.id, agent.name, agent.title,
        (chunk) => {
          agentContent += chunk;
          setMessages(prev => prev.map(m => 
            m.id === agentMessageId 
              ? { ...m, content: [{ id: agentBlockId, type: 'text' as const, data: agentContent }] }
              : m
          ));
        },
        () => setMessages(prev => prev.map(m => m.id === agentMessageId ? { ...m, status: 'complete' as const } : m)),
        () => {}
      );

      await new Promise(resolve => setTimeout(resolve, 400));
    }

    // 4. 会议总结 - 主持人总结
    const summaryMessageId = `msg_${Date.now()}_summary`;
    const summaryBlockId = `block_summary`;
    const summaryMessage: Message = {
      id: summaryMessageId,
      role: 'assistant',
      content: [{ id: summaryBlockId, type: 'text', data: '' }],
      timestamp: new Date(),
      agentId: leadAgent.id,
      status: 'streaming',
    };
    setMessages(prev => [...prev, summaryMessage]);

    const summaryPrompt = `你是${leadAgent.name}，作为会议主持人，请总结本次「${scenario.name}」分析会议（约200字）：

用户原始问题：「${userQuery}」

请包含：
1. **核心结论**：本次分析的主要发现（2-3点，包含具体数据）
2. **行动建议**：基于分析结果的具体可执行建议（2-3条）
3. **后续跟进**：建议用户可以继续深入了解的方向

用专业简洁的语气总结，用**加粗**标注重点。不要使用emoji。`;

    let summaryContent = '';
    await chatCompletionStream(
      [{ role: 'user', content: summaryPrompt }],
      leadAgent.id, leadAgent.name, leadAgent.title,
      (chunk) => {
        summaryContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === summaryMessageId 
            ? { ...m, content: [{ id: summaryBlockId, type: 'text' as const, data: summaryContent }] }
            : m
        ));
      },
      () => setMessages(prev => prev.map(m => m.id === summaryMessageId ? { ...m, status: 'complete' as const } : m)),
      () => {}
    );
  };

  // 启动业务场景（手动触发）
  const handleScenarioStart = async (scenario: BusinessScenario) => {
    setScenarioPanelOpen(false);
    await executeIntelligentWorkflow(scenario, scenario.keyQuestions[0] || scenario.name);
  };


  // 筛选条件到查询的映射表
  const FILTER_QUERY_MAP: Record<string, Record<string, string>> = {
    // 数据源映射
    datasource: {
      '销售流水': '今年销售额是多少',
      '订单表': '本月订单量有多少',
      '用户表': '日活还有月活数据',
      '库存表': '当前库存数值',
      '财务流水': '看一下营收以及利润',
      '门店销售': '各门店业绩排名',
      '用户行为表': '日活还有月活数据',
      '产品表': '分产品线看销量',
    },
    // 分组方式映射
    groupby: {
      '产品 分组': '分产品线看销量',
      '时间 按日': '最近一周订单量波动',
      '时间 按周': '最近一周订单量波动',
      '时间 按月': '近3个月销售额趋势',
      '渠道 分组': '销售渠道占比分析',
      '地区 分组': '各地区销售额对比',
      '品类 分组': '各品类销售额构成',
      '城市 下钻': '详细看看华东区数据',
      '门店 排名': '各门店业绩排名',
      '季度 分组': '看一下营收以及利润',
      '年份 同比': '对比去年和今年营收',
    },
    // 日期范围映射
    date: {
      '今天': '本月订单量有多少',
      '昨天': '昨天订单量是不是有问题',
      '本周': '最近一周订单量波动',
      '本月': '本月订单量有多少',
      '上月': '本月销售额比上月如何',
      '近7天': '最近一周订单量波动',
      '近30天': '近3个月销售额趋势',
      '近3个月': '近3个月销售额趋势',
      '2024年': '今年销售额是多少',
      '2023年': '对比去年和今年营收',
      'Q1': '看一下营收以及利润',
      'Q2': '看一下营收以及利润',
      'Q3': 'Q3销售额同比增长情况',
      'Q4': '看一下营收以及利润',
    },
    // 筛选条件映射（地区、状态等）
    filter: {
      '华东': '详细看看华东区数据',
      '华南': '各地区销售额对比',
      '华北': '各地区销售额对比',
      '线上': '销售渠道占比分析',
      '线下': '销售渠道占比分析',
      '已完成': '本月订单量有多少',
      '不为空': '今年销售额是多少',
      '包含': '今年销售额是多少',
      '等于': '今年销售额是多少',
      '为空': '找出异常交易数据',
      '活跃': '日活还有月活数据',
    },
  };

  // 处理筛选条件变化 - 就地更新当前消息的数据
  const handleFilterChange = (messageId: string, conditions: any[], changedType?: string, changedValue?: string) => {
    let query = '';
    
    // 以被更改的条件类型为准来决定查询
    if (changedType && changedValue) {
      const typeMap = FILTER_QUERY_MAP[changedType as keyof typeof FILTER_QUERY_MAP];
      if (typeMap && typeMap[changedValue]) {
        query = typeMap[changedValue];
      }
    }
    
    // 如果没有匹配到，使用默认优先级
    if (!query) {
      const datasource = conditions.find(c => c.type === 'datasource')?.value || '';
      const date = conditions.find(c => c.type === 'date')?.value || '';
      const groupby = conditions.find(c => c.type === 'groupby')?.value || '';
      
      if (groupby && FILTER_QUERY_MAP.groupby[groupby]) {
        query = FILTER_QUERY_MAP.groupby[groupby];
      } else if (date && FILTER_QUERY_MAP.date[date]) {
        query = FILTER_QUERY_MAP.date[date];
      } else if (datasource && FILTER_QUERY_MAP.datasource[datasource]) {
        query = FILTER_QUERY_MAP.datasource[datasource];
      } else {
        query = '今年销售额是多少';
      }
    }
    
    console.log('筛选条件变更:', { changedType, changedValue }, '→ 查询:', query);
    
    // 生成新的数据内容
    const newContent = generateNarrativeResponse(query);
    
    // 就地更新消息内容，保留新的筛选条件
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.role === 'assistant') {
        // 确保第一个 block 是带有新条件的 visualizer
        const hasVisualizer = newContent[0]?.type === 'visualizer';
        const updatedContent = hasVisualizer 
          ? [{ ...newContent[0], data: conditions }, ...newContent.slice(1)]
          : [{ id: 'filter-' + Date.now(), type: 'visualizer' as const, data: conditions }, ...newContent];
        
        return { ...msg, content: updatedContent };
      }
      return msg;
    }));
  };

  const hasMessages = messages.length > 0;

  // 路由：移动端测试页面
  if (currentPage === 'mobile') {
    return <MobileTestPage />;
  }

  // 路由：手势控制页面
  if (currentPage === 'gesture') {
    return <GestureControlPage />;
  }

  // 主页面渲染
  return (
    <div className="flex h-screen bg-[#F5F5F7] font-sans">
      {/* 左侧边栏 */}
      <Sidebar 
        onNewChat={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* 顶部导航栏 - Glass Effect */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-apple-text font-semibold tracking-tight">
              AI 数据分析
            </span>
            <div className="hidden md:flex items-center gap-2 pl-4 ml-1 border-l border-black/5">
              {currentAgent.avatar ? (
                <img 
                  src={currentAgent.avatar} 
                  alt={currentAgent.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center text-xs font-semibold">
                  {currentAgent.name.slice(0, 2)}
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-[#86868b]">当前数字员工</span>
                <span className="text-[12px] text-[#1d1d1f]">
                  {currentAgent.name} · {currentAgent.title}
                </span>
              </div>
            </div>
            {hasMessages && (
              <span className="px-2.5 py-0.5 bg-black/5 text-apple-gray text-xs font-medium rounded-full">
                {messages.filter(m => m.role === 'user').length} 轮对话
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScenarioPanelOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#007AFF] rounded-lg hover:bg-[#0066CC] transition-all"
            >
              <Workflow className="w-4 h-4" />
              <span>业务场景</span>
            </button>
            <a
              href="?page=gesture"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-apple-gray hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors"
            >
              <span>🖐</span>
              <span>手势控制</span>
            </a>
            <a
              href="?page=mobile"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-apple-gray hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>移动端测试</span>
            </a>
            {hasMessages && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-apple-gray hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>新对话</span>
              </button>
            )}
          </div>
        </header>

        {/* 对话区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 消息区 + 输入框 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 消息滚动区 */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <AnimatePresence mode="wait">
                {!hasMessages ? (
                  <WelcomeScreen onQuestionSelect={handleSend} agent={currentAgent} userMemory={userMemory} />
                ) : (
                  <div className="max-w-4xl mx-auto px-6 py-8 pb-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      {messages.map((message) => (
                        <MessageBubble 
                          key={message.id} 
                          message={message}
                          onActionSelect={handleActionSelect}
                          onFilterChange={(conditions, changedType, changedValue) => handleFilterChange(message.id, conditions, changedType, changedValue)}
                          onAgentSwitch={handleAgentSwitchByName}
                          isSearching={isSearching && message.status === 'streaming'}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* 输入区域 - 固定在底部，不重叠 */}
            <div className="flex-shrink-0 px-6 py-4 bg-[#F5F5F7] border-t border-black/5">
              <ChatInput 
                onSend={handleSend} 
                disabled={isLoading}
                placeholder={`向 ${currentAgent.name} 提问...`}
                agents={AGENTS}
                currentAgent={currentAgent}
                onAgentChange={handleAgentChange}
                isStreaming={isStreaming}
                onStop={handleStopStreaming}
              />
            </div>
          </div>

          {/* 右侧测试面板 */}
          <TestScenarioPanel
            isOpen={testPanelOpen}
            onToggle={() => setTestPanelOpen(!testPanelOpen)}
            onQuestionSelect={handleSend}
          />
        </div>
      </main>

      {/* 业务场景面板（可选快速入口） */}
      <ScenarioPanel
        isOpen={scenarioPanelOpen}
        onClose={() => setScenarioPanelOpen(false)}
        onScenarioStart={handleScenarioStart}
      />
    </div>
  );
}

export default App;
