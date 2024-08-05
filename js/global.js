export const GROUP_KEY = '2ujgh9kh';

if ((!localStorage.getItem("username") || !localStorage.getItem("password")) && !window.location.href.includes("login.html") && !window.location.href.includes("register.html")) {
    alert('Please log in first');
    location.href = "login.html";
}

const username = localStorage.getItem('username');
document.getElementById('nav-bar').innerHTML = `
    <div id="icon"></div>
    <input id="search-bar" list="users" placeholder="🔎 Search for users...">
    <datalist id="users"></datalist>
    <div id="right-container">
        <button id="new-ranking-button">
            <img src="../assets/plus-icon.png" alt="Icon">
            New Ranking
        </button>
        ${username ? `<div id="profile-actions">
            <div id="avatar">${username.at(0).toUpperCase()}</div>
                <div id="drop-down" class="invisible">
                    <div id="profile" class="drop-down-item">Profile</div>
                    <div id="log-out" class="drop-down-item">Log Out</div>       
                    <div id="delete-account" class="drop-down-item">Delete my account</div>              
                </div>
        </div>` : ''}
    </div>
`

document.getElementById('icon').onclick = () => {
    location = 'main.html';
};

document.getElementById('search-bar').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        console.log(document.getElementById('search-bar').value);
    }
});

document.getElementById('new-ranking-button').addEventListener('click', () => {
    location.href = 'ranking.html';
})

document.getElementById('avatar')?.addEventListener('click', () => {
    document.getElementById('drop-down').classList.toggle('invisible');
});

document.getElementById('profile')?.addEventListener('click', () => {
    location.href = 'profile.html';
});

document.getElementById('log-out')?.addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    location.href = "login.html";
});

document.getElementById('delete-account')?.addEventListener('click', async () => {
    await deleteUser(localStorage.getItem('username'), localStorage.getItem('password'));
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    location.href = "login.html";
});

getUsers();

async function getUsers() {
    const usersResponse = await fetch('https://lukas.rip/api/users', {
        method: 'GET', headers: {
            "group-key": GROUP_KEY
        }
    })
    const users = await usersResponse.json();
    console.log(users);
    const userDataList = document.getElementById('users');
    userDataList.innerHTML = '';
    for (const user of users) {
        const option = document.createElement('option');
        option.text = user.profile.displayName;
        option.value = user.username;
        userDataList.appendChild(option);
    }
}

async function deleteUser(userName, password) {
    await fetch('https://lukas.rip/api/users/' + userName, {
        method: 'DELETE',
        headers: {
            'group-key': GROUP_KEY,
            'authorization': `Basic ${btoa(userName + ":" + password)}`,
        }
    })
    console.log("deleted user: " + userName)
}