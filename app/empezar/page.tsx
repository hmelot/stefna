'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { PlanId, Industry, WhatsappChannel } from '../lib/types'
import { PLANS, getPlan, recommendedPlanFor } from '../lib/plans'
import { INDUSTRIES, INDUSTRY_LABELS, WEEKDAYS, type Weekday } from '../lib/labels'
import { isValidEmail, isValidPhone } from '../lib/validation'
import { API_URL, ONBOARDING_STORAGE_KEY } from '../lib/constants'

const VALID_PLAN_IDS = new Set<string>(PLANS.map(p => p.id))

// Suspense boundary required for useSearchParams with output: 'export'
export default function EmpezarPage() {
  return (
    <Suspense>
      <Empezar />
    </Suspense>
  )
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
  plan: PlanId | ''
}

const INITIAL: FormData = {
  name: '', email: '', whatsappPhone: '',
  businessName: '', industry: '', city: 'Santiago', usesBSale: false,
  whatsappChannel: '', openTime: '09:00', closeTime: '20:00',
  days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], delivery: false,
  plan: '',
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

function Empezar() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const hydrated = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (saved) setData(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch {
      // Corrupt draft — start fresh
    }

    // Pre-fill plan from ?plan= query param (e.g. /empezar?plan=complete)
    const planParam = searchParams.get('plan')
    if (planParam && VALID_PLAN_IDS.has(planParam)) {
      setData(prev => ({ ...prev, plan: planParam as PlanId }))
    }

    hydrated.current = true
  }, [searchParams])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Quota or disabled storage — best effort only.
    }
  }, [data])

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData(d => ({ ...d, [key]: value }))

  const canAdvance = (): boolean => {
    if (step === 1) return !!data.name.trim() && isValidEmail(data.email) && isValidPhone(data.whatsappPhone)
    if (step === 2) return !!data.businessName.trim() && !!data.industry && !!data.city.trim()
    if (step === 3) return !!data.whatsappChannel && data.days.length > 0 && !!data.openTime && !!data.closeTime
    if (step === 4) return !!data.plan
    return true
  }

  const recommended: PlanId | null = data.industry ? recommendedPlanFor[data.industry] : null

  const finalize = async () => {
    setSubmitState('submitting')
    try {
      const response = await fetch(`${API_URL}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
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

      <section style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px 96px' }}>
        {submitState === 'success' ? (
          <Success firstName={data.name.split(' ')[0] || ''} />
        ) : (
          <>
            {step === 1 && <Step1 data={data} update={update} />}
            {step === 2 && <Step2 data={data} update={update} />}
            {step === 3 && <Step3 data={data} update={update} />}
            {step === 4 && <Step4 data={data} update={update} recommended={recommended} />}
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
                    background: 'var(--accent)', color: 'var(--bg)',
                    border: 'none', borderRadius: 10,
                    cursor: submitState === 'submitting' ? 'wait' : 'pointer',
                    opacity: submitState === 'submitting' ? 0.6 : 1,
                  }}
                >
                  {submitState === 'submitting' ? 'Enviando…' : 'Ir a pagar →'}
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

function Step4({ data, update, recommended }: StepProps & { recommended: PlanId | null }) {
  const industryLabel = data.industry ? INDUSTRY_LABELS[data.industry].toLowerCase() : ''
  return (
    <>
      <StepHeader
        k="04 · Plan"
        title="Elige tu plan."
        subtitle={recommended
          ? `Para ${industryLabel} recomendamos el plan ${getPlan(recommended).name}.`
          : 'Todos sin contrato. Cancelas cuando quieras.'}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PLANS.map(plan => {
          const active = data.plan === plan.id
          const isRecommended = recommended === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              aria-pressed={active}
              onClick={() => update('plan', plan.id)}
              style={{
                textAlign: 'left', padding: '20px 22px',
                background: active ? 'var(--bg-3)' : 'var(--bg-2)',
                border: `0.5px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                borderRadius: 14, cursor: 'pointer', fontFamily: 'var(--sans)',
                position: 'relative', transition: 'all 0.15s',
              }}
            >
              {isRecommended && (
                <span style={{
                  position: 'absolute', top: 14, right: 16, fontSize: 10, fontWeight: 500,
                  color: 'var(--accent)', background: 'var(--accent-dim)',
                  padding: '3px 10px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase',
                  border: '0.5px solid var(--accent-border)',
                }}>
                  Recomendado
                </span>
              )}
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{plan.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 300, marginBottom: 14 }}>{plan.description}</p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '-0.02em' }}>
                ${plan.price} <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-3)' }}>CLP / mes</span>
              </p>
            </button>
          )
        })}
      </div>
    </>
  )
}

function Step5({ data }: { data: FormData }) {
  const plan = data.plan ? getPlan(data.plan) : null
  const industryLabel = data.industry ? INDUSTRY_LABELS[data.industry] : '—'
  const channelLabel = data.whatsappChannel === 'existing' ? 'Ya tiene número' : data.whatsappChannel === 'new' ? 'Necesita nuevo' : '—'
  return (
    <>
      <StepHeader k="05 · Resumen" title="Todo listo." subtitle="Revisa los datos y confirma. Siguiente: pago seguro por MercadoPago." />
      <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
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
      {plan && (
        <div style={{ background: 'var(--bg-3)', border: '0.5px solid var(--accent-border)', borderRadius: 14, padding: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Plan elegido</p>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{plan.name}</p>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 32, letterSpacing: '-0.02em' }}>
            ${plan.price} <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-3)' }}>CLP / mes</span>
          </p>
        </div>
      )}
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
