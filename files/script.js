/* ============================================
   1) DATOS DE CONVERSIÓN
   Cada categoría (excepto temperatura) usa un
   "factor hacia la unidad base". Para convertir
   entre dos unidades cualesquiera:
     valorEnBase = valor * factorOrigen
     resultado   = valorEnBase / factorDestino
   ============================================ */
const categories = {
  longitud: {
    label: "Longitud", icon: "📏", base: "metro",
    units: {
      metro: 1, kilometro: 1000, centimetro: 0.01, milimetro: 0.001,
      milla: 1609.34, yarda: 0.9144, pie: 0.3048, pulgada: 0.0254
    }
  },
  masa: {
    label: "Masa", icon: "⚖️", base: "kilogramo",
    units: {
      kilogramo: 1, gramo: 0.001, miligramo: 0.000001,
      libra: 0.453592, onza: 0.0283495, tonelada: 1000
    }
  },
  volumen: {
    label: "Volumen", icon: "🧪", base: "litro",
    units: {
      litro: 1, mililitro: 0.001, metro_cubico: 1000,
      galon_us: 3.78541, cuarto_us: 0.946353, taza: 0.24
    }
  },
  area: {
    label: "Área", icon: "▦", base: "metro_cuadrado",
    units: {
      metro_cuadrado: 1, kilometro_cuadrado: 1e6, hectarea: 10000,
      pie_cuadrado: 0.092903, acre: 4046.86
    }
  },
  velocidad: {
    label: "Velocidad", icon: "⇢", base: "metro_por_segundo",
    units: {
      metro_por_segundo: 1, kilometro_por_hora: 0.277778,
      milla_por_hora: 0.44704, nudo: 0.514444
    }
  },
  tiempo: {
    label: "Tiempo", icon: "⏱", base: "segundo",
    units: {
      segundo: 1, minuto: 60, hora: 3600, dia: 86400,
      semana: 604800, mes: 2629800, año: 31557600
    }
  },
  datos: {
    label: "Datos", icon: "▮▮", base: "byte",
    units: {
      byte: 1, kilobyte: 1024, megabyte: 1024 ** 2,
      gigabyte: 1024 ** 3, terabyte: 1024 ** 4
    }
  },
  // La temperatura no es lineal desde cero, así que se maneja aparte
  // con funciones de ida y vuelta hacia Celsius (ver sección 2).
  temperatura: {
    label: "Temperatura", icon: "🌡", base: "celsius",
    units: { celsius: null, fahrenheit: null, kelvin: null }
  },
  // Igual que temperatura, no es una simple multiplicación por un factor:
  // aquí se transforma el número dígito por dígito (ver sección 2b).
  numeros: {
    label: "Números", icon: "🔢", base: "decimal",
    units: { decimal: null, binario: null }
  }
};

// Nombres bonitos para mostrar en pantalla
const displayNames = {
  metro: "Metro", kilometro: "Kilómetro", centimetro: "Centímetro", milimetro: "Milímetro",
  milla: "Milla", yarda: "Yarda", pie: "Pie", pulgada: "Pulgada",
  kilogramo: "Kilogramo", gramo: "Gramo", miligramo: "Miligramo",
  libra: "Libra", onza: "Onza", tonelada: "Tonelada (métrica)",
  litro: "Litro", mililitro: "Mililitro", metro_cubico: "Metro cúbico",
  galon_us: "Galón (US)", cuarto_us: "Cuarto (US)", taza: "Taza",
  metro_cuadrado: "Metro cuadrado", kilometro_cuadrado: "Kilómetro cuadrado",
  hectarea: "Hectárea", pie_cuadrado: "Pie cuadrado", acre: "Acre",
  metro_por_segundo: "Metro/segundo", kilometro_por_hora: "Km/hora",
  milla_por_hora: "Milla/hora", nudo: "Nudo",
  segundo: "Segundo", minuto: "Minuto", hora: "Hora", dia: "Día",
  semana: "Semana", mes: "Mes", "año": "Año",
  byte: "Byte", kilobyte: "Kilobyte", megabyte: "Megabyte",
  gigabyte: "Gigabyte", terabyte: "Terabyte",
  celsius: "Celsius (°C)", fahrenheit: "Fahrenheit (°F)", kelvin: "Kelvin (K)",
  decimal: "Decimal", binario: "Binario"
};

