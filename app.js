let list = JSON.parse(localStorage.getItem("shoppingList")) || [];

// ==================== PUSH-BENACHRICHTIGUNGEN ====================
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
    } catch (error) {
      console.error("Service Worker Fehler:", error);
    }
  }
}

function startReminderTimer() {
  // Alle 10 Sekunden (statt 12 Stunden)
  setInterval(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_REMINDER",
        title: "Einkaufs-Erinnerung",
        body: "Hast du schon alles eingekauft? 🛒",
      });
    }
  }, 10000); // 10.000 Millisekunden = 10 Sekunden
}

// ==================== BESTEHENDE FUNKTIONEN ====================
function cleanUrl() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState(null, null, cleanUrl);
}

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

// ==================== INITIALISIERUNG ====================
document.addEventListener("DOMContentLoaded", () => {
  // URL-Parameter verarbeiten (für geteilte Listen)
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
  requestNotificationPermission(); // Startet den 10-Sekunden-Timer
});

// Event-Listener
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
