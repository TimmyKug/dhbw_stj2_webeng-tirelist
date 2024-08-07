import { GROUP_KEY } from './global.js';

const userName = localStorage.getItem("username");
const password = localStorage.getItem("password");

const ranking = JSON.parse(localStorage.getItem("ranking"));

document.addEventListener("DOMContentLoaded", loadRanking);

async function loadRanking() {
    buildRankingDescription(ranking);
    buildRankingGrid(ranking);

    if (userName === ranking.username) {
        document.getElementById("edit-container").style.visibility = "visible";
    }
}

function buildRankingDescription(ranking) {
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const createdAt = document.getElementById("created-at");
    const username = document.getElementById("username");
    const remove = document.getElementById("delete-ranking");

    remove.innerHTML = userName === ranking.username ? "DELETE-RANKING" : null;
    remove.addEventListener("click", async () => {
        await deleteRanking(ranking.id);
        location.href = "main.html";
    });

    title.innerHTML = ranking.title;
    description.innerHTML = "DESCRIPTION<br>" + ranking.description;
    createdAt.innerHTML = "RANKING-CREATED-AT<br>" + ranking.createdAt.split('T')[0];
    username.innerHTML = "BY<br>" + ranking.username;
}

function buildRankingGrid(ranking) {
    console.log(ranking.id);
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

        const gridItem = document.createElement('input');
        gridItem.type = "text";
        gridItem.className = 'color-item';
        gridItem.value = tier.title;
        gridItem.style.backgroundColor = tier.color;
        gridItem.readOnly = (userName === ranking.username) ? false : true;
        grid.appendChild(gridItem);

        gridItem.addEventListener('click', () => {
            gridItem.style.zIndex = 1;
        })

        gridItem.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                gridItem.blur();
            }
        });

        gridItem.addEventListener("blur", () => {
            gridItem.style.zIndex = "auto";
            if (tier.title != gridItem.value) {
                tier.title = gridItem.value;
                saveRanking();
            }
        });

        for (let j = 0; j < tier.content.length; j++) {
            const item = tier.content[j];
            const gridItem = document.createElement('input');
            gridItem.type = "text";
            gridItem.className = 'grid-item';
            gridItem.value = item;
            gridItem.readOnly = (userName === ranking.username) ? false : true;
            gridItem.draggable = (userName === ranking.username) ? true : false;
            gridItem.ondragstart = dragStart;
            gridItem.ondragover = dragOver;
            gridItem.ondragleave = dragLeave;
            gridItem.ondrop = drop;
            gridItem.dataset.tierIndex = i;
            gridItem.dataset.itemIndex = j;
            grid.appendChild(gridItem);
            count++;

            gridItem.addEventListener('click', () => {
                gridItem.style.zIndex = 1;
            })

            gridItem.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    gridItem.blur();
                }
            });

            gridItem.addEventListener("blur", () => {
                gridItem.style.zIndex = "auto";
                if (tier.content[j] != gridItem.value) {
                    tier.content[j] = gridItem.value;
                    saveRanking();
                }
            });
        }

        while (count < longestTier) {
            const blankItem = document.createElement('div');
            blankItem.className = 'grid-item';
            grid.appendChild(blankItem);
            count++;
        }
    }
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.tierIndex + ',' + e.target.dataset.itemIndex);
    e.currentTarget.style.backgroundColor = '';
}

function dragOver(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'var(--accent-color-2)';
}

function dragLeave(e) {
    e.currentTarget.style.backgroundColor = '';
}

async function drop(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';

    const data = e.dataTransfer.getData('text/plain').split(',');
    const [fromTierIndex, fromItemIndex] = data.map(Number);
    const toTierIndex = e.target.dataset.tierIndex;
    const toItemIndex = e.target.dataset.itemIndex;

    if (toTierIndex === undefined || toItemIndex === undefined) return;

    const item = ranking.tiers[fromTierIndex].content.splice(fromItemIndex, 1)[0];
    ranking.tiers[toTierIndex].content.splice(toItemIndex, 0, item);

    document.getElementById('ranking-grid').innerHTML = '';

    buildRankingGrid(ranking);

    if ((fromTierIndex != toTierIndex) || (fromItemIndex != toItemIndex)) saveRanking();
}

function saveRanking() {
    const saveButton = document.getElementById('save-button');
    saveButton.style.backgroundColor = "var(--accent-color-2)";

    const handleClick = async () => {
        const newRanking = await updateRanking(ranking.id);
        localStorage.setItem('ranking', JSON.stringify(newRanking));
        saveButton.style.backgroundColor = "var(--border-color)";
        saveButton.removeEventListener("click", handleClick);
    };
    saveButton.removeEventListener("click", handleClick);
    saveButton.addEventListener("click", handleClick);
}

async function deleteRanking(id) {
    const response = await fetch('https://lukas.rip/api/rankings/' + id, {
        method: 'DELETE',
        headers: {
            'group-key': GROUP_KEY,
            'authorization': `Basic ${btoa(userName + ":" + password)}`
        }
    });

    if (response.status === 204) {
        console.log("deleted ranking");
        return true;
    } else {
        alert('Can’t delete this ranking, error:' + response.status);
        return false;
    }
}

async function updateRanking(id) {
    const response = await fetch('https://lukas.rip/api/rankings/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'group-key': GROUP_KEY,
            'authorization': `Basic ${btoa(userName + ":" + password)}`
        },
        body: JSON.stringify(ranking)
    });

    if (response.status === 200) {
        console.log("updated ranking");
        return ranking;
    } else {
        alert('Can’t update this ranking');
        return false;
    }
}