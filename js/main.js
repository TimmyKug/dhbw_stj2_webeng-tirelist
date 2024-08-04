import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", async () => {
    const rankingsResponse = await fetch('https://lukas.rip/api/rankings', {
        method: 'GET', headers: {
            "group-key": GROUP_KEY
        }
    })
    const rankings = await rankingsResponse.json();
   
    for (const ranking of rankings) {
        let newDiv = document.createElement("div");
        newDiv.id = "ranking";
        newDiv.textContent = ranking.title;
        let containerDiv = document.getElementById("ranking-grid");
        containerDiv.appendChild(newDiv);
    }
})