// script.js
// דשבורד לקריאת status.json מריפו GitHub

// עדכן כאן את שם המשתמש שלך בגיטהאב
const GITHUB_USERNAME = "Guy Barkan"; // לדוגמה: "GuyBarkan"
const STATUS_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/price-agent-dashboard/main/status.json`;

let autoRefresh = true;
let autoRefreshHandle = null;

const elStatusRunning = document.getElementById("status-running");
const elStatusTime = document.getElementById("status-time");
const elStatusCount = document.getElementById("status-count");
const elProgressBar = document.getElementById("progress-bar");
const elProductsBody = document.getElementById("products-body");
const btnRefresh = document.getElementById("btn-refresh");
const btnToggleAuto = document.getElementById("btn-toggle-auto");

async function fetchStatus() {
  try {
    btnRefresh.disabled = true;
    const res = await fetch(STATUS_URL + "?t=" + Date.now());
    if (!res.ok) {
      throw new Error("סטטוס לא זמין (HTTP " + res.status + ")");
    }
    const data = await res.json();
    renderStatus(data);
  } catch (err) {
    console.error(err);
    elStatusRunning.textContent = "שגיאה בקריאה ל-status.json";
  } finally {
    btnRefresh.disabled = false;
  }
}

function renderStatus(status) {
  if (!status) return;

  const total = status.totalProducts || 0;
  const processed = status.processedProducts || 0;
  const lastUpdate = status.lastUpdate || status.lastRun || "";
  const running = status.running;

  elStatusRunning.textContent = running ? "רץ" : "הסתיים";
  elStatusTime.textContent = lastUpdate || "—";
  elStatusCount.textContent = `${processed} / ${total}`;

  let percent = 0;
  if (total > 0) {
    percent = Math.round((processed / total) * 100);
  }
  elProgressBar.style.width = percent + "%";

  elProductsBody.innerHTML = "";
  const products = status.products || [];
  products.forEach((p) => {
    const tr = document.createElement("tr");

    const statusText = p.status || "";
    let rowClass = "status-none";
    if (statusText.includes("זול יותר או זהה")) {
      rowClass = "status-better";
    } else if (statusText.includes("יקר יותר")) {
      rowClass = "status-worse";
    }
    tr.className = rowClass;

    const diffDisplay =
      typeof p.diff === "number" && !isNaN(p.diff)
        ? p.diff.toFixed(2)
        : p.diff || "";

    tr.innerHTML = `
      <td>${p.product_name || ""}</td>
      <td>${p.model || ""}</td>
      <td>${p.price_paid || ""}</td>
      <td>${p.found_price || ""}</td>
      <td>${diffDisplay}</td>
      <td>${statusText}</td>
      <td>${p.url ? `<a href="${p.url}" target="_blank">קישור</a>` : ""}</td>
      <td>${p.screenshot || ""}</td>
    `;

    elProductsBody.appendChild(tr);
  });
}

function startAutoRefresh() {
  if (autoRefreshHandle) return;
  autoRefreshHandle = setInterval(fetchStatus, 10000); // כל 10 שניות
  btnToggleAuto.textContent = "עצור רענון אוטומטי";
}

function stopAutoRefresh() {
  if (autoRefreshHandle) {
    clearInterval(autoRefreshHandle);
    autoRefreshHandle = null;
  }
  btnToggleAuto.textContent = "הפעל רענון אוטומטי";
}

btnRefresh.addEventListener("click", () => {
  fetchStatus();
});

btnToggleAuto.addEventListener("click", () => {
  autoRefresh = !autoRefresh;
  if (autoRefresh) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

// התחלה: רענון מיידי + רענון אוטומטי
fetchStatus();
startAutoRefresh();
