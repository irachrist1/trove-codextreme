import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const success = useCallback((message: string) => toast('success', message), [toast])
  const error = useCallback((message: string) => toast('error', message), [toast])
  const info = useCallback((message: string) => toast('info', message), [toast])
  const warning = useCallback((message: string) => toast('warning', message), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast container
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual toast
const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles: Record<ToastType, string> = {
  success: 'bg-[var(--color-success-50)] border-[var(--color-success-100)]',
  error: 'bg-[var(--color-red-50)] border-[var(--color-red-100)]',
  info: 'bg-[var(--color-info-50)] border-[var(--color-info-100)]',
  warning: 'bg-[var(--color-warning-50)] border-[var(--color-warning-100)]',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-[var(--color-success-500)]',
  error: 'text-[var(--color-red-500)]',
  info: 'text-[var(--color-info-500)]',
  warning: 'text-[var(--color-warning-500)]',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={cn(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm',
        'shadow-lg min-w-[300px] max-w-md',
        styles[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', iconColors[toast.type])} />
      <p className="flex-1 text-sm font-medium text-[var(--color-black-900)]">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 -m-1 text-[var(--color-gray-400)] hover:text-[var(--color-black-900)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
