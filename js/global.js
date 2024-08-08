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

document.getElementById('search-bar').addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        console.log(document.getElementById('search-bar').value);

        const selectedUser = document.getElementById('search-bar').value;
        const user = await getUser(selectedUser);
        localStorage.setItem("user", JSON.stringify(user));
        location.href = 'profile.html';
    }
});

document.getElementById('new-ranking-button').addEventListener('click', () => {
    const newRanking = {
        title: 'My Ranking',
        description: '',
        tiers: [
            {
                title: 'tier-1',
                content: ['item-1', 'item-2'],
                color: 'var(--border-color)'
            },
            {
                title: 'tier-2',
                content: ['item-1', 'item-2'],
                color: 'var(--border-color)'
            }
        ],
        username: localStorage.getItem("username")
    };

    localStorage.setItem("ranking", JSON.stringify(newRanking));
    location = 'ranking-edit.html';
})

document.getElementById('avatar')?.addEventListener('click', () => {
    document.getElementById('drop-down').classList.toggle('invisible');
});

document.getElementById('profile')?.addEventListener('click', async () => {
    const userName = localStorage.getItem("username");
    const user = await getUser(userName);
    localStorage.setItem("user", JSON.stringify(user));
    location.href = 'profile.html';
});

document.getElementById('log-out')?.addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('user');
    localStorage.removeItem('ranking');
    location.href = "login.html";
});

document.getElementById('delete-account')?.addEventListener('click', async () => {
    await deleteAllUserRankings(localStorage.getItem('username'), localStorage.getItem('password'));
    await deleteUser(localStorage.getItem('username'), localStorage.getItem('password'));
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('user');
    localStorage.removeItem('ranking');
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

async function getUser(userName) {
    const userResponse = await fetch('https://lukas.rip/api/users/' + userName, {
        method: 'GET', headers: {
            "group-key": GROUP_KEY
        }
    })
    const user = await userResponse.json();
    console.log(user);
    return user;
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

async function deleteAllUserRankings(userName, password) {
    const response = await fetch('https://lukas.rip/api/users/' + userName + '/rankings', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
        
    const allUserRankings = await response.json();
    for(const ranking of allUserRankings) await deleteRanking(userName, password, ranking.id);
}

async function deleteRanking(userName, password, id) {
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