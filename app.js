let list = JSON.parse(localStorage.getItem("shoppingList")) || [];

// URL beim Laden checken und Liste aus URL laden
const params = new URLSearchParams(window.location.search);
const itemsParam = params.get("items");
if (itemsParam) {
  try {
    list = itemsParam.split(",").map(name => ({ name, checked: false }));
    saveList();
  } catch (e) {
    console.error("Fehler beim Parsen der Liste aus URL", e);
  }
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
  }
}

function toggleItem(index) {
  list[index].checked = !list[index].checked;
  saveList();
  renderList();
}

function clearList() {
  if (confirm("Liste wirklich löschen?")) {
    list = [];
    saveList();
    renderList();
  }
}

// Funktion zum Teilen-Link erzeugen und kopieren
function shareLink() {
  const baseUrl = window.location.origin + window.location.pathname;
  const items = encodeURIComponent(list.map(item => item.name).join(","));
  const shareUrl = `${baseUrl}?items=${items}`;

  navigator.clipboard.writeText(shareUrl).then(() => {
    alert("Link kopiert! Einfach weiterschicken.");
  }).catch(() => {
    alert("Konnte Link nicht kopieren, hier ist er:\n" + shareUrl);
  });
}

// Eventlistener für Teilen-Button
document.getElementById("shareLinkBtn").onclick = shareLink;

// Initiales Rendern
renderList();
