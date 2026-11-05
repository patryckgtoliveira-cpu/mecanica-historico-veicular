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
const vehicleDialog = document.querySelector("#vehicle-dialog");
const vehicleForm = document.querySelector("#vehicle-form");
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
const commonsApi = "https://commons.wikimedia.org/w/api.php";
const revisionInterval = 10000;
const vehicleCatalog = {
  palio: { make: "Fiat", body: "hatchback" },
  uno: { make: "Fiat", body: "hatchback" },
  argo: { make: "Fiat", body: "hatchback" },
  mobi: { make: "Fiat", body: "hatchback" },
  gol: { make: "Volkswagen", body: "hatchback" },
  fox: { make: "Volkswagen", body: "hatchback" },
  polo: { make: "Volkswagen", body: "hatchback" },
  onix: { make: "Chevrolet", body: "hatchback" },
  hb20: { make: "Hyundai", body: "hatchback" },
  kwid: { make: "Renault", body: "hatchback" },
  sandero: { make: "Renault", body: "hatchback" },
  fit: { make: "Honda", body: "hatchback" },
  ka: { make: "Ford", body: "hatchback" },
  "208": { make: "Peugeot", body: "hatchback" },
  corolla: { make: "Toyota", body: "sedan" },
  civic: { make: "Honda", body: "sedan" },
  city: { make: "Honda", body: "sedan" },
  prisma: { make: "Chevrolet", body: "sedan" },
  cronos: { make: "Fiat", body: "sedan" },
  virtus: { make: "Volkswagen", body: "sedan" },
  versa: { make: "Nissan", body: "sedan" },
  "hrv": { make: "Honda", body: "suv" },
  "crv": { make: "Honda", body: "suv" },
  creta: { make: "Hyundai", body: "suv" },
  "tcross": { make: "Volkswagen", body: "suv" },
  compass: { make: "Jeep", body: "suv" },
  renegade: { make: "Jeep", body: "suv" },
  tracker: { make: "Chevrolet", body: "suv" },
  kicks: { make: "Nissan", body: "suv" },
  duster: { make: "Renault", body: "suv" },
  "corollacross": { make: "Toyota", body: "suv" },
  ecosport: { make: "Ford", body: "suv" }
};
const defaultVehicle = {
  make: "Honda",
  model: "HR-V",
  version: "EXL",
  year: 2021,
  fuel: "Flex",
  plate: "ABC1D23",
  odometer: 48260,
  lastRevisionOdometer: 40000,
  nextRevisionOdometer: 50000
};

let toastTimer;
let userSettings = loadUserSettings();
let vehiclePhotoController;

function loadUserSettings() {
  try {
    const storedSettings = window.localStorage.getItem(userSettingsKey);
    if (!storedSettings) return { account: null, workshop: "", vehicle: { ...defaultVehicle } };

    const parsedSettings = JSON.parse(storedSettings);
    if (!parsedSettings || typeof parsedSettings !== "object") {
      throw new Error("Formato de configurações inválido.");
    }

    const account = parsedSettings.account;
    return {
      account: account && typeof account.name === "string" && typeof account.email === "string"
        ? { name: account.name, email: account.email }
        : null,
      workshop: typeof parsedSettings.workshop === "string" ? parsedSettings.workshop : "",
      vehicle: normalizeVehicle(parsedSettings.vehicle)
    };
  } catch (error) {
    console.error("Não foi possível carregar as configurações locais.", error);
    showToast("Não foi possível carregar seu perfil salvo neste navegador.");
    return { account: null, workshop: "", vehicle: { ...defaultVehicle } };
  }
}

