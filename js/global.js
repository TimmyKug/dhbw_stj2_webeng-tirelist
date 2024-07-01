localStorage.setItem("group-key", '2ujgh9kh');

const GROUP_KEY = localStorage.getItem("group-key");

const goToLoginPageButtons = document.getElementsByClassName('to-login');
for (goToLoginPageButton of goToLoginPageButtons) {
    goToLoginPageButton.addEventListener('click', (e) => {
        window.location.href = "login.html";
    })
}

testAPI();

async function testAPI() {
    const users = await fetch('https://lukas.rip/api/users', {
        method: 'GET', headers: {
            "group-key": GROUP_KEY
        }
    })
    console.log(await users.json());
}