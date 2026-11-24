'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/format';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  mobileFullScreen?: boolean;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  mobileFullScreen = true,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            type="button"
            aria-label="Tutup panel"
            className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={mobileFullScreen ? { y: '100%' } : { x: '100%' }}
            animate={mobileFullScreen ? { y: 0 } : { x: 0 }}
            exit={mobileFullScreen ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'flex flex-col border-l border-line bg-cream shadow-lift',
              mobileFullScreen
                ? 'absolute inset-x-0 bottom-0 max-h-[88vh] w-full rounded-t-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:max-w-[360px] sm:rounded-l-2xl sm:rounded-tr-none'
                : 'absolute inset-y-0 right-0 w-full max-w-[90vw]',
              !mobileFullScreen && width === 'sm' && 'sm:max-w-md',
              !mobileFullScreen && width === 'md' && 'sm:max-w-lg',
              !mobileFullScreen && width === 'lg' && 'sm:max-w-2xl'
            )}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                {title && <h2 className="font-display text-xl font-semibold text-navy">{title}</h2>}
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted transition hover:bg-navy/5 hover:text-ink shrink-0"
                aria-label="Tutup panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 thin-scrollbar">{children}</div>
            {footer && <div className="border-t border-line bg-white/60 px-5 py-4">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
