// Delivery Tool v2.0

// =====================
// 共通
// =====================
const homeCards = document.querySelectorAll(".home-card");
const tabButtons = document.querySelectorAll(".tab-btn");
const pages = document.querySelectorAll(".page");
const homeScreen = document.getElementById("homeScreen");

function showPage(targetId) {
  pages.forEach(page => page.classList.remove("active"));
  tabButtons.forEach(btn => btn.classList.remove("active"));

  const target = document.getElementById(targetId);
  if (target) target.classList.add("active");

  tabButtons.forEach(btn => {
    if (btn.dataset.target === targetId) btn.classList.add("active");
  });

  if (homeScreen) homeScreen.style.display = "none";
}

homeCards.forEach(card => {
  card.addEventListener("click", () => showPage(card.dataset.target));
});

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.target));
});

// =====================
// ダークモード
// =====================
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ ";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "☀️ " : "🌙 ";
  });
}

// =====================
// サイズ換算
// =====================
const sizeTable = [
  [70,2],[80,5],[100,10],[120,15],[140,20],[160,30],[170,50],[180,60],
  [190,70],[200,80],[210,100],[220,110],[230,130],[240,140],[250,160],
  [260,180],[270,200],[280,230],[290,250],[300,280],[310,310],[320,340],
  [330,370],[340,410],[350,450],[360,480],[370,530],[380,570],[390,620],
  [400,660],[410,720],[420,770],[430,830],[440,880],[450,950],[460,1010],
  [470,1080],[480,1150],[490,1220],[500,1300]
];

function convertSize(value) {
  if (!value || value <= 0) return "サイズ：0";
  const result = sizeTable.find(([size]) => value <= size);
  return result ? `${result[0]}サイズ（${result[1]}kgまで）` : "対応範囲外です";
}

const sizeInput = document.getElementById("sizeInput");
const sizeOutput = document.getElementById("sizeOutput");

if (sizeInput && sizeOutput) {
  sizeInput.addEventListener("input", () => {
    sizeOutput.textContent = convertSize(Number(sizeInput.value));
  });
}

const sizeLengthInput = document.getElementById("sizeLengthInput");
const sizeWidthInput = document.getElementById("sizeWidthInput");
const sizeDepthInput = document.getElementById("sizeDepthInput");
const sizeTotalOutput = document.getElementById("sizeTotalOutput");

function calcThreeSideSize() {
  const total =
    Number(sizeLengthInput?.value || 0) +
    Number(sizeWidthInput?.value || 0) +
    Number(sizeDepthInput?.value || 0);

  sizeTotalOutput.textContent =
    total === 0
      ? "合計サイズ：0cm ／ サイズ：0"
      : `合計サイズ：${total}cm ／ ${convertSize(total)}`;
}

[sizeLengthInput, sizeWidthInput, sizeDepthInput].forEach(input => {
  if (input) input.addEventListener("input", calcThreeSideSize);
});

