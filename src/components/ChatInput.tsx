import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Mic, Paperclip, ChevronDown, Check, Layers, Sparkles, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { AgentProfile } from '../types';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  // Agent 相关
  agents?: AgentProfile[];
  currentAgent?: AgentProfile;
  onAgentChange?: (agentId: string) => void;
  // 停止输出相关
  isStreaming?: boolean;
  onStop?: () => void;
}

export const ChatInput = ({ 
  onSend, 
  disabled = false, 
  placeholder = "输入你的数据分析问题...",
  agents = [],
  currentAgent,
  onAgentChange,
  isStreaming = false,
  onStop,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showAgentHint, setShowAgentHint] = useState(() => {
    // 首次访问时显示提示
    return !localStorage.getItem('agent_hint_dismissed');
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 获取当前 Agent 的建议问题
  const allSuggestions = useMemo(() => {
    if (!currentAgent?.suggestedQuestions) return [];
    return currentAgent.suggestedQuestions.map(q => q.label);
  }, [currentAgent]);

  // 根据用户输入过滤建议
  const filteredSuggestions = useMemo(() => {
    if (!message.trim()) return allSuggestions;
    const query = message.toLowerCase();
    return allSuggestions.filter(s => 
      s.toLowerCase().includes(query) || 
      query.split('').every(char => s.toLowerCase().includes(char))
    );
  }, [message, allSuggestions]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [message]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAgentDropdownOpen(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        // 延迟关闭，让点击事件先触发
        setTimeout(() => setShowSuggestions(false), 150);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 重置选中索引
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [filteredSuggestions]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 如果建议列表打开，处理上下键导航
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        return;
      }
      if (e.key === 'Tab' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 如果有选中的建议，使用建议
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        handleSelectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        handleSubmit();
      }
    }
  };

  const handleAgentSelect = (agentId: string) => {
    onAgentChange?.(agentId);
    setAgentDropdownOpen(false);
    // 选择后隐藏提示
    if (showAgentHint) {
      setShowAgentHint(false);
      localStorage.setItem('agent_hint_dismissed', 'true');
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    // 找到对应的 query
    const questionData = currentAgent?.suggestedQuestions?.find(q => q.label === suggestion);
    if (questionData) {
      onSend(questionData.query);
    } else {
      onSend(suggestion);
    }
    setMessage('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (allSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // 延迟关闭，让点击事件先触发
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const showAgentSelector = agents.length > 0 && currentAgent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative bg-white rounded-[26px] transition-all duration-300 border',
        isFocused 
          ? 'shadow-xl border-primary-200 ring-2 ring-primary-100' 
          : 'shadow-lg border-slate-200 hover:shadow-xl hover:border-slate-300'
      )}
    >
      {/* 智能建议列表 - 向上展开 */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 right-4 bottom-full mb-3 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-white border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-xs font-medium text-primary-600">
                {currentAgent?.name} 推荐问题
              </span>
            </div>
            <div className="py-1 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={clsx(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors",
                    index === selectedSuggestionIndex
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="text-slate-400 mr-2">→</span>
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
              <span className="mr-3">↑↓ 选择</span>
              <span className="mr-3">Tab 填充</span>
              <span>Enter 发送</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent 切换器 - 左上角 */}
      {showAgentSelector && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 relative" ref={dropdownRef}>
          <div className="flex items-center gap-3">
            <motion.button
              key={currentAgent.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setAgentDropdownOpen(!agentDropdownOpen);
                // 点击也隐藏提示
                if (showAgentHint) {
                  setShowAgentHint(false);
                  localStorage.setItem('agent_hint_dismissed', 'true');
                }
              }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[13px] text-slate-700 hover:border-[#007AFF] hover:text-[#007AFF] transition-colors"
            >
              <motion.div
                key={currentAgent.avatar}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {currentAgent.avatar ? (
                  <img 
                    src={currentAgent.avatar} 
                    alt={currentAgent.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-500/15 text-primary-600 flex items-center justify-center text-[10px] font-semibold">
                    {currentAgent.name.slice(0, 2)}
                  </div>
                )}
              </motion.div>
              <motion.span 
                key={currentAgent.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-medium"
              >
                {currentAgent.name}
              </motion.span>
              <ChevronDown className={clsx(
                "w-3.5 h-3.5 text-[#86868b] transition-transform",
                agentDropdownOpen && "rotate-180"
              )} />
            </motion.button>

            {/* 首次提示 */}
            <AnimatePresence>
              {showAgentHint && !agentDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-[12px] text-[#007AFF]"
                >
                  ← 点击选择 AI 员工
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agent 下拉列表 - 向上展开 */}
          <AnimatePresence>
            {agentDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 bottom-full mb-2 w-[280px] bg-white rounded-xl shadow-lg border border-[#d2d2d7] overflow-hidden z-50"
              >
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500">
                  切换 AI 员工
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {agents.map((agent, index) => (
                    <motion.button
                      key={agent.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAgentSelect(agent.id)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 transition-colors text-left",
                        agent.id === currentAgent.id && "bg-primary-50/70"
                      )}
                    >
                      <motion.div
                        animate={agent.id === currentAgent.id ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {agent.avatar ? (
                          <img 
                            src={agent.avatar} 
                            alt={agent.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center text-[12px] font-semibold">
                            {agent.name.slice(0, 2)}
                          </div>
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{agent.name}</span>
                          {agent.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-600 rounded">
                              {agent.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{agent.title}</div>
                      </div>

                      <AnimatePresence>
                        {agent.id === currentAgent.id && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 输入区域 */}
      <div className="relative flex items-end gap-2 px-4 py-3">
        {/* 左侧工具栏 */}
        <div className="flex items-center gap-1 pb-1">
          <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
            onClick={() => setShowSuggestions(!showSuggestions)}
            title="显示推荐问题"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* 输入框 */}
        <div className="flex-1 py-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (e.target.value && allSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-[15px] leading-relaxed"
            style={{ maxHeight: '150px' }}
          />
        </div>

        {/* 停止/发送按钮 */}
        <div className="pb-1 flex items-center gap-2">
          {/* 停止按钮 - 仅在流式输出时显示 */}
          <AnimatePresence>
            {isStreaming && onStop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onStop}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF3B30] text-white hover:bg-[#E63329] transition-all shadow-md hover:shadow-lg"
                title="停止输出"
              >
                <Square className="w-4 h-4 fill-current" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* 发送按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className={clsx(
              'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
              message.trim() && !disabled
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            )}
          >
            {message.trim() ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-slate-400">
        <span>Enter 发送 · Shift+Enter 换行</span>
        {allSuggestions.length > 0 && (
          <span className="text-primary-400">点击输入框查看推荐问题</span>
        )}
      </div>
    </motion.div>
  );
};

export default ChatInput;
