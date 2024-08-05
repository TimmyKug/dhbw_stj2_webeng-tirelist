import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", async () => {
    const rankingsResponse = await fetch('https://lukas.rip/api/rankings', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
    
    const rankings = await rankingsResponse.json();
    const lastTenRankings = rankings.slice(-10);

    for (const ranking of lastTenRankings) {
        let rankingDiv = document.createElement("div");
        rankingDiv.classList.add("ranking-container");
        let gridDiv = document.getElementById("ranking-grid");
        gridDiv.appendChild(rankingDiv);

        let bottomDiv = document.createElement("div");
        bottomDiv.classList.add("bottom-container");
        rankingDiv.appendChild(bottomDiv);

        let titleDiv = document.createElement("div");
        titleDiv.classList.add("title");
        titleDiv.textContent = ranking.title;
        bottomDiv.appendChild(titleDiv);

        rankingDiv.addEventListener("click", () => {
            location.href = "ranking.html";
        })
    }
})