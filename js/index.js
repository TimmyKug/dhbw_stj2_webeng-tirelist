document.addEventListener('DOMContentLoaded', async () => {
    await fetch('https://lukas.rip/api/users', {
        method: 'POST',
        headers: {
            "group-key": GROUP_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: "Tmimy",
            password: "Tmimy123",
            profile: {
                displayName: "Timmeee",
                description: "Timmy... naja",
            }
        })
    })
    const users = await fetch('https://lukas.rip/api/users', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
    console.log(await users.json());

})



const GROUP_KEY = '2ujgh9kh';