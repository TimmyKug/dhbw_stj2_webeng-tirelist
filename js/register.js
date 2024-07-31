import { GROUP_KEY } from './global.js';

if (localStorage.getItem('username') != null) {
    location.href = 'main.html';
}


const inputElements = document.getElementsByClassName('input-field');

for (const inputElement of inputElements) {
    inputElement.addEventListener('input', (e) => {
        if (isValid(e.target.value, e.target.id)) {
            inputElement.classList.remove('invalid');
            document.getElementById(e.target.id + "-error-field").classList.add('invisible');
        } else {
            inputElement.classList.add('invalid');
            document.getElementById(e.target.id + "-error-field").classList.remove('invisible');
        }
    })
}

function isValid(input, id) {
    let isValid;
    switch (id) {
        case 'user-name':
            isValid = /^[a-zA-Z0-9]{4,10}$/.test(input);
            break;
        case 'display-name':
            isValid = input.length >= 4 && input.length <= 30;
            break;
        case 'password':
            isValid = /^[a-zA-Z0-9]{6,12}$/.test(input) && /[a-zA-Z]/.test(input) && /[0-9]/.test(input);
            break;
        case 'description':
            isValid = input.length <= 300;
            break;
        default: isValid = true;
    }
    return isValid;
}

document.getElementById("register").addEventListener('click', async () => {
    const name = document.getElementById('user-name').value;
    const password = document.getElementById('password').value;
    const displayName = document.getElementById('display-name').value;
    const description = document.getElementById('description').value;

    const wasSuccessful = await registerUser(name, password, displayName, description);
    if (!wasSuccessful) {
        return;
    }

    console.log(`registered user: username: ${name}, password: ${password}, display name: ${displayName}, description: ${description}`);

    localStorage.setItem("username", name);
    localStorage.setItem("password", password);

    window.location.href = "main.html";
})

async function registerUser(name, password, displayName, description) {
    const response = await fetch('https://lukas.rip/api/users', {
        method: 'POST', headers: {
            "group-key": GROUP_KEY,
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
    console.log(response.status);
    if (response.status === 201) {
        return true;
    } else if (response.status === 400) {
        alert("invalid entries");
        return false;
    } else if (response.status === 409) {
        alert("A profile with this username already exists")
        return false;
    }
}