let list = JSON.parse(localStorage.getItem("shoppingList")) || [];

function cleanUrl() {
	const cleanUrl = window.location.origin + window.location.pathname;
	window.history.replaceState(null, null, cleanUrl);
}

const params = new URLSearchParams(window.location.search);
const itemsParam = params.get("items");
if (itemsParam) {
	try {
		list = itemsParam.split(',').map(part => {
			const lastColonIndex = part.lastIndexOf(':');

			if (lastColonIndex === -1) {
				return {
					name: decodeURIComponent(part),
					checked: false
				};
			}

			const namePart = part.substring(0, lastColonIndex);
			const status = part.substring(lastColonIndex + 1);

			return {
				name: decodeURIComponent(namePart),
				checked: status === '1'
			};
		});

		saveList();
		cleanUrl();
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
		list.push({
			name,
			checked: false
		});
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

document.getElementById("removeListItems").addEventListener("click", function() {
	if (confirm("Liste wirklich löschen?")) {
		list = [];
		saveList();
		renderList();
		cleanUrl();
	}
});

function shareLink() {
	const baseUrl = window.location.origin + window.location.pathname;

	const items = list.map(item =>
		`${encodeURIComponent(item.name)}:${item.checked ? '1' : '0'}`
	).join(',');

	const shareUrl = `${baseUrl}?items=${items}`;

	navigator.clipboard.writeText(shareUrl).then(() => {
		alert("Link kopiert! Einfach weiterschicken.");
	}).catch(() => {
		alert("Konnte Link nicht kopieren, hier ist er:\n" + shareUrl);
	});
}

document.getElementById("shareLinkBtn").onclick = shareLink;

document.getElementById("itemInput").addEventListener("keyup", event => {
	if (event.key === "Enter") addItem();
});

renderList();