import { GROUP_KEY } from './global.js';

document.addEventListener('DOMContentLoaded', loadRankings);

async function loadRankings() {
    const lastTenRankings = await getLastTenRankings();
    
    if (lastTenRankings.length === 0) {
        const container = document.getElementById('main');
        const header = document.getElementById('header');
        const message = document.createElement('p');

        header.textContent = '';
        message.id ='no-ranking-message';
        message.textContent = 'Hey, it looks like you will be the first person to create a ranking ;)';
        container.appendChild(message);
        return;
    }

    for (const ranking of lastTenRankings) buildRankingCard(ranking);
}

function buildRankingCard(ranking) {
    const grid = document.getElementById('rankings-grid');
    const rankingCard = document.createElement('div');
    const userName = document.createElement('div');
    const title = document.createElement('div');
    const bottomBox = document.createElement('div');

    rankingCard.classList.add('ranking-container');
    userName.classList.add('username');
    title.classList.add('title');
    bottomBox.classList.add('bottom-container');

    userName.textContent = ranking.username;
    title.textContent = ranking.title;

    grid.appendChild(rankingCard);
    rankingCard.appendChild(userName);
    rankingCard.appendChild(bottomBox); 
    bottomBox.appendChild(title);

    userName.addEventListener('click', async () => {
        const user = await getUser(ranking.username);
        localStorage.setItem('user', JSON.stringify(user));
        location = 'profile.html';
    });

    bottomBox.addEventListener('click', async () => {
        localStorage.setItem('ranking', JSON.stringify(ranking));
        location = 'ranking.html';
    });
}

async function getUser(username) {
    const userResponse = await fetch('https://lukas.rip/api/users/' + username, {
        method: 'GET', headers: {
            'group-key': GROUP_KEY
        }
    })

    const user = await userResponse.json();
    console.log(user);
    return user;
}

async function getLastTenRankings() {
    const rankingsResponse = await fetch('https://lukas.rip/api/rankings', {
        method: 'GET',
        headers: {
            'group-key': GROUP_KEY
        }
    })

    const lastTenRankings = await rankingsResponse.json();
    console.log(lastTenRankings);
    return lastTenRankings;
}