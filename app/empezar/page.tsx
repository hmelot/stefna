'use client'
import { useEffect, useRef, useState } from 'react'
import type { Industry, WhatsappChannel, CajaId } from '../lib/types'
import { CAJAS, calcTotal, recommendedCajasFor } from '../lib/cajas'
import { INDUSTRIES, INDUSTRY_LABELS, WEEKDAYS, type Weekday } from '../lib/labels'
import { formatCLP } from '../lib/format'
import { isValidEmail, isValidPhone } from '../lib/validation'
import { API_URL, ONBOARDING_STORAGE_KEY } from '../lib/constants'

export default function EmpezarPage() {
  return <Empezar />
}

type FormData = {
  name: string
  email: string
  whatsappPhone: string
  businessName: string
  industry: Industry | ''
  city: string
  usesBSale: boolean
  whatsappChannel: WhatsappChannel | ''
  openTime: string
  closeTime: string
  days: Weekday[]
  delivery: boolean
  cajas: CajaId[]
}

const INITIAL: FormData = {
  name: '', email: '', whatsappPhone: '',
  businessName: '', industry: '', city: 'Santiago', usesBSale: false,
  whatsappChannel: '', openTime: '09:00', closeTime: '20:00',
  days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], delivery: false,
  cajas: [], // populated by recommendations on step 4
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

