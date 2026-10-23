import React, { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      // Enfocar el botón de acción principal para navegación accesible inmediata
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      // Cerrar al presionar tecla Escape
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isDestructive ? '#FEF2F2' : 'var(--isf-blue-sky-light)',
                    color: isDestructive ? '#B91C1C' : 'var(--isf-blue-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={20} aria-hidden="true" />
                </div>
                <h2 id="modal-title" className="modal-title" style={{ margin: 0 }}>
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Cerrar ventana emergente"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <p id="modal-desc" style={{ fontSize: '0.9375rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {description}
            </p>

            {children && <div style={{ marginBottom: '1.5rem' }}>{children}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                className={`btn ${isDestructive ? 'btn-outline-danger' : 'btn-primary'}`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
