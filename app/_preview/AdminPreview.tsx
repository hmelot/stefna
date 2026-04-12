'use client'
// Design reference — NOT routed. See ./README.md.

import Metric from '../components/ui/Metric'
import Panel from '../components/ui/Panel'
import { formatCLP, statusColor } from '../lib/format'
import type { Status, PlanId } from '../lib/types'
import { TARGET_CLIENTS } from '../lib/constants'

type HealthCheck = { key: string; status: Status; detail: string }

type Customer = {
  name: string
  industry: string
  city: string
  plan: PlanId
  mrr: number
  health: HealthCheck[]
}

const PLAN_LABEL: Record<PlanId, string> = {
  starter: 'Arranque',
  complete: 'Completo',
  total: 'Total',
}

const CUSTOMERS: Customer[] = [
  {
    name: 'Panadería Don Luis', industry: 'Panadería', city: 'Santiago', plan: 'complete', mrr: 149_000,
    health: [
      { key: 'WA', status: 'green', detail: '97 conv / 7d' },
      { key: 'Web', status: 'green', detail: 'uptime 100%' },
      { key: 'Cobros', status: 'green', detail: '63 pagos ok' },
      { key: 'SEO', status: 'amber', detail: 'pos. 8 → 11' },
      { key: 'Pago', status: 'green', detail: 'al día' },
      { key: 'Actividad', status: 'green', detail: 'login ayer' },
    ],
  },
  {
    name: 'Deli Fernando', industry: 'Charcutería', city: 'Providencia', plan: 'complete', mrr: 149_000,
    health: [
      { key: 'WA', status: 'green', detail: '214 conv / 7d' },
      { key: 'Web', status: 'green', detail: 'uptime 100%' },
      { key: 'Cobros', status: 'green', detail: '88 pagos ok' },
      { key: 'SEO', status: 'green', detail: 'pos. 2' },
      { key: 'Pago', status: 'green', detail: 'al día' },
      { key: 'Actividad', status: 'green', detail: 'login hoy' },
    ],
  },
  {
    name: 'Bar Esquina', industry: 'Bar/Botillería', city: 'Ñuñoa', plan: 'starter', mrr: 49_000,
    health: [
      { key: 'WA', status: 'green', detail: 'sin encargado' },
      { key: 'Web', status: 'green', detail: 'uptime 99.9%' },
      { key: 'Cobros', status: 'amber', detail: '2 links caducos' },
      { key: 'SEO', status: 'red', detail: 'no indexado' },
      { key: 'Pago', status: 'amber', detail: '-3 días' },
      { key: 'Actividad', status: 'red', detail: 'sin login 12d' },
    ],
  },
  {
    name: 'Taller Álvarez', industry: 'Taller', city: 'Maipú', plan: 'starter', mrr: 49_000,
    health: [
      { key: 'WA', status: 'green', detail: 'sin encargado' },
      { key: 'Web', status: 'green', detail: 'uptime 100%' },
      { key: 'Cobros', status: 'green', detail: '4 pagos ok' },
      { key: 'SEO', status: 'green', detail: 'pos. 4' },
      { key: 'Pago', status: 'green', detail: 'al día' },
      { key: 'Actividad', status: 'amber', detail: 'sin login 5d' },
    ],
  },
]

const SETUP_IN_PROGRESS = [
  { name: 'Café Lupe', step: 4, total: 6, label: 'WhatsApp en configuración' },
  { name: 'Librería Atlas', step: 2, total: 6, label: 'Dominio propagando' },
  { name: 'Peluquería Sur', step: 5, total: 6, label: 'Cobros conectados' },
]

const OPERATIONS_LOG: { time: string; message: string; kind: 'ok' | 'warn' }[] = [
  { time: '09:42', message: 'Encargado respondió 3 mensajes en Deli Fernando', kind: 'ok' },
  { time: '09:15', message: 'Alerta SEO: Bar Esquina cayó 4 posiciones', kind: 'warn' },
  { time: '08:58', message: 'Cobro exitoso $28.400 en Panadería Don Luis', kind: 'ok' },
  { time: '08:30', message: 'Setup paso 5/6 completado en Peluquería Sur', kind: 'ok' },
  { time: 'Ayer', message: 'Taller Álvarez no ha iniciado sesión en 5 días', kind: 'warn' },
]

