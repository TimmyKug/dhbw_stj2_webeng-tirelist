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
    document.getElementById('ranking-grid').innerHTML = '';

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
    grid.style.gridTemplateColumns = gridTemplateColumns;
    grid.style.gridTemplateRows = gridTemplateRows;

    for (let i = 0; i < tiersLength; i++) {
        let tier = ranking.tiers[i];
        let count = 1;

        const colorItem = document.createElement('input');
        colorItem.type = "text";
        colorItem.className = 'color-item';
        colorItem.value = tier.title;
        colorItem.style.backgroundColor = tier.color;
        colorItem.readOnly = (userName === ranking.username) ? false : true;
        grid.appendChild(colorItem);

        colorItem.addEventListener('click', () => {
            colorItem.style.zIndex = 1;
        })

        colorItem.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                colorItem.blur();
            }
        });

        colorItem.addEventListener("blur", () => {
            colorItem.style.zIndex = "auto";
            if (tier.title != colorItem.value) {
                tier.title = colorItem.value;
                saveRanking();
            }
        });

        for (let j = 0; j < tier.content.length; j++) {
            const item = tier.content[j];

            const itemContainer = document.createElement('div');
            const textItem = document.createElement('input');
            const dropDownIcon = document.createElement('div');
            const dropDown = document.createElement('div');
            const deleteItem = document.createElement('div');
            const editItem = document.createElement('div');
            const addItem = document.createElement('div');

            textItem.className = 'grid-item';
            textItem.type = "text";
            textItem.value = item;
            textItem.readOnly = true;
            textItem.style.pointerEvents = "none";

            dropDownIcon.classList = 'ranking-drop-down-icon';
            dropDownIcon.textContent = '...';
            
            dropDown.classList = 'ranking-drop-down';
            dropDown.classList = 'invisible';

            deleteItem.classList = 'ranking-drop-down-item';
            deleteItem.textContent = 'delete';

            editItem.classList = 'ranking-drop-down-item';
            editItem.textContent = 'edit';

            addItem.classList = 'ranking-drop-down-item';
            addItem.textContent = 'add';

            itemContainer.className = "item-container";
            itemContainer.draggable = (userName === ranking.username) ? true : false;
            itemContainer.ondragstart = dragStart;
            itemContainer.ondragover = dragOver;
            itemContainer.ondragleave = dragLeave;
            itemContainer.ondrop = drop;
            itemContainer.dataset.tierIndex = i;
            itemContainer.dataset.itemIndex = j;

            itemContainer.appendChild(textItem);
            itemContainer.appendChild(dropDownIcon);
            dropDownIcon.appendChild(dropDown);
            dropDown.appendChild(deleteItem);
            dropDown.appendChild(editItem);
            dropDown.appendChild(addItem);

            grid.appendChild(itemContainer);
            count++;

            dropDownIcon.addEventListener('click', () => {
                dropDown.classList.toggle('invisible');
            });

            deleteItem.addEventListener('click', () => {
                if (tier.content.length <= 1) {
                    alert("A ranking must contain at least one item!");
                    return;
                }
                tier.content.splice(j, 1)[0];
                buildRankingGrid(ranking);
                saveRanking();
            });

            editItem.addEventListener('click', () => {
                textItem.readOnly = false;
                textItem.style.pointerEvents = "auto";
                itemContainer.draggable = false;

                textItem.focus();
                textItem.select();
            });

            textItem.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    textItem.blur();
                }
            });

            textItem.addEventListener("blur", () => {
                textItem.readOnly = true;
                textItem.style.pointerEvents = "none";
                itemContainer.draggable = true;

                if (tier.content[j] != textItem.value) {
                    tier.content[j] = textItem.value;
                    saveRanking();
                }
            });

            addItem.addEventListener("click", () => {
                const newItem = prompt("Enter new item:");
                if (newItem) {
                    tier.content.push(newItem);
                    buildRankingGrid(ranking);
                    saveRanking();
                }
            });
        }

        while (count < longestTier) {
            const blankItem = document.createElement('div');
            blankItem.className = 'grid-item';
            blankItem.dataset.tierIndex = i;
            blankItem.dataset.itemIndex = count - 1;

            blankItem.ondragover = dragOver;
            blankItem.ondragleave = dragLeave;
            blankItem.ondrop = drop;
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

function drop(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';

    const data = e.dataTransfer.getData('text/plain').split(',');
    const [fromTierIndex, fromItemIndex] = data.map(Number);
    const toTierIndex = e.target.dataset.tierIndex;
    const toItemIndex = e.target.dataset.itemIndex;

    if (toTierIndex === undefined || toItemIndex === undefined) return;

    if (ranking.tiers[fromTierIndex].content.length <= 1) {
        alert("A ranking must contain at least one item!");
        return;
    }

    const item = ranking.tiers[fromTierIndex].content.splice(fromItemIndex, 1)[0];
    ranking.tiers[toTierIndex].content.splice(toItemIndex, 0, item);
    
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