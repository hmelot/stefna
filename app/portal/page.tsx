'use client'
import { useEffect, useRef, useState } from 'react'
import { API_URL } from '../lib/constants'

type ClientInfo = {
  name: string
  business_name: string
  industry: string
  city: string
  cajas: string[]
}

type Task = {
  id: number
  caja: string
  task_key: string
  title: string
  description: string
  bucket: 'eventually_due' | 'currently_due' | 'past_due' | 'completed'
  order_num: number
  payload: string | null
  completed_at: string | null
}

type Progress = { completed: number; total: number; percent: number }

type PortalData = {
  client: ClientInfo
  tasks: Task[]
  progress: Progress
}

const CAJA_LABELS: Record<string, { name: string; emoji: string }> = {
  general: { name: 'Lo esencial', emoji: '✨' },
  web: { name: 'Tu web', emoji: '🌐' },
  whatsapp: { name: 'WhatsApp', emoji: '💬' },
  seo: { name: 'Google Maps', emoji: '📍' },
  social: { name: 'Redes sociales', emoji: '📱' },
  payments: { name: 'Cobros', emoji: '💳' },
}

type AuthState = 'loading' | 'login' | 'authenticated' | 'linksent'

export default function PortalPage() {
  return <Portal />
}

function Portal() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [session, setSession] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [data, setData] = useState<PortalData | null>(null)
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    // Check hash for magic link token
    const hash = window.location.hash
    const tokenMatch = hash.match(/token=([^&]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    const saved = sessionStorage.getItem('stefna_portal_session')

    if (token) {
      window.history.replaceState({}, '', '/portal')
      verifyToken(token)
    } else if (saved) {
      checkSession(saved)
    } else {
      setAuthState('login')
    }
  }, [])

  async function verifyToken(token: string) {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ token }),
      })
      const d = await res.json()
      if (d.ok && d.sessionId) {
        sessionStorage.setItem('stefna_portal_session', d.sessionId)
        setSession(d.sessionId)
        setAuthState('authenticated')
        loadPortal(d.sessionId)
      } else {
        setAuthState('login')
      }
    } catch {
      setAuthState('login')
    }
  }

  async function checkSession(sid: string) {
    try {
      const res = await fetch(`${API_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${sid}` },
      })
      const d = await res.json()
      if (d.ok) {
        setSession(sid)
        setAuthState('authenticated')
        loadPortal(sid)
      } else {
        sessionStorage.removeItem('stefna_portal_session')
        setAuthState('login')
      }
    } catch {
      setAuthState('login')
    }
  }

  async function loadPortal(sid: string) {
    try {
      const res = await fetch(`${API_URL}/portal/tasks`, {
        headers: { Authorization: `Bearer ${sid}` },
      })
      if (res.status === 401) {
        // M7 fix: session expired — clear state and send back to login instead of infinite loading
        sessionStorage.removeItem('stefna_portal_session')
        setSession(null)
        setData(null)
        setAuthState('login')
        return
      }
      const d = await res.json()
      if (d.client) setData(d)
    } catch {
      // Network error — leave auth state alone, user can retry
    }
  }

  async function sendMagicLink() {
    try {
      await fetch(`${API_URL}/auth/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email }),
      })
      setAuthState('linksent')
    } catch {}
  }

  async function logout() {
    if (session) {
      try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${session}`, 'X-Requested-With': 'XMLHttpRequest' } })
      } catch {}
    }
    sessionStorage.removeItem('stefna_portal_session')
    setSession(null)
    setData(null)
    setAuthState('login')
  }

  if (authState === 'loading') {
    return <Centered><p style={{ color: 'var(--text-3)', fontSize: 14 }}>Cargando…</p></Centered>
  }

  if (authState === 'linksent') {
    return (
      <Centered>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', color: 'var(--accent)', fontSize: 28,
          }}>✓</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
            Revisa tu email
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.6 }}>
            Te enviamos un link de acceso a <strong>{email}</strong>. Ábrelo desde el mismo navegador donde estás ahora.
          </p>
        </div>
      </Centered>
    )
  }

  if (authState === 'login') {
    return (
      <Centered>
        <div style={{ maxWidth: 380, width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 12, textAlign: 'center' }}>
            Tu panel
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 300, marginBottom: 28, textAlign: 'center', lineHeight: 1.6 }}>
            Escribe tu email y te enviamos un link de acceso.
          </p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            style={{
              width: '100%', padding: '14px 16px', fontSize: 15,
              background: 'var(--bg-2)', color: 'var(--text)',
              border: '0.5px solid var(--border)', borderRadius: 10,
              fontFamily: 'var(--sans)', outline: 'none', marginBottom: 12,
            }}
          />
          <button
            onClick={sendMagicLink}
            disabled={!email.trim()}
            style={{
              width: '100%', padding: '14px', fontSize: 14, fontWeight: 500,
              background: email.trim() ? 'var(--text)' : 'var(--bg-3)',
              color: email.trim() ? 'var(--bg)' : 'var(--text-3)',
              border: 'none', borderRadius: 10,
              cursor: email.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--sans)',
            }}
          >
            Enviarme el link →
          </button>
        </div>
      </Centered>
    )
  }

  // Authenticated
  if (!data) {
    return <Centered><p style={{ color: 'var(--text-3)', fontSize: 14 }}>Cargando tu panel…</p></Centered>
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      <PortalHeader client={data.client} onLogout={logout} />
      <MissionControl data={data} session={session!} reload={() => loadPortal(session!)} />
    </main>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {children}
    </main>
  )
}

