/**
 * Onboarding task catalog — defines what tasks each caja generates
 * when a client completes signup.
 *
 * Each task is a small unit of work (2-5 min for the client) that unlocks
 * progress in the Mission Control portal.
 */

export type TaskDefinition = {
  caja: string
  task_key: string
  title: string
  description: string
  order_num: number
  required: boolean  // if true, blocks caja from going live
}

export const TASKS_BY_CAJA: Record<string, TaskDefinition[]> = {
  web: [
    { caja: 'web', task_key: 'upload_photos', title: 'Sube fotos de tu local', description: '5-10 fotos. Exterior, interior, productos, equipo. Mientras más, mejor.', order_num: 1, required: true },
    { caja: 'web', task_key: 'pick_template', title: 'Elige el estilo de tu web', description: 'Te mostramos 4 estilos. Elige el que más te represente.', order_num: 2, required: true },
    { caja: 'web', task_key: 'confirm_content', title: 'Revisa el texto de tu web', description: 'Armamos un borrador con tus datos. Confirma o edita lo que quieras.', order_num: 3, required: false },
    { caja: 'web', task_key: 'choose_domain', title: 'Tu dominio', description: 'Nuevo (te lo registramos) o usa uno que ya tengas.', order_num: 4, required: true },
  ],
  whatsapp: [
    { caja: 'whatsapp', task_key: 'confirm_number', title: 'Confirma tu número de WhatsApp', description: 'Te enviaremos un código para verificar que es tuyo.', order_num: 1, required: true },
    { caja: 'whatsapp', task_key: 'upload_menu', title: 'Sube tu carta o catálogo', description: 'Foto, PDF o imagen. Lo transcribimos automáticamente con precios.', order_num: 2, required: true },
    { caja: 'whatsapp', task_key: 'confirm_menu', title: 'Revisa tu catálogo', description: 'Te mostramos lo que extrajimos. Confirma o edita.', order_num: 3, required: true },
    { caja: 'whatsapp', task_key: 'pick_tone', title: 'Personalidad de tu asistente', description: 'Formal, cercano o muy informal. Cómo quieres que responda.', order_num: 4, required: true },
    { caja: 'whatsapp', task_key: 'test_chat', title: 'Prueba una conversación', description: 'Escríbele un mensaje y ve cómo responde tu asistente.', order_num: 5, required: false },
  ],
  seo: [
    { caja: 'seo', task_key: 'confirm_address', title: 'Confirma tu dirección exacta', description: 'Necesitamos el pin exacto para Google Maps.', order_num: 1, required: true },
    { caja: 'seo', task_key: 'upload_exterior', title: 'Sube 3 fotos del exterior', description: 'Para tu ficha de Google Business Profile.', order_num: 2, required: true },
    { caja: 'seo', task_key: 'describe_specialty', title: '¿Cuál es tu especialidad?', description: 'Una frase que te defina. Ej: charcutería artesanal, tablas de quesos.', order_num: 3, required: true },
  ],
  social: [
    { caja: 'social', task_key: 'connect_accounts', title: 'Conecta Instagram y Facebook', description: 'Un click para autorizar. No tocamos tu cuenta sin permiso.', order_num: 1, required: true },
    { caja: 'social', task_key: 'brand_voice', title: 'Tu voz de marca', description: 'Quiz rápido. Ayuda a que los posts suenen como tú.', order_num: 2, required: true },
    { caja: 'social', task_key: 'upload_content', title: 'Sube 20-30 fotos para contenido', description: 'Fotos para las próximas semanas de publicaciones.', order_num: 3, required: false },
  ],
  payments: [
    { caja: 'payments', task_key: 'connect_mp', title: 'Conecta MercadoPago', description: 'Un click para autorizar. Si no tienes cuenta, te ayudamos a crearla.', order_num: 1, required: true },
  ],
  dashboard: [],  // Dashboard se arma solo cuando todo lo demás está listo
  general: [
    { caja: 'general', task_key: 'upload_logo', title: 'Sube tu logo', description: 'Opcional, pero ayuda mucho si lo tienes.', order_num: 1, required: false },
    { caja: 'general', task_key: 'describe_business', title: 'Describe tu negocio en 1-2 frases', description: 'Lo que te hace único. Lo usamos en todos lados.', order_num: 2, required: true },
  ],
}

/** Given the cajas a client selected, return the full list of tasks to create. */
export function tasksForClient(cajas: string[]): TaskDefinition[] {
  const tasks: TaskDefinition[] = [...TASKS_BY_CAJA.general]
  for (const caja of cajas) {
    const cajaTasks = TASKS_BY_CAJA[caja]
    if (cajaTasks) tasks.push(...cajaTasks)
  }
  return tasks
}

/** Progress calculation: completed required tasks / total required tasks */
export function calcProgress(
  tasks: { bucket: string; task_key: string; caja: string }[],
  cajas: string[]
): { completed: number; total: number; percent: number } {
  const allDefs = tasksForClient(cajas)
  const requiredDefs = allDefs.filter(t => t.required)
  const completedKeys = new Set(
    tasks.filter(t => t.bucket === 'completed').map(t => `${t.caja}:${t.task_key}`)
  )
  const completed = requiredDefs.filter(d => completedKeys.has(`${d.caja}:${d.task_key}`)).length
  const total = requiredDefs.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percent }
}
