// Stefna — Sistema de identidad de marca

export const brand = {
  nombre: "Stefna",
  significado: "Rumbo en nórdico antiguo",
  tagline: "Tu negocio, en rumbo.",
  
  colores: {
    negro: "#0a0a0a",       // fondo principal
    negro2: "#111111",      // secciones alternas
    negro3: "#1a1a1a",      // elementos destacados
    teal: "#5DCAA5",        // acento único — el único color
    blanco: "#ffffff",
    crema: "#f5f5f3",       // fondo light (mockups)
  },

  tipografia: {
    display: "DM Serif Display",  // logos, títulos grandes, énfasis italic
    sans: "DM Sans",              // todo lo demás
    pesos: [300, 400, 500],       // nunca 600 ni 700
  },

  alma: {
    nombre: "Alma",
    descripcion: "La encargada de WhatsApp de cada negocio. Responde con la personalidad del negocio que representa.",
    escala: "Si no sabe responder, escala al dueño con: 'Esa pregunta me la reservo para [dueño], que te va a poder responder mejor que yo. Te contacta en breve.'",
    espera: "Si el dueño no responde en 30 min: 'Todavía estamos coordinando para responderte bien. Te escribimos apenas tengamos la respuesta, prometido.'",
  },

  tono: {
    si: ["Cercano sin ser informal", "Directo sin ser frío", "Confiable sin ser aburrido"],
    no: ["Nunca mencionar IA, agentes o tecnología", "No somos agencia", "No somos app que el cliente configura"],
    frases: {
      si: ["Tu negocio, en rumbo", "Tú no tocas nada", "Listo en 72 horas", "Armado y operado por nosotros"],
      no: ["Solución de IA", "Plataforma omnicanal", "Agentes inteligentes", "Transformación digital"],
    },
  },

  corte: {
    dia1: "Hola, te escribimos desde Stefna. Tu pago de este mes no llegó todavía — puede ser un error del sistema. Si quieres regularizarlo, aquí está el link: [link]. Cualquier duda, responde este mensaje.",
    dia5: "Hola, en este momento estamos haciendo mantención en tu cuenta. Tu encargado vuelve pronto. Para resolver esto rápido: [link de pago].",
    dia15: "Este negocio está tomando un descanso. Si eres el dueño, escríbenos a hola@stefna.app.",
  },
}

export default brand
