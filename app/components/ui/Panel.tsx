type Props = { title: string; children: React.ReactNode }

export default function Panel({ title, children }: Props) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '0.5px solid var(--border)',
      borderRadius: 14, padding: '24px 26px',
    }}>
      <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
        {title}
      </p>
      {children}
    </div>
  )
}
