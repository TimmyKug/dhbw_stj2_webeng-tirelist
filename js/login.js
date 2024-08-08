import { GROUP_KEY } from './global.js';

if (localStorage.getItem('username') != null) {
    location.href = 'main.html';
}

document.getElementById('login').addEventListener('click', async () => {
    const name = document.getElementById('user-name').value;
    const password = document.getElementById('password').value;

    const wasSuccessful = await loginUser(name, password);
    if (!wasSuccessful) {
        return;
    }

    console.log(`logged in user: username: ${name}, password: ${password}`);

    localStorage.setItem('username', name);
    localStorage.setItem('password', password);

    window.location.href = 'main.html';
})

async function loginUser(name, password) {
    console.log(`${name}: ${password}`);
    const response = await fetch('https://lukas.rip/api/users/login', {
        method: 'GET',
        headers: {
            'group-key': GROUP_KEY,
            'authorization': `Basic ${btoa(`${name}:${password}`)}`,
        }
    })
    if (response.status === 200) {
        return true;
    } else {
        alert('Invalid username or password');
        return false;
    }
}

