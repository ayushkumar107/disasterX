import React from 'react';
import { motion } from 'framer-motion';
export const GlassPanel = ({
  children,
  className = '',
  strong = false,
  glow = 'none',
  animate = true,
  onClick
}) => {
  const baseClass = strong ? 'glass-panel-strong' : 'glass-panel';
  const glowClass = glow === 'cyan' ? 'glow-cyan' : glow === 'red' ? 'glow-red' : '';
  const content = <div className={`${baseClass} ${glowClass} ${className}`} onClick={onClick}>
      {children}
    </div>;
  if (!animate) return content;
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: 10
  }} transition={{
    duration: 0.3,
    ease: 'easeOut'
  }}>
      {content}
    </motion.div>;
};
