
let list = JSON.parse(localStorage.getItem("shoppingList")) || [];

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

renderList();