// Abreviaturas cortas para mostrar junto al número del resultado
const shortNames = {
  metro: "m", kilometro: "km", centimetro: "cm", milimetro: "mm",
  milla: "mi", yarda: "yd", pie: "ft", pulgada: "in",
  kilogramo: "kg", gramo: "g", miligramo: "mg", libra: "lb", onza: "oz", tonelada: "t",
  litro: "L", mililitro: "mL", metro_cubico: "m³", galon_us: "gal", cuarto_us: "qt", taza: "taza",
  metro_cuadrado: "m²", kilometro_cuadrado: "km²", hectarea: "ha", pie_cuadrado: "ft²", acre: "acre",
  metro_por_segundo: "m/s", kilometro_por_hora: "km/h", milla_por_hora: "mph", nudo: "kn",
  segundo: "s", minuto: "min", hora: "h", dia: "d", semana: "sem", mes: "mes", "año": "año",
  byte: "B", kilobyte: "KB", megabyte: "MB", gigabyte: "GB", terabyte: "TB",
  celsius: "°C", fahrenheit: "°F", kelvin: "K",
  decimal: "dec", binario: "bin"
};
function shortLabel(unit) {
  return shortNames[unit] || displayNames[unit];
}

/* ============================================
   2) TEMPERATURA — caso especial
   Se convierte siempre pasando por Celsius.
   ============================================ */
function toCelsius(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return (value - 32) * (5 / 9);
  if (unit === "kelvin") return value - 273.15;
}
function fromCelsius(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return value * (9 / 5) + 32;
  if (unit === "kelvin") return value + 273.15;
}
function convertTemperature(value, from, to) {
  return fromCelsius(toCelsius(value, from), to);
}

/* ============================================
   2b) NÚMEROS — decimal <-> binario
   No se multiplica por un factor: se transforma
   el número dígito por dígito.
   ============================================ */

// Solo acepta dígitos 0 y 1 (con signo y punto decimal opcional)
const BINARY_REGEX = /^-?[01]+(\.[01]+)?$/;

function decimalToBinary(value) {
  if (isNaN(value)) return null;
  const negative = value < 0;
  value = Math.abs(value);

  const intPart = Math.floor(value);
  let fracPart = value - intPart;
  let result = intPart.toString(2);

  if (fracPart > 0) {
    let fracBits = "";
    let guard = 0; // evita bucles infinitos con decimales que no terminan en binario
    while (fracPart > 0 && guard < 24) {
      fracPart *= 2;
      const bit = Math.floor(fracPart);
      fracBits += bit;
      fracPart -= bit;
      guard++;
    }
    result += "." + fracBits;
  }
  return (negative ? "-" : "") + result;
}

function binaryToDecimal(str) {
  str = str.trim();
  if (!BINARY_REGEX.test(str)) return null;

  const negative = str.startsWith("-");
  if (negative) str = str.slice(1);

  const [intStr, fracStr] = str.split(".");
  let result = parseInt(intStr, 2);

  if (fracStr) {
    for (let i = 0; i < fracStr.length; i++) {
      if (fracStr[i] === "1") {
        result += Math.pow(2, -(i + 1));
      }
    }
  }
  return negative ? -result : result;
}

function convertNumberBase(rawValue, from, to) {
  if (from === to) return rawValue;
  if (from === "decimal" && to === "binario") {
    return decimalToBinary(parseFloat(rawValue));
  }
  if (from === "binario" && to === "decimal") {
    return binaryToDecimal(String(rawValue));
  }
}

/* ============================================
   3) CONVERSIÓN GENERAL
   ============================================ */
function convert(categoryKey, value, from, to) {
  if (categoryKey === "temperatura") {
    return convertTemperature(value, from, to);
  }
  if (categoryKey === "numeros") {
    return convertNumberBase(value, from, to);
  }
  const { units } = categories[categoryKey];
  const valueInBase = value * units[from];
  return valueInBase / units[to];
}

/* ============================================
   4) ESTADO Y REFERENCIAS AL DOM
   ============================================ */
let currentCategory = "longitud";

const dialEl = document.getElementById("categoryDial");
const inputValueEl = document.getElementById("inputValue");
const unitFromEl = document.getElementById("unitFrom");
const unitToEl = document.getElementById("unitTo");
const readoutEl = document.getElementById("readout");
const formulaLineEl = document.getElementById("formulaLine");
const referenceGridEl = document.getElementById("referenceGrid");
const swapBtn = document.getElementById("swapBtn");
const numberHintEl = document.getElementById("numberHint");

/* ============================================
   5) RENDERIZADO
   ============================================ */
function renderDial() {
  dialEl.innerHTML = Object.entries(categories).map(([key, cat]) => `
    <button class="dial-btn ${key === currentCategory ? "active" : ""}" data-key="${key}">
      <span class="ico">${cat.icon}</span> ${cat.label}
    </button>
  `).join("");

  dialEl.querySelectorAll(".dial-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.key;
      populateUnitSelects();
      renderDial();
      updateAll();
    });
  });
}

function populateUnitSelects() {
  const unitKeys = Object.keys(categories[currentCategory].units);
  const optionsHtml = unitKeys.map(u => `<option value="${u}">${displayNames[u]}</option>`).join("");

  unitFromEl.innerHTML = optionsHtml;
  unitToEl.innerHTML = optionsHtml;

  // Por defecto, origen = primera unidad, destino = segunda unidad
  unitFromEl.value = unitKeys[0];
  unitToEl.value = unitKeys[1] || unitKeys[0];
}