function Empezar() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const hydrated = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (saved) setData(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch {
      // Corrupt draft — start fresh
    }
    hydrated.current = true
  }, [])

  // Debounced localStorage save (500ms after last change)
  useEffect(() => {
    if (!hydrated.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data))
      } catch {
        // Quota or disabled storage — best effort only.
      }
    }, 500)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [data])

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData(d => ({ ...d, [key]: value }))

  const toggleCaja = (id: CajaId) => {
    const has = data.cajas.includes(id)
    update('cajas', has ? data.cajas.filter(c => c !== id) : [...data.cajas, id])
  }

  const canAdvance = (): boolean => {
    if (step === 1) return !!data.name.trim() && isValidEmail(data.email) && isValidPhone(data.whatsappPhone)
    if (step === 2) return !!data.businessName.trim() && !!data.industry && !!data.city.trim()
    if (step === 3) return !!data.whatsappChannel && data.days.length > 0 && !!data.openTime && !!data.closeTime
    if (step === 4) return data.cajas.length >= 1
    return true
  }

  const recommended: CajaId[] = data.industry ? recommendedCajasFor[data.industry] : []

  // Pre-fill recommended cajas when entering step 4 with uncustomized selection
  const hasPrefilledCajas = useRef(false)
  useEffect(() => {
    if (step === 4 && !hasPrefilledCajas.current && data.industry && data.cajas.length === 0) {
      hasPrefilledCajas.current = true
      update('cajas', recommendedCajasFor[data.industry])
    }
  }, [step, data.industry, data.cajas.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const finalize = async () => {
    setSubmitState('submitting')
    try {
      const response = await fetch(`${API_URL}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error((errorBody as any).error || `HTTP ${response.status}`)
      }
      setSubmitState('success')
      try { localStorage.removeItem(ONBOARDING_STORAGE_KEY) } catch {}
    } catch {
      setSubmitState('error')
    }
  }

  const advanceDisabled = !canAdvance()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <header style={{
        padding: '24px', borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 720, margin: '0 auto',
      }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Stefna
        </a>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Paso {Math.min(step, 5)} de 5</p>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: 2, background: 'var(--border)', marginTop: 16, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(Math.min(step, 5) / 5) * 100}%`,
            background: 'var(--accent)', transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <section style={{ maxWidth: 620, margin: '0 auto', padding: '56px 24px 96px' }}>
        {submitState === 'success' ? (
          <Success firstName={data.name.split(' ')[0] || ''} />
        ) : (
          <>
            {step === 1 && <Step1 data={data} update={update} />}
            {step === 2 && <Step2 data={data} update={update} />}
            {step === 3 && <Step3 data={data} update={update} />}
            {step === 4 && <Step4 data={data} toggleCaja={toggleCaja} recommended={recommended} />}
            {step === 5 && <Step5 data={data} />}

            {submitState === 'error' && (
              <p style={{
                marginTop: 24, padding: 14, fontSize: 13,
                background: 'rgba(217,84,79,0.1)', border: '0.5px solid rgba(217,84,79,0.4)',
                borderRadius: 10, color: '#D9544F',
              }}>
                No pudimos enviar tu solicitud. Revisa tu conexión y vuelve a intentarlo.
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                style={{
                  padding: '12px 22px', fontSize: 14, fontFamily: 'var(--sans)',
                  background: 'transparent', color: 'var(--text-2)',
                  border: '0.5px solid var(--border)', borderRadius: 10,
                  cursor: step === 1 ? 'not-allowed' : 'pointer',
                  opacity: step === 1 ? 0.4 : 1,
                }}
              >
                ← Atrás
              </button>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => !advanceDisabled && setStep(s => s + 1)}
                  disabled={advanceDisabled}
                  style={{
                    padding: '12px 26px', fontSize: 14, fontWeight: 500, fontFamily: 'var(--sans)',
                    background: advanceDisabled ? 'var(--bg-3)' : 'var(--text)',
                    color: advanceDisabled ? 'var(--text-3)' : 'var(--bg)',
                    border: 'none', borderRadius: 10,
                    cursor: advanceDisabled ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                >
                  Continuar →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finalize}
                  disabled={submitState === 'submitting'}
                  style={{
                    padding: '12px 26px', fontSize: 14, fontWeight: 500, fontFamily: 'var(--sans)',
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 10,
                    cursor: submitState === 'submitting' ? 'wait' : 'pointer',
                    opacity: submitState === 'submitting' ? 0.6 : 1,
                  }}
                >
                  {submitState === 'submitting' ? 'Enviando…' : 'Confirmar →'}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

function StepHeader({ k, title, subtitle }: { k: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>{k}</p>
      <h1 style={{
        fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
        fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 10,
      }}>{title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.55 }}>{subtitle}</p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 14px', fontSize: 14,
  background: 'var(--bg-2)', color: 'var(--text)',
  border: '0.5px solid var(--border)', borderRadius: 10,
  fontFamily: 'var(--sans)', outline: 'none',
  transition: 'border-color 0.2s',
}

function Field({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 8, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

type StepProps = {
  data: FormData
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void
}

function Step1({ data, update }: StepProps) {
  return (
    <>
      <StepHeader k="01 · Cuenta" title="Hola. Empecemos por ti." subtitle="Tres datos y seguimos. Nunca vamos a usar tu teléfono para spam." />
      <Field id="name" label="Tu nombre">
        <input id="name" style={inputStyle} value={data.name} onChange={e => update('name', e.target.value)} placeholder="Nombre y apellido" autoComplete="name" />
      </Field>
      <Field id="email" label="Email">
        <input id="email" style={inputStyle} type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="tu@email.com" autoComplete="email" />
      </Field>
      <Field id="phone" label="WhatsApp (el tuyo, para hablar contigo)">
        <input id="phone" style={inputStyle} type="tel" value={data.whatsappPhone} onChange={e => update('whatsappPhone', e.target.value)} placeholder="+56 9 ..." autoComplete="tel" />
      </Field>
    </>
  )
}

function Step2({ data, update }: StepProps) {
  return (
    <>
      <StepHeader k="02 · Negocio" title="Cuéntanos de tu negocio." subtitle="Usamos esta info para armar tu web y afinar tu posicionamiento local." />
      <Field id="businessName" label="Nombre del negocio">
        <input id="businessName" style={inputStyle} value={data.businessName} onChange={e => update('businessName', e.target.value)} placeholder="ej. Panadería Don Luis" />
      </Field>
      <Field label="Rubro">
        <div role="radiogroup" aria-label="Rubro" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {INDUSTRIES.map(id => {
            const active = data.industry === id
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update('industry', id)}
                style={{
                  padding: '11px 12px', fontSize: 13, textAlign: 'left',
                  background: active ? 'var(--accent-dim)' : 'var(--bg-2)',
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  border: `0.5px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                  borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
                  transition: 'all 0.15s',
                }}
              >
                {INDUSTRY_LABELS[id]}
              </button>
            )
          })}
        </div>
      </Field>
      <Field id="city" label="Ciudad">
        <input id="city" style={inputStyle} value={data.city} onChange={e => update('city', e.target.value)} />
      </Field>
      <label style={{
        padding: 16, background: 'var(--bg-2)', border: '0.5px solid var(--border)',
        borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={data.usesBSale}
          onChange={e => update('usesBSale', e.target.checked)}
          style={{ marginTop: 3, accentColor: 'var(--accent)' }}
        />
        <div>
          <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>Uso <strong>BSale</strong> (o Alegra / Defontana)</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 300 }}>Lo conectamos después para pre-llenar tu catálogo. Opcional.</p>
        </div>
      </label>
    </>
  )
}

function Step3({ data, update }: StepProps) {
  const toggleDay = (day: Weekday) => {
    update('days', data.days.includes(day) ? data.days.filter(d => d !== day) : [...data.days, day])
  }
  const channels: { id: WhatsappChannel; label: string }[] = [
    { id: 'existing', label: 'Ya tengo uno' },
    { id: 'new', label: 'Necesito uno nuevo' },
  ]
  return (
    <>
      <StepHeader k="03 · WhatsApp y horarios" title="¿Cómo atiendes hoy?" subtitle="Esto entrena al encargado para responder como tú." />
      <Field label="¿Tienes un número de WhatsApp para el negocio?">
        {channels.map(({ id, label }) => (
          <label key={id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 12,
            marginBottom: 8, background: 'var(--bg-2)',
            border: `0.5px solid ${data.whatsappChannel === id ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: 10, cursor: 'pointer',
          }}>
            <input
              type="radio"
              name="whatsappChannel"
              checked={data.whatsappChannel === id}
              onChange={() => update('whatsappChannel', id)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{label}</span>
          </label>
        ))}
      </Field>
      <Field label="Horarios de atención">
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={inputStyle} type="time" value={data.openTime} onChange={e => update('openTime', e.target.value)} aria-label="Hora de apertura" />
          <input style={inputStyle} type="time" value={data.closeTime} onChange={e => update('closeTime', e.target.value)} aria-label="Hora de cierre" />
        </div>
      </Field>
      <Field label="Días abiertos">
        <div role="group" aria-label="Días abiertos" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WEEKDAYS.map(day => {
            const active = data.days.includes(day)
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() => toggleDay(day)}
                style={{
                  padding: '10px 14px', fontSize: 13,
                  background: active ? 'var(--accent-dim)' : 'var(--bg-2)',
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  border: `0.5px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                  borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </Field>
      <label style={{
        padding: 16, background: 'var(--bg-2)', border: '0.5px solid var(--border)',
        borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={data.delivery}
          onChange={e => update('delivery', e.target.checked)}
          style={{ marginTop: 3, accentColor: 'var(--accent)' }}
        />
        <div>
          <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>Hacemos delivery</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 300 }}>El encargado ofrecerá opciones de envío en la conversación.</p>
        </div>
      </label>
    </>
  )
}

type Step4Props = {
  data: FormData
  toggleCaja: (id: CajaId) => void
  recommended: CajaId[]
}

function Step4({ data, toggleCaja, recommended }: Step4Props) {
  const industryLabel = data.industry ? INDUSTRY_LABELS[data.industry].toLowerCase() : ''
  const total = calcTotal(data.cajas)


  return (
    <>
      <StepHeader
        k="04 · Arma tu plan"
        title="¿Qué necesita tu negocio?"
        subtitle={data.industry
          ? `Para ${industryLabel} recomendamos estas cajas. Puedes agregar o quitar lo que quieras.`
          : 'Selecciona las cajas que necesitas. Tu web siempre está incluida.'}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CAJAS.map(caja => {
          const active = data.cajas.includes(caja.id)
          const isRecommended = recommended.includes(caja.id) && !caja.included
          return (
            <button
              key={caja.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleCaja(caja.id)}
              disabled={caja.included}
              style={{
                textAlign: 'left', padding: '18px 20px',
                background: active ? 'rgba(74,138,74,0.06)' : 'var(--bg-2)',
                border: active
                  ? '1.5px solid var(--accent)'
                  : '0.5px solid var(--border)',
                borderRadius: 14,
                cursor: caja.included ? 'default' : 'pointer',
                fontFamily: 'var(--sans)',
                position: 'relative', transition: 'all 0.15s',
                opacity: caja.included ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                  {/* Checkbox visual */}
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: active ? 'var(--accent)' : 'transparent',
                    border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {active && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{caja.name}</p>
                      {caja.included && (
                        <span style={{ fontSize: 10, color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                          Incluida
                        </span>
                      )}
                      {isRecommended && !active && (
                        <span style={{ fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 4, fontWeight: 500, border: '0.5px solid var(--accent-border)' }}>
                          Recomendada
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.5 }}>{caja.desc}</p>
                    {active && !caja.included && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                        {caja.items.map(item => (
                          <span key={item} style={{
                            fontSize: 11, color: 'var(--text-2)', background: 'rgba(255,255,255,0.05)',
                            padding: '3px 8px', borderRadius: 5,
                          }}>
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  {caja.price > 0 ? (
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '-0.02em', color: active ? 'var(--text)' : 'var(--text-2)' }}>
                      {formatCLP(caja.price)}
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                      {caja.included ? 'Base' : 'Gratis'}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Sticky total */}
      <div style={{
        position: 'sticky', bottom: 0,
        marginTop: 24, padding: '18px 22px',
        background: 'var(--bg-3)', border: '1px solid var(--border-hover)',
        borderRadius: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backdropFilter: 'blur(12px)',
      }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Tu plan mensual
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
            {data.cajas.length} {data.cajas.length === 1 ? 'caja' : 'cajas'} seleccionadas
          </p>
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 32, letterSpacing: '-0.02em' }}>
          {formatCLP(total)}
        </p>
      </div>
    </>
  )
}

function Step5({ data }: { data: FormData }) {
  const total = calcTotal(data.cajas)

  const industryLabel = data.industry ? INDUSTRY_LABELS[data.industry] : '—'
  const channelLabel = data.whatsappChannel === 'existing' ? 'Ya tiene número' : data.whatsappChannel === 'new' ? 'Necesita nuevo' : '—'
  const selectedCajas = CAJAS.filter(c => data.cajas.includes(c.id))

  return (
    <>
      <StepHeader k="05 · Resumen" title="Todo listo." subtitle="Revisa los datos y confirma. Te contactamos por WhatsApp para coordinar." />
      <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <SummaryRow label="Titular" value={data.name} />
        <SummaryRow label="Email" value={data.email} />
        <SummaryRow label="WhatsApp" value={data.whatsappPhone} />
        <Divider />
        <SummaryRow label="Negocio" value={data.businessName} />
        <SummaryRow label="Rubro" value={industryLabel} />
        <SummaryRow label="Ciudad" value={data.city} />
        {data.usesBSale && <SummaryRow label="Integra" value="BSale" />}
        <Divider />
        <SummaryRow label="Canal WA" value={channelLabel} />
        <SummaryRow label="Horario" value={`${data.openTime} – ${data.closeTime}`} />
        <SummaryRow label="Días" value={data.days.join(', ') || '—'} />
        <SummaryRow label="Delivery" value={data.delivery ? 'Sí' : 'No'} />
      </div>

      <div style={{ background: 'var(--bg-3)', border: '0.5px solid var(--accent-border)', borderRadius: 14, padding: 24 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>Tu plan</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {selectedCajas.map(caja => (
            <div key={caja.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text)' }}>✓ {caja.name}</span>
              <span style={{ color: 'var(--text-3)' }}>
                {caja.included ? 'Incluida' : caja.price > 0 ? formatCLP(caja.price) : 'Gratis'}
              </span>
            </div>
          ))}
        </div>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Total mensual</p>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 32, letterSpacing: '-0.02em' }}>
            {formatCLP(total)} <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-3)' }}>CLP / mes</span>
          </p>
        </div>
      </div>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ height: '0.5px', background: 'var(--border)', margin: '14px 0' }} />
}

function Success({ firstName }: { firstName: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', color: 'var(--accent)', fontSize: 24,
      }}>
        ✓
      </div>
      <h1 style={{
        fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 2.8rem)',
        fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 14,
      }}>
        {firstName ? `${firstName}, ` : ''}recibimos tu solicitud.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 300, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
        Te escribimos por WhatsApp en las próximas horas para coordinar el pago y el lanzamiento de tu presencia digital.
      </p>
      <a href="/" style={{
        display: 'inline-block', padding: '12px 26px', fontSize: 14,
        background: 'var(--text)', color: 'var(--bg)',
        borderRadius: 10, textDecoration: 'none', fontWeight: 500,
      }}>
        Volver al inicio
      </a>
    </div>
  )
}
