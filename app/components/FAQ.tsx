'use client'
import { useState } from 'react'

type FAQ = {
  q: string
  a: string
  example?: { from: 'client' | 'encargado'; text: string }[]
}

const faqs: FAQ[] = [
  { q: '¿Necesito saber de tecnología?', a: 'No. Nosotros configuramos todo. Tú solo respondes un formulario de 5 minutos y apruebas el resultado por WhatsApp.' },
  { q: '¿En cuánto tiempo está listo?', a: '72 horas desde que completas el formulario. A veces menos. Te avisamos por WhatsApp cuando puedas revisar.' },
  {
    q: '¿El encargado de WhatsApp es un bot genérico?',
    a: 'No. Está entrenado con tu negocio — tu menú, tus precios, tu zona de delivery, tu horario. Así se ve una conversación real:',
    example: [
      { from: 'client', text: 'Hola, hacen delivery a Llanquihue?' },
      { from: 'encargado', text: 'Hola! Sí, hacemos delivery a Llanquihue. El envío tiene un costo de $3.000 y demora aprox 40 min. ¿Te muestro el menú del día?' },
      { from: 'client', text: 'Dale, qué tienen?' },
      { from: 'encargado', text: 'Hoy tenemos:\n· Tabla mixta (jamón serrano, queso brie, aceitunas) — $12.900\n· Sándwich de pastrami con mostaza — $7.500\n· Tabla de quesos premium — $15.900\n\n¿Quieres pedir algo? Te mando el link de pago al toque 🙌' },
    ],
  },
  { q: '¿Qué pasa si quiero cancelar?', a: 'Sin compromisos. Cancelas cuando quieras desde tu panel. Tu dominio siempre es tuyo — te lo llevas.' },
  { q: '¿Funciona para mi tipo de negocio?', a: 'Funciona para charcuterías, restaurantes, cafés, tiendas, talleres, peluquerías, spas, y cualquier negocio que atiende clientes localmente.' },
  { q: '¿Ya tengo BSale o un sistema de gestión, sirve?', a: 'Sí. Lo conectamos y tu catálogo queda configurado automáticamente — sin cargar nada manualmente.' },
]

function WaMessage({ from, text }: { from: 'client' | 'encargado'; text: string }) {
  const isClient = from === 'client'
  return (
    <div style={{
      display: 'flex', justifyContent: isClient ? 'flex-end' : 'flex-start',
      marginBottom: 6,
    }}>
      <div style={{
        maxWidth: '80%', padding: '10px 14px',
        background: isClient ? 'rgba(74,138,74,0.15)' : 'var(--bg-2)',
        border: `0.5px solid ${isClient ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: isClient ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontWeight: 300,
        whiteSpace: 'pre-line',
      }}>
        {text}
      </div>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section style={{ padding: '100px 24px', background: 'var(--bg-2)', borderTop: '0.5px solid var(--border)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
            Preguntas frecuentes
          </p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 400, letterSpacing: '-0.02em',
          }}>
            Todo lo que necesitas saber.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map(({ q, a, example }, i) => (
            <div key={i} style={{
              background: open === i ? 'var(--bg-3)' : 'transparent',
              border: '0.5px solid var(--border)',
              borderRadius: 12, overflow: 'hidden',
              transition: 'background 0.2s',
            }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', textAlign: 'left',
                padding: '20px 24px',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
                <span style={{
                  fontSize: 18, color: 'var(--text-3)',
                  transform: open === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 24px 20px' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, fontWeight: 300 }}>{a}</p>
                  {example && (
                    <div style={{
                      marginTop: 16, padding: 16,
                      background: 'var(--bg)', border: '0.5px solid var(--border)',
                      borderRadius: 12,
                    }}>
                      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                        Ejemplo real de conversación
                      </p>
                      {example.map((msg, j) => (
                        <WaMessage key={j} from={msg.from} text={msg.text} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
