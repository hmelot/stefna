'use client'
import { useState, useEffect } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 24px',
      background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '0.5px solid var(--border)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          Stefna
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[
              { label: 'Cómo funciona', href: '#como-funciona' },
              { label: 'Qué incluye', href: '#que-incluye' },
              { label: 'Precios', href: '#precios' },
            ].map(({ label, href }) => (
              <a key={href} href={href}
                style={{ fontSize: 14, color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}>
                {label}
              </a>
            ))}
          </div>
          <a href="/empezar" className="nav-cta" style={{
            fontSize: 13, fontWeight: 500,
            padding: '8px 18px',
            background: 'var(--text)', color: 'var(--bg)',
            borderRadius: 8, textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Empezar
          </a>
        </div>
      </div>
    </nav>
  )
}
