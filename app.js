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
const accountDialog = document.querySelector("#account-dialog");
const accountForm = document.querySelector("#account-form");
const workshopForm = document.querySelector("#workshop-form");
const preferredWorkshop = document.querySelector("#preferred-workshop");
const customWorkshopField = document.querySelector("#custom-workshop-field");
const customWorkshopInput = document.querySelector("#custom-workshop");
const toast = document.querySelector("#toast");
const timeline = document.querySelector("#timeline");
const serviceCount = document.querySelector("#service-count");
const userSettingsKey = "garagem.user-settings";

let toastTimer;
let userSettings = loadUserSettings();

function loadUserSettings() {
  try {
    const storedSettings = window.localStorage.getItem(userSettingsKey);
    if (!storedSettings) return { account: null, workshop: "" };

    const parsedSettings = JSON.parse(storedSettings);
    if (!parsedSettings || typeof parsedSettings !== "object") {
      throw new Error("Formato de configurações inválido.");
    }

    const account = parsedSettings.account;
    return {
      account: account && typeof account.name === "string" && typeof account.email === "string"
        ? { name: account.name, email: account.email }
        : null,
      workshop: typeof parsedSettings.workshop === "string" ? parsedSettings.workshop : ""
    };
  } catch (error) {
    console.error("Não foi possível carregar as configurações locais.", error);
    showToast("Não foi possível carregar seu perfil salvo neste navegador.");
    return { account: null, workshop: "" };
  }
}

function saveUserSettings(nextSettings) {
  try {
    window.localStorage.setItem(userSettingsKey, JSON.stringify(nextSettings));
    userSettings = nextSettings;
    return true;
  } catch (error) {
    console.error("Não foi possível salvar as configurações locais.", error);
    showToast("Não foi possível salvar. Verifique as permissões de armazenamento do navegador.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("pt-BR");
}

function updateAccountUI() {
  const accountName = userSettings.account?.name || "Marina Costa";
  const firstName = accountName.trim().split(/\s+/)[0];
  const initials = getInitials(accountName);

  document.querySelector("#dashboard-title").textContent = `Bom dia, ${firstName}`;
  document.querySelectorAll("[data-account-name]").forEach(element => {
    element.textContent = accountName;
  });
  document.querySelectorAll("[data-account-initials]").forEach(element => {
    element.textContent = initials;
    element.setAttribute("aria-label", `Perfil de ${accountName}`);
  });

  const accountDetail = userSettings.account?.email || "Perfil demonstrativo";
  document.querySelectorAll("[data-account-detail]").forEach(element => {
    element.textContent = accountDetail;
  });
  document.querySelectorAll("[data-open-account]").forEach(button => {
    button.setAttribute(
      "aria-label",
      `${userSettings.account ? "Editar" : "Criar"} perfil de ${accountName}`
    );
  });
  document.querySelector("#account-dialog-title").textContent = userSettings.account
    ? "Editar seu perfil"
    : "Criar seu perfil";
}

function renderPreferredWorkshop() {
  const knownWorkshops = [...preferredWorkshop.options]
    .map(option => option.value)
    .filter(value => value && value !== "custom");
  const isCustomWorkshop = userSettings.workshop && !knownWorkshops.includes(userSettings.workshop);

  preferredWorkshop.value = isCustomWorkshop ? "custom" : userSettings.workshop;
  customWorkshopField.hidden = !isCustomWorkshop;
  customWorkshopInput.value = isCustomWorkshop ? userSettings.workshop : "";
  document.querySelector("#workshop-current").textContent = userSettings.workshop
    ? `Oficina: ${userSettings.workshop}`
    : "Nenhuma oficina selecionada";
}

function openAccountDialog() {
  accountForm.elements.name.value = userSettings.account?.name || "";
  accountForm.elements.email.value = userSettings.account?.email || "";
  clearAccountErrors();
  accountDialog.showModal();
  accountForm.elements.name.focus();
}

function clearAccountErrors() {
  document.querySelector("#account-name-error").textContent = "";
  document.querySelector("#account-email-error").textContent = "";
  accountForm.elements.name.removeAttribute("aria-invalid");
  accountForm.elements.email.removeAttribute("aria-invalid");
}

function handleAccountSubmit(event) {
  event.preventDefault();

  const name = accountForm.elements.name.value.trim();
  const emailInput = accountForm.elements.email;
  emailInput.value = emailInput.value.trim();
  const email = emailInput.value;
  const nameError = name ? "" : "Informe seu nome.";
  const emailError = !email
    ? "Informe seu e-mail."
    : emailInput.validity.typeMismatch
      ? "Informe um e-mail válido."
      : "";

  document.querySelector("#account-name-error").textContent = nameError;
  document.querySelector("#account-email-error").textContent = emailError;
  accountForm.elements.name.setAttribute("aria-invalid", String(Boolean(nameError)));
  accountForm.elements.email.setAttribute("aria-invalid", String(Boolean(emailError)));

  if (nameError || emailError) {
    accountForm.elements[nameError ? "name" : "email"].focus();
    return;
  }

  const nextSettings = {
    ...userSettings,
    account: { name, email }
  };
  if (!saveUserSettings(nextSettings)) return;

  updateAccountUI();
  accountDialog.close();
  showToast("Perfil salvo neste navegador.");
}

function handleWorkshopSubmit(event) {
  event.preventDefault();

  const selectedWorkshop = preferredWorkshop.value;
  const workshopName = selectedWorkshop === "custom"
    ? customWorkshopInput.value.trim()
    : selectedWorkshop;
  const error = !selectedWorkshop
    ? "Selecione uma oficina."
    : !workshopName
      ? "Informe o nome da oficina."
      : "";
  const errorMessage = document.querySelector("#workshop-error");
  errorMessage.textContent = error;
  preferredWorkshop.setAttribute("aria-invalid", String(Boolean(error)));
  customWorkshopInput.setAttribute("aria-invalid", String(Boolean(error && selectedWorkshop === "custom")));

  if (error) {
    (selectedWorkshop === "custom" ? customWorkshopInput : preferredWorkshop).focus();
    return;
  }

  const nextSettings = { ...userSettings, workshop: workshopName };
  if (!saveUserSettings(nextSettings)) return;

  renderPreferredWorkshop();
  showToast("Oficina preferida salva neste navegador.");
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
  form.elements.workshop.value = userSettings.workshop;
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
document.querySelectorAll("[data-open-account]").forEach(button => {
  button.addEventListener("click", openAccountDialog);
});
document.querySelector("#close-account-dialog").addEventListener("click", () => accountDialog.close());
accountDialog.addEventListener("click", event => {
  if (event.target === accountDialog) accountDialog.close();
});
accountForm.addEventListener("submit", handleAccountSubmit);
preferredWorkshop.addEventListener("change", () => {
  const isCustomWorkshop = preferredWorkshop.value === "custom";
  customWorkshopField.hidden = !isCustomWorkshop;
  document.querySelector("#workshop-error").textContent = "";
  preferredWorkshop.removeAttribute("aria-invalid");
  customWorkshopInput.removeAttribute("aria-invalid");
  if (isCustomWorkshop) customWorkshopInput.focus();
});
workshopForm.addEventListener("submit", handleWorkshopSubmit);
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
form.addEventListener("submit", handleEntrySubmit);

updateAccountUI();
renderPreferredWorkshop();
initializePrintMode();
