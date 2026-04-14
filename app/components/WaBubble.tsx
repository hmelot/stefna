export type WaMsg = { from: 'client' | 'encargado'; text: string }

export default function WaBubble({ from, text }: WaMsg) {
  const isClient = from === 'client'
  return (
    <div style={{ display: 'flex', justifyContent: isClient ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
      <div style={{
        maxWidth: '80%', padding: '10px 14px',
        background: isClient ? 'rgba(74,138,74,0.15)' : 'var(--bg-2)',
        border: `0.5px solid ${isClient ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: isClient ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontWeight: 300,
        whiteSpace: 'pre-line' as const,
      }}>
        {text}
      </div>
    </div>
  )
}
