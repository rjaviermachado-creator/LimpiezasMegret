"use strict";

const MARIA_WHATSAPP = "34641167155";
const modal = document.getElementById("contact-modal");
const message = document.getElementById("contact-message");
const notice = document.getElementById("contact-notice");
const cartDrawer = document.getElementById("cart-drawer");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartOrder = document.getElementById("cart-order");
let cart = [];

try {
  const saved = JSON.parse(localStorage.getItem("megret_pack_cart") || "[]");
  if (Array.isArray(saved)) cart = saved.filter((item) => typeof item === "string").slice(0, 10);
} catch {}

function openMaria(text) {
  closeCart();
  if (text) message.value = text;
  notice.hidden = true;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => message.focus(), 30);
}

function saveCart() {
  try { localStorage.setItem("megret_pack_cart", JSON.stringify(cart)); } catch {}
}

function renderCart() {
  cartCount.textContent = String(cart.length);
  cartOrder.disabled = cart.length === 0;
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Todavía no has añadido ningún pack.</p>';
  } else {
    cartItems.innerHTML = cart.map((name, index) => `<div class="cart-line"><div><b>${name}</b><span>Precio a consultar</span></div><button type="button" data-remove-pack="${index}">Quitar</button></div>`).join("");
  }
  document.querySelectorAll(".add-pack").forEach((button) => {
    const active = cart.includes(button.dataset.pack);
    button.classList.toggle("added", active);
    button.textContent = active ? "Añadido ✓" : "+ Añadir";
  });
}

function openCart() {
  renderCart();
  cartBackdrop.hidden = false;
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!cartDrawer) return;
  cartBackdrop.hidden = true;
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  if (modal.hidden) document.body.style.overflow = "";
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
  window.open(`https://wa.me/${MARIA_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
});

document.getElementById("quote-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  openMaria([
    "🧽 SOLICITUD DE LIMPIEZA · LIMPIEZAS MEGRET",
    "",
    `Quién contrata: ${data.get("clientType")}`,
    `Nombre / empresa: ${data.get("clientName")}`,
    `Teléfono: ${data.get("phone")}`,
    `Tipo de espacio: ${data.get("space")}`,
    `Tamaño aproximado: ${data.get("size")}`,
    `Zona: ${data.get("zone")}`,
    `Frecuencia: ${data.get("frequency")}`,
    `Horas aproximadas: ${data.get("hours")}`,
    `Fecha preferida: ${data.get("date") || "A convenir"}`,
    `Productos / material: ${data.get("supplies")}`,
    `Detalles: ${data.get("details") || "Sin detalles adicionales"}`,
    "",
    "Hola María, me gustaría recibir información y presupuesto para este servicio."
  ].join("\n"));
});

document.getElementById("job-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  openMaria([
    "👋 CANDIDATURA · LIMPIEZAS MEGRET",
    "",
    `Me presento como: ${data.get("candidateType")}`,
    `Nombre / equipo: ${data.get("name")}`,
    `Teléfono: ${data.get("phone")}`,
    `Zona: ${data.get("area")}`,
    `Experiencia: ${data.get("experience")}`,
    `Trabajo que me interesa: ${data.get("preference")}`,
    `Disponibilidad: ${data.get("availability")}`,
    `Desplazamiento por Madrid: ${data.get("travel")}`,
    `Información adicional: ${data.get("details") || "Sin información adicional"}`,
    "",
    "Hola María, me gustaría formar parte del equipo de Limpiezas Megret."
  ].join("\n"));
});

document.querySelectorAll(".add-pack").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.pack;
    if (!name) return;
    if (!cart.includes(name)) cart.push(name);
    saveCart();
    renderCart();
    button.classList.add("added");
  });
});

document.getElementById("cart-button").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-pack]");
  if (!button) return;
  cart.splice(Number(button.dataset.removePack), 1);
  saveCart();
  renderCart();
});
cartOrder.addEventListener("click", () => {
  if (!cart.length) return;
  openMaria(`Hola María, quiero pedir información y precio de estos Packs Megret: ${cart.join(", ")}.`);
});

document.getElementById("year").textContent = String(new Date().getFullYear());
renderCart();
