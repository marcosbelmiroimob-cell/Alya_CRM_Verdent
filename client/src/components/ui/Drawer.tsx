import { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  side?: 'left' | 'right'
}

export function Drawer({ isOpen, onClose, children, side = 'left' }: DrawerProps) {
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
          fixed top-0 bottom-0 w-72 bg-slate-900 shadow-xl
          transform transition-transform duration-300 ease-out
          ${side === 'left' ? 'left-0' : 'right-0'}
          ${isOpen ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full'}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:bg-slate-800 rounded-lg"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
