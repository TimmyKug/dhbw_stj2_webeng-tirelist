import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", loadAllUserRankings);

async function loadAllUserRankings() {
    const username = localStorage.getItem('username');
    const response = await fetch('https://lukas.rip/api/users/' + username + '/rankings', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
        
    const allUserRankings = await response.json();
    console.log(allUserRankings);

    if (allUserRankings.length === 0) {
        const container = document.getElementById("main");
        const message = document.createElement("p");

        message.id ="no-ranking-message";
        message.textContent = "It looks like you haven’t created a ranking yet...";
        container.appendChild(message);
    }
    
    for (const ranking of allUserRankings) {
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
            window.location.reload();
        })
    }
}

async function deleteRanking(rankingId) {
    const userName = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    await fetch('https://lukas.rip/api/rankings/' + rankingId, {
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