function normalizeVehicle(vehicle) {
  if (!vehicle || typeof vehicle !== "object") return { ...defaultVehicle };

  const odometer = Number.isInteger(vehicle.odometer) ? vehicle.odometer : defaultVehicle.odometer;
  const storedLastRevisionOdometer = Number.isInteger(vehicle.lastRevisionOdometer)
    ? vehicle.lastRevisionOdometer
    : null;
  const nextRevisionOdometer = Number.isInteger(vehicle.nextRevisionOdometer)
    ? vehicle.nextRevisionOdometer
    : storedLastRevisionOdometer !== null
      ? storedLastRevisionOdometer + revisionInterval
      : Math.ceil((odometer + 1) / revisionInterval) * revisionInterval;
  const lastRevisionOdometer = storedLastRevisionOdometer !== null
    ? storedLastRevisionOdometer
    : Math.max(0, nextRevisionOdometer - revisionInterval);

  return {
    make: typeof vehicle.make === "string" ? vehicle.make : defaultVehicle.make,
    model: typeof vehicle.model === "string" ? vehicle.model : defaultVehicle.model,
    version: typeof vehicle.version === "string" ? vehicle.version : defaultVehicle.version,
    year: Number.isInteger(vehicle.year) ? vehicle.year : defaultVehicle.year,
    fuel: typeof vehicle.fuel === "string" ? vehicle.fuel : defaultVehicle.fuel,
    plate: typeof vehicle.plate === "string" ? vehicle.plate : defaultVehicle.plate,
    odometer,
    lastRevisionOdometer,
    nextRevisionOdometer
  };
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

function renderVehicle() {
  const { make, model, version, year, fuel, plate, odometer, nextRevisionOdometer } = userSettings.vehicle;
  const vehicleVisual = document.querySelector("#vehicle-visual");
  const vehicleProfile = vehicleCatalog[normalizeVehicleModel(model)];
  const remainingDistance = nextRevisionOdometer - odometer;
  const nextRevisionText = remainingDistance > 0
    ? `Aos ${nextRevisionOdometer.toLocaleString("pt-BR")} km · faltam ${remainingDistance.toLocaleString("pt-BR")} km`
    : remainingDistance === 0
      ? `Revisão prevista agora · ${nextRevisionOdometer.toLocaleString("pt-BR")} km`
      : `Revisão atrasada há ${Math.abs(remainingDistance).toLocaleString("pt-BR")} km · prevista aos ${nextRevisionOdometer.toLocaleString("pt-BR")} km`;
  document.querySelector("#vehicle-name").textContent = [make, model, version]
    .filter(Boolean)
    .join(" ");
  document.querySelector("#vehicle-summary").textContent = `${year} · ${fuel} · ${plate}`;
  document.querySelector("#vehicle-odometer").textContent =
    `${odometer.toLocaleString("pt-BR")} km`;
  document.querySelector("#next-revision").textContent = nextRevisionText;
  document.querySelector("#next-revision-detail").textContent = nextRevisionText;
  document.querySelector("#create-revision-reminder").dataset.toast =
    `Lembrete de revisão configurado para ${nextRevisionOdometer.toLocaleString("pt-BR")} km.`;
  vehicleVisual.dataset.body = vehicleProfile?.body || "generic";
  document.querySelector("#vehicle-image-label").textContent = `${make} ${model}`;
  document.querySelector("#vehicle-photo").alt =
    `Foto de referência de ${make} ${model}; ano ou versão podem variar.`;
  renderVehiclePhoto({ make, model });
}

function normalizeVehicleModel(model) {
  return model
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f\s-]/g, "");
}

function getVehiclePhoto(pages, model) {
  const normalizedModel = normalizeVehicleModel(model);
  const excludedTitleTerms = /\b(weekend|rally|racing|race|motorsport|competition|championship|concept|toy|logo|badge|emblem|drawing|diecast|miniature|tn|tc|dtm)\b/i;
  const candidates = Object.values(pages || {})
    .map(page => {
      const imageInfo = page.imageinfo?.[0];
      const metadata = imageInfo?.extmetadata || {};
      return {
        title: page.title || "",
        imageUrl: imageInfo?.thumburl,
        sourceUrl: imageInfo?.descriptionurl,
        author: metadata.Artist?.value,
        licenseUrl: metadata.LicenseUrl?.value,
        license: metadata.LicenseShortName?.value
      };
    })
    .filter(candidate => {
      const normalizedTitle = normalizeVehicleModel(candidate.title);
      const isModelMatch = normalizedModel.length <= 2
        ? candidate.title.toLocaleLowerCase("pt-BR").split(/[^a-z0-9]+/).includes(normalizedModel)
        : normalizedTitle.includes(normalizedModel);
      const hasAllowedLicense = /^CC BY(?:-SA)? [0-9.]+$|^CC0$|^Public domain$/i
        .test(candidate.license || "");
      return isModelMatch && !excludedTitleTerms.test(candidate.title) &&
        hasAllowedLicense && candidate.imageUrl && candidate.sourceUrl;
    });

  return candidates[0];
}

