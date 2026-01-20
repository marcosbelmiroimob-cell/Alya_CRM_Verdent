import { useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className={`
          fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 
          rounded-t-3xl shadow-xl max-h-[90vh] overflow-hidden
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-60px)] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
