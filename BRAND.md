# Stefna — Brand System

> Este archivo es la fuente de verdad de identidad de Stefna.
> Léelo antes de generar cualquier copy, UI, o comunicación.

---

## Nombre y significado

**Stefna** — *rumbo* en nórdico antiguo.
Eso es lo que le damos a cada negocio: un rumbo claro en un mundo que no para de cambiar.

---

## Quiénes somos

Stefna arma y opera la presencia digital de PYMEs latinoamericanas.
Web + canal WhatsApp + cobros + SEO local — todo operado por nosotros.
El cliente no toca nada.

**No somos** una agencia. No somos una app. Somos el equipo digital que el negocio nunca tuvo.

---

## Cliente objetivo

Dueños de PYMEs locales en Chile (expansión Latam).
Rubros: charcuterías, panaderías, cafés, restaurantes, talleres, peluquerías, spas, tiendas.
Perfil: 30–55 años, concreto, desconfiado de lo digital, valora la cercanía y la confiabilidad.
Primer cliente real: Fernando — La Charcutería, Puerto Varas.

---

## Manifiesto

Hay un carpintero que lleva décadas trabajando la misma madera. Que conoce cada veta,
cada nudo, cada herramienta por su nombre. Que hace cosas que ninguna fábrica puede replicar.

Hay una panadera que amasa a las 4am. Un tallerista que arregla lo que otros botan.
Una carnicera que sabe exactamente qué corte necesitas.

Los que no escalan. Los que no franquician. Los que hacen su oficio con cariño, con historia,
con las manos.

El mundo cambió — y no está mal que haya cambiado. Está mal que ese cambio deje atrás
a los que más merecen seguir.

Nosotros existimos para cerrar esa brecha. Armamos su presencia digital, su canal de
WhatsApp, su forma de cobrar — y lo operamos por ellos. Para que sigan haciendo lo que
saben hacer, mejor que nunca, con más cariño que antes.

Porque las herramientas más poderosas del mundo no deberían ser solo para los grandes.

Stefna significa rumbo en nórdico antiguo. Eso es lo que le damos a cada negocio:
un rumbo claro en un mundo que no para de cambiar.

---

## Paleta de colores

| Nombre        | Hex       | Uso                                      |
|---------------|-----------|------------------------------------------|
| Negro cálido  | `#0F0E0C` | Fondo principal — base de todo           |
| Verde Tompkins| `#003300` | Acento único — fórmula 3 negro : 2 verde |
| Terracota     | `#C17A5A` | Secundario — calidez, CTAs, highlights   |
| Arena         | `#D4C5B0` | Neutro medio                             |
| Crema cálida  | `#F2EDE4` | Fondo claro — dashboards, interfaces     |

**Regla:** El verde Tompkins es el único acento en fondos oscuros.
La terracota es el acento de acción en interfaces claras.
Nunca usar ambos juntos en el mismo elemento.

**Origen del verde:** Fórmula oficial del Parque Nacional Pumalín Douglas Tompkins —
3 partes negro + 2 partes verde. Usado en señalética y estructuras del parque.
Plasticote 13. Representa la Ecología Profunda de Tompkins.

---

## Tipografía

| Rol              | Fuente              | Peso       | Uso                              |
|------------------|---------------------|------------|----------------------------------|
| Display / logo   | Libre Baskerville   | 700        | Logos, títulos grandes, heroes   |
| Énfasis / citas  | Libre Baskerville   | 400 italic | Frases del manifiesto, citas     |
| Títulos UI       | Nunito              | 600        | Headings en dashboard            |
| Cuerpo           | Nunito              | 300 / 400  | Textos largos, descripciones     |
| Etiquetas        | Nunito              | 600        | Uppercase + letter-spacing       |

**Por qué Libre Baskerville:** Espíritu Belwe/Patagonia — robusto, cálido, artesanal.
Serifas con carácter sin ser arcaico. Contrasta perfectamente con Nunito redondeado.

---

## Tono de voz

### Somos
- Cercanos sin ser informales
- Directos sin ser fríos
- Confiables sin ser aburridos

### Decimos
- "Tu negocio, en rumbo."
- "Tú no tocas nada."
- "Listo en 72 horas."
- "Armado y operado por nosotros."

### NUNCA decimos
- "Solución de IA" / "Agentes inteligentes"
- "Plataforma omnicanal"
- "Transformación digital"
- "Automatización" (en comunicación con clientes)

### Regla de oro
El cliente Fernando no sabe que hay IA detrás. No tiene que saberlo.
Alma es su encargada. Punto.

---

## Alma — encargada de WhatsApp

**Nombre:** Alma
**Personalidad:** Responde con la voz y estilo del negocio que representa.
**Tono:** Cálido, ágil, nunca robótico.

**Escalada al dueño:**
> "Esa pregunta me la reservo para [dueño], que te va a poder responder mejor que yo.
> Te contacta en breve — ¿te parece?"

**Si el dueño no responde en 30 min:**
> "Todavía estamos coordinando para responderte bien.
> Te escribimos apenas tengamos la respuesta, prometido."

---

## Mensajes de corte por impago

**Día 1 — recordatorio amable:**
> "Hola, te escribimos desde Stefna. Tu pago de este mes no llegó todavía —
> puede ser un error del sistema. Si quieres regularizarlo: [link]. Cualquier duda, responde este mensaje."

**Día 5 — Alma en modo silencioso:**
> "Hola, en este momento estamos haciendo mantención en tu cuenta.
> Tu encargado vuelve pronto. Para resolver esto rápido: [link de pago]."

**Día 15 — corte total (web muestra):**
> "Este negocio está tomando un descanso.
> Si eres el dueño, escríbenos a hola@stefna.app."

---

## Rutas y accesos

| Ruta                  | Quién la ve        | Estado     |
|-----------------------|--------------------|------------|
| stefna.app/           | Todos              | Live       |
| stefna.app/empezar    | Clientes nuevos    | Construir  |
| stefna.app/casos/[x]  | Todos (SEO)        | Construir  |
| stefna.app/dashboard  | Cliente autenticado| Construir  |
| stefna.app/admin      | Solo Horacio       | Construir  |
| stefna.app/mockups    | Solo Horacio       | Live (CF Access) |

---

## Stack técnico

- Frontend: Next.js 14 static export → Cloudflare Pages
- Backend: Cloudflare Workers + D1 (SQLite) + R2
- Auth clientes: Cloudflare Access
- AI: Anthropic Claude API (Alma + agentes internos)
- Pagos: MercadoPago
- WhatsApp: Meta Cloud API
- Repo: github.com/hmelot/stefna

---

## Credenciales activas (NO commitear valores reales)

Ver `.env.local` para valores. Variables necesarias:
- `ANTHROPIC_API_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `MP_ACCESS_TOKEN`
- `WA_TOKEN`
- `WA_PHONE_NUMBER_ID`

---

*Última actualización: abril 2026*
*Propietario: Horacio Melot — hmelot@gmail.com*
