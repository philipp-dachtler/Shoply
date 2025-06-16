let list = JSON.parse(localStorage.getItem("shoppingList")) || [];

// 1. Push-Benachrichtigungen: Berechtigung anfordern + Timer starten
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Push-Benachrichtigungen aktiviert!");
    startReminderTimer();
    registerServiceWorker();
  } else {
    console.warn("Benachrichtigungen wurden blockiert");
  }
}

// 2. Service Worker registrieren
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registriert");
    } catch (error) {
      console.error("Service Worker Registration failed:", error);
    }
  }
}

// 3. Timer für 12-Stunden-Erinnerung
function startReminderTimer() {
  // Sofort testen (Dev-Modus: Kommentar für Produktion entfernen)
  // showTestNotification();

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

// 4. Test-Button für Benachrichtigungen (optional)
function setupNotificationButton() {
  const notificationBtn = document.createElement("button");
  notificationBtn.id = "notification-btn";
  notificationBtn.textContent = "🔔 Benachrichtigung testen";
  notificationBtn.style.position = "fixed";
  notificationBtn.style.bottom = "10px";
  notificationBtn.style.right = "10px";
  notificationBtn.style.zIndex = "1000";
  notificationBtn.onclick = showTestNotification;
  document.body.appendChild(notificationBtn);
}

// 5. Testbenachrichtigung anzeigen
function showTestNotification() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_REMINDER",
      title: "Test-Erinnerung",
      body: "Dies ist ein Test der Einkaufs-Erinnerung!",
    });
  }
}

// --- Bestehende Einkaufslisten-Logik (angepasst) ---
function cleanUrl() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState(null, null, cleanUrl);
}

// Initialisierung beim Laden
document.addEventListener("DOMContentLoaded", () => {
  // URL-Parameter verarbeiten
  const params = new URLSearchParams(window.location.search);
  const itemsParam = params.get("items");
  if (itemsParam) {
    try {
      list = itemsParam.split(',').map(part => {
        const lastColonIndex = part.lastIndexOf(':');
        if (lastColonIndex === -1) {
          return { name: decodeURIComponent(part), checked: false };
        }
        return {
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
  setupNotificationButton(); // Test-Button hinzufügen
  requestNotificationPermission(); // Berechtigung anfordern
});

function saveList() {
  localStorage.setItem("shoppingList", JSON.stringify(list));
}

function renderList() {
  const ul = document.getElementById("shoppingList");
  ul.innerHTML = "";
  list.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.name;
    if (item.checked) li.classList.add("checked");
    li.onclick = () => toggleItem(index);
    ul.appendChild(li);
  });
}

function addItem() {
  const input = document.getElementById("itemInput");
  const name = input.value.trim();
  if (name) {
    list.push({ name, checked: false });
    input.value = "";
    saveList();
    renderList();
    input.focus();
  }
}

function toggleItem(index) {
  list[index].checked = !list[index].checked;
  saveList();
  renderList();
}

document.getElementById("addItem").addEventListener("click", addItem);
document.getElementById("itemInput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") addItem();
});

document.getElementById("removeListItems").addEventListener("click", function() {
  if (confirm("Liste wirklich löschen?")) {
    list = [];
    saveList();
    renderList();
    cleanUrl();
  }
});

function generateShareUrl() {
  const baseUrl = window.location.origin + window.location.pathname;
  const items = list.map(item => 
    `${encodeURIComponent(item.name)}:${item.checked ? '1' : '0'}`
  ).join(',');
  return `${baseUrl}?items=${items}`;
}

function shareLink() {
  const shareUrl = generateShareUrl();
  navigator.clipboard.writeText(shareUrl).then(() => {
    if (navigator.share) {
      navigator.share({
        title: 'Meine Einkaufsliste',
        text: 'Hier ist meine Einkaufsliste:',
        url: shareUrl
      }).catch(console.error);
    } else {
      alert("Link kopiert! Einfach weiterschicken.");
    }
  }).catch(() => {
    alert("Link zum Kopieren:\n" + shareUrl);
  });
}

document.getElementById("shareLinkBtn").onclick = shareLink;
