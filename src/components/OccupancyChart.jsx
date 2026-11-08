import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const point = payload[0]
  return (
    <div className="bg-ink text-white rounded-lg px-3 py-2 shadow-lg text-xs font-body">
      <p className="text-white/60 mb-0.5">{label}</p>
      <p className="font-mono font-semibold text-sm">
        {point.value?.toFixed(1)}
        {point.payload.isForecast ? ' (predicted)' : ''}
      </p>
    </div>
  )
}

export function OccupancyChart({ history, forecast, target = 'icu' }) {
  const historyPoints = history.map((h) => ({ week: h.week, value: h.value, isForecast: false }))
  const forecastPoint = forecast
    ? [{ week: forecast.predicted_week, value: forecast.predicted_value, isForecast: true }]
    : []
  const data = [...historyPoints, ...forecastPoint]
  const color = target === 'icu' ? '#0E6B5C' : '#E08A3C'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${target}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#12211D0D" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#12211D66' }}
          axisLine={false}
          tickLine={false}
          minTickGap={30}
        />
        <YAxis tick={{ fontSize: 11, fill: '#12211D66' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${target})`}
          dot={(props) => {
            if (props.payload.isForecast) {
              return (
                <circle
                  key={`dot-${props.cx}`}
                  cx={props.cx}
                  cy={props.cy}
                  r={5}
                  fill="white"
                  stroke={color}
                  strokeWidth={2.5}
                />
              )
            }
            return <circle key={`dot-${props.cx}`} cx={props.cx} cy={props.cy} r={0} />
          }}
          activeDot={{ r: 5, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
