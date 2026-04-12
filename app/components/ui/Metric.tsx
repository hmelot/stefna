type Props = {
  label: string
  value: string
  delta?: string
  sub?: string
  warn?: boolean
}

export default function Metric({ label, value, delta, sub, warn }: Props) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '0.5px solid var(--border)',
      borderRadius: 14, padding: '22px 24px',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.02em',
        marginBottom: 4, color: warn ? '#E0A85A' : 'var(--text)',
      }}>
        {value}
      </p>
      {delta && <p style={{ fontSize: 12, color: 'var(--accent)' }}>{delta} vs semana anterior</p>}
      {sub && <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</p>}
    </div>
  )
}
