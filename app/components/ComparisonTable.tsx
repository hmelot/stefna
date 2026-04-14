/**
 * Feature comparison table — Solo vs Agencia vs Stefna
 * Inspired by cap-table.lat's clean feature checklist.
 */

type Row = { feature: string; solo: string; agency: string; stefna: string }

const rows: Row[] = [
  { feature: 'Web profesional activa', solo: '✕', agency: '✓', stefna: '✓' },
  { feature: 'Aparece en Google Maps', solo: '✕', agency: '~', stefna: '✓' },
  { feature: 'SEO local (búsquedas por rubro y ciudad)', solo: '✕', agency: '~', stefna: '✓' },
  { feature: 'Responde WhatsApp 24/7', solo: '✕', agency: '✕', stefna: '✓' },
  { feature: 'Toma pedidos automáticamente', solo: '✕', agency: '✕', stefna: '✓' },
  { feature: 'Cobra por WhatsApp (link de pago)', solo: '✕', agency: '✕', stefna: '✓' },
  { feature: 'Panel con métricas del negocio', solo: '✕', agency: '~', stefna: '✓' },
  { feature: 'Redes sociales gestionadas', solo: '✕', agency: '✓', stefna: '✓' },
  { feature: 'Setup en 72 horas', solo: '—', agency: '✕', stefna: '✓' },
  { feature: 'Sin contratos ni permanencia', solo: '—', agency: '✕', stefna: '✓' },
  { feature: 'Precio fijo mensual', solo: '—', agency: '✕', stefna: '✓' },
  { feature: 'Tú no configuras nada', solo: '✕', agency: '~', stefna: '✓' },
]

function Cell({ value, highlight }: { value: string; highlight?: boolean }) {
  const color = value === '✓' ? 'var(--accent)' :
                value === '✕' ? 'var(--text-3)' :
                value === '~' ? '#E0A85A' : 'var(--text-3)'
  return (
    <td style={{
      padding: '12px 16px', textAlign: 'center', fontSize: 14,
      color, fontWeight: value === '✓' ? 500 : 300,
      background: highlight ? 'rgba(74,138,74,0.04)' : 'transparent',
    }}>
      {value}
    </td>
  )
}

export default function ComparisonTable() {
  return (
    <section style={{ padding: '100px 24px', background: 'var(--bg-2)', borderTop: '0.5px solid var(--border)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            Comparación
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            ¿Qué ganas con Stefna?
          </h2>
        </div>

        <div className="comparison-wrap" style={{
          border: '0.5px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--sans)' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  Funcionalidad
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--text-3)', width: 100 }}>
                  Solo
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: 12, fontWeight: 400, color: 'var(--text-3)', width: 100 }}>
                  Agencia
                </th>
                <th style={{
                  padding: '16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent)', width: 100,
                  background: 'rgba(74,138,74,0.04)', borderBottom: '2px solid var(--accent)',
                }}>
                  Stefna
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)', fontWeight: 300 }}>
                    {row.feature}
                  </td>
                  <Cell value={row.solo} />
                  <Cell value={row.agency} />
                  <Cell value={row.stefna} highlight />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)' }}>✓</span> Incluido &nbsp;&nbsp;
            <span style={{ color: '#E0A85A' }}>~</span> Parcial o con costo extra &nbsp;&nbsp;
            <span style={{ color: 'var(--text-3)' }}>✕</span> No incluido
          </p>
        </div>
      </div>
    </section>
  )
}
