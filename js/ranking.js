import { GROUP_KEY } from "./global.js";

const userName = localStorage.getItem("username");
const password = localStorage.getItem("password");
const ranking = JSON.parse(localStorage.getItem("ranking"));

buildRankingDescription(ranking);
buildRankingGrid(ranking);

setVisibility(document.getElementById("edit-container"));
setVisibility(document.getElementById("delete-ranking"));

const saveButton = document.getElementById("save-button");
saveButton.textContent = ranking.id ? "Save Edits" : "Create Ranking";

saveButton.addEventListener("click", async () => {
  const newRanking = ranking.id
    ? await updateRanking(ranking.id)
    : await createRanking(ranking);
  localStorage.setItem("ranking", JSON.stringify(newRanking));
  saveButton.style.backgroundColor = "var(--border-color)";
  saveButton.style.pointerEvents = "none";
  if (!ranking.id) location = "main.html";
});

function buildRankingDescription(ranking) {
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const createdAt = document.getElementById("created-at");
  const updatedAt = document.getElementById("updated-at");
  const username = document.getElementById("username");
  const remove = document.getElementById("delete-ranking");
  const editTitle = document.createElement("img");
  const editDescription = document.createElement("img");

  setVisibility(editTitle);
  setVisibility(editDescription);

  remove.innerHTML = "Delete Ranking";
  remove.addEventListener("click", async () => {
    ranking.id ? await deleteRanking(ranking.id) : null;
    location.href = "main.html";
  });

  title.innerHTML = ranking.title;
  description.innerHTML = "DESCRIPTION<br>" + ranking.description;
  ranking.id
    ? (createdAt.innerHTML =
        "CREATED-AT<br>" + ranking.createdAt.split(".")[0].replace("T", ", "))
    : null;
  ranking.id
    ? (updatedAt.innerHTML =
        "LAST-UPDATED<br>" + ranking.updatedAt.split(".")[0].replace("T", ", "))
    : null;
  username.innerHTML = "BY<br>" + ranking.username;

  editTitle.classList = "edit-icon";
  editDescription.classList = "edit-icon";
  title.appendChild(editTitle);
  description.appendChild(editDescription);

  editTitle.addEventListener("click", () => {
    const newTitle = prompt(
      "Enter New Title:\n(The title must be 4-60 characters long)"
    );
    if (!isValid(newTitle, "title", "The title must be 4-60 characters long!"))
      return;

    ranking.title = newTitle;
    buildRankingDescription(ranking);
    saveButtonActive();
  });

  editDescription.addEventListener("click", () => {
    const newDescription = prompt("Enter New Description:");
    if (
      !isValid(
        newDescription,
        "description",
        "The description must be less than 300 characters!"
      )
    )
      return;

    ranking.description = newDescription;
    buildRankingDescription(ranking);
    saveButtonActive();
  });
}

function buildRankingGrid(ranking) {
  const rankingContainer = document.getElementById("ranking-container");
  rankingContainer.innerHTML = "";

  const tiersLength = ranking.tiers.length;
  let longestTier = 1;

  for (let i = 0; i < tiersLength; i++) {
    const currentTierLength = ranking.tiers[i].content.length;
    if (currentTierLength > longestTier) {
      longestTier = currentTierLength;
    }
  }
  longestTier += 1;

  for (let i = 0; i < tiersLength; i++) {
    const tierGrid = document.createElement("div");
    tierGrid.className = "tier-grid";
    rankingContainer.appendChild(tierGrid);

    const tier = ranking.tiers[i];
    let count = 1;

    const tierTitleContainer = createItemContainer(
      "tier-title",
      tier.title,
      tier.color,
      i,
      -1,
      tier,
      ranking
    );
    tierGrid.appendChild(tierTitleContainer.container);

    for (let j = 0; j < tier.content.length; j++) {
      const item = tier.content[j];

      const tierContentContainer = createItemContainer(
        "tier-content",
        item,
        "",
        i,
        j,
        tier,
        ranking
      );
      tierGrid.appendChild(tierContentContainer.container);
      count++;
    }

    while (count < longestTier) {
      const blankItem = document.createElement("div");
      blankItem.className = "blank-item";
      blankItem.dataset.tierIndex = i;
      blankItem.dataset.itemIndex = count - 1;

      blankItem.ondragover = dragOver;
      blankItem.ondragleave = dragLeave;
      blankItem.ondrop = drop;
      tierGrid.appendChild(blankItem);
      count++;
    }
  }
}

