import { GROUP_KEY } from "./global.js";

const lastTenRankings = await getLastTenRankings();

const grid = document.getElementById("rankings-grid");
for (const ranking of lastTenRankings) {
    grid.appendChild(buildRankingCard(ranking));
}

function buildRankingCard(ranking) {
  const rankingCard = document.createElement("div");
  rankingCard.classList.add("ranking-container");
  rankingCard.innerHTML = `
    <div class="username">${ranking.username}</div>
    <div class="bottom-container">
        <div class="title">${ranking.title}</div>
    </div>
  `;

  rankingCard.addEventListener("click", async () => {
    const user = await getUser(ranking.username);
    localStorage.setItem("user", JSON.stringify(user));
    location = "profile.html";
  });

  rankingCard.getElementsByClassName("bottom-container")[0].addEventListener("click", async () => {
    localStorage.setItem("ranking", JSON.stringify(ranking));
    location = "ranking.html";
  });
}

async function getUser(username) {
  const userResponse = await fetch("https://lukas.rip/api/users/" + username, {
    method: "GET",
    headers: {
      "group-key": GROUP_KEY,
    },
  });

  return await userResponse.json();
}

async function getLastTenRankings() {
  const rankingsResponse = await fetch("https://lukas.rip/api/rankings", {
    method: "GET",
    headers: {
      "group-key": GROUP_KEY,
    },
  });

  return await rankingsResponse.json();
}
