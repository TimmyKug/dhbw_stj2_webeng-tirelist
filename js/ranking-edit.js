import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", loadRanking);

async function loadRanking() {
    const userName = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    const user = JSON.parse(localStorage.getItem("user"));
    const ranking = JSON.parse(localStorage.getItem("ranking"));

    buildRankingDescription(userName, password, ranking);
    buildRankingGrid(ranking);
}

function buildRankingDescription(userName, password, ranking) {
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const createdAt = document.getElementById("created-at");
    const username = document.getElementById("username");
    const remove = document.getElementById("delete-ranking");

    remove.innerHTML = userName === ranking.username ? "DELETE-RANKING" : null;
    remove.addEventListener("click", async () => {
        await deleteRanking(userName, password, ranking.id);
        location.href = "main.html";
    });

    title.innerHTML = ranking.title;
    description.innerHTML = "DESCRIPTION<br>" + ranking.description;
    createdAt.innerHTML = "RANKING-CREATED-AT<br>" + ranking.createdAt.split('T')[0];
    username.innerHTML = "BY<br>" + ranking.username;
}

function buildRankingGrid(ranking) {
    let tiersLength = ranking.tiers.length;
    let longestTier = 1;

    for (let i = 0; i < tiersLength; i++) {
        let currentTierLength = ranking.tiers[i].content.length;
        if (currentTierLength > longestTier) {
            longestTier = currentTierLength;
        }
    }
    longestTier += 1;

    let gridTemplateColumns = `0.5fr repeat(${longestTier - 1}, 1fr)`;
    let gridTemplateRows = `repeat(${tiersLength}, 1fr)`;

    const grid = document.getElementById('ranking-grid');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = gridTemplateColumns;
    grid.style.gridTemplateRows = gridTemplateRows;

    for (let i = 0; i < tiersLength; i++) {
        let tier = ranking.tiers[i];
        let count = 1;

        const gridItem = document.createElement('div');
        gridItem.className = 'color-item';
        gridItem.textContent = tier.title;
        gridItem.style.backgroundColor = tier.color;
        grid.appendChild(gridItem);

        for (const item of tier.content) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.textContent = item;
            grid.appendChild(gridItem);
            count++;
        }

        while (count < longestTier) {
            const blankItem = document.createElement('div');
            blankItem.className = 'grid-item';
            grid.appendChild(blankItem);
            count++;
        }
    }
}

async function deleteRanking(userName, password, id) {
    const response = await fetch('https://lukas.rip/api/rankings/' + id, {
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
        alert('Can´t delete this ranking');
        return false;
    }
}