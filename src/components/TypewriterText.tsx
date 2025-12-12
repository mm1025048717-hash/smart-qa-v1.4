/**
 * 打字机效果文本组件 - 乔布斯级别的极致体验
 * 丝滑轻柔的逐字显示，营造期待感
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TypewriterTextProps {
  content: string;
  speed?: number; // 每个字符的显示速度（毫秒）
  delay?: number; // 初始延迟
  onComplete?: () => void;
  isStreaming?: boolean; // 是否正在流式输出
  onAgentSwitch?: (agentName: string) => void;
}

// 检查内容是否包含需要立即渲染的特殊组件（不应用打字机效果）
function hasSpecialComponents(text: string): boolean {
  return /\[chart:\s*\{/.test(text) || 
         /\[kpi:\s*\{/.test(text) || 
         /\[gantt:\s*\{/.test(text) || 
         /\[steps:/.test(text) ||
         /\[step:/.test(text);
}

// 智能速度调整：根据内容类型调整速度
function getSmartSpeed(content: string, baseSpeed: number): number {
  // 标点符号后稍慢，营造思考感
  if (/[。！？；]/.test(content.slice(-1))) {
    return baseSpeed * 1.5;
  }
  // 逗号后稍慢
  if (/[，、]/.test(content.slice(-1))) {
    return baseSpeed * 1.2;
  }
  // 空格和换行稍快
  if (/[\s\n]/.test(content.slice(-1))) {
    return baseSpeed * 0.8;
  }
  return baseSpeed;
}

export const TypewriterText = ({
  content,
  speed = 15, // 默认15ms每个字符，极致流畅
  delay = 0,
  onComplete,
  isStreaming = false,
  onAgentSwitch,
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const previousLengthRef = useRef<number>(0);
  
  // 流式输出模式：直接显示新内容，使用渐变效果
  useEffect(() => {
    if (isStreaming) {
      // 流式输出时，直接更新，但保留打字机效果
      if (content.length > previousLengthRef.current) {
        setDisplayedText(content);
        setIsTyping(true);
        previousLengthRef.current = content.length;
      }
      return;
    }
    
    // 非流式模式：完整的打字机效果
    if (content.length < displayedText.length) {
      // 内容被清理，重置
      setDisplayedText(content);
      previousLengthRef.current = content.length;
      return;
    }
    
    if (content.length > displayedText.length) {
      previousLengthRef.current = displayedText.length;
      setIsTyping(true);
    } else if (content.length === displayedText.length && displayedText.length > 0 && isTyping) {
      setIsTyping(false);
      onComplete?.();
    }
  }, [content, isStreaming, displayedText, isTyping, onComplete]);
  
  // 打字机动画 - 使用requestAnimationFrame确保60fps丝滑体验
  useEffect(() => {
    if (isStreaming) {
      // 流式模式下，内容已经直接更新，不需要动画
      return;
    }
    
    if (displayedText.length >= content.length) {
      if (isTyping) {
        setIsTyping(false);
        onComplete?.();
      }
      return;
    }
    
    const animate = (currentTime: number) => {
      if (lastUpdateTimeRef.current === 0) {
        lastUpdateTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      const currentSpeed = getSmartSpeed(displayedText, speed);
      
      // 批量更新字符，提高性能
      if (deltaTime >= currentSpeed) {
        const charsToAdd = Math.min(
          Math.max(1, Math.floor(deltaTime / currentSpeed)),
          content.length - displayedText.length
        );
        
        const nextLength = displayedText.length + charsToAdd;
        setDisplayedText(content.slice(0, nextLength));
        lastUpdateTimeRef.current = currentTime;
      }
      
      if (displayedText.length < content.length) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };
    
    // 延迟启动
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        lastUpdateTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      lastUpdateTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lastUpdateTimeRef.current = 0;
    };
  }, [content, displayedText, speed, delay, isStreaming, isTyping, onComplete]);
  
  if (!content) return null;
  
  // 如果包含特殊组件（图表、KPI、甘特图、流程图），直接渲染，不应用打字机效果
  const hasSpecial = hasSpecialComponents(content);
  const finalContent = hasSpecial ? content : displayedText;
  const showCursor = hasSpecial ? false : isTyping;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* 文本内容 - 精致排版，带缩进和渐变效果 */}
      <div 
        className="text-[15px] text-[#1d1d1f] leading-[1.85] tracking-[0.01em] pl-1"
        style={{
          textIndent: '0.5em', // 首行缩进
        }}
      >
        <MarkdownRenderer 
          content={finalContent} 
          onAgentSwitch={onAgentSwitch}
        />
      </div>
      
      {/* 打字光标 - 渐变闪烁，营造期待感，完成后立即消失 */}
      {showCursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
            times: [0, 0.1, 0.9, 1],
          }}
          className="inline-block w-[2px] h-[18px] bg-gradient-to-b from-[#007AFF] to-[#5AC8FA] ml-[3px] align-middle rounded-full"
          style={{
            boxShadow: '0 0 6px rgba(0, 122, 255, 0.6)',
            filter: 'blur(0.5px)',
          }}
        />
      )}
    </motion.div>
  );
};