function PortalHeader({ client, onLogout }: { client: ClientInfo; onLogout: () => void }) {
  return (
    <header style={{
      padding: '18px 24px', borderBottom: '0.5px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      maxWidth: 960, margin: '0 auto',
    }}>
      <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
        Stefna
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {client.business_name}
        </p>
        <button onClick={onLogout} style={{
          fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'var(--sans)',
        }}>
          Salir
        </button>
      </div>
    </header>
  )
}

function MissionControl({ data, session, reload }: { data: PortalData; session: string; reload: () => void }) {
  const firstName = data.client.name.split(' ')[0]
  const { percent, completed, total } = data.progress
  const [stagingUrl, setStagingUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!data.client.cajas.includes('web')) return
    fetch(`${API_URL}/portal/site-preview`, { headers: { Authorization: `Bearer ${session}` } })
      .then(r => r.json())
      .then(d => { if (d.staging_url) setStagingUrl(d.staging_url) })
      .catch(() => {})
  }, [session, data])

  // Group tasks by caja
  const tasksByCaja = data.tasks.reduce((acc, t) => {
    if (!acc[t.caja]) acc[t.caja] = []
    acc[t.caja].push(t)
    return acc
  }, {} as Record<string, Task[]>)

  const cajaOrder = ['general', 'web', 'whatsapp', 'seo', 'social', 'payments']
  const orderedCajas = cajaOrder.filter(c => tasksByCaja[c]?.length > 0)

  const progressMessage = percent === 100
    ? 'Todo listo. Estamos lanzando tu negocio.'
    : percent >= 75
    ? 'Casi listo. Ya casi te lanzamos.'
    : percent >= 50
    ? 'A la mitad. Lo más fácil ya lo hiciste.'
    : percent >= 25
    ? 'Vas bien. Sigue así.'
    : 'Empecemos. Cada tarea toma 2-5 minutos.'

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>
      {/* Status hero */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>
          Tu misión
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.2 }}>
          {firstName}, tu negocio está a {total - completed} {total - completed === 1 ? 'tarea' : 'tareas'} de estar online.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 300, marginBottom: 28, lineHeight: 1.5 }}>
          {progressMessage}
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${percent}%`,
              background: 'var(--accent)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {completed} de {total} tareas · {percent}%
        </p>

        {stagingUrl && (
          <a
            href={stagingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 20, padding: '10px 16px',
              background: 'var(--accent-dim)', border: '0.5px solid var(--accent-border)',
              color: 'var(--accent)', fontSize: 13, fontWeight: 500,
              borderRadius: 10, textDecoration: 'none',
            }}
          >
            👁 Ver cómo va tu web →
          </a>
        )}
      </div>

      {/* Task groups by caja */}
      {orderedCajas.map(caja => {
        const label = CAJA_LABELS[caja] || { name: caja, emoji: '•' }
        const tasks = tasksByCaja[caja]
        const cajaCompleted = tasks.filter(t => t.bucket === 'completed').length
        return (
          <div key={caja} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{label.emoji}</span>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {label.name}
                </h2>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {cajaCompleted}/{tasks.length}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(t => (
                <TaskCard key={t.id} task={t} session={session} reload={reload} />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

function TaskCard({ task, session, reload }: { task: Task; session: string; reload: () => void }) {
  const done = task.bucket === 'completed'
  const [expanded, setExpanded] = useState(false)

  async function completeTask(payload?: any) {
    try {
      await fetch(`${API_URL}/portal/task/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${session}` },
        body: JSON.stringify({ payload }),
      })
      reload()
    } catch {}
  }

  return (
    <div style={{
      padding: '16px 18px',
      background: done ? 'rgba(74,138,74,0.05)' : 'var(--bg-2)',
      border: done ? '0.5px solid var(--accent-border)' : '0.5px solid var(--border)',
      borderRadius: 12,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Checkbox */}
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
          background: done ? 'var(--accent)' : 'transparent',
          border: done ? '1.5px solid var(--accent)' : '1.5px solid var(--border-hover)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {done && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: done ? 'var(--text-3)' : 'var(--text)', marginBottom: 2, textDecoration: done ? 'line-through' : 'none' }}>
            {task.title}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.5 }}>
            {task.description}
          </p>
          {!done && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  padding: '8px 14px', fontSize: 13, fontWeight: 500,
                  background: 'var(--text)', color: 'var(--bg)',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
              >
                {expanded ? 'Cerrar' : 'Empezar →'}
              </button>
            </div>
          )}
          {expanded && !done && (
            <TaskDetail task={task} onComplete={completeTask} session={session} />
          )}
        </div>
      </div>
    </div>
  )
}

function TaskDetail({ task, onComplete, session }: { task: Task; onComplete: (payload?: any) => void; session: string }) {
  // Task-specific UI based on task_key
  switch (task.task_key) {
    case 'upload_photos':
    case 'upload_exterior':
    case 'upload_content':
    case 'upload_menu':
    case 'upload_logo':
      return <UploadTask task={task} onComplete={onComplete} session={session} />
    case 'describe_business':
    case 'describe_specialty':
      return <TextareaTask task={task} onComplete={onComplete} placeholder="Cuéntanos en tus palabras…" />
    case 'pick_template':
      return <TemplatePicker onComplete={onComplete} />
    case 'pick_tone':
      return <TonePicker onComplete={onComplete} />
    case 'choose_domain':
      return <DomainPicker onComplete={onComplete} />
    case 'confirm_number':
    case 'confirm_address':
      return <ConfirmTask task={task} onComplete={onComplete} />
    default:
      return (
        <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-3)', borderRadius: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, fontWeight: 300 }}>
            Esta tarea se completará cuando esté lista en tu panel.
          </p>
          <button onClick={() => onComplete()} style={actionBtnStyle}>Marcar como listo</button>
        </div>
      )
  }
}

function UploadTask({ task, onComplete, session }: { task: Task; onComplete: (payload?: any) => void; session: string }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    const kind = task.task_key === 'upload_menu' ? 'menu'
      : task.task_key === 'upload_logo' ? 'logo'
      : task.task_key === 'upload_exterior' ? 'exterior'
      : 'photo'

    const ids: string[] = []
    for (const file of Array.from(files)) {
      try {
        // Get upload URL
        const urlRes = await fetch(`${API_URL}/portal/upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${session}` },
          body: JSON.stringify({ kind }),
        })
        const urlData = await urlRes.json()
        if (!urlData.ok) throw new Error(urlData.error || 'upload_url_failed')

        // Upload to CF Images
        const form = new FormData()
        form.append('file', file)
        const up = await fetch(urlData.uploadURL, { method: 'POST', body: form })
        if (!up.ok) throw new Error('cf_upload_failed')

        // Record completion
        await fetch(`${API_URL}/portal/upload-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${session}` },
          body: JSON.stringify({
            imageId: urlData.imageId, kind, slot: task.task_key,
            filename: file.name, sizeBytes: file.size,
          }),
        })
        ids.push(urlData.imageId)
      } catch (e: any) {
        setError('Hubo un problema subiendo una de las fotos. Intenta de nuevo.')
        break
      }
    }
    setUploaded(prev => [...prev, ...ids])
    setUploading(false)
  }

  return (
    <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-3)', borderRadius: 10 }}>
      <label style={{
        display: 'block', padding: '28px', textAlign: 'center',
        border: '2px dashed var(--border-hover)', borderRadius: 10,
        cursor: 'pointer', background: 'var(--bg-2)',
        transition: 'border-color 0.2s',
      }}>
        <input
          type="file"
          accept="image/*"
          multiple={task.task_key !== 'upload_logo'}
          disabled={uploading}
          onChange={e => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          {uploading ? 'Subiendo…' : '📷 Haz click para subir fotos'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
          JPG, PNG o HEIC. Hasta 10 MB cada una.
        </p>
      </label>
      {uploaded.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 12 }}>
          ✓ {uploaded.length} {uploaded.length === 1 ? 'foto subida' : 'fotos subidas'}
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#D9544F', marginTop: 10 }}>{error}</p>
      )}
      {uploaded.length > 0 && !uploading && (
        <button
          onClick={() => onComplete({ uploaded_count: uploaded.length, image_ids: uploaded })}
          style={{ ...actionBtnStyle, marginTop: 14 }}
        >
          Listo, estas son las fotos →
        </button>
      )}
    </div>
  )
}

function TextareaTask({ task, onComplete, placeholder }: { task: Task; onComplete: (payload?: any) => void; placeholder: string }) {
  const [text, setText] = useState('')
  return (
    <div style={{ marginTop: 12 }}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', minHeight: 100, padding: 14, fontSize: 14,
          background: 'var(--bg-3)', color: 'var(--text)',
          border: '0.5px solid var(--border)', borderRadius: 10,
          fontFamily: 'var(--sans)', resize: 'vertical', outline: 'none',
        }}
      />
      <button
        onClick={() => text.trim() && onComplete({ text: text.trim() })}
        disabled={!text.trim()}
        style={{ ...actionBtnStyle, marginTop: 10, opacity: text.trim() ? 1 : 0.5 }}
      >
        Guardar →
      </button>
    </div>
  )
}

const TEMPLATES = [
  { id: 'minimal', name: 'Minimal', desc: 'Fondo limpio, tipografía grande' },
  { id: 'modern', name: 'Moderno', desc: 'Grid con fotos grandes' },
  { id: 'classic', name: 'Clásico', desc: 'Layout tradicional' },
  { id: 'bold', name: 'Impacto', desc: 'Textos enormes, contrastes' },
]

function TemplatePicker({ onComplete }: { onComplete: (payload?: any) => void }) {
  const [selected, setSelected] = useState<string>('')
  return (
    <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-3)', borderRadius: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {TEMPLATES.map(t => {
          const active = selected === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              style={{
                padding: 14, textAlign: 'left',
                background: active ? 'rgba(74,138,74,0.1)' : 'var(--bg-2)',
                border: active ? '1.5px solid var(--accent)' : '0.5px solid var(--border)',
                borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>
                {t.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 300, lineHeight: 1.4 }}>
                {t.desc}
              </p>
            </button>
          )
        })}
      </div>
      <button
        onClick={() => selected && onComplete({ template: selected })}
        disabled={!selected}
        style={{ ...actionBtnStyle, marginTop: 12, opacity: selected ? 1 : 0.5 }}
      >
        Elegir este estilo →
      </button>
    </div>
  )
}

const TONES = [
  { id: 'formal', name: 'Formal', desc: 'Respuestas serias, profesionales' },
  { id: 'cercano', name: 'Cercano', desc: 'Amigable pero profesional' },
  { id: 'informal', name: 'Muy informal', desc: 'Como hablarías con un amigo' },
]

function TonePicker({ onComplete }: { onComplete: (payload?: any) => void }) {
  return (
    <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-3)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {TONES.map(t => (
        <button
          key={t.id}
          onClick={() => onComplete({ tone: t.id })}
          style={{
            padding: 14, textAlign: 'left',
            background: 'var(--bg-2)', border: '0.5px solid var(--border)',
            borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 300 }}>{t.desc}</p>
        </button>
      ))}
    </div>
  )
}

function DomainPicker({ onComplete }: { onComplete: (payload?: any) => void }) {
  const [mode, setMode] = useState<'new' | 'existing' | ''>('')
  const [domain, setDomain] = useState('')
  return (
    <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-3)', borderRadius: 10 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setMode('new')}
          style={{
            flex: 1, padding: 12, fontSize: 13,
            background: mode === 'new' ? 'rgba(74,138,74,0.1)' : 'var(--bg-2)',
            border: mode === 'new' ? '1.5px solid var(--accent)' : '0.5px solid var(--border)',
            borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
            color: mode === 'new' ? 'var(--accent)' : 'var(--text)', fontWeight: 500,
          }}>
          Registrar uno nuevo
        </button>
        <button
          onClick={() => setMode('existing')}
          style={{
            flex: 1, padding: 12, fontSize: 13,
            background: mode === 'existing' ? 'rgba(74,138,74,0.1)' : 'var(--bg-2)',
            border: mode === 'existing' ? '1.5px solid var(--accent)' : '0.5px solid var(--border)',
            borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--sans)',
            color: mode === 'existing' ? 'var(--accent)' : 'var(--text)', fontWeight: 500,
          }}>
          Ya tengo uno
        </button>
      </div>
      {mode && (
        <>
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder={mode === 'new' ? 'miNegocio.cl' : 'tudominio.com'}
            style={{
              width: '100%', padding: 12, fontSize: 14,
              background: 'var(--bg-2)', color: 'var(--text)',
              border: '0.5px solid var(--border)', borderRadius: 10,
              fontFamily: 'var(--sans)', outline: 'none',
            }}
          />
          <button
            onClick={() => domain.trim() && onComplete({ mode, domain: domain.trim() })}
            disabled={!domain.trim()}
            style={{ ...actionBtnStyle, marginTop: 10, opacity: domain.trim() ? 1 : 0.5 }}
          >
            Guardar →
          </button>
        </>
      )}
    </div>
  )
}

function ConfirmTask({ task, onComplete }: { task: Task; onComplete: (payload?: any) => void }) {
  return (
    <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-3)', borderRadius: 10 }}>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, fontWeight: 300, lineHeight: 1.5 }}>
        Esta tarea la activamos pronto. Nosotros nos encargamos de los pasos técnicos.
      </p>
      <button onClick={() => onComplete({ confirmed: true })} style={actionBtnStyle}>
        Entendido →
      </button>
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  padding: '10px 18px', fontSize: 13, fontWeight: 500,
  background: 'var(--text)', color: 'var(--bg)',
  border: 'none', borderRadius: 8, cursor: 'pointer',
  fontFamily: 'var(--sans)',
}