// =====================
// 才数換算
// =====================
const lengthInput = document.getElementById("lengthInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const volumeOutput = document.getElementById("volumeOutput");
const tasuOutput = document.getElementById("tasuOutput");

function calcTasu() {
  const l = Number(lengthInput?.value || 0);
  const w = Number(widthInput?.value || 0);
  const h = Number(heightInput?.value || 0);

  if (!l || !w || !h) {
    volumeOutput.textContent = "体積：0㎤";
    tasuOutput.textContent = "才数：0才";
    return;
  }

  const volume = l * w * h;
  const tasu = volume / 28316;
  const ceilTasu = Math.ceil(tasu);
  const kg = ceilTasu * 8;

  volumeOutput.textContent = `体積：${volume.toLocaleString()}㎤`;
  tasuOutput.textContent = `才数：${tasu.toFixed(2)}才（${ceilTasu}才 × 8kg = ${kg}kg）`;
}

[lengthInput, widthInput, heightInput].forEach(input => {
  if (input) input.addEventListener("input", calcTasu);
});

// =====================
// バーコード
// =====================
const barcodeInput = document.getElementById("barcodeInput");
const barcodeSvg = document.getElementById("barcode");
const barcodeSizeSlider = document.getElementById("barcodeSizeSlider");
const barcodeSizeValue = document.getElementById("barcodeSizeValue");

const presetNameInput = document.getElementById("presetNameInput");
const savePreset = document.getElementById("savePreset");
const presetList = document.getElementById("presetList");

const historyList = document.getElementById("historyList");
const downloadBarcode = document.getElementById("downloadBarcode");
const fullscreenBarcode = document.getElementById("fullscreenBarcode");
const barcodeModal = document.getElementById("barcodeModal");
const closeModal = document.getElementById("closeModal");
const fullscreenSvg = document.getElementById("fullscreenSvg");

let presets = JSON.parse(localStorage.getItem("presets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// 古いプリセット形式を変換
presets = presets.map(item => {
  if (typeof item === "string") {
    return { name: item, code: item };
  }
  return item;
});

function savePresets() {
  localStorage.setItem("presets", JSON.stringify(presets));
}

function saveHistory(code) {
  history = history.filter(v => v !== code);
  history.unshift(code);
  history = history.slice(0, 30);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function generateBarcode() {
  if (!barcodeInput || !barcodeSvg) return;

  let value = barcodeInput.value.replace(/\D/g, "");
  barcodeInput.value = value;

  if (!value) {
    barcodeSvg.innerHTML = "";
    return;
  }

  if (value.length < 4) {
    barcodeSvg.innerHTML = "";
    return;
  }

  if (value.length > 4) {
    value = value.slice(0, 4);
    barcodeInput.value = value;
  }

  const size = barcodeSizeSlider ? Number(barcodeSizeSlider.value) : 2;
  if (barcodeSizeValue) barcodeSizeValue.textContent = size;

  JsBarcode("#barcode", `A${value}A`, {
    format: "codabar",
    lineColor: "#000",
    background: "#fff",
    width: size,
    height: 70 + size * 15,
    displayValue: true,
    fontSize: 16 + size,
    margin: 10
  });

  saveHistory(value);
}

if (barcodeInput) {
  barcodeInput.addEventListener("input", generateBarcode);
}

if (barcodeSizeSlider) {
  barcodeSizeSlider.addEventListener("input", generateBarcode);
}

// =====================
// プリセット
// =====================
function renderPresets() {
  if (!presetList) return;

  presetList.innerHTML = "";

  if (presets.length === 0) {
    presetList.innerHTML = `<p class="help">まだプリセットはありません。</p>`;
    return;
  }

  presets.forEach((preset, index) => {
    const item = document.createElement("div");
    item.className = "preset-item";

    const main = document.createElement("div");
    main.className = "preset-main";
    main.innerHTML = `
      📦 ${preset.name}
      <div class="preset-code">${preset.code}</div>
    `;

    main.addEventListener("click", () => {
      barcodeInput.value = preset.code;
      generateBarcode();
    });

    const actions = document.createElement("div");
    actions.className = "preset-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      const newName = prompt("プリセット名", preset.name);
      if (newName === null) return;

      const newCode = prompt("4桁の番号", preset.code);
      if (newCode === null) return;

      const cleanCode = newCode.replace(/\D/g, "");

      if (cleanCode.length !== 4) {
        alert("バーコード番号は必ず4桁で入力してください");
        return;
      }

      presets[index] = {
        name: newName.trim() || cleanCode,
        code: cleanCode
      };

      savePresets();
      renderPresets();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`${preset.name} を削除しますか？`)) {
        presets.splice(index, 1);
        savePresets();
        renderPresets();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(main);
    item.appendChild(actions);
    presetList.appendChild(item);
  });
}

if (savePreset) {
  savePreset.addEventListener("click", () => {
    const code = barcodeInput.value.replace(/\D/g, "");
    const name = presetNameInput ? presetNameInput.value.trim() : "";

    if (code.length !== 4) {
      alert("バーコードは必ず4桁で入力してください（例：5kg→0005）");
      return;
    }

    if (!name) {
      alert("プリセット名を入力してください（例：5kg）");
      return;
    }

    presets.push({ name, code });
    savePresets();
    renderPresets();

    if (presetNameInput) presetNameInput.value = "";
  });
}

// =====================
// 履歴
// =====================
function renderHistory() {
  if (!historyList) return;

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = `<p class="help">まだ履歴はありません。</p>`;
    return;
  }

  history.forEach((code, index) => {
    const button = document.createElement("button");
    button.textContent = code;

    button.addEventListener("click", () => {
      barcodeInput.value = code;
      generateBarcode();
    });

    button.addEventListener("contextmenu", e => {
      e.preventDefault();
      if (confirm(`${code} を履歴から削除しますか？`)) {
        history.splice(index, 1);
        localStorage.setItem("history", JSON.stringify(history));
        renderHistory();
      }
    });

    historyList.appendChild(button);
  });
}

// =====================
// PNG保存
// =====================
if (downloadBarcode) {
  downloadBarcode.addEventListener("click", () => {
    if (!barcodeSvg || !barcodeSvg.innerHTML.trim()) {
      alert("先に4桁のバーコードを生成してください");
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(barcodeSvg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `barcode_${barcodeInput.value}.png`;
      a.click();
    };

    img.src = url;
  });
}

// =====================
// 全画面表示
// =====================
if (fullscreenBarcode) {
  fullscreenBarcode.addEventListener("click", () => {
    if (!barcodeSvg || !barcodeSvg.innerHTML.trim()) {
      alert("先に4桁のバーコードを生成してください");
      return;
    }

    if (!barcodeModal || !fullscreenSvg) return;

    fullscreenSvg.innerHTML = barcodeSvg.innerHTML;
    fullscreenSvg.setAttribute("viewBox", barcodeSvg.getAttribute("viewBox") || "");
    fullscreenSvg.setAttribute("width", barcodeSvg.getAttribute("width") || "100%");
    fullscreenSvg.setAttribute("height", barcodeSvg.getAttribute("height") || "auto");

    barcodeModal.classList.add("active");
  });
}

if (closeModal) {
  closeModal.addEventListener("click", () => {
    barcodeModal.classList.remove("active");
  });
}

// 初期描画
renderPresets();
renderHistory();