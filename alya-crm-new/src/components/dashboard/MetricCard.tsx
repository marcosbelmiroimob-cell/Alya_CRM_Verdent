interface MetricCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  subtitle?: string
  trend?: string
}

export function MetricCard({ title, value, icon, color, subtitle, trend }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend}
              </span>
              <span className="text-xs text-gray-500">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color] || colorClasses.purple}`}>
          <i className={`fas fa-${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  )
}
