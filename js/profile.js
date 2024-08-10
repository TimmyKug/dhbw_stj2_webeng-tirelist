import { GROUP_KEY } from "./global.js";

document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const allUserRankings = await getAllUserRankings(user);
  console.log("user is authenticated: " + isAuthenticated());

  buildProfileDescription(user);

  if (allUserRankings.length === 0) {
    const container = document.getElementById("main");
    const message = document.createElement("p");

    message.id = "no-ranking-message";
    message.textContent = "There is no ranking yet...";
    container.appendChild(message);
    return;
  }

  for (const ranking of allUserRankings) buildRankingCard(ranking);
}

function buildRankingCard(ranking) {
  const grid = document.getElementById("rankings-grid");
  const rankingCard = document.createElement("div");
  const title = document.createElement("div");
  const bottomBox = document.createElement("div");

  rankingCard.classList.add("ranking-container");
  title.classList.add("title");
  bottomBox.classList.add("bottom-container");

  title.textContent = ranking.title;

  grid.appendChild(rankingCard);
  rankingCard.appendChild(bottomBox);
  bottomBox.appendChild(title);

  bottomBox.addEventListener("click", async () => {
    localStorage.setItem("ranking", JSON.stringify(ranking));
    location = "ranking.html";
  });
}

function buildProfileDescription(user) {
  const displayName = document.getElementById("displayName");
  const userName = document.getElementById("userName");
  const description = document.getElementById("description");
  const createdAt = document.getElementById("created-at");
  const updatedAt = document.getElementById("updated-at");
  const editDisplayName = document.createElement("img");
  const editDescription = document.createElement("img");

  displayName.innerHTML = user.profile.displayName + "´s Rankings";
  userName.innerHTML = "User name: <br>" + user.username;
  description.innerHTML = "Description: <br>" + user.profile.description;
  createdAt.innerHTML =
    "Tirelist member since: <br>" +
    user.createdAt.split(".")[0].replace("T", ", ");
  updatedAt.innerHTML =
    "Last updated: <br>" + user.updatedAt.split(".")[0].replace("T", ", ");

  editDisplayName.classList = "edit-icon";
  editDescription.classList = "edit-icon";

  setVisibility(editDisplayName);
  setVisibility(editDescription);

  displayName.appendChild(editDisplayName);
  description.appendChild(editDescription);

  editDisplayName.addEventListener("click", async () => {
    const newDisplayName = prompt(
      "Display Name:\n(The display-name must be 4-30 characters long)"
    );
    if (
      !isValid(
        newDisplayName,
        "profile-display-name",
        "The display-name must be 4-30 characters long!"
      )
    )
      return;

    user.profile.displayName = newDisplayName;

    const requestUser = {
      password: localStorage.getItem("password"),
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await updateUser(
      requestUser,
      localStorage.getItem("username"),
      localStorage.getItem("password")
    );
    localStorage.setItem("user", JSON.stringify(user));
    buildProfileDescription(user);
  });

  editDescription.addEventListener("click", async () => {
    const newDescription = prompt("Description:");
    if (
      !isValid(
        newDescription,
        "profile-description",
        "The description must be less than 300 characters!"
      )
    )
      return;

    user.profile.description = newDescription;

    const requestUser = {
      password: localStorage.getItem("password"),
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await updateUser(
      requestUser,
      localStorage.getItem("username"),
      localStorage.getItem("password")
    );
    localStorage.setItem("user", JSON.stringify(user));
    buildProfileDescription(user);
  });
}

async function updateUser(user, userName, password) {
  const response = await fetch("https://lukas.rip/api/users/" + userName, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "group-key": GROUP_KEY,
      authorization: `Basic ${btoa(userName + ":" + password)}`,
    },
    body: JSON.stringify(user),
  });

  if (response.status === 200) {
    console.log("updated user");
  } else {
    console.log(user);
  }
}

async function getAllUserRankings(user) {
  const response = await fetch(
    "https://lukas.rip/api/users/" + user.username + "/rankings",
    {
      method: "GET",
      headers: {
        "group-key": GROUP_KEY,
      },
    }
  );

  const allUserRankings = await response.json();
  console.log(allUserRankings);
  return allUserRankings;
}

function isAuthenticated() {
  const userName = localStorage.getItem("username");
  const user = JSON.parse(localStorage.getItem("user"));

  return userName === user.username;
}

function setVisibility(element) {
  element.style.visibility = isAuthenticated() ? "visible" : "hidden";
}

function isValid(input, id, message) {
  let isValid;

  if (input === null) return;

  switch (id) {
    case "profile-display-name":
      isValid = input.length >= 4 && input.length <= 60;
      break;
    case "profile-description":
      isValid = input.length <= 300;
      break;
    default:
      isValid = true;
  }
  if (!isValid) alert("Invalid: " + message);
  return isValid;
}
