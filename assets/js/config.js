/* =========================================================
   CONFIGURACIÓN DEYSCOM MOTORSPORT
   Archivo generado por tools/build.py a partir de content/ajustes.json.
   Edítalo desde el panel de contenido (/admin → Ajustes), no aquí.
   ========================================================= */
window.DEYSCOM = {
  // URL del Web App de Google Apps Script (README → "Conectar formularios a Google Sheets").
  // Mientras esté vacío, los formularios abren WhatsApp con los datos rellenados para no perder ningún lead
  // y el CRM (crm.html) solo funciona en modo demostración.
  SHEETS_ENDPOINT: "",

  phone: "+34615972233",
  phoneDisplay: "(+34) 615 97 22 33",
  whatsapp: "34615972233",
  whatsappMsg: "¡Hola Deyscom! Vengo desde la web y quiero información sobre ",
  email: "info@deyscom.com",

  // Horario: 0 = domingo … 6 = sábado. [apertura, cierre] en horas decimales.
  hours: { 1: [7, 15], 2: [7, 15], 3: [7, 15], 4: [7, 15], 5: [7, 15] },

  // Enlaces de pago (Stripe Payment Links, PayPal…): curso y experiencias llevan directo al pago; en la tienda aparece «Pagar ahora».
  payLinks: {
      "ds-copilot-course": "",
      "ds-pilot-weekend-circuit": "",
      "ds-pilot-weekend-rally": "",
      "ds-pilot-weekend-slalom": "",
      "camiseta-deyscom": "",
      "gorra-deyscom": "",
      "pegatinas-deyscom": "",
      "camiseta-edicion-especial-el-molar-2026": "",
      "sudadera-capucha-deyscom": "",
      "chaqueta-deyscom": ""
  },

  // Enlace para pedir reseñas en Google. Lo usa la plantilla de WhatsApp del CRM.
  googleReview: "",

  social: {}
};