function createItemContainer(
  type,
  value,
  color,
  tierIndex,
  itemIndex,
  tier,
  ranking
) {
  const container = document.createElement("div");
  const input = document.createElement("input");
  const dropDownContainer = document.createElement("div");
  const editIcon = document.createElement("img");
  const dropDown = document.createElement("div");
  const deleteItem = document.createElement("div");
  const editItem = document.createElement("div");
  const addItem = document.createElement("div");
  let colorPicker;

  if (type === "tier-title") {
    input.className = "title-item";
    input.type = "text";
    input.value = value;
    input.style.pointerEvents = "none";
    input.style.backgroundColor = color;

    container.className = "item-container";
    container.draggable = false;
    container.style.backgroundColor = color;

    colorPicker = document.createElement("input");
    colorPicker.className = "ranking-color-picker";
    colorPicker.type = "color";
    colorPicker.value = color;
    setVisibility(colorPicker);
    container.appendChild(colorPicker);
  } else {
    input.className = "content-item";
    input.type = "text";
    input.value = value;
    input.style.pointerEvents = "none";

    container.className = "item-container";
    container.draggable = isAuthenticated() ? true : false;
    container.ondragstart = dragStart;
    container.ondragover = dragOver;
    container.ondragleave = dragLeave;
    container.ondragend = dragEnd;
    container.ondrop = drop;
    container.dataset.tierIndex = tierIndex;
    container.dataset.itemIndex = itemIndex;
  }

  dropDownContainer.classList = "drop-down-container";
  setVisibility(dropDownContainer);

  editIcon.classList = "edit-icon";

  dropDown.classList = "ranking-drop-down invisible";
  dropDownContainer.style.zIndex = "0";

  deleteItem.classList = "ranking-drop-down-item";
  deleteItem.textContent =
    type === "tier-title" ? "Delete Tier" : "Delete Item";

  editItem.classList = "ranking-drop-down-item";
  editItem.textContent = type === "tier-title" ? "Edit Tier" : "Edit Item";

  addItem.classList = "ranking-drop-down-item";
  addItem.textContent = type === "tier-title" ? "Add Tier" : "Add Item";

  editIcon.addEventListener("click", () => {
    dropDown.classList.toggle("invisible");
    dropDownContainer.style.zIndex =
      dropDownContainer.style.zIndex === "1" ? "0" : "1";
  });

  deleteItem.addEventListener("click", () => {
    if (type === "tier-title") {
      if (
        !isValid(ranking.tiers, "tiers", "A ranking needs at least two tiers!")
      )
        return;
      ranking.tiers.splice(tierIndex, 1)[0];
    } else {
      if (
        !isValid(
          tier.content,
          "tier-content",
          "A tier needs at least one element!"
        )
      )
        return;
      tier.content.splice(itemIndex, 1)[0];
    }
    buildRankingGrid(ranking);
    saveButtonActive();
  });

  editItem.addEventListener("click", () => {
    input.style.pointerEvents = "auto";
    container.draggable = false;
    dropDown.classList.toggle("invisible");
    dropDownContainer.style.zIndex = "0";

    input.focus();
    input.select();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
    }
  });

  input.addEventListener("blur", () => {
    input.style.pointerEvents = "none";
    container.draggable = type == "tier-title" ? false : true;

    if (type === "tier-title" && tier.title != input.value) {
      if (
        !isValid(
          input.value,
          "tier-title",
          "The title must be 4-60 characters long!"
        )
      ) {
        buildRankingGrid(ranking);
        return;
      }

      tier.title = input.value;
      saveButtonActive();
    } else if (
      type === "tier-content" &&
      tier.content[itemIndex] != input.value
    ) {
      tier.content[itemIndex] = input.value;
      saveButtonActive();
    }
    buildRankingGrid(ranking);
  });

  addItem.addEventListener("click", () => {
    if (type === "tier-title") {
      const newTierTitle = prompt("Enter new tier:");
      if (
        !isValid(
          newTierTitle,
          "tier-title",
          "The title must be 4-60 characters long!"
        )
      )
        return;

      const newItem1 = prompt(
        "A rank requires at least two items. Enter first item:"
      );
      const newItem2 = prompt(
        "A rank requires at least two items. Enter second item:"
      );

      if (newTierTitle && newItem1 && newItem2) {
        const newTier = {
          title: newTierTitle,
          color: "var(--border-color)",
          content: [newItem1, newItem2],
        };
        ranking.tiers.push(newTier);
        buildRankingGrid(ranking);
        saveButtonActive();
      }
    } else {
      const newItem = prompt("Enter new item:");
      if (newItem) {
        tier.content.splice(itemIndex + 1, 0, newItem);
        buildRankingGrid(ranking);
        saveButtonActive();
      }
    }
  });

  if (type === "tier-title") {
    colorPicker.addEventListener("blur", () => {
      if (ranking.tiers[tierIndex].color != colorPicker.value) {
        ranking.tiers[tierIndex].color = colorPicker.value;
        buildRankingGrid(ranking);
        saveButtonActive();
      }
    });
  }

  container.appendChild(input);
  container.appendChild(dropDownContainer);
  dropDownContainer.appendChild(editIcon);
  dropDownContainer.appendChild(dropDown);
  dropDown.appendChild(deleteItem);
  dropDown.appendChild(editItem);
  dropDown.appendChild(addItem);

  return { container, colorPicker };
}

