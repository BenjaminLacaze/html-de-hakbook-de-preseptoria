import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap shrink-0 cursor-pointer';

    const variants = {
      primary: 'bg-[var(--accent-primary)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent-primary)] shadow-sm',
      secondary: 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] border border-subtle-custom',
      outline: 'border border-subtle-custom bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
      gold: 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-current)]',
      md: 'h-9 px-4 text-sm gap-2 rounded-[var(--radius-current)]',
      lg: 'h-11 px-6 text-base gap-2.5 rounded-[var(--radius-current)]',
      icon: 'h-9 w-9 p-0 rounded-[var(--radius-current)]',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
