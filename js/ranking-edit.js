import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", loadRanking);

async function loadRanking() {
    const user = JSON.parse(localStorage.getItem("user"));
    const ranking = JSON.parse(localStorage.getItem("ranking"));

    buildRankingDescription(ranking, user);
    buildRankingGrid(ranking);
}

function buildRankingDescription(ranking, user) {
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const createdAt = document.getElementById("createdAt");
    const username = document.getElementById("username");
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