import { GROUP_KEY } from "./global.js";

const userName = localStorage.getItem("username");
const password = localStorage.getItem("password");
const ranking = JSON.parse(localStorage.getItem("ranking"));

document.getElementById("ranking-description").innerHTML = `
    <input id="title" type="text" value="${
      ranking.title
    }" maxlength=60 disabled></input>
    <img id="edit-title-icon" class="edit-icon permission-required" alt="edit icon" />
    <span id="title-error-field" class="error-field invisible">
            ⓘ
            <span class="invisible">
              The title must be 4-60 characters long
            </span>
          </span>
    <br><br>
    <textarea id="description" type="text" value="${
      ranking.description
    }" maxlength=300 disabled>This is my ranking</textarea>
    <img id="edit-description-icon" class="edit-icon permission-required" alt="edit icon" />
    
    <div id="created-at" class="depends-on-creation">Date created: ${
      ranking.id
        ? ranking.createdAt.split(".")[0].replace("T", " ").replaceAll("-", "/")
        : ""
    }</div>
    <div id="last-updated" class="depends-on-creation">Date last updated: ${
      ranking.id
        ? ranking.updatedAt.split(".")[0].replace("T", " ").replaceAll("-", "/")
        : ""
    }</div>
    <div id="username">Created by: ${ranking.username}</div>
`;

document
  .getElementById("delete-ranking")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    document.body.style.cursor = "wait";
    if (ranking.id) {
      await deleteRanking(ranking.id);
    }
    document.body.style.cursor = "unset";
    location = "main.html";
  });

for (const editIcon of document.getElementsByClassName("edit-icon")) {
  editIcon.addEventListener("click", () => {
    document.getElementById(
      editIcon.id.replace("-icon", "").replace("edit-", "")
    ).disabled = false;
  });
}

const errorField = document.getElementById("title-error-field");
errorField.addEventListener("mouseenter", () => {
  errorField.children[0].classList.remove("invisible");
});
errorField.addEventListener("mouseleave", () => {
  errorField.children[0].classList.add("invisible");
});
document.getElementById("title").addEventListener("input", (event) => {
  const val = event.target.value;
  if (val.length < 4) {
    errorField.classList.remove("invisible");
  } else {
    errorField.classList.add("invisible");
  }
  ranking.title = event.target.value;
  updateRankingData();
});
document.getElementById("description").addEventListener("input", (event) => {
  ranking.description = event.target.value;
  updateRankingData();
});

document.getElementById("save-button").addEventListener("click", async () => {
  document.body.style.cursor = "wait";
  const response = ranking.id ? await updateRanking(ranking.id) : await createRanking(ranking)
  document.body.style.cursor = "unset";
  if (!response) {
    return;
  }
  location = "main.html";
});

const rankingContainer = document.getElementById("ranking-container");

for (const tier of ranking.tiers) {
  rankingContainer.appendChild(createTier(tier));
}
const tierAdder = rankingContainer.appendChild(document.createElement("div"));
tierAdder.innerHTML = `
  <div id="tier-name-display">
    <div class="tier-utils"></div>
    <div class="tier-name-container">
      <textarea class="tier-name-field" disabled>+</textarea>
    </div>
  </div>
`;
const itemsContainer = tierAdder.appendChild(document.createElement("div"));
itemsContainer.classList.add("tier-items-container");
createItemAdder(itemsContainer);
tierAdder.classList.add("tier-container", "permission-required");
tierAdder.children[0].addEventListener(
  "click",
  (event) => {
    rankingContainer.insertBefore(
      createTier({
        title: "new tier",
        content: ["example-item"],
        color: "#444444",
      }),
      tierAdder
    );
    updateRankingData();
  },
  false
);

function createItemAdder(itemsContainer) {
  const itemAdder = itemsContainer.appendChild(document.createElement("div"));
  itemAdder.classList.add(
    "tier-add-item-container",
    "tier-item-container",
    "permission-required"
  );
  itemAdder.textContent = "+";
  itemAdder.addEventListener("click", () => {
    itemsContainer.insertBefore(createItem("new-item"), itemAdder);
    updateRankingData();
  });
  itemAdder.ondragenter = dragEnterItemAdder;
}

function createTier(tier) {
  const tierContainer = document.createElement("div");
  tierContainer.classList.add("tier-container");
  const tierName = document.createElement("div");
  tierName.id = "tier-name-display";
  const title = tier.title;
  tierName.innerHTML = `
    <div class="tier-utils invisible-space permission-required"">
      <input type="color" class="invisible tier-color-picker" value=${tier.color}></input>
      <img class="brush-icon" alt="brush-icon"></img>
      <img class="edit-icon" alt="edit-icon"></img>
      <img class="trash-icon" alt="trash-icon"></img>
    </div>
    <div class="tier-name-container">
      <textarea class="tier-name-field" type="text" disabled>${title}</textarea>
    </div>
  `;
  tierName.style.backgroundColor = tier.color;
  tierContainer.appendChild(tierName);

  const utils = tierContainer.children[0].children[0];
  tierContainer.children[0].addEventListener("mouseenter", () => {
    utils.classList.remove("invisible-space");
  });
  tierContainer.children[0].addEventListener("mouseleave", () => {
    utils.classList.add("invisible-space");
  });

  const textArea = tierContainer.getElementsByClassName("tier-name-field")[0];
  textArea.addEventListener("input", (e) => {
    updateRankingData();
  });
  const colorPicker =
    tierContainer.getElementsByClassName("tier-color-picker")[0];
  colorPicker.addEventListener("input", (e) => {
    tierName.style.backgroundColor = e.target.value;
    updateRankingData();
  });
  tierContainer
    .getElementsByClassName("edit-icon")[0]
    .addEventListener("click", (event) => {
      textArea.disabled = false;
    });
  tierContainer
    .getElementsByClassName("trash-icon")[0]
    .addEventListener("click", (event) => {
      tierContainer.remove();
      updateRankingData();
    });
  tierContainer
    .getElementsByClassName("brush-icon")[0]
    .addEventListener("click", (event) => {
      colorPicker.click();
    });

  const itemsContainer = tierContainer.appendChild(
    document.createElement("div")
  );
  itemsContainer.classList.add("tier-items-container");
  for (const item of tier.content) {
    itemsContainer.appendChild(createItem(item));
  }
  createItemAdder(itemsContainer);

  return tierContainer;
}

