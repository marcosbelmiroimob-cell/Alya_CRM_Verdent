import { Sparkles } from 'lucide-react'
import { useAlya } from '../../contexts/AlyaContext'

export function AlyaFloatingButton() {
  const { isOpen, setIsOpen, notificacoes, limparNotificacoes } = useAlya()

  const handleClick = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      limparNotificacoes()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br from-purple-600 to-pink-500
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-xl
        ${isOpen ? 'rotate-12 scale-105' : ''}
      `}
      aria-label="Abrir Alya"
    >
      <Sparkles className="w-6 h-6" />
      
      {notificacoes > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
          {notificacoes > 9 ? '9+' : notificacoes}
        </span>
      )}
      
      <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
    </button>
  )
}
