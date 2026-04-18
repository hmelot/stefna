/**
 * Static site generator for client websites.
 *
 * Takes template + content + photos → generates HTML.
 * Served via Worker at /site/[clientId] or via subdomain routing.
 * When approved, deployed to client's custom domain via CF Pages.
 */

import { imageDeliveryUrl } from './images'

export type SiteContent = {
  business_name: string
  description: string
  city: string
  phone?: string
  whatsapp?: string
  hours?: { open: string; close: string; days: string[] }
  delivery?: { enabled: boolean; zones?: string }
  photos: { image_id: string; slot?: string }[]
  menu_items?: { name: string; price_clp: number | null; description?: string | null; category?: string | null }[]
  template: 'minimal' | 'modern' | 'classic' | 'bold'
}

const COMMON_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.6;color:#1a1a1a}
  img{max-width:100%;display:block}
  a{color:inherit;text-decoration:none}
  .container{max-width:1080px;margin:0 auto;padding:0 24px}
  @media(max-width:640px){.container{padding:0 16px}}
`

function formatCLP(n: number | null): string {
  if (n === null || n === undefined) return 'Consultar'
  return '$' + n.toLocaleString('es-CL')
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function renderMinimal(c: SiteContent, hash: string): string {
  const heroPhoto = c.photos[0] ? imageDeliveryUrl(hash, c.photos[0].image_id, 'hero') : null
  const gallery = c.photos.slice(1, 7)
  const hoursText = c.hours ? `${c.hours.open} – ${c.hours.close} · ${c.hours.days.join(', ')}` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(c.business_name)} — ${escape(c.city)}</title>
  <meta name="description" content="${escape(c.description)}">
  <style>
    ${COMMON_CSS}
    body{background:#fafaf7;color:#111}
    .hero{padding:120px 24px 80px;text-align:center}
    .hero h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:400;letter-spacing:-0.02em;margin-bottom:16px;font-family:Georgia,serif}
    .hero p{font-size:18px;color:#555;max-width:560px;margin:0 auto;font-weight:300}
    .hero-img{max-width:800px;margin:48px auto 0;border-radius:8px;overflow:hidden}
    section{padding:60px 24px}
    .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;max-width:1080px;margin:0 auto}
    .gallery img{aspect-ratio:4/3;object-fit:cover;border-radius:6px}
    .menu{max-width:720px;margin:0 auto}
    .menu h2{font-size:28px;font-weight:400;margin-bottom:32px;text-align:center;font-family:Georgia,serif}
    .menu-item{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e5e5e2}
    .menu-item:last-child{border:none}
    .menu-item-name{font-size:15px}
    .menu-item-price{font-weight:500;color:#444}
    .info{text-align:center;padding:60px 24px;background:#fff;border-top:1px solid #e5e5e2}
    .info p{color:#555;font-size:15px;margin-bottom:8px}
    .cta{display:inline-block;margin-top:16px;padding:14px 32px;background:#111;color:#fff;border-radius:8px;font-weight:500}
  </style>
</head>
<body>
  <header class="hero">
    <h1>${escape(c.business_name)}</h1>
    <p>${escape(c.description)}</p>
    ${heroPhoto ? `<div class="hero-img"><img src="${heroPhoto}" alt="${escape(c.business_name)}"></div>` : ''}
  </header>
  ${gallery.length > 0 ? `<section><div class="gallery">${gallery.map(p => `<img src="${imageDeliveryUrl(hash, p.image_id, 'gallery')}" alt="${escape(c.business_name)}">`).join('')}</div></section>` : ''}
  ${c.menu_items && c.menu_items.length > 0 ? `
    <section class="menu">
      <h2>Nuestra carta</h2>
      ${c.menu_items.map(i => `
        <div class="menu-item">
          <div>
            <div class="menu-item-name">${escape(i.name)}</div>
            ${i.description ? `<div style="font-size:13px;color:#777;margin-top:2px">${escape(i.description)}</div>` : ''}
          </div>
          <div class="menu-item-price">${formatCLP(i.price_clp)}</div>
        </div>
      `).join('')}
    </section>
  ` : ''}
  <section class="info">
    <p><strong>${escape(c.city)}</strong></p>
    ${hoursText ? `<p>${escape(hoursText)}</p>` : ''}
    ${c.whatsapp ? `<a class="cta" href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}">Escríbenos por WhatsApp →</a>` : ''}
  </section>
