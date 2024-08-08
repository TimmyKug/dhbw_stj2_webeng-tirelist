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
                location = 'ranking.html';
            });
        }
    }
}

function buildProfileDescription(user) {
    const displayName = document.getElementById("display-name");
    const userName = document.getElementById("userName");
    const description = document.getElementById("description");
    const createdAt = document.getElementById("created-at");
    const updatedAt = document.getElementById("updated-at");
    const editDisplayName = document.getElementById('edit-display-name');
    const editDescription = document.getElementById('edit-description');

    displayName.value = user.profile.displayName;
    userName.innerHTML = `USER-NAME<br>${user.username}`;
    description.value = user.profile.description;
    createdAt.innerHTML = `TIRELIST-MEMBER SINCE<br>${user.createdAt.split('.')[0].replace('T', ', ')}`;
    updatedAt.innerHTML = `LAST-UPDATED<br>${user.updatedAt.split('.')[0].replace('T', ', ')}`;

    setVisibility(editDisplayName);
    setVisibility(editDescription);

    displayName.style.pointerEvents = 'none';

    editDisplayName.addEventListener('click', async () => {
        displayName.style.pointerEvents = 'auto';
        
        displayName.focus();
        displayName.select();

        displayName.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                displayName.blur();
            }
        });

        displayName.addEventListener("blur", async () => {
            displayName.style.pointerEvents = "none";

            if (!checkValidity(displayName)) {
                displayName.value = user.profile.displayName;
                return;
            }

            user.profile.displayName = displayName.value;

            const requestUser = {
                password: localStorage.getItem("password"),
                profile: user.profile,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
            await updateUser(requestUser, localStorage.getItem("username"), localStorage.getItem("password"));
            localStorage.setItem("user", JSON.stringify(user));
        });
    });

    editDescription.addEventListener('click', async () => {
 
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

    if (response.status === 201) {
        console.log("Updated user successfully");
    } else {
        console.log("Failed to update user", response.status);
    }
}

function isAuthenticated() {
    const userName = localStorage.getItem("username");
    const user = JSON.parse(localStorage.getItem("user"));

    return (userName === user.username);
}

function setVisibility(element) {
    element.style.visibility = isAuthenticated() ? "visible" : "hidden";
}

const inputElements = document.getElementsByClassName('input-field');

for (const inputElement of inputElements) {
    inputElement.addEventListener('input', (e) => {
        checkValidity(e.target);
    })
}

function checkValidity(target) {
    
    if (isValid(target.value, target.id)) {
        target.classList.remove('invalid');
        document.getElementById(target.id + "-error-field").classList.add('invisible');
        return true;
    } else {
        target.classList.add('invalid');
        document.getElementById(target.id + "-error-field").classList.remove('invisible');
        return false;
    }
}

function isValid(input, id) {
    let isValid;
    switch (id) {
        case 'display-name':
            isValid = input.length >= 4 && input.length <= 30;
            break;
        case 'description':
            isValid = input.length <= 300;
            break;
        default: isValid = true;
    }
    return isValid;
}