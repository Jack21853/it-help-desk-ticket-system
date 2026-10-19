/* DeskFlow IT Help Desk — vanilla JavaScript demo */
"use strict";

const STORAGE_KEY = "deskflow-tickets-v1";
const LOG_STORAGE_KEY = "deskflow-logs-v1";

const initialTickets = [
  { id: "HD-1048", title: "Laptop cannot connect to office Wi-Fi", requester: "Priya Sharma", category: "Network", priority: "High", status: "Open", description: "Laptop sees the office network but fails to connect. The issue started this morning.", createdAt: daysAgo(0), updatedAt: daysAgo(0), logs: [] },
  { id: "HD-1047", title: "Printer showing paper jam error", requester: "Arun Kumar", category: "Hardware", priority: "Medium", status: "In Progress", description: "The printer displays a paper jam warning even after the visible paper was removed.", createdAt: daysAgo(1), updatedAt: daysAgo(0), logs: [{ text: "Checked the paper tray and rear access panel. Testing a printer restart next.", at: daysAgo(0) }] },
  { id: "HD-1046", title: "Request access to project folder", requester: "Meera Iyer", category: "Access", priority: "Low", status: "Resolved", description: "Needs access to the shared project folder for assigned work.", createdAt: daysAgo(2), updatedAt: daysAgo(1), logs: [{ text: "Verified the request with the folder owner and confirmed access was granted.", at: daysAgo(1) }] },
  { id: "HD-1045", title: "Office application keeps crashing", requester: "Rahul Verma", category: "Software", priority: "High", status: "In Progress", description: "The office application closes unexpectedly when opening a large spreadsheet.", createdAt: daysAgo(2), updatedAt: daysAgo(0), logs: [{ text: "Asked the requester to restart the application and note any error message. Further checks pending.", at: daysAgo(0) }] },
  { id: "HD-1044", title: "External monitor not detected", requester: "Divya Nair", category: "Hardware", priority: "Low", status: "Resolved", description: "External monitor was not detected after reconnecting the laptop.", createdAt: daysAgo(4), updatedAt: daysAgo(3), logs: [{ text: "Reseated the cable and selected the correct display input. Monitor is working.", at: daysAgo(3) }] },
  { id: "HD-1043", title: "VPN sign-in fails", requester: "Karthik Raj", category: "Network", priority: "Medium", status: "Open", description: "VPN sign-in fails after the password was changed. No password is stored in this ticket.", createdAt: daysAgo(5), updatedAt: daysAgo(5), logs: [] }
];

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(10, 15, 0, 0);
  return date.toISOString();
}

const guides = [
  { id: "wifi", icon: "⌁", title: "Wi-Fi connection issues", category: "Network", summary: "Basic checks when a device cannot connect to a wireless network.", steps: ["Confirm Wi-Fi is enabled and airplane mode is off.", "Check whether other devices can connect to the same network.", "Move closer to the access point and retry.", "Restart the device if appropriate and record any error message.", "If the issue continues, collect the device name and error details before escalating."] },
  { id: "printer", icon: "▤", title: "Printer not printing", category: "Hardware", summary: "Check common printer and queue problems safely.", steps: ["Confirm the printer is powered on and shows no warning lights.", "Check paper, toner/ink, and visible jams using the manufacturer's safe instructions.", "Verify the correct printer is selected in the print dialog.", "Check whether the job is paused or stuck in the print queue.", "Record the printer model and exact error before escalating."] },
  { id: "slowpc", icon: "◫", title: "Slow computer", category: "Performance", summary: "Gather useful details before trying more advanced fixes.", steps: ["Ask when the slowdown began and which apps are affected.", "Save work and close unnecessary applications.", "Check whether a restart is pending or the device is installing updates.", "Use approved system tools to check resource usage if permitted.", "Do not delete files or disable security tools without authorization."] },
  { id: "software", icon: "▧", title: "Application keeps crashing", category: "Software", summary: "Collect symptoms and try basic recovery steps.", steps: ["Write down the application name and exact error message.", "Save work, close the application, and reopen it.", "Check whether the issue affects one file or every file.", "Check approved update guidance and available disk space.", "Escalate with reproducible steps; do not install unapproved software."] },
  { id: "access", icon: "⌑", title: "Account or access request", category: "Access", summary: "Handle access requests with security in mind.", steps: ["Confirm the exact resource and business reason for access.", "Verify the requester according to your organization's policy.", "Route approval to the resource owner or authorized manager.", "Never ask the user to share their password or MFA code.", "Record the approval and outcome without storing secrets."] },
  { id: "vpn", icon: "◉", title: "VPN connection trouble", category: "Network", summary: "First checks for a remote-access connection problem.", steps: ["Confirm the device has an internet connection without the VPN.", "Check the approved VPN service status or internal notice if available.", "Verify the device date and time are correct.", "Record the error text and approximate time of failure.", "Use the official password reset or support process; never collect credentials."] }
];

