import { GROUP_KEY } from './global.js';

let username = localStorage.getItem('username');

loadAllUserRankings();

function loadAllUserRankings() {
    document.addEventListener("DOMContentLoaded", async () => {
        const response = await fetch('https://lukas.rip/api/users/' + username + '/rankings', {
            method: 'GET',
            headers: {
                "group-key": GROUP_KEY
            }
        })
        
        const allUserRankings = await response.json();
        console.log(allUserRankings);
    
        for (const ranking of allUserRankings) {
            let rankingDiv = document.createElement("div");
            rankingDiv.classList.add("ranking-preview-container");
            let gridDiv = document.getElementById("ranking-preview-grid");
            gridDiv.appendChild(rankingDiv);
    
            let bottomDiv = document.createElement("div");
            bottomDiv.classList.add("bottom-container");
            rankingDiv.appendChild(bottomDiv);
    
            let titleDiv = document.createElement("div");
            titleDiv.classList.add("title");
            titleDiv.textContent = ranking.title;
            bottomDiv.appendChild(titleDiv);
    
            rankingDiv.addEventListener("click", () => {
                RANKING_ID = ranking.id;
                getRanking();
            })
        }
    })
}