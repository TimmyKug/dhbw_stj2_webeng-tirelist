import { GROUP_KEY } from './global.js';

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
        case 'title':
            isValid = input.length >= 4 && input.length <= 60;
            break;
        case 'description':
            isValid = input.length >= 0 && input.length <= 300;
            break;
        case 'tier-title':
            isValid = input.length >= 4 && input.length <= 60;
            break;
        case 'item':
            isValid = input.length > 0;
            break;
        case 'tier-color':
            isValid = input.length <= 300;
            break;
        default: isValid = true;
    }
    return isValid;
}

let items = [];
let tiers = [];

document.getElementById('add-item-button').addEventListener('click', () => {
    const item = document.getElementById('item').value;
    items.push(item);
    document.getElementById('item').value = "";
    showItems();
})

function showItems() {
    const div = document.getElementById("all-items");
    div.innerHTML = "";
    items.forEach(element => {
        div.innerHTML += element + " ";
    });
}

const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', () => {
    console.log(colorPicker.value);
})

document.getElementById("add-tier").addEventListener("click", () => {
    const tierTitle = document.getElementById('tier-title').value;

    tiers.push({
        title: tierTitle,
        content: items,
        color: colorPicker.value
    });

    document.getElementById('tier-title').value = "";
    document.getElementById('item').value = "";
    items = [];
})

document.getElementById("create").addEventListener("click", async () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const wasSuccessful = await createRanking(title, description);
    if (!wasSuccessful) {
        return;
    }
})

async function createRanking(title, description) {
    const userName = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    const response = await fetch('https://lukas.rip/api/rankings', {
        method: 'POST', 
        headers: {
            "group-key": GROUP_KEY,
            "Content-Type": "application/json",
            'authorization': `Basic ${btoa(`${userName}:${password}`)}`,
        }, body: JSON.stringify({
            title: title,
            description: description,
            tiers: tiers
        })
    })
    tiers = [];

    console.log(response.status);
    if (response.status === 201) {
        location.href = "main.html";
        return true;
    } else if (response.status === 400) {
        alert("invalid entries");
        return false;
    }
}