function updateReadout() {
  numberHintEl.textContent = "";
  const from = unitFromEl.value;
  const to = unitToEl.value;
  const raw = inputValueEl.value.trim();

  // Caso especial: conversión de bases numéricas (decimal <-> binario)
  if (currentCategory === "numeros") {
    if (raw === "") {
      readoutEl.textContent = "—";
      formulaLineEl.textContent = "";
      return;
    }
    if (from === "binario" && !BINARY_REGEX.test(raw)) {
      readoutEl.textContent = "—";
      formulaLineEl.textContent = "";
      numberHintEl.textContent = "⚠ Un binario solo puede tener dígitos 0 y 1 (ej: 1010)";
      return;
    }
    const value = from === "binario" ? raw : parseFloat(raw);
    if (from === "decimal" && isNaN(value)) {
      readoutEl.textContent = "—";
      formulaLineEl.textContent = "";
      return;
    }
    const result = convert(currentCategory, value, from, to);
    readoutEl.innerHTML = `${result} <span class="readout-unit">${shortLabel(to)}</span>`;
    formulaLineEl.innerHTML =
      `<strong>${value} ${displayNames[from]}</strong> equivale a <strong>${result} ${displayNames[to]}</strong>`;
    return;
  }

  // Caso normal: unidades con factor de conversión
  const value = parseFloat(raw);
  if (isNaN(value)) {
    readoutEl.textContent = "—";
    formulaLineEl.textContent = "";
    return;
  }
  const result = convert(currentCategory, value, from, to);

  readoutEl.innerHTML = `${formatNumber(result)} <span class="readout-unit">${shortLabel(to)}</span>`;
  formulaLineEl.innerHTML =
    `<strong>${formatNumber(value)} ${displayNames[from]}</strong> equivale a <strong>${formatNumber(result)} ${displayNames[to]}</strong>`;
}

function updateReferenceGrid() {
  const from = unitFromEl.value;
  const unitKeys = Object.keys(categories[currentCategory].units);
  const raw = inputValueEl.value.trim();

  if (currentCategory === "numeros") {
    if (raw === "" || (from === "binario" && !BINARY_REGEX.test(raw))) {
      referenceGridEl.innerHTML = "";
      return;
    }
    const value = from === "binario" ? raw : parseFloat(raw);
    if (from === "decimal" && isNaN(value)) {
      referenceGridEl.innerHTML = "";
      return;
    }
    referenceGridEl.innerHTML = unitKeys
      .filter(u => u !== from)
      .map(u => {
        const result = convert(currentCategory, value, from, u);
        return `
          <div class="ref-item">
            <div class="ref-unit">${displayNames[u]}</div>
            <div class="ref-val">${result}</div>
          </div>
        `;
      })
      .join("");
    return;
  }

  const value = parseFloat(raw);
  if (isNaN(value)) {
    referenceGridEl.innerHTML = "";
    return;
  }

  referenceGridEl.innerHTML = unitKeys
    .filter(u => u !== from)
    .map(u => {
      const result = convert(currentCategory, value, from, u);
      return `
        <div class="ref-item">
          <div class="ref-unit">${displayNames[u]}</div>
          <div class="ref-val">${formatNumber(result)}</div>
        </div>
      `;
    })
    .join("");
}

function formatNumber(num) {
  if (!isFinite(num)) return "—";
  // Números grandes o muy pequeños en notación compacta, el resto con hasta 4 decimales
  if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(3);
  }
  return parseFloat(num.toFixed(6)).toLocaleString("es-ES", { maximumFractionDigits: 6 });
}

function updateAll() {
  updateReadout();
  updateReferenceGrid();
}

/* ============================================
   6) REGLA DECORATIVA — genera las marcas
   ============================================ */
function renderRulerTicks() {
  const svg = document.querySelector(".ruler svg");
  const totalTicks = 100;
  let marks = "";
  for (let i = 0; i <= totalTicks; i++) {
    const x = (i / totalTicks) * 1000;
    const isMajor = i % 10 === 0;
    const height = isMajor ? 18 : 8;
    marks += `<line x1="${x}" y1="${38 - height}" x2="${x}" y2="38" stroke="${isMajor ? "#c69a3a" : "#3a4d6b"}" stroke-width="${isMajor ? 1.4 : 1}" />`;
  }
  svg.insertAdjacentHTML("beforeend", marks);
}

/* ============================================
   7) EVENTOS
   ============================================ */
inputValueEl.addEventListener("input", updateAll);
unitFromEl.addEventListener("change", updateAll);
unitToEl.addEventListener("change", updateAll);

swapBtn.addEventListener("click", () => {
  const temp = unitFromEl.value;
  unitFromEl.value = unitToEl.value;
  unitToEl.value = temp;
  updateAll();
});

/* ============================================
   8) INICIALIZACIÓN
   ============================================ */
renderDial();
populateUnitSelects();
renderRulerTicks();
updateAll();
