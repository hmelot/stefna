'use client'
import { useState } from 'react'

const faqs = [
  { q: '¿Necesito saber de tecnología?', a: 'No. Nosotros configuramos todo. Tú solo respondes un formulario de 5 minutos y apruebas el resultado por WhatsApp.' },
  { q: '¿En cuánto tiempo está listo?', a: '72 horas desde que completas el formulario. A veces menos. Te avisamos por WhatsApp cuando puedas revisar.' },
  { q: '¿El encargado de WhatsApp es un bot genérico?', a: 'No. Está entrenado específicamente con tu negocio — tu menú, tus precios, tu zona de delivery, tu horario. Responde como si supiera todo de tu negocio.' },
  { q: '¿Qué pasa si quiero cancelar?', a: 'Sin compromisos. Cancelas cuando quieras desde tu panel. Tu dominio siempre es tuyo.' },
  { q: '¿Funciona para mi tipo de negocio?', a: 'Funciona para charcuterías, restaurantes, cafés, tiendas, talleres, peluquerías, spas, y cualquier negocio que atiende clientes localmente.' },
  { q: '¿Ya tengo BSale o un sistema de gestión, sirve?', a: 'Sí. Lo conectamos y tu catálogo queda configurado automáticamente — sin cargar nada manualmente.' },
]

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
          {faqs.map(({ q, a }, i) => (
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
                <p style={{
                  fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65,
                  padding: '0 24px 20px', fontWeight: 300,
                }}>
                  {a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
