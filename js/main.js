import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", async () => {
    const rankingsResponse = await fetch('https://lukas.rip/api/rankings', {
        method: 'GET', headers: {
            "group-key": GROUP_KEY
        }
    })
    
    const rankings = await rankingsResponse.json();
    const lastTenRankings = rankings.slice(-10);

    for (const ranking of lastTenRankings) {
        let newDiv = document.createElement("div");
        newDiv.id = "ranking";
        newDiv.textContent = ranking.title;
        let containerDiv = document.getElementById("ranking-grid");
        containerDiv.appendChild(newDiv);
    }
})