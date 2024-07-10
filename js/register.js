import { GROUP_KEY } from './global.js'

document.getElementById("register").addEventListener('click', () => {
    const name = document.getElementById("name").value;
    const displayName = document.getElementById("display-name").value;
    const password = document.getElementById("password").value;
    const description = document.getElementById("description").value;

    registerUser(name, displayName, password, description);

    localStorage.setItem("username", name);
    localStorage.setItem("password", password);

    console.log(localStorage.getItem("username"));
    console.log(localStorage.getItem("password"));

    window.location.href = "main.html";
})

async function registerUser(name, displayName, password, description) {
    console.log(`username: ${name}, display name: ${displayName}, password: ${password}, description: ${description}`);
    const response = await fetch('https://lukas.rip/api/users', {
        method: 'POST', headers: {
            "group-key": localStorage.getItem('group-key'),
            "Content-Type": "application/json",
        }, body: JSON.stringify({
            username: name,
            password: password,
            profile: {
                displayName: displayName,
                description: description,
            }
        })
    })
    console.log(response);
    console.log(await response.json());
}