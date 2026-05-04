import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("glass-panel rounded-2xl p-6 relative overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

export function Button({ children, className, variant = 'primary', ...props }: any) {
  const baseStyle = "px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const variants: any = {
    primary: "bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-yellow-500/30",
    secondary: "bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white shadow-zinc-900/20",
    outline: "border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-black dark:border-yellow-500 dark:text-yellow-400 dark:hover:text-black",
    ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
  };
  
  return (
    <button className={cn(baseStyle, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Input({ className, ...props }: any) {
  return (
    <input 
      className={cn("w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all", className)}
      {...props}
    />
  );
}