async function renderVehiclePhoto(vehicle) {
  vehiclePhotoController?.abort();
  const controller = new AbortController();
  vehiclePhotoController = controller;
  const image = document.querySelector("#vehicle-photo");
  const credit = document.querySelector("#vehicle-photo-credit");
  const sourceLink = document.querySelector("#vehicle-photo-source");
  const licenseLink = document.querySelector("#vehicle-photo-license");
  const visual = document.querySelector("#vehicle-visual");
  const status = document.querySelector("#vehicle-image-status");
  visual.dataset.photo = "loading";
  status.textContent = "Buscando foto...";
  credit.hidden = true;
  sourceLink.removeAttribute("href");
  sourceLink.textContent = "";
  licenseLink.removeAttribute("href");
  licenseLink.textContent = "";
  image.hidden = true;
  image.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  try {
    const parameters = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: `${vehicle.make} ${vehicle.model} car`,
      gsrwhat: "text",
      gsrorder: "relevance",
      gsrlimit: "20",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl",
      iiurlwidth: "900",
      origin: "*",
      format: "json"
    });
    const response = await fetch(`${commonsApi}?${parameters}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Wikimedia Commons respondeu ${response.status}.`);

    const data = await response.json();
    const photo = getVehiclePhoto(data.query?.pages, vehicle.model);
    if (!photo) throw new Error(`Nenhuma foto licenciada encontrada para ${vehicle.make} ${vehicle.model}.`);

    const photoUrl = new URL(photo.imageUrl);
    const sourceUrl = new URL(photo.sourceUrl);
    const licenseUrl = new URL(
      photo.licenseUrl || "https://commons.wikimedia.org/wiki/Commons:Licensing"
    );
    if (!["thumb.wikimedia.org", "upload.wikimedia.org"].includes(photoUrl.hostname) ||
        sourceUrl.hostname !== "commons.wikimedia.org" ||
        !["creativecommons.org", "commons.wikimedia.org"].includes(licenseUrl.hostname)) {
      throw new Error("A origem da foto não é reconhecida.");
    }

    const author = photo.author
      ? new DOMParser().parseFromString(photo.author, "text/html").body.textContent.trim()
      : "Wikimedia Commons";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("A foto encontrada não pôde ser carregada."));
      image.src = photoUrl.href;
    });
    if (controller.signal.aborted || vehiclePhotoController !== controller) return;

    image.hidden = false;
    visual.dataset.photo = "loaded";
    status.textContent = "Foto de referência";
    sourceLink.href = sourceUrl.href;
    sourceLink.textContent = `Foto: ${author}`;
    licenseLink.href = licenseUrl.href;
    licenseLink.textContent = photo.license;
    credit.hidden = false;
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error("Não foi possível carregar uma foto licenciada para o veículo.", error);
    visual.dataset.photo = "unavailable";
    status.textContent = "Foto indisponível · ilustração";
  }
}

function updateVehicleMakeFromModel() {
  const model = vehicleForm.elements.model.value.trim();
  const isDifferentModel = model !== userSettings.vehicle.model;
  const isSavedVersion = vehicleForm.elements.version.value === userSettings.vehicle.version;
  if (isDifferentModel && isSavedVersion) {
    vehicleForm.elements.version.value = "";
  }

  const vehicleProfile = vehicleCatalog[normalizeVehicleModel(model)];
  if (vehicleProfile) vehicleForm.elements.make.value = vehicleProfile.make;
}