function createItem(item) {
  const itemContainer = document.createElement("div");
  itemContainer.innerHTML = `
      <div class="tier-item-utils invisible-space permission-required">
        <img class="edit-icon" alt="edit-icon"></img>
        <img class="trash-icon" alt="trash-icon"></img>
      </div>
      <div class="tier-item-name-container">
        <textarea class="tier-item-name-field" type="text" disabled>${item}</textarea>
      </div>
    `;
  const textArea = itemContainer.getElementsByClassName(
    "tier-item-name-field"
  )[0];
  textArea.addEventListener("input", () => {
    updateRankingData();
  });
  itemContainer
    .getElementsByClassName("edit-icon")[0]
    .addEventListener("click", (event) => {
      textArea.disabled = false;
    });
  itemContainer
    .getElementsByClassName("trash-icon")[0]
    .addEventListener("click", (event) => {
      itemContainer.remove();
      updateRankingData();
    });
  itemContainer.classList.add("tier-item-container");
  const utils = itemContainer.children[0];
  itemContainer.addEventListener("mouseenter", () => {
    utils.classList.remove("invisible-space");
  });
  itemContainer.addEventListener("mouseleave", () => {
    utils.classList.add("invisible-space");
  });

  itemContainer.draggable = isAuthenticated();
  itemContainer.ondragstart = dragStart;
  itemContainer.ondragenter = dragEnter;
  itemContainer.ondrop = drop;
  itemContainer.ondragover = dragOver;
  itemContainer.ondragend = dragEnd;

  return itemContainer;
}

let eventTransferData;
function dragStart(e) {
  const target = e.currentTarget;
  eventTransferData = [
    target.children[1].children[0].value,
    target.nextSibling,
  ];
  setTimeout(() => {
    e.target.remove();
  }, 0);
}

function createPlaceHolder(current) {
  const placeholder = document.createElement("div");
  placeholder.classList.add("tier-item-container", "temp");
  placeholder.ondragleave = dragLeave;
  placeholder.ondrop = drop;
  placeholder.ondragover = dragOver;
  return placeholder;
}
function dragEnter(e) {
  const current = e.currentTarget;
  const placeholder = createPlaceHolder(current);
  if (hasPlaceholderBefore(current)) {
    current.parentElement.insertBefore(placeholder, current.nextSibling);
  } else {
    current.parentElement.insertBefore(placeholder, current);
  }
}
function hasPlaceholderBefore(current) {
  if (current.previousSibling === null) return false;
  if (current.previousSibling.classList.contains("temp")) return true;
  return hasPlaceholderBefore(current.previousSibling);
}
function dragEnterItemAdder(e) {
  const current = e.currentTarget;
  const placeholder = createPlaceHolder(current);
  if (!hasPlaceholderBefore(current)) {
    current.parentElement.insertBefore(placeholder, current);
  }
}

function dragLeave(e) {
  setTimeout(() => {
    e.target.remove();
  }, 0);
}
function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  const title = eventTransferData[0];
  eventTransferData = "";
  const current = e.currentTarget;

  const newNode = current.parentElement.insertBefore(
    createItem(title),
    current
  );
  current.remove();

  updateRankingData();
}

function dragEnd(e) {
  if (!eventTransferData) {
    return;
  }
  const itemsContainer = eventTransferData[1].parentElement;
  const newNode = itemsContainer.insertBefore(
    createItem(eventTransferData[0]),
    eventTransferData[1]
  );
}

function updateRankingData() {
  const tiers = [];
  for (const tier of rankingContainer.children) {
    const tierItems = [];
    for (const item of tier.children[1].children) {
      tierItems.push(item.children[1]?.children[0]?.value);
    }
    tierItems.pop();
    tiers.push({
      title: tier.children[0].children[1].children[0].value,
      content: tierItems,
      color: rgbToHex(
        tier.children[0].style.backgroundColor
          .replace("rgb(", "")
          .replace(")", "")
          .split(",")
      ),
    });
  }
  tiers.pop();

  ranking.tiers = tiers;
  localStorage.setItem("ranking", JSON.stringify(ranking));
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
    return true;
  } else {
    alert(
      "One of the following requirements isn't met: \n" +
        " - Title must be 4-60 characters long\n" +
        " - Ranking must contain at least 2 tiers\n" +
        " - Tiers must contain at least 1 item"
    );
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

  if (response.status === 201) {
    return true;
  } else {
    alert("One of the following requirements isn't met: \n" +
        " - Title must be 4-60 characters long\n" +
        " - Ranking must contain at least 2 tiers\n" +
        " - Tiers must contain at least 1 item");
    return false;
  }
}

if (!isAuthenticated()) {
  for (const item of document.getElementsByClassName("permission-required")) {
    item.classList.add("invisible-permanent");
  }
}

if (!ranking.id) {
  for (const item of document.getElementsByClassName("depends-on-creation")) {
    item.classList.add("invisible-permanent");
  }
}

function isAuthenticated() {
  return userName == ranking.username;
}

function rgbToHex([r, g, b]) {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
