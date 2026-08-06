"use strict";

const MARIA_WHATSAPP = "34641167155";
const PROFILE_KEY = "megret_profile_v3";
const BOOKINGS_KEY = "megret_bookings_v3";
const JOBS_KEY = "megret_jobs_v3";
const MESSAGES_KEY = "megret_messages_v3";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const overlay = $("#overlay");
const accountPanel = $("#account-panel");
const accountContent = $("#account-content");
const profileModal = $("#profile-modal");
const profileForm = $("#profile-form");
const profileLabel = $("#profile-label");
const profileAvatar = $("#profile-avatar");
const toast = $("#toast");
let activeTab = "pedidos";

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function getProfile() { return read(PROFILE_KEY, null); }
function getBookings() { return read(BOOKINGS_KEY, []); }
function getJobs() { return read(JOBS_KEY, []); }
function getMessages() { return read(MESSAGES_KEY, []); }

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function formatDate(value) {
  try { return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  catch { return value; }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
}

function openWhatsApp(text = "Hola María, me gustaría pedir información sobre Limpiezas Megret.") {
  window.open(`https://wa.me/${MARIA_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

function updateHeader() {
  const profile = getProfile();
  if (profile) {
    profileLabel.textContent = profile.name.split(" ")[0];
    profileAvatar.textContent = profile.name.trim().charAt(0).toUpperCase();
  } else {
    profileLabel.textContent = "Crear perfil";
    profileAvatar.textContent = "👤";
  }
  $("#cart-count").textContent = String(getBookings().length + getJobs().length);
}

function openProfile(edit = false) {
  const profile = getProfile();
  if (profile && edit) {
    profileForm.elements.name.value = profile.name || "";
    profileForm.elements.phone.value = profile.phone || "";
    profileForm.elements.email.value = profile.email || "";
    profileForm.elements.address.value = profile.address || "";
    profileForm.elements.type.value = profile.type || "Particular";
  }
  profileModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeProfile() {
  profileModal.hidden = true;
  if (!accountPanel.classList.contains("open")) document.body.style.overflow = "";
}

function openAccount(tab = "pedidos") {
  activeTab = tab;
  overlay.hidden = false;
  accountPanel.classList.add("open");
  accountPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderAccount();
}

function closeAccount() {
  overlay.hidden = true;
  accountPanel.classList.remove("open");
  accountPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function renderAccount() {
  const profile = getProfile();
  if (!profile) {
    accountContent.innerHTML = `<div class="account-empty"><div><span>🌸</span><h3>Tu espacio aún está vacío</h3><p>Crea un perfil rápido para guardar solicitudes, candidaturas y mensajes sin repetir tus datos.</p><button class="button primary" id="empty-create" type="button">Crear mi perfil</button></div></div>`;
    $("#empty-create").addEventListener("click", () => openProfile(false));
    return;
  }

  accountContent.innerHTML = `
    <div class="profile-summary"><span>${escapeHTML(profile.name.charAt(0).toUpperCase())}</span><div><b>${escapeHTML(profile.name)}</b><small>${escapeHTML(profile.type)} · ${escapeHTML(profile.phone)}</small></div><button id="edit-profile" type="button">Editar</button></div>
    <div class="account-tabs"><button data-tab="pedidos" class="${activeTab === "pedidos" ? "active" : ""}">Pedidos</button><button data-tab="mensajes" class="${activeTab === "mensajes" ? "active" : ""}">Mensajes</button><button data-tab="datos" class="${activeTab === "datos" ? "active" : ""}">Mis datos</button></div>
    <div id="tab-content"></div>`;

  $("#edit-profile").addEventListener("click", () => openProfile(true));
  $$("[data-tab]", accountContent).forEach(button => button.addEventListener("click", () => { activeTab = button.dataset.tab; renderAccount(); }));
  renderTab(profile);
}

function renderTab(profile) {
  const container = $("#tab-content");
  if (activeTab === "pedidos") {
    const bookings = getBookings().map(item => ({...item, kind: "Limpieza"}));
    const jobs = getJobs().map(item => ({...item, kind: "Candidatura"}));
    const entries = [...bookings, ...jobs].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    container.innerHTML = entries.length ? `<div class="history-list">${entries.map(item => `<article class="history-card"><header><b>${escapeHTML(item.kind)}</b><span>${escapeHTML(item.status || "Enviado")}</span></header><p>${item.kind === "Limpieza" ? `${escapeHTML(item.space)} · ${escapeHTML(item.address)} · ${escapeHTML(item.hours)}` : `${escapeHTML(item.area)} · ${escapeHTML(item.availability)}`}</p><small>${formatDate(item.createdAt)}</small></article>`).join("")}</div>` : `<div class="account-empty"><div><span>🧺</span><h3>Aún no hay solicitudes</h3><p>Cuando reserves una limpieza o envíes una candidatura aparecerá aquí.</p><button class="button primary" data-go-booking type="button">Reservar limpieza</button></div></div>`;
    const button = $("[data-go-booking]", container);
    if (button) button.addEventListener("click", () => { closeAccount(); $("#reservar").scrollIntoView({behavior:"smooth"}); });
  }

  if (activeTab === "mensajes") {
    const messages = getMessages();
    container.innerHTML = `<div class="message-compose"><label>Nuevo mensaje para María<textarea id="saved-message" placeholder="Escribe tu consulta..."></textarea></label><button class="button primary full" id="send-saved-message" type="button">Guardar y abrir WhatsApp</button></div>${messages.length ? `<div class="history-list" style="margin-top:18px">${messages.slice().reverse().map(item => `<article class="history-card"><header><b>Mensaje</b><span>Guardado</span></header><p>${escapeHTML(item.text)}</p><small>${formatDate(item.createdAt)}</small></article>`).join("")}</div>` : ""}`;
    $("#send-saved-message").addEventListener("click", () => {
      const field = $("#saved-message");
      const text = field.value.trim();
      if (!text) return showToast("Escribe primero el mensaje");
      const list = getMessages();
      list.push({ id: crypto.randomUUID?.() || String(Date.now()), text, createdAt: new Date().toISOString() });
      write(MESSAGES_KEY, list);
      openWhatsApp(`Hola María, soy ${profile.name}. ${text}`);
      renderAccount();
    });
  }

  if (activeTab === "datos") {
    container.innerHTML = `<div class="history-list"><article class="history-card"><header><b>Datos guardados</b><span>Local</span></header><p><strong>Nombre:</strong> ${escapeHTML(profile.name)}<br><strong>Teléfono:</strong> ${escapeHTML(profile.phone)}<br><strong>Correo:</strong> ${escapeHTML(profile.email || "No indicado")}<br><strong>Dirección:</strong> ${escapeHTML(profile.address || "No indicada")}<br><strong>Cuenta:</strong> ${escapeHTML(profile.type)}</p></article><button class="button secondary full" id="clear-data" type="button">Borrar todos mis datos</button></div>`;
    $("#clear-data").addEventListener("click", () => {
      if (!confirm("¿Quieres borrar tu perfil, solicitudes y mensajes guardados en este dispositivo?")) return;
      [PROFILE_KEY, BOOKINGS_KEY, JOBS_KEY, MESSAGES_KEY].forEach(key => localStorage.removeItem(key));
      updateHeader(); renderAccount(); showToast("Datos borrados");
    });
  }
}

profileForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(profileForm);
  const profile = Object.fromEntries(data.entries());
  write(PROFILE_KEY, profile);
  closeProfile();
  updateHeader();
  showToast("Perfil guardado");
  openAccount(activeTab);
});

$("#booking-form").addEventListener("submit", event => {
  event.preventDefault();
  let profile = getProfile();
  if (!profile) {
    showToast("Crea tu perfil antes de reservar");
    openProfile(false);
    return;
  }
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const booking = { id: crypto.randomUUID?.() || String(Date.now()), ...data, status: "Pendiente de confirmar", createdAt: new Date().toISOString() };
  const bookings = getBookings();
  bookings.push(booking);
  write(BOOKINGS_KEY, bookings);
  updateHeader();
  showToast("Solicitud guardada");
  openWhatsApp(["🧽 SOLICITUD DE LIMPIEZA · LIMPIEZAS MEGRET", "", `Cliente: ${profile.name}`, `Teléfono: ${profile.phone}`, `Tipo: ${data.clientType}`, `Espacio: ${data.space}`, `Fecha: ${data.date || "A convenir"}`, `Horas: ${data.hours}`, `Dirección / zona: ${data.address}`, `Detalles: ${data.details || "Sin detalles adicionales"}`, "", "Hola María, me gustaría confirmar esta solicitud."].join("\n"));
  event.currentTarget.reset();
});

$("#job-form").addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const job = { id: crypto.randomUUID?.() || String(Date.now()), ...data, status: "Candidatura enviada", createdAt: new Date().toISOString() };
  const jobs = getJobs(); jobs.push(job); write(JOBS_KEY, jobs); updateHeader();
  showToast("Candidatura guardada");
  openWhatsApp(["👋 CANDIDATURA · LIMPIEZAS MEGRET", "", `Nombre: ${data.name}`, `Teléfono: ${data.phone}`, `Zona: ${data.area}`, `Experiencia: ${data.experience}`, `Disponibilidad: ${data.availability}`, `Información: ${data.details || "Sin información adicional"}`].join("\n"));
  event.currentTarget.reset();
});

$("#profile-button").addEventListener("click", () => openAccount());
$("#cart-button").addEventListener("click", () => openAccount("pedidos"));
$("#hero-profile").addEventListener("click", () => getProfile() ? openAccount() : openProfile());
$("#quick-profile").addEventListener("click", () => openAccount());
$("#feature-profile").addEventListener("click", () => openAccount());
$("#close-account").addEventListener("click", closeAccount);
overlay.addEventListener("click", closeAccount);
$("#close-profile").addEventListener("click", closeProfile);
profileModal.addEventListener("click", event => { if (event.target === profileModal) closeProfile(); });
$$('.js-whatsapp').forEach(button => button.addEventListener("click", () => openWhatsApp()));
$$('[data-scroll]').forEach(button => button.addEventListener("click", () => $(button.dataset.scroll)?.scrollIntoView({behavior:"smooth"})));

const menuButton = $("#menu-button");
const nav = $("#main-nav");
menuButton.addEventListener("click", () => nav.classList.toggle("open"));
$$('a', nav).forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!profileModal.hidden) closeProfile();
  if (accountPanel.classList.contains("open")) closeAccount();
});

const profile = getProfile();
if (profile?.address) $("#booking-form").elements.address.value = profile.address;
$("#year").textContent = String(new Date().getFullYear());
updateHeader();
