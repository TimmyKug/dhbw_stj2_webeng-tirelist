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

for (const tire of ranking.tiers) {
  rankingContainer.appendChild(createtire(tire));
}
const tireAdder = rankingContainer.appendChild(document.createElement("div"));
tireAdder.innerHTML = `
  <div id="tire-name-display">
    <div class="tire-utils"></div>
    <div class="tire-name-container">
      <textarea class="tire-name-field" disabled>+</textarea>
    </div>
  </div>
`;
const itemsContainer = tireAdder.appendChild(document.createElement("div"));
itemsContainer.classList.add("tire-items-container");
createItemAdder(itemsContainer);
tireAdder.classList.add("tire-container", "permission-required");
tireAdder.children[0].addEventListener(
  "click",
  (event) => {
    rankingContainer.insertBefore(
      createtire({
        title: "new tire",
        content: ["example-item"],
        color: "#444444",
      }),
      tireAdder
    );
    updateRankingData();
  },
  false
);

function createItemAdder(itemsContainer) {
  const itemAdder = itemsContainer.appendChild(document.createElement("div"));
  itemAdder.classList.add(
    "tire-add-item-container",
    "tire-item-container",
    "permission-required"
  );
  itemAdder.textContent = "+";
  itemAdder.addEventListener("click", () => {
    itemsContainer.insertBefore(createItem("new-item"), itemAdder);
    updateRankingData();
  });
  itemAdder.ondragenter = dragEnterItemAdder;
}

function createtire(tire) {
  const tireContainer = document.createElement("div");
  tireContainer.classList.add("tire-container");
  const tireName = document.createElement("div");
  tireName.id = "tire-name-display";
  const title = tire.title;
  tireName.innerHTML = `
    <div class="tire-utils invisible-space permission-required"">
      <input type="color" class="invisible tire-color-picker" value=${tire.color}></input>
      <img class="brush-icon" alt="brush-icon"></img>
      <img class="edit-icon" alt="edit-icon"></img>
      <img class="trash-icon" alt="trash-icon"></img>
    </div>
    <div class="tire-name-container">
      <textarea class="tire-name-field" type="text" disabled>${title}</textarea>
    </div>
  `;
  tireName.style.backgroundColor = tire.color;
  tireContainer.appendChild(tireName);

  const utils = tireContainer.children[0].children[0];
  tireContainer.children[0].addEventListener("mouseenter", () => {
    utils.classList.remove("invisible-space");
  });
  tireContainer.children[0].addEventListener("mouseleave", () => {
    utils.classList.add("invisible-space");
  });

  const textArea = tireContainer.getElementsByClassName("tire-name-field")[0];
  textArea.addEventListener("input", (e) => {
    updateRankingData();
  });
  const colorPicker =
    tireContainer.getElementsByClassName("tire-color-picker")[0];
  colorPicker.addEventListener("input", (e) => {
    tireName.style.backgroundColor = e.target.value;
    updateRankingData();
  });
  tireContainer
    .getElementsByClassName("edit-icon")[0]
    .addEventListener("click", (event) => {
      textArea.disabled = false;
    });
  tireContainer
    .getElementsByClassName("trash-icon")[0]
    .addEventListener("click", (event) => {
      tireContainer.remove();
      updateRankingData();
    });
  tireContainer
    .getElementsByClassName("brush-icon")[0]
    .addEventListener("click", (event) => {
      colorPicker.click();
    });

  const itemsContainer = tireContainer.appendChild(
    document.createElement("div")
  );
  itemsContainer.classList.add("tire-items-container");
  for (const item of tire.content) {
    itemsContainer.appendChild(createItem(item));
  }
  createItemAdder(itemsContainer);

  return tireContainer;
}

function createItem(item) {
  const itemContainer = document.createElement("div");
  itemContainer.innerHTML = `
      <div class="tire-item-utils invisible-space permission-required">
        <img class="edit-icon" alt="edit-icon"></img>
        <img class="trash-icon" alt="trash-icon"></img>
      </div>
      <div class="tire-item-name-container">
        <textarea class="tire-item-name-field" type="text" disabled>${item}</textarea>
      </div>
    `;
  const textArea = itemContainer.getElementsByClassName(
    "tire-item-name-field"
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
  itemContainer.classList.add("tire-item-container");
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
  placeholder.classList.add("tire-item-container", "temp");
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
  const tires = [];
  for (const tire of rankingContainer.children) {
    const tireItems = [];
    for (const item of tire.children[1].children) {
      tireItems.push(item.children[1]?.children[0]?.value);
    }
    tireItems.pop();
    tires.push({
      title: tire.children[0].children[1].children[0].value,
      content: tireItems,
      color: rgbToHex(
        tire.children[0].style.backgroundColor
          .replace("rgb(", "")
          .replace(")", "")
          .split(",")
      ),
    });
  }
  tires.pop();

  ranking.tiers = tires;
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
        " - Ranking must contain at least 2 tires\n" +
        " - All tires must contain at least 1 item"
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
      tiers: ranking.tires,
    }),
  });

  if (response.status === 201) {
    return true;
  } else {
    alert("One of the following requirements isn't met: \n" +
        " - Title must be 4-60 characters long\n" +
        " - Ranking must contain at least 2 tires\n" +
        " - All tires must contain at least 1 item");
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