let tickets = loadTickets();
let activeTicketId = null;
let toastTimer = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadTickets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn("Could not read saved tickets:", error);
  }
  return initialTickets.map(ticket => ({ ...ticket, logs: ticket.logs || [] }));
}

function saveTickets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return true;
  } catch (error) {
    console.error("Could not save tickets:", error);
    showToast("Could not save data in this browser.");
    return false;
  }
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function initials(name) {
  return String(name || "IT").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function statusClass(status) {
  return status === "In Progress" ? "status-progress" : status === "Resolved" ? "status-resolved" : "status-open";
}
function priorityClass(priority) {
  return priority === "High" ? "priority-high" : priority === "Low" ? "priority-low" : "priority-medium";
}
function statusBadge(status) {
  return `<span class="status-pill ${statusClass(status)}">${safeText(status)}</span>`;
}
function priorityBadge(priority) {
  return `<span class="priority-pill ${priorityClass(priority)}">${safeText(priority)}</span>`;
}
function categoryBadge(category) {
  return `<span class="category-pill">${safeText(category)}</span>`;
}

function renderDashboard() {
  const open = tickets.filter(ticket => ticket.status === "Open").length;
  const progress = tickets.filter(ticket => ticket.status === "In Progress").length;
  const resolved = tickets.filter(ticket => ticket.status === "Resolved").length;
  $("#statTotal").textContent = tickets.length;
  $("#statOpen").textContent = open;
  $("#statProgress").textContent = progress;
  $("#statResolved").textContent = resolved;
  $("#navTicketCount").textContent = tickets.length;

  const recent = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  $("#recentTicketRows").innerHTML = recent.map(ticket => `
    <tr>
      <td><button class="row-action" data-open-ticket="${safeText(ticket.id)}"><span class="ticket-id">${safeText(ticket.id)}</span><span class="ticket-title">${safeText(ticket.title)}</span></button></td>
      <td><div class="requester-cell"><span class="mini-avatar">${safeText(initials(ticket.requester))}</span>${safeText(ticket.requester)}</div></td>
      <td>${categoryBadge(ticket.category)}</td><td>${priorityBadge(ticket.priority)}</td><td>${statusBadge(ticket.status)}</td>
    </tr>`).join("");
  $("#recentEmpty").classList.toggle("hidden", recent.length > 0);

  const counts = {
    High: tickets.filter(ticket => ticket.priority === "High" && ticket.status !== "Resolved").length,
    Medium: tickets.filter(ticket => ticket.priority === "Medium" && ticket.status !== "Resolved").length,
    Low: tickets.filter(ticket => ticket.priority === "Low" && ticket.status !== "Resolved").length
  };
  const activeCount = counts.High + counts.Medium + counts.Low;
  $("#priorityOverview").innerHTML = ["High", "Medium", "Low"].map(priority => {
    const count = counts[priority];
    const percent = activeCount ? Math.round(count / activeCount * 100) : 0;
    const fillClass = priority === "High" ? "fill-high" : priority === "Medium" ? "fill-medium" : "fill-low";
    return `<div class="priority-row"><span>${priority} priority</span><div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${percent}%"></div></div><strong>${count}</strong></div>`;
  }).join("");
}

function getFilteredTickets() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const status = $("#statusFilter").value;
  const priority = $("#priorityFilter").value;
  const category = $("#categoryFilter").value;
  return [...tickets]
    .filter(ticket => {
      const searchable = [ticket.id, ticket.title, ticket.requester, ticket.category, ticket.description].join(" ").toLowerCase();
      return (!query || searchable.includes(query)) &&
        (status === "all" || ticket.status === status) &&
        (priority === "all" || ticket.priority === priority) &&
        (category === "all" || ticket.category === category);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderAllTickets() {
  const filtered = getFilteredTickets();
  $("#allTicketRows").innerHTML = filtered.map(ticket => `
    <tr>
      <td><span class="ticket-id">${safeText(ticket.id)}</span><span class="ticket-title">${safeText(ticket.title)}</span></td>
      <td><div class="requester-cell"><span class="mini-avatar">${safeText(initials(ticket.requester))}</span>${safeText(ticket.requester)}</div></td>
      <td>${categoryBadge(ticket.category)}</td><td>${priorityBadge(ticket.priority)}</td><td>${statusBadge(ticket.status)}</td>
      <td>${safeText(formatDate(ticket.createdAt))}</td>
      <td><button class="row-action" data-open-ticket="${safeText(ticket.id)}">Manage →</button></td>
    </tr>`).join("");
  $("#ticketsEmpty").classList.toggle("hidden", filtered.length > 0);
  $(".wide-table").classList.toggle("hidden", filtered.length === 0);
  $("#ticketResultCount").textContent = `Showing ${filtered.length} of ${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`;
}

function renderKnowledge() {
  $("#knowledgeGrid").innerHTML = guides.map(guide => `
    <article class="guide-card">
      <div class="guide-icon">${safeText(guide.icon)}</div>
      <h3>${safeText(guide.title)}</h3><p>${safeText(guide.summary)}</p>
      <button data-open-guide="${safeText(guide.id)}">Read troubleshooting guide →</button>
    </article>`).join("");
}

function renderAll() {
  renderDashboard();
  renderAllTickets();
  renderKnowledge();
}

function switchView(viewName) {
  const viewNames = { dashboard: "Overview", tickets: "All tickets", knowledge: "Knowledge base" };
  $$(".view").forEach(view => view.classList.remove("active"));
  $(`#${viewName}View`).classList.add("active");
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === viewName));
  $("#breadcrumbCurrent").textContent = viewNames[viewName] || "Overview";
  $("#sidebar").classList.remove("open");
  if (viewName === "tickets") renderAllTickets();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openTicketModal() {
  $("#ticketForm").reset();
  $("#ticketPriority").value = "Medium";
  $("#ticketStatus").value = "Open";
  $("#ticketModal").classList.remove("hidden");
  setTimeout(() => $("#ticketTitle").focus(), 30);
}
function closeTicketModal() { $("#ticketModal").classList.add("hidden"); }

function createTicket(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const title = $("#ticketTitle").value.trim();
  const requester = $("#requesterName").value.trim();
  const description = $("#ticketDescription").value.trim();
  if (!title || !requester || !description) {
    showToast("Please complete all required fields.");
    return;
  }
  const nextNumber = tickets.reduce((max, ticket) => {
    const match = String(ticket.id).match(/HD-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1042) + 1;
  const now = new Date().toISOString();
  const ticket = {
    id: `HD-${nextNumber}`, title, requester,
    category: $("#ticketCategory").value,
    priority: $("#ticketPriority").value,
    status: $("#ticketStatus").value,
    description, createdAt: now, updatedAt: now, logs: []
  };
  tickets.unshift(ticket);
  saveTickets();
  renderAll();
  closeTicketModal();
  switchView("tickets");
  showToast(`${ticket.id} created successfully.`);
}

function openDetail(ticketId) {
  const ticket = tickets.find(item => item.id === ticketId);
  if (!ticket) return;
  activeTicketId = ticketId;
  $("#detailEyebrow").textContent = ticket.id;
  $("#detailTitle").textContent = ticket.title;
  $("#detailSubtitle").textContent = `${ticket.requester} · Created ${formatDateTime(ticket.createdAt)}`;
  const logs = Array.isArray(ticket.logs) ? ticket.logs : [];
  $("#detailBody").innerHTML = `
    <div class="detail-grid">
      <div class="detail-block"><span class="detail-label">Requester</span><div class="detail-value">${safeText(ticket.requester)}</div></div>
      <div class="detail-block"><span class="detail-label">Category</span><div class="detail-value">${safeText(ticket.category)}</div></div>
      <div class="detail-block"><span class="detail-label">Priority</span><div class="detail-value">${priorityBadge(ticket.priority)}</div></div>
      <div class="detail-block"><span class="detail-label">Current status</span><div class="detail-value">${statusBadge(ticket.status)}</div></div>
    </div>
    <span class="detail-label">Issue description</span><div class="detail-description">${safeText(ticket.description)}</div>
    <div class="detail-controls">
      <label>Status<select id="detailStatus"><option ${ticket.status === "Open" ? "selected" : ""}>Open</option><option ${ticket.status === "In Progress" ? "selected" : ""}>In Progress</option><option ${ticket.status === "Resolved" ? "selected" : ""}>Resolved</option></select></label>
      <label>Priority<select id="detailPriority"><option ${ticket.priority === "Low" ? "selected" : ""}>Low</option><option ${ticket.priority === "Medium" ? "selected" : ""}>Medium</option><option ${ticket.priority === "High" ? "selected" : ""}>High</option></select></label>
      <label class="full">Add troubleshooting note<textarea id="newLogNote" maxlength="1200" placeholder="Describe checks performed, results, or the resolution. Do not enter passwords or private information."></textarea></label>
    </div>
    <span class="detail-label">Troubleshooting history (${logs.length})</span>
    <ul class="log-list">${logs.length ? logs.slice().reverse().map(log => `<li class="log-item"><p>${safeText(log.text)}</p><small>${safeText(formatDateTime(log.at))}</small></li>`).join("") : `<li class="log-empty">No troubleshooting notes yet. Add a note when you investigate the issue.</li>`}</ul>
    <div class="detail-actions">
      <button class="secondary-button" id="deleteTicket">Delete ticket</button>
      <div class="detail-actions-right"><button class="secondary-button" id="closeDetailBottom">Close</button><button class="primary-button" id="saveTicketChanges">Save changes →</button></div>
    </div>`;
  $("#detailModal").classList.remove("hidden");
  $("#closeDetailBottom").addEventListener("click", closeDetailModal);
  $("#saveTicketChanges").addEventListener("click", saveTicketChanges);
  $("#deleteTicket").addEventListener("click", deleteActiveTicket);
}

function closeDetailModal() {
  $("#detailModal").classList.add("hidden");
  activeTicketId = null;
}

function saveTicketChanges() {
  const ticket = tickets.find(item => item.id === activeTicketId);
  if (!ticket) return;
  ticket.status = $("#detailStatus").value;
  ticket.priority = $("#detailPriority").value;
  const note = $("#newLogNote").value.trim();
  if (note) {
    if (!Array.isArray(ticket.logs)) ticket.logs = [];
    ticket.logs.push({ text: note, at: new Date().toISOString() });
  }
  ticket.updatedAt = new Date().toISOString();
  saveTickets();
  renderAll();
  closeDetailModal();
  showToast(`${ticket.id} updated.`);
}

function deleteActiveTicket() {
  const ticket = tickets.find(item => item.id === activeTicketId);
  if (!ticket) return;
  if (!window.confirm(`Delete ${ticket.id}? This cannot be undone in this browser.`)) return;
  tickets = tickets.filter(item => item.id !== activeTicketId);
  saveTickets();
  renderAll();
  closeDetailModal();
  showToast("Ticket deleted.");
}

function openGuide(guideId) {
  const guide = guides.find(item => item.id === guideId);
  if (!guide) return;
  $("#detailEyebrow").textContent = `TROUBLESHOOTING · ${guide.category.toUpperCase()}`;
  $("#detailTitle").textContent = guide.title;
  $("#detailSubtitle").textContent = guide.summary;
  $("#detailBody").innerHTML = `
    <ol class="guide-steps">${guide.steps.map(step => `<li>${safeText(step)}</li>`).join("")}</ol>
    <div class="detail-description">Safety reminder: follow your organization's policies. Do not request or record passwords, MFA codes, or other secrets.</div>
    <div class="detail-actions"><span></span><div class="detail-actions-right"><button class="secondary-button" id="closeGuide">Close</button><button class="primary-button" id="createFromGuide">Create related ticket →</button></div></div>`;
  $("#detailModal").classList.remove("hidden");
  $("#closeGuide").addEventListener("click", closeDetailModal);
  $("#createFromGuide").addEventListener("click", () => {
    closeDetailModal();
    openTicketModal();
    $("#ticketTitle").value = `${guide.title} — needs support`;
    $("#ticketCategory").value = ["Network", "Hardware", "Software", "Access"].includes(guide.category) ? guide.category : "Other";
    $("#ticketDescription").value = `Issue details:\nTroubleshooting steps already tried:\nError message (if any):`;
  });
}

function showToast(message) {
  $("#toastMessage").textContent = message;
  $("#toast").classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.add("hidden"), 2800);
}

function resetFilters() {
  $("#searchInput").value = "";
  $("#statusFilter").value = "all";
  $("#priorityFilter").value = "all";
  $("#categoryFilter").value = "all";
  renderAllTickets();
}

function bindEvents() {
  $$(".nav-item").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
  ["newTicketTop", "newTicketList", "quickCreate"].forEach(id => $(`#${id}`).addEventListener("click", openTicketModal));
  $("#quickKnowledge").addEventListener("click", () => switchView("knowledge"));
  $("#quickOpen").addEventListener("click", () => {
    switchView("tickets");
    $("#statusFilter").value = "Open";
    renderAllTickets();
  });
  $("#viewAllTickets").addEventListener("click", () => switchView("tickets"));
  $("#ticketForm").addEventListener("submit", createTicket);
  $("#closeModal").addEventListener("click", closeTicketModal);
  $("#cancelModal").addEventListener("click", closeTicketModal);
  $("#closeDetail").addEventListener("click", closeDetailModal);
  $("#ticketModal").addEventListener("click", event => { if (event.target === $("#ticketModal")) closeTicketModal(); });
  $("#detailModal").addEventListener("click", event => { if (event.target === $("#detailModal")) closeDetailModal(); });
  $("#searchInput").addEventListener("input", renderAllTickets);
  ["statusFilter", "priorityFilter", "categoryFilter"].forEach(id => $(`#${id}`).addEventListener("change", renderAllTickets));
  $("#clearFilters").addEventListener("click", resetFilters);
  $("#emptyReset").addEventListener("click", resetFilters);
  $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#helpButton").addEventListener("click", () => showToast("DeskFlow is a front-end portfolio demo. Data stays in this browser."));
  document.addEventListener("click", event => {
    const ticketButton = event.target.closest("[data-open-ticket]");
    if (ticketButton) openDetail(ticketButton.dataset.openTicket);
    const guideButton = event.target.closest("[data-open-guide]");
    if (guideButton) openGuide(guideButton.dataset.openGuide);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeTicketModal();
      closeDetailModal();
      $("#sidebar").classList.remove("open");
    }
  });
}

function initialize() {
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  $("#currentDate").textContent = today.toUpperCase();
  bindEvents();
  renderAll();
}

initialize();
