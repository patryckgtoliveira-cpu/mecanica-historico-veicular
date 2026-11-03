const viewLabels = {
  dashboard: "Visão geral",
  wireframe: "Wireframe",
  requirements: "Requisitos"
};
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const views = [...document.querySelectorAll(".view")];
const navigationItems = [...document.querySelectorAll("[data-view]")];
const breadcrumb = document.querySelector("#breadcrumb-current");
const content = document.querySelector("#conteudo");
const dialog = document.querySelector("#entry-dialog");
const form = document.querySelector("#entry-form");
const toast = document.querySelector("#toast");
const timeline = document.querySelector("#timeline");
const serviceCount = document.querySelector("#service-count");

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

function setActiveView(target) {
  const selectedView = views.find(view => view.id === target);
  if (!selectedView) {
    console.error(`A tela "${target}" não foi encontrada.`);
    return;
  }

  views.forEach(view => view.classList.toggle("active", view === selectedView));
  navigationItems.forEach(item => {
    item.classList.toggle("active", item.dataset.view === target);
  });
  document.body.classList.toggle("wireframe-mode", target === "wireframe");
  breadcrumb.textContent = viewLabels[target];
  content.focus({ preventScroll: true });
  window.scrollTo({
    top: 0,
    behavior: reducedMotionQuery.matches ? "instant" : "smooth"
  });
}

function formatDateParts(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return {
    day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(date)
      .replace(".", "")
  };
}

function createTimelineEntry({ service, date, odometer, workshop, amount }) {
  const entry = document.createElement("article");
  entry.className = "timeline-row";

  const dateParts = formatDateParts(date);
  const dateBlock = document.createElement("div");
  dateBlock.className = "date-block";
  const dateDay = document.createElement("span");
  dateDay.className = "date-day";
  dateDay.textContent = dateParts.day;
  const dateMonth = document.createElement("span");
  dateMonth.className = "date-month";
  dateMonth.textContent = dateParts.month;
  dateBlock.append(dateDay, dateMonth);

  const details = document.createElement("div");
  const eventName = document.createElement("div");
  eventName.className = "event-name";
  eventName.textContent = service;
  const eventDetail = document.createElement("div");
  eventDetail.className = "event-detail";
  eventDetail.textContent = `${odometer.toLocaleString("pt-BR")} km · ${workshop}`;
  details.append(eventName, eventDetail);

  const status = document.createElement("span");
  status.className = "status status-done";
  const statusDot = document.createElement("span");
  statusDot.className = "status-dot";
  status.append(statusDot, document.createTextNode("Concluída"));

  entry.append(dateBlock, details, status);
  if (amount) {
    const cost = document.createElement("span");
    cost.className = "event-cost";
    cost.textContent = Number(amount).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
    entry.append(cost);
  }

  return entry;
}

function validateEntry() {
  const service = form.elements.service.value.trim();
  const date = form.elements.date.value;
  const rawOdometer = form.elements.odometer.value;
  const odometer = Number(rawOdometer);
  const amount = form.elements.amount.value;

  return {
    service: !service ? "Informe o serviço realizado." : "",
    date: !date ? "Informe a data do serviço." : "",
    odometer: !rawOdometer || !Number.isFinite(odometer) || odometer < 0
      ? "Informe uma quilometragem válida."
      : "",
    amount: amount && (!Number.isFinite(Number(amount)) || Number(amount) < 0)
      ? "Informe um valor válido."
      : ""
  };
}

function showValidationErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    document.querySelector(`#${field}-error`).textContent = message;
    form.elements[field].setAttribute("aria-invalid", message ? "true" : "false");
  });

  const firstInvalidField = Object.keys(errors).find(field => errors[field]);
  if (firstInvalidField) {
    form.elements[firstInvalidField].focus();
    return false;
  }

  return true;
}

function clearValidationErrors() {
  form.querySelectorAll(".form-error").forEach(error => {
    error.textContent = "";
  });
  Object.values(form.elements).forEach(element => {
    if (element instanceof HTMLElement && element.matches("input, select")) {
      element.removeAttribute("aria-invalid");
    }
  });
}

function handleEntrySubmit(event) {
  event.preventDefault();

  const errors = validateEntry();
  if (!showValidationErrors(errors)) return;

  const entry = {
    service: form.elements.service.value.trim(),
    date: form.elements.date.value,
    odometer: Number(form.elements.odometer.value),
    workshop: form.elements.workshop.value.trim() || "Oficina não informada",
    amount: form.elements.amount.value
  };

  timeline.prepend(createTimelineEntry(entry));
  serviceCount.textContent = String(Number(serviceCount.textContent) + 1);
  form.reset();
  clearValidationErrors();
  dialog.close();
  showToast("Manutenção registrada no prontuário.");
}

function openEntryDialog() {
  const today = new Date();
  form.elements.date.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  clearValidationErrors();
  dialog.showModal();
  form.elements.service.focus();
}

function initializePrintMode() {
  const printView = new URLSearchParams(window.location.search).get("print");
  if (printView !== "wireframe" && printView !== "high-fidelity") return;

  document.body.classList.add(
    printView === "wireframe" ? "print-wireframe" : "print-high-fidelity"
  );
  window.addEventListener("load", () => window.print(), { once: true });
}

navigationItems.forEach(button => {
  button.addEventListener("click", () => setActiveView(button.dataset.view));
});

document.querySelectorAll("[data-toast]").forEach(button => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.querySelector("#open-entry").addEventListener("click", openEntryDialog);
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
form.addEventListener("submit", handleEntrySubmit);

initializePrintMode();
