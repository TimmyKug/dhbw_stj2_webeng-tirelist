export const GROUP_KEY = '2ujgh9kh';
if ((!localStorage.getItem("username") || !localStorage.getItem("password")) && !window.location.href.includes("login.html") && !window.location.href.includes("register.html")) {
    alert('Please log in first');
    location.href = "login.html";
}
const username = localStorage.getItem('username')
document.getElementById('global-nav-bar').innerHTML = `
    <div id="icon"></div>
    <input id="search-bar" list="users" placeholder="🔎 Search for users...">
    <datalist id="users"></datalist>
    ${username ? `<div id="profile-actions">
                     <div id="avatar">${username.at(0).toUpperCase()}</div>
                     <div id="drop-down">
                         <div id="profile"></div>
                         <div id="log-out"></div>                      
                     </div>
                  </div>` : ''}
    `

document.getElementById('search-bar').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        console.log(document.getElementById('search-bar').value);
    }
})
document.getElementById('avatar').addEventListener('click', () => {

})

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