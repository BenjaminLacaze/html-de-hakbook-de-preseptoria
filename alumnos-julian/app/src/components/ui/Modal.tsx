import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              'relative w-full bg-surface border border-subtle-custom rounded-[var(--radius-current)] shadow-xl z-10 flex flex-col max-h-[90vh]',
              maxW[maxWidth]
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-subtle-custom">
              <div>
                <h3 id="modal-title" className="text-base font-semibold text-primary-custom tracking-tight">
                  {title}
                </h3>
                {description && <p className="text-xs text-secondary-custom mt-0.5">{description}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Cerrar ventana modal"
                className="h-8 w-8 text-secondary-custom hover:text-primary-custom -mr-1 -mt-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-4 px-5 border-t border-subtle-custom bg-[var(--bg-surface-elevated)] flex items-center justify-end gap-3 rounded-b-[var(--radius-current)]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