function openVehicleDialog() {
  Object.entries(userSettings.vehicle).forEach(([field, value]) => {
    const control = vehicleForm.elements.namedItem(field);
    if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) {
      control.value = String(value);
    }
  });
  clearVehicleErrors();
  vehicleDialog.showModal();
  vehicleForm.elements.make.focus();
}

function clearVehicleErrors() {
  vehicleForm.querySelectorAll(".form-error").forEach(error => {
    error.textContent = "";
  });
  Object.values(vehicleForm.elements).forEach(element => {
    if (element instanceof HTMLElement && element.matches("input, select")) {
      element.removeAttribute("aria-invalid");
    }
  });
}

function validateVehicle() {
  const make = vehicleForm.elements.make.value.trim();
  const model = vehicleForm.elements.model.value.trim();
  const year = Number(vehicleForm.elements.year.value);
  const fuel = vehicleForm.elements.fuel.value;
  const plate = vehicleForm.elements.plate.value.trim().toLocaleUpperCase("pt-BR");
  const rawOdometer = vehicleForm.elements.odometer.value;
  const odometer = Number(rawOdometer);
  const rawLastRevisionOdometer = vehicleForm.elements.lastRevisionOdometer.value;
  const lastRevisionOdometer = Number(rawLastRevisionOdometer);
  const currentYear = new Date().getFullYear();

  return {
    make: make ? "" : "Informe a marca.",
    model: model ? "" : "Informe o modelo.",
    year: !Number.isInteger(year) || year < 1900 || year > currentYear + 1
      ? `Informe um ano entre 1900 e ${currentYear + 1}.`
      : "",
    fuel: fuel ? "" : "Selecione o combustível.",
    plate: /^(?:[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z0-9][0-9]{2})$/.test(plate)
      ? ""
      : "Informe uma placa válida (ex.: ABC1D23).",
    odometer: !rawOdometer || !Number.isInteger(odometer) || odometer < 0 || odometer > 9999999
      ? "Informe uma quilometragem inteira válida."
      : "",
    lastRevisionOdometer: !rawLastRevisionOdometer || !Number.isInteger(lastRevisionOdometer) ||
      lastRevisionOdometer < 0 || lastRevisionOdometer > 9999999 || lastRevisionOdometer > odometer
      ? "Informe a quilometragem da revisão, igual ou menor que a quilometragem atual."
      : ""
  };
}

