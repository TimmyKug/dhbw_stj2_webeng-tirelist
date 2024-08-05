import { GROUP_KEY } from './global.js';
export const RANKING_ID = "";

document.addEventListener("DOMContentLoaded", loadLastTenRankings);

async function loadLastTenRankings() {
    const rankingsResponse = await fetch('https://lukas.rip/api/rankings', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
        
    const lastTenRankings = await rankingsResponse.json();
    console.log(lastTenRankings);
    
    if (lastTenRankings.length === 0) {
        const header = document.getElementById("header");
        const container = document.getElementById("main");
        const message = document.createElement("p");

        header.textContent = "";
        message.id ="no-ranking-message";
        message.textContent = "Hey, it looks like you will be the first person to create a ranking ;)";
        container.appendChild(message);
    }

    for (const ranking of lastTenRankings) {
        const rankingDiv = document.createElement("div");
        rankingDiv.classList.add("ranking-container");
        const gridDiv = document.getElementById("rankings-grid");
        gridDiv.appendChild(rankingDiv);
    
        const bottomDiv = document.createElement("div");
        bottomDiv.classList.add("bottom-container");
        rankingDiv.appendChild(bottomDiv);
    
        const titleDiv = document.createElement("div");
        titleDiv.classList.add("title");
        titleDiv.textContent = ranking.title;
        bottomDiv.appendChild(titleDiv);
    
        rankingDiv.addEventListener("click", () => {
            deleteRanking(ranking.id);
        })
    }
}

async function getRanking() {
    const response = await fetch('https://lukas.rip/api/rankings/' + RANKING_ID, {
        method: 'GET', 
        headers: {
            "group-key": GROUP_KEY
        }
    })

    const ranking = await response.json();

    if (response.status === 200) {
        location.href = "ranking-overview.html";
        return ranking;
    } else {
        console.log("can't find ranking");
        return false;
    }
}

async function deleteRanking(rankingId) {
    const userName = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const response = await fetch('https://lukas.rip/api/rankings/' + rankingId, {
        method: 'DELETE',
        headers: {
            'group-key': GROUP_KEY,
            'authorization': `Basic ${btoa(userName + ":" + password)}`,
        }
    })

    if (response.status === 200) {
        console.log("deleted ranking");
        return true;
    } else {
        console.log("not your ranking to delete");
        return false;
    }
}