</body>
</html>`
}

// Other templates use the same structure with different styling
function renderWithStyle(c: SiteContent, hash: string, bodyStyle: string, heroStyle: string, accent: string): string {
  const heroPhoto = c.photos[0] ? imageDeliveryUrl(hash, c.photos[0].image_id, 'hero') : null
  const gallery = c.photos.slice(1, 7)
  const hoursText = c.hours ? `${c.hours.open} – ${c.hours.close} · ${c.hours.days.join(', ')}` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(c.business_name)} — ${escape(c.city)}</title>
  <meta name="description" content="${escape(c.description)}">
  <style>
    ${COMMON_CSS}
    ${bodyStyle}
    .hero{${heroStyle}}
    .hero h1{font-size:clamp(2.5rem,6vw,4.5rem);letter-spacing:-0.02em;margin-bottom:16px}
    .hero p{font-size:18px;max-width:560px;margin:0 auto;font-weight:300;opacity:0.85}
    .hero-img{max-width:900px;margin:48px auto 0;border-radius:12px;overflow:hidden}
    section{padding:80px 24px}
    .gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;max-width:1080px;margin:0 auto}
    .gallery img{aspect-ratio:4/3;object-fit:cover;border-radius:10px}
    .menu{max-width:720px;margin:0 auto}
    .menu h2{font-size:36px;margin-bottom:40px;text-align:center;font-weight:400}
    .menu-item{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.1)}
    .menu-item-price{font-weight:600;color:${accent}}
    .info{text-align:center;padding:80px 24px}
    .cta{display:inline-block;margin-top:16px;padding:14px 32px;background:${accent};color:#fff;border-radius:8px;font-weight:500}
  </style>
</head>
<body>
  <header class="hero">
    <h1>${escape(c.business_name)}</h1>
    <p>${escape(c.description)}</p>
    ${heroPhoto ? `<div class="hero-img"><img src="${heroPhoto}" alt="${escape(c.business_name)}"></div>` : ''}
  </header>
  ${gallery.length > 0 ? `<section><div class="gallery">${gallery.map(p => `<img src="${imageDeliveryUrl(hash, p.image_id, 'gallery')}" alt="${escape(c.business_name)}">`).join('')}</div></section>` : ''}
  ${c.menu_items && c.menu_items.length > 0 ? `
    <section class="menu">
      <h2>Nuestra carta</h2>
      ${c.menu_items.map(i => `
        <div class="menu-item">
          <div>
            <div>${escape(i.name)}</div>
            ${i.description ? `<div style="font-size:13px;opacity:0.7;margin-top:2px">${escape(i.description)}</div>` : ''}
          </div>
          <div class="menu-item-price">${formatCLP(i.price_clp)}</div>
        </div>
      `).join('')}
    </section>
  ` : ''}
  <section class="info">
    <p style="font-size:18px;font-weight:500;margin-bottom:4px">${escape(c.city)}</p>
    ${hoursText ? `<p style="opacity:0.7">${escape(hoursText)}</p>` : ''}
    ${c.whatsapp ? `<a class="cta" href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}">Escríbenos por WhatsApp →</a>` : ''}
  </section>
</body>
</html>`
}

export function generateSite(content: SiteContent, imagesHash: string): string {
  switch (content.template) {
    case 'minimal':
      return renderMinimal(content, imagesHash)
    case 'modern':
      return renderWithStyle(content, imagesHash,
        'body{background:#0f0f0f;color:#f5f5f5;font-family:system-ui,sans-serif}',
        'padding:140px 24px 100px;text-align:center;background:linear-gradient(180deg,#1a1a1a,#0f0f0f)',
        '#5DCAA5')
    case 'classic':
      return renderWithStyle(content, imagesHash,
        'body{background:#f8f5f0;color:#2a2417;font-family:Georgia,serif}',
        'padding:120px 24px 80px;text-align:center',
        '#8B6F47')
    case 'bold':
      return renderWithStyle(content, imagesHash,
        'body{background:#ff5722;color:#fff;font-family:Impact,sans-serif;text-transform:uppercase}',
        'padding:140px 24px 100px;text-align:center',
        '#000')
    default:
      return renderMinimal(content, imagesHash)
  }
}