function handleVehicleSubmit(event) {
  event.preventDefault();

  const errors = validateVehicle();
  Object.entries(errors).forEach(([field, message]) => {
    document.querySelector(`#vehicle-${field}-error`).textContent = message;
    vehicleForm.elements[field].setAttribute("aria-invalid", String(Boolean(message)));
  });

  const firstInvalidField = Object.keys(errors).find(field => errors[field]);
  if (firstInvalidField) {
    vehicleForm.elements[firstInvalidField].focus();
    return;
  }

  const odometer = Number(vehicleForm.elements.odometer.value);
  if (odometer < userSettings.vehicle.odometer &&
      !window.confirm("A quilometragem informada é menor que a salva. Deseja confirmar essa correção?")) {
    vehicleForm.elements.odometer.focus();
    return;
  }
  const lastRevisionOdometer = Number(vehicleForm.elements.lastRevisionOdometer.value);
  const nextSettings = {
    ...userSettings,
    vehicle: {
      make: vehicleForm.elements.make.value.trim(),
      model: vehicleForm.elements.model.value.trim(),
      version: vehicleForm.elements.version.value.trim(),
      year: Number(vehicleForm.elements.year.value),
      fuel: vehicleForm.elements.fuel.value,
      plate: vehicleForm.elements.plate.value.trim().toLocaleUpperCase("pt-BR"),
      odometer,
      lastRevisionOdometer,
      nextRevisionOdometer: lastRevisionOdometer + revisionInterval
    }
  };
  if (!saveUserSettings(nextSettings)) return;

  renderVehicle();
  vehicleDialog.close();
  showToast("Dados do veículo salvos neste navegador.");
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

function createTimelineEntry({ maintenanceType, service, date, odometer, workshop, amount }) {
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
  eventName.textContent = maintenanceType;
  const eventDetail = document.createElement("div");
  eventDetail.className = "event-detail";
  eventDetail.textContent = `${service} · ${odometer.toLocaleString("pt-BR")} km · ${workshop}`;
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
  const maintenanceType = form.elements.maintenanceType.value;
  const service = form.elements.service.value.trim();
  const date = form.elements.date.value;
  const rawOdometer = form.elements.odometer.value;
  const odometer = Number(rawOdometer);
  const amount = form.elements.amount.value;

  return {
    maintenanceType: maintenanceType ? "" : "Selecione o tipo de manutenção.",
    service: !service ? "Informe o serviço realizado." : "",
    date: !date ? "Informe a data do serviço." : "",
    odometer: !rawOdometer || !Number.isInteger(odometer) || odometer < 0 || odometer > 9999999
      ? "Informe uma quilometragem válida."
      : "",
    amount: amount && (!Number.isFinite(Number(amount)) || Number(amount) < 0)
      ? "Informe um valor válido."
      : ""
  };
}

function showValidationErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorId = field === "maintenanceType" ? "maintenance-type-error" : `${field}-error`;
    document.querySelector(`#${errorId}`).textContent = message;
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
    maintenanceType: form.elements.maintenanceType.value,
    service: form.elements.service.value.trim(),
    date: form.elements.date.value,
    odometer: Number(form.elements.odometer.value),
    workshop: form.elements.workshop.value.trim() || "Oficina não informada",
    amount: form.elements.amount.value
  };

  const isRevision = entry.maintenanceType === "Revisão periódica";
  const updatesRevisionSchedule = isRevision &&
    entry.odometer >= userSettings.vehicle.lastRevisionOdometer;
  if (updatesRevisionSchedule || entry.odometer > userSettings.vehicle.odometer) {
    const lastRevisionOdometer = updatesRevisionSchedule
      ? entry.odometer
      : userSettings.vehicle.lastRevisionOdometer;
    const vehicle = {
      ...userSettings.vehicle,
      odometer: Math.max(userSettings.vehicle.odometer, entry.odometer),
      lastRevisionOdometer,
      nextRevisionOdometer: updatesRevisionSchedule
        ? entry.odometer + revisionInterval
        : userSettings.vehicle.nextRevisionOdometer
    };
    if (!saveUserSettings({ ...userSettings, vehicle })) return;
    renderVehicle();
  }

  timeline.prepend(createTimelineEntry(entry));
  serviceCount.textContent = String(Number(serviceCount.textContent) + 1);
  form.reset();
  clearValidationErrors();
  dialog.close();
  showToast(updatesRevisionSchedule
    ? `Revisão registrada. Próxima revisão aos ${(entry.odometer + revisionInterval).toLocaleString("pt-BR")} km.`
    : isRevision
      ? "Revisão anterior registrada. A previsão atual foi mantida."
    : "Manutenção registrada no prontuário.");
}

function openEntryDialog() {
  const today = new Date();
  form.elements.date.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  form.elements.workshop.value = userSettings.workshop;
  form.elements.odometer.value = String(userSettings.vehicle.odometer);
  clearValidationErrors();
  dialog.showModal();
  form.elements.maintenanceType.focus();
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
document.querySelector("#open-vehicle").addEventListener("click", openVehicleDialog);
document.querySelector("#close-vehicle-dialog").addEventListener("click", () => vehicleDialog.close());
vehicleDialog.addEventListener("click", event => {
  if (event.target === vehicleDialog) vehicleDialog.close();
});
vehicleForm.addEventListener("submit", handleVehicleSubmit);
vehicleForm.elements.model.addEventListener("input", updateVehicleMakeFromModel);
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
renderVehicle();
initializePrintMode();
