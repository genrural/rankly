/* =========================================================
   CONFIGURACIÓN DEYSCOM MOTORSPORT
   Edita aquí los datos de contacto, redes y el endpoint
   de Google Sheets. No hace falta tocar nada más.
   ========================================================= */
window.DEYSCOM = {
  // URL del Web App de Google Apps Script (ver README.md → "Conectar formularios a Google Sheets").
  // Mientras esté vacío, los formularios abren WhatsApp con los datos rellenados para no perder ningún lead.
  SHEETS_ENDPOINT: "",

  phone: "+34615972233",
  phoneDisplay: "(+34) 615 97 22 33",
  whatsapp: "34615972233",
  whatsappMsg: "¡Hola Deyscom! Vengo desde la web y quiero información sobre ",
  email: "info@deyscom.com",

  // Horario: 0 = domingo … 6 = sábado. [apertura, cierre] en horas decimales.
  hours: { 1: [7, 15], 2: [7, 15], 3: [7, 15], 4: [7, 15], 5: [7, 15] },

  // Enlaces de pago opcionales (Stripe Payment Links, PayPal…).
  // Curso y experiencias: si se rellenan, el botón "Comprar mi plaza" lleva directamente al pago.
  // Merch: tras confirmar el pedido aparece el botón "Pagar ahora".
  payLinks: {
    "ds-copilot-course": "",
    "ds-pilot-weekend-circuit": "",
    "ds-pilot-weekend-rally": "",
    "ds-pilot-weekend-slalom": "",
    "camiseta-deyscom": "",
    "gorra-deyscom": "",
    "pegatinas-deyscom": ""
  },

  social: {
    instagram: "https://www.instagram.com/deyscom_motorsport/",
    facebook: "https://www.facebook.com/deyscom/",
    tiktok: "https://www.tiktok.com/@deyscom_motorsport",
    youtube: "https://www.youtube.com/channel/UCBdUbFXBtKdeDkqQ5_S5C6g",
    wallapop: "https://es.wallapop.com/user/deyscomm-467502343"
  }
};
