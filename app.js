"use strict";

// Añadiremos aquí el WhatsApp real de María cuando nos lo facilites.
const MARIA_WHATSAPP = "";
const modal = document.getElementById("contact-modal");
const message = document.getElementById("contact-message");
const notice = document.getElementById("contact-notice");

function openMaria(text) {
  if (text) message.value = text;
  notice.hidden = true;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => message.focus(), 30);
}

function closeMaria() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll(".js-maria").forEach((button) => {
  button.addEventListener("click", () => openMaria("Hola María, me gustaría pedir información sobre Limpiezas Megret."));
});
document.getElementById("close-contact").addEventListener("click", closeMaria);
modal.addEventListener("click", (event) => { if (event.target === modal) closeMaria(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeMaria(); });

document.getElementById("send-contact").addEventListener("click", () => {
  const text = message.value.trim();
  if (!text) { notice.textContent = "Escribe primero tu mensaje para María."; notice.hidden = false; return; }
  if (!MARIA_WHATSAPP) {
    notice.textContent = "El mensaje está preparado. Falta añadir el WhatsApp de María para activar el envío directo.";
    notice.hidden = false;
    return;
  }
  window.open(`https://wa.me/${MARIA_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
});

document.getElementById("quote-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  openMaria(`Hola María, quiero solicitar limpieza. Tipo: ${data.get("space")}. Frecuencia: ${data.get("frequency")}. Horas aproximadas: ${data.get("hours")}. Zona: ${data.get("zone")}. Comentario: ${data.get("details") || "Sin comentario"}.`);
});

document.getElementById("job-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  openMaria(`Hola María, quiero trabajar con Limpiezas Megret. Me llamo ${data.get("name")}. Vivo por ${data.get("area")}. Experiencia: ${data.get("experience")}. Disponibilidad: ${data.get("availability")}.`);
});

document.getElementById("year").textContent = String(new Date().getFullYear());
