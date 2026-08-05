"use strict";

// Añadiremos aquí el WhatsApp real de María cuando nos lo facilites.
const MARIA_WHATSAPP = "";
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