function dragStart(e) {
  const editMenu = e.currentTarget.querySelector(".drop-down-container");
  if (editMenu) editMenu.style.display = "none";
  e.dataTransfer.setData(
    "text/plain",
    e.target.dataset.tierIndex + "," + e.target.dataset.itemIndex
  );
  e.currentTarget.style.backgroundColor = "";
}

function dragOver(e) {
  e.preventDefault();
  e.currentTarget.style.backgroundColor = "var(--accent-color-2)";
  const editMenu = e.currentTarget.querySelector(".drop-down-container");
  if (editMenu) editMenu.style.pointerEvents = "none";
}

function dragLeave(e) {
  e.currentTarget.style.backgroundColor = "";
}

function drop(e) {
  e.preventDefault();
  e.currentTarget.style.backgroundColor = "";

  const data = e.dataTransfer.getData("text/plain").split(",");
  const [fromTierIndex, fromItemIndex] = data.map(Number);
  const toTierIndex = e.target.dataset.tierIndex;
  const toItemIndex = e.target.dataset.itemIndex;

  const editMenu = e.currentTarget.querySelector(".drop-down-container");
  if (editMenu) editMenu.style.pointerEvents = "auto";

  if (
    !isValid(
      ranking.tiers[fromTierIndex].content,
      "tier-content",
      "A tier needs at least one item!"
    )
  )
    return;

  const item = ranking.tiers[fromTierIndex].content.splice(fromItemIndex, 1)[0];
  ranking.tiers[toTierIndex].content.splice(toItemIndex, 0, item);

  if (fromTierIndex != toTierIndex || fromItemIndex != toItemIndex)
    saveButtonActive();
}

function dragEnd(e) {
  const editMenu = e.currentTarget.querySelector(".drop-down-container");
  if (editMenu) editMenu.style.display = "auto";
  buildRankingGrid(ranking);
}

function isAuthenticated() {
  return userName === ranking.username;
}

function setVisibility(element) {
  if (isAuthenticated()) {
    element.classList.remove("invisible");
  } else {
    element.classList.add("invisible");
  }
}

function saveButtonActive() {
  const saveButton = document.getElementById("save-button");
  saveButton.style.backgroundColor = "var(--accent-color-2)";
  saveButton.style.pointerEvents = "auto";
}

async function deleteRanking(id) {
  const response = await fetch("https://lukas.rip/api/rankings/" + id, {
    method: "DELETE",
    headers: {
      "group-key": GROUP_KEY,
      authorization: `Basic ${btoa(userName + ":" + password)}`,
    },
  });

  if (response.status === 204) {
    console.log("deleted ranking");
    return true;
  } else {
    alert("Can’t delete this ranking, error:" + response.status);
    return false;
  }
}

async function updateRanking(id) {
  const response = await fetch("https://lukas.rip/api/rankings/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "group-key": GROUP_KEY,
      authorization: `Basic ${btoa(userName + ":" + password)}`,
    },
    body: JSON.stringify(ranking),
  });

  if (response.status === 200) {
    console.log("updated ranking");
    return ranking;
  } else {
    alert("Can’t update this ranking, error: " + response.status);
    return false;
  }
}

async function createRanking(ranking) {
  const userName = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  const response = await fetch("https://lukas.rip/api/rankings", {
    method: "POST",
    headers: {
      "group-key": GROUP_KEY,
      "Content-Type": "application/json",
      authorization: `Basic ${btoa(`${userName}:${password}`)}`,
    },
    body: JSON.stringify({
      title: ranking.title,
      description: ranking.description,
      tiers: ranking.tiers,
    }),
  });

  console.log(response.status);
  if (response.status === 201) {
    return ranking;
  } else if (response.status === 401) {
    alert("can´t create ranking");
    return false;
  }
}

function isValid(input, id, message) {
  let isValid;

  if (input === null) return;

  switch (id) {
    case "title":
    case "tier-title":
      isValid = input.length >= 4 && input.length <= 60;
      break;
    case "description":
      isValid = input.length <= 300;
      break;
    case "tiers":
      isValid = input.length > 2;
      break;
    case "tier-content":
      isValid = input.length > 1;
      break;
    default:
      isValid = true;
  }
  if (!isValid) alert("Invalid: " + message);
  return isValid;
}
