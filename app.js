let list = JSON.parse(localStorage.getItem("shoppingList")) || [];

// ==================== NEUE FUNKTIONEN (PUSH-BENACHRICHTIGUNGEN) ====================
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Benachrichtigungen aktiviert!");
    startReminderTimer();
    registerServiceWorker();
  }
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registriert!");
    } catch (error) {
      console.error("Service Worker Fehler:", error);
    }
  }
}

function startReminderTimer() {
  // Nur alle 12 Stunden trigger (in Prod)
  setInterval(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_REMINDER",
        title: "Einkaufs-Erinnerung",
        body: "Hast du heute schon eingekauft? 🛒",
      });
    }
  }, 12 * 60 * 60 * 1000); // 12 Stunden
}

// Test-Button (für Entwicklung)
function setupNotificationButton() {
  const btn = document.createElement("button");
  btn.id = "notification-test-btn";
  btn.textContent = "🔔 Test";
  btn.style.position = "fixed";
  btn.style.bottom = "20px";
  btn.style.right = "20px";
  btn.style.zIndex = "1000";
  btn.onclick = () => {
    navigator.serviceWorker?.controller.postMessage({
      type: "SHOW_REMINDER",
      title: "Test",
      body: "Push funktioniert!",
    });
  };
  document.body.appendChild(btn);
}

// ==================== BESTEHENDE FUNKTIONEN (EINKAUFSLISTE) ====================
function cleanUrl() { /* ... unverändert ... */ }
function saveList() { /* ... unverändert ... */ }
function renderList() { /* ... unverändert ... */ }
function addItem() { /* ... unverändert ... */ }
function toggleItem(index) { /* ... unverändert ... */ }
function generateShareUrl() { /* ... unverändert ... */ }
function shareLink() { /* ... unverändert ... */ }

// ==================== INITIALISIERUNG ====================
document.addEventListener("DOMContentLoaded", () => {
  // Bestehende Logik (URL-Parameter, Liste rendern)
  const params = new URLSearchParams(window.location.search);
  if (params.get("items")) {
    try {
      list = params.get("items").split(',').map(part => {
        const lastColonIndex = part.lastIndexOf(':');
        return lastColonIndex === -1
          ? { name: decodeURIComponent(part), checked: false }
          : {
              name: decodeURIComponent(part.substring(0, lastColonIndex)),
              checked: part.substring(lastColonIndex + 1) === '1'
            };
      });
      saveList();
      cleanUrl();
    } catch (e) {
      console.error("Fehler beim Parsen der URL-Parameter", e);
    }
  }

  renderList();
  setupNotificationButton(); // Nur für Tests!
  requestNotificationPermission();
});

// Event-Listener (unverändert)
document.getElementById("addItem").addEventListener("click", addItem);
document.getElementById("itemInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") addItem();
});
document.getElementById("removeListItems").addEventListener("click", () => {
  if (confirm("Liste wirklich löschen?")) {
    list = [];
    saveList();
    renderList();
    cleanUrl();
  }
});
document.getElementById("shareLinkBtn").onclick = shareLink;