const overallStatus = (checks: HealthCheck[]): Status => {
  if (checks.some(c => c.status === 'red')) return 'red'
  if (checks.some(c => c.status === 'amber')) return 'amber'
  return 'green'
}

export default function AdminPreview() {
  const mrr = CUSTOMERS.reduce((acc, c) => acc + c.mrr, 0)
  const projection = (mrr / CUSTOMERS.length) * TARGET_CLIENTS
  const customerStatuses = CUSTOMERS.map(c => ({ customer: c, status: overallStatus(c.health) }))
  const churnRisk = customerStatuses.filter(cs => cs.status !== 'green').length

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <AdminNav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 96px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Motor interno
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 400, letterSpacing: '-0.02em' }}>
            Sala de máquinas.
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          <Metric label="MRR actual" value={formatCLP(mrr)} sub={`${CUSTOMERS.length} clientes`} />
          <Metric label={`Proyección a ${TARGET_CLIENTS}`} value={formatCLP(Math.round(projection))} sub="modelo boutique" />
          <Metric
            label="Churn en riesgo"
            value={`${churnRisk}`}
            sub={`${Math.round((churnRisk / CUSTOMERS.length) * 100)}% de la cartera`}
            warn={churnRisk > 0}
          />
          <Metric label="Setup en curso" value={`${SETUP_IN_PROGRESS.length}`} sub="onboardings activos" />
        </div>

        <section style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
            Semáforo de sanidad — clientes
          </p>
          <div style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr repeat(6, 1fr) 0.5fr',
              padding: '14px 22px', fontSize: 11, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              borderBottom: '0.5px solid var(--border)',
            }}>
              <span>Cliente</span>
              <span>Plan</span>
              <span>MRR</span>
              <span>WA</span>
              <span>Web</span>
              <span>Cobros</span>
              <span>SEO</span>
              <span>Pago</span>
              <span>Actividad</span>
              <span>Global</span>
            </div>
            {customerStatuses.map(({ customer, status }) => (
              <div key={customer.name} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr repeat(6, 1fr) 0.5fr',
                padding: '16px 22px', alignItems: 'center',
                borderBottom: '0.5px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{customer.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{customer.industry} · {customer.city}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{PLAN_LABEL[customer.plan]}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{formatCLP(customer.mrr)}</span>
                {customer.health.map(check => (
                  <div key={check.key} title={check.detail} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(check.status) }} />
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{check.detail}</span>
                  </div>
                ))}
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: statusColor(status),
                  boxShadow: `0 0 0 3px ${statusColor(status)}22`,
                }} />
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          <Panel title="Log de operación">
            {OPERATIONS_LOG.map((entry, i) => (
              <div key={`${entry.time}-${i}`} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: i < OPERATIONS_LOG.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', width: 44, flexShrink: 0 }}>{entry.time}</span>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: entry.kind === 'warn' ? '#E0A85A' : '#5DCAA5',
                }} />
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{entry.message}</p>
              </div>
            ))}
          </Panel>

          <Panel title="Setup en curso">
            {SETUP_IN_PROGRESS.map(s => (
              <div key={s.name} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.step}/{s.total}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{s.label}</p>
                <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(s.step / s.total) * 100}%`, height: '100%', background: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </main>
  )
}

function AdminNav() {
  return (
    <nav style={{ padding: '0 24px', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Stefna
          </a>
          <span style={{
            fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)',
            border: '0.5px solid var(--accent-border)', padding: '2px 8px',
            borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          {['Clientes', 'Operación', 'Setup', 'Revenue'].map(x => (
            <span key={x} style={{ fontSize: 13, color: 'var(--text-2)' }}>{x}</span>
          ))}
        </div>
      </div>
    </nav>
  )
}
