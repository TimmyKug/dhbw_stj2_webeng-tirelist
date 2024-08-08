import { GROUP_KEY } from './global.js';

document.addEventListener("DOMContentLoaded", loadAllUserRankings);

async function loadAllUserRankings() {
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch('https://lukas.rip/api/users/' + user.username + '/rankings', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
        
    const allUserRankings = await response.json();
    console.log(allUserRankings);

    buildProfileDescription(user);

    if (allUserRankings.length === 0) {
        const container = document.getElementById("main");
        const message = document.createElement("p");

        message.id ="no-ranking-message";
        message.textContent = "There is no ranking yet...";
        container.appendChild(message);
    } else {
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

            bottomDiv.addEventListener("click", async () => {
                localStorage.setItem("ranking", JSON.stringify(ranking));
                location = 'ranking-edit.html';
            });
        }
    }
}

function buildProfileDescription(user) {
    const displayName = document.getElementById("displayName");
    const userName = document.getElementById("userName");
    const description = document.getElementById("description");
    const createdAt = document.getElementById("created-at");
    const updatedAt = document.getElementById("updated-at");
    const editDisplayName = document.createElement("img");
    const editDescription = document.createElement("img");

    displayName.innerHTML = user.profile.displayName + "'s Rankings";
    userName.innerHTML = "USER-NAME<br>" + user.username;
    description.innerHTML = "DESCRIPTION<br>" + user.profile.description;
    createdAt.innerHTML = "TIRELIST-MEMBER SINCE<br>" + user.createdAt.split('.')[0].replace('T', ', ');
    updatedAt.innerHTML = "LAST-UPDATED<br>" + user.createdAt.split('.')[0].replace('T', ', ');

    editDisplayName.classList = 'edit-icon';
    editDescription.classList = 'edit-icon';

    setVisibility(editDisplayName);
    setVisibility(editDescription);

    displayName.appendChild(editDisplayName);
    description.appendChild(editDescription);

    editDisplayName.addEventListener('click', async () => {
        const newDisplayName = prompt('Enter New Display Name:');
        if (newDisplayName) {
            user.profile.displayName = newDisplayName;

            const requestUser = {
                password: localStorage.getItem("password"),
                profile: user.profile,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
            
            await updateUser(requestUser, localStorage.getItem("username"), localStorage.getItem("password"));
            localStorage.setItem("user", JSON.stringify(user));
            buildProfileDescription(user);
        }
    });

    editDescription.addEventListener('click', async () => {
        const newDescription = prompt('Enter New Description:');
        if (newDescription) {
            user.profile.description = newDescription;
            
            const requestUser = {
                password: localStorage.getItem("password"),
                profile: user.profile,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
            
            await updateUser(requestUser, localStorage.getItem("username"), localStorage.getItem("password"));
            localStorage.setItem("user", JSON.stringify(user));
            buildProfileDescription(user);
        }
    });
}

async function updateUser(user, userName, password) {
    const response = await fetch('https://lukas.rip/api/users/' + userName, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'group-key': GROUP_KEY,
            'authorization': `Basic ${btoa(userName + ":" + password)}`
        },
        body: JSON.stringify(user)
    });

    if (response.status === 200) {
        console.log("updated user");
    } else {
        console.log(user);
    }
}

function isAuthenticated() {
    const userName = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));

    return (userName === user.username)
}

function setVisibility(element) {
    if (isAuthenticated()) {
        element.style.visibility = "visible";
    } else {
        element.style.visibility = "hidden";
    